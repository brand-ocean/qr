import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from './_generated/server';
import {
  roadmapKindValidator,
  roadmapPriorityValidator,
  roadmapStatusValidator,
} from './schema';

// The roadmap is admin-only. Every function requires an authenticated user and
// resolves their user document (for the createdBy / author name).
async function requireUser(ctx: MutationCtx | QueryCtx): Promise<Doc<'users'>> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error('Niet ingelogd.');
  }
  const user = await ctx.db.get(userId);
  if (user === null) {
    throw new Error('Gebruiker niet gevonden.');
  }
  return user;
}

function displayName(user: Doc<'users'>): string {
  return user.name ?? user.email ?? 'Beheerder';
}

type RoadmapStatus = Doc<'roadmapItems'>['status'];

// The four columns, in fixed left-to-right order.
export const ROADMAP_STATUSES: RoadmapStatus[] = [
  'backlog',
  'planned',
  'inProgress',
  'done',
];

// Spacing between fresh sort keys; midpoint insertion halves the gap on each
// drop between two neighbours, which is fine for any realistic drag count.
const ORDER_STEP = 1024;

// Sort key for appending at the bottom of a column.
async function nextOrder(
  ctx: MutationCtx,
  status: RoadmapStatus,
): Promise<number> {
  const last = await ctx.db
    .query('roadmapItems')
    .withIndex('by_status_and_order', (q) => q.eq('status', status))
    .order('desc')
    .first();
  return (last?.order ?? 0) + ORDER_STEP;
}

// Sort key for inserting at the TOP of a column. "done" grows from the top so
// the most recently completed card is always first.
async function topOrder(
  ctx: MutationCtx,
  status: RoadmapStatus,
): Promise<number> {
  const first = await ctx.db
    .query('roadmapItems')
    .withIndex('by_status_and_order', (q) => q.eq('status', status))
    .order('asc')
    .first();
  return (first?.order ?? 0) - ORDER_STEP;
}

// Where a card lands when dropped without explicit neighbours: top of "done"
// (newest first), bottom of every other column.
function autoOrder(ctx: MutationCtx, status: RoadmapStatus): Promise<number> {
  return status === 'done' ? topOrder(ctx, status) : nextOrder(ctx, status);
}

// --- Queries ----------------------------------------------------------------

export type RoadmapListItem = Doc<'roadmapItems'> & {
  creatorName: string;
  commentCount: number;
};

// All roadmap items, joined with the creator's display name and the number of
// feedback comments (so the board can flag cards without opening each one).
// Bounded per column so a runaway column can never blow up.
export const list = query({
  args: {},
  handler: async (ctx): Promise<RoadmapListItem[]> => {
    await requireUser(ctx);
    const columns = await Promise.all(
      ROADMAP_STATUSES.map((status) =>
        ctx.db
          .query('roadmapItems')
          .withIndex('by_status_and_order', (q) => q.eq('status', status))
          .take(200),
      ),
    );
    const items = columns.flat();

    const creatorIds = [...new Set(items.map((item) => item.createdBy))];
    const creators = await Promise.all(creatorIds.map((id) => ctx.db.get(id)));
    const nameById = new Map<Id<'users'>, string>();
    for (const creator of creators) {
      if (creator !== null) {
        nameById.set(creator._id, displayName(creator));
      }
    }

    const commentCounts = await Promise.all(
      items.map((item) =>
        ctx.db
          .query('roadmapComments')
          .withIndex('by_item', (q) => q.eq('itemId', item._id))
          .take(200)
          .then((rows) => rows.length),
      ),
    );

    return items.map((item, i) => ({
      ...item,
      creatorName: nameById.get(item.createdBy) ?? 'Onbekend',
      commentCount: commentCounts[i] ?? 0,
    }));
  },
});

// Feedback thread for one item, oldest first so it reads like a chat.
export const comments = query({
  args: { itemId: v.id('roadmapItems') },
  handler: async (ctx, args): Promise<Doc<'roadmapComments'>[]> => {
    await requireUser(ctx);
    return await ctx.db
      .query('roadmapComments')
      .withIndex('by_item', (q) => q.eq('itemId', args.itemId))
      .order('asc')
      .collect();
  },
});

// --- Mutations --------------------------------------------------------------

export const create = mutation({
  args: {
    title: v.string(),
    status: roadmapStatusValidator,
    kind: v.optional(roadmapKindValidator),
    priority: v.optional(roadmapPriorityValidator),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<'roadmapItems'>> => {
    const user = await requireUser(ctx);
    const title = args.title.trim();
    if (title === '') {
      throw new Error('Titel is verplicht.');
    }
    return await ctx.db.insert('roadmapItems', {
      title,
      status: args.status,
      order: await nextOrder(ctx, args.status),
      kind: args.kind,
      priority: args.priority,
      description: args.description?.trim() || undefined,
      createdBy: user._id,
    });
  },
});

// Drop handler: place the item in `status` between two neighbours. The client
// sends the neighbouring sort keys; we write the midpoint so a move is a
// single-document patch.
export const move = mutation({
  args: {
    itemId: v.id('roadmapItems'),
    status: roadmapStatusValidator,
    beforeOrder: v.optional(v.number()),
    afterOrder: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<null> => {
    await requireUser(ctx);
    const item = await ctx.db.get(args.itemId);
    if (item === null) {
      throw new Error('Roadmap-item niet gevonden.');
    }
    let order: number;
    if (args.beforeOrder !== undefined && args.afterOrder !== undefined) {
      order = (args.beforeOrder + args.afterOrder) / 2;
    } else if (args.afterOrder !== undefined) {
      order = args.afterOrder - ORDER_STEP;
    } else if (args.beforeOrder !== undefined) {
      order = args.beforeOrder + ORDER_STEP;
    } else {
      order = await autoOrder(ctx, args.status);
    }
    await ctx.db.patch(args.itemId, { status: args.status, order });
    return null;
  },
});

export const update = mutation({
  args: {
    itemId: v.id('roadmapItems'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    // null clears the field; omitted leaves it untouched.
    kind: v.optional(v.union(roadmapKindValidator, v.null())),
    priority: v.optional(v.union(roadmapPriorityValidator, v.null())),
  },
  handler: async (ctx, args): Promise<null> => {
    await requireUser(ctx);
    const item = await ctx.db.get(args.itemId);
    if (item === null) {
      throw new Error('Roadmap-item niet gevonden.');
    }
    const patch: Partial<Doc<'roadmapItems'>> = {};
    if (args.title !== undefined) {
      const title = args.title.trim();
      if (title === '') {
        throw new Error('Titel is verplicht.');
      }
      patch.title = title;
    }
    if (args.description !== undefined) {
      patch.description = args.description.trim() || undefined;
    }
    if (args.kind !== undefined) {
      patch.kind = args.kind ?? undefined;
    }
    if (args.priority !== undefined) {
      patch.priority = args.priority ?? undefined;
    }
    await ctx.db.patch(args.itemId, patch);
    return null;
  },
});

// Post a message to an item's feedback thread. Author is the signed-in user;
// the display name is denormalized so the thread renders without a join.
export const addComment = mutation({
  args: { itemId: v.id('roadmapItems'), body: v.string() },
  handler: async (ctx, args): Promise<Id<'roadmapComments'>> => {
    const user = await requireUser(ctx);
    const body = args.body.trim();
    if (body === '') {
      throw new Error('Reactie mag niet leeg zijn.');
    }
    const item = await ctx.db.get(args.itemId);
    if (item === null) {
      throw new Error('Roadmap-item niet gevonden.');
    }
    return await ctx.db.insert('roadmapComments', {
      itemId: args.itemId,
      body,
      authorUserId: user._id,
      authorName: displayName(user),
    });
  },
});

export const remove = mutation({
  args: { itemId: v.id('roadmapItems') },
  handler: async (ctx, args): Promise<null> => {
    await requireUser(ctx);
    // Delete the item and its comment thread.
    const comments = await ctx.db
      .query('roadmapComments')
      .withIndex('by_item', (q) => q.eq('itemId', args.itemId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }
    await ctx.db.delete(args.itemId);
    return null;
  },
});
