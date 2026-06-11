interface EmailSender {
  send(message: {
    to: string | string[];
    from: { email: string; name?: string };
    subject: string;
    text: string;
    html?: string;
  }): Promise<{ messageId: string }>;
}

interface Env {
  APP_STORE_URL: string;
  PLAY_STORE_URL: string;
  EMAIL: EmailSender;
  REPORT_EMAIL_TO: string;
  MAILER_TOKEN?: string;
  TRIGGER_KEY?: string;
}

const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appID: 'YOUR_TEAM_ID.nl.viralsgame.app',
        paths: ['/kaart*'],
      },
    ],
  },
};

const ASSET_LINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'nl.viralsgame.app',
      sha256_cert_fingerprints: [
        '13:4C:1D:B6:23:8A:0F:CD:8F:62:85:E4:79:BD:C6:43:5C:33:7C:77:0B:82:CE:9E:25:A1:36:2B:AC:E2:80:F9',
        'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C',
      ],
    },
  },
];

const SHARED_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px; background: #000; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
  #sunburst { position: fixed; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; }
  #sunburst::before {
    content: '';
    position: absolute;
    width: 200vmax;
    height: 200vmax;
    top: calc(50% - 100vmax);
    left: calc(50% - 100vmax);
    background: conic-gradient(
      #22B331 0deg 23deg, #016A2A 23deg 46deg, #22B331 46deg 69deg, #FFFFFF 69deg 72deg,
      #EC001B 72deg 95deg, #7E131C 95deg 118deg, #EC001B 118deg 141deg, #FFFFFF 141deg 144deg,
      #FFF200 144deg 167deg, #FF8C00 167deg 190deg, #FFF200 190deg 213deg, #FFFFFF 213deg 216deg,
      #00B1E0 216deg 239deg, #1B5096 239deg 262deg, #00B1E0 262deg 285deg, #FFFFFF 285deg 288deg,
      #B52D87 288deg 311deg, #6D297F 311deg 334deg, #B52D87 334deg 357deg, #FFFFFF 357deg 360deg
    );
    animation: spin 60s linear infinite;
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .card { position: relative; z-index: 1; width: 100%; max-width: 520px; background: #111; border-radius: 16px; padding: 20px; box-sizing: border-box; }
  h1 { margin: 0 0 12px; }
  p { line-height: 1.5; text-align: center; }
  .buttons { display: grid; gap: 12px; margin-top: 16px; }
  a { display: block; text-decoration: none; font-weight: 700; text-align: center; border-radius: 10px; padding: 12px; }
  .primary { background: #FFCC00; color: #000; }
  .secondary { background: #fff; color: #111; }
  .logo { width: 100%; max-width: 320px; height: auto; display: block; margin: 0 auto 16px; }
`;

type Platform = 'ios' | 'android' | 'unknown';

function detectPlatform(request: Request): Platform {
  const ua = request.headers.get('User-Agent') ?? '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'unknown';
}

function storeButtons(platform: Platform, env: Env): string {
  if (platform === 'ios') {
    return `<a class="secondary" href="${env.APP_STORE_URL}">Download op iPhone</a>`;
  }
  if (platform === 'android') {
    return `<a class="secondary" href="${env.PLAY_STORE_URL}">Download op Android</a>`;
  }
  return `
    <a class="secondary" href="${env.APP_STORE_URL}">Download op iPhone</a>
    <a class="secondary" href="${env.PLAY_STORE_URL}">Download op Android</a>`;
}

function homepageHtml(): string {
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Virals Game</title>
    <style>${SHARED_STYLES}</style>
  </head>
  <body>
    <div id="sunburst"></div>
    <div class="card">
      <img class="logo" src="/virals-logo.png" alt="Virals Meme Editie" />
      <p>Pre-order nu het virale meme kaartspel en speel het samen met vrienden.</p>
      <div class="buttons">
        <a class="primary" href="https://avondmakers.nl/products/virals-meme-editie">Pre-order</a>
      </div>
    </div>
  </body>
</html>`;
}

function fallbackHtml(cardId: string, _platform: Platform, _env: Env): string {
  const escapedCardId = cardId.replaceAll(/[^\da-z]/gi, '');
  const deepLink = `viralsgame://${escapedCardId}`;

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Virals Game</title>
    <style>${SHARED_STYLES}</style>
  </head>
  <body>
    <div id="sunburst"></div>
    <div class="card">
      <img class="logo" src="/virals-logo.png" alt="Virals Meme Editie" />
      <p>Je hebt een kaart gescand van Virals Game. Pre-order nu jouw eigen set!</p>
      <div class="buttons">
        <a class="primary" href="https://avondmakers.nl/products/virals-meme-editie">Pre-order</a>
      </div>
    </div>
    <script>
      setTimeout(() => {
        window.location.href = '${deepLink}';
      }, 120);
    </script>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

async function sendReportMail(
  env: Env,
  subject: string,
  text: string,
): Promise<void> {
  const recipients = env.REPORT_EMAIL_TO.split(',')
    .map((address) => address.trim())
    .filter(Boolean);

  await env.EMAIL.send({
    to: recipients,
    from: { email: 'rapport@viralsgame.nl', name: 'Virals Video Check' },
    subject,
    text,
    html: `<pre style="font-family: ui-monospace, monospace; white-space: pre-wrap;">${escapeHtml(text)}</pre>`,
  });
}

async function handleVideosReport(
  request: Request,
  env: Env,
): Promise<Response> {
  const authorization = request.headers.get('Authorization') ?? '';
  if (!env.MAILER_TOKEN || authorization !== `Bearer ${env.MAILER_TOKEN}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: { subject?: string; text?: string };
  try {
    payload = (await request.json()) as { subject?: string; text?: string };
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (typeof payload.subject !== 'string' || typeof payload.text !== 'string') {
    return new Response('Missing subject or text', { status: 400 });
  }

  await sendReportMail(env, payload.subject, payload.text);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/brand-ocean/qr/main';
const CHECK_CONCURRENCY = 20;

interface CardVideo {
  cardId: string;
  videoId: string;
}

interface CardCheckFailure extends CardVideo {
  allowlistReason?: string;
  status: number;
}

function parseVideoCards(source: string): CardVideo[] {
  const cards: CardVideo[] = [];
  for (const match of source.matchAll(
    /id: '(kaart\d{4})',[\s\S]*?videoId: '((?:[^'\\]|\\.)*)'/g,
  )) {
    cards.push({ cardId: match[1], videoId: match[2] });
  }
  return cards;
}

function oembedUrl(videoId: string): string {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
}

function checkReportText(
  totalCards: number,
  broken: ReadonlyArray<CardCheckFailure>,
  allowlisted: ReadonlyArray<CardCheckFailure>,
): string {
  const lines: string[] = [];
  if (broken.length === 0) {
    lines.push(`Alles werkt. Alle ${totalCards} video's zijn beschikbaar.`);
  } else {
    lines.push(
      broken.length === 1
        ? `1 video werkt niet:`
        : `${broken.length} video's werken niet:`,
      '',
    );
    for (const failure of broken) {
      lines.push(
        `${failure.cardId} → https://www.youtube.com/watch?v=${failure.videoId} (HTTP ${failure.status})`,
      );
    }
  }
  if (allowlisted.length > 0) {
    lines.push(
      '',
      `Bewust genegeerd: ${allowlisted.map((failure) => failure.cardId).join(', ')}`,
    );
  }
  lines.push('', `Gecontroleerd: ${totalCards} kaarten.`);
  return lines.join('\n');
}

async function handleManualVideosCheck(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') ?? '';
  if (!env.TRIGGER_KEY || key !== env.TRIGGER_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const [videosResponse, allowlistResponse] = await Promise.all([
    fetch(`${GITHUB_RAW_BASE}/src/data/videos.ts`),
    fetch(`${GITHUB_RAW_BASE}/config/videos-check-allowlist.json`),
  ]);
  if (!videosResponse.ok || !allowlistResponse.ok) {
    return new Response('Kon de kaartdata niet ophalen van GitHub.', {
      status: 502,
    });
  }

  const cards = parseVideoCards(await videosResponse.text());
  const allowlist = (await allowlistResponse.json()) as {
    entries?: ReadonlyArray<{
      cardId: string;
      reason?: string;
      videoId: string;
    }>;
  };
  const allowlistByKey = new Map(
    (allowlist.entries ?? []).map((entry) => [
      `${entry.cardId}|${entry.videoId}`,
      entry.reason ?? 'allowlisted',
    ]),
  );

  const statuses: number[] = Array.from({ length: cards.length }, () => 0);
  let nextIndex = 0;
  const lane = async (): Promise<void> => {
    while (nextIndex < cards.length) {
      const index = nextIndex++;
      try {
        statuses[index] = (await fetch(oembedUrl(cards[index].videoId))).status;
      } catch {
        statuses[index] = -1;
      }
    }
  };
  await Promise.all(Array.from({ length: CHECK_CONCURRENCY }, lane));

  const broken: CardCheckFailure[] = [];
  const allowlisted: CardCheckFailure[] = [];
  for (const [index, card] of cards.entries()) {
    const status = statuses[index];
    if (status === 200) continue;
    const allowlistReason = allowlistByKey.get(
      `${card.cardId}|${card.videoId}`,
    );
    if (allowlistReason === undefined) {
      broken.push({ ...card, status });
    } else {
      allowlisted.push({ ...card, allowlistReason, status });
    }
  }

  const text = checkReportText(cards.length, broken, allowlisted);
  const subject =
    broken.length === 0
      ? `✅ Virals: alle ${cards.length} video's werken`
      : broken.length === 1
        ? `❌ Virals: 1 video werkt niet`
        : `❌ Virals: ${broken.length} video's werken niet`;

  const mailed = url.searchParams.get('mail') === '1';
  if (mailed) {
    await sendReportMail(env, subject, text);
  }

  const heading =
    broken.length === 0
      ? '✅ Alles werkt'
      : broken.length === 1
        ? '❌ 1 video werkt niet'
        : `❌ ${broken.length} video's werken niet`;
  const brokenList = broken
    .map(
      (failure) =>
        `<li><strong>${escapeHtml(failure.cardId)}</strong> — <a class="link" href="https://www.youtube.com/watch?v=${escapeHtml(failure.videoId)}">${escapeHtml(failure.videoId)}</a> (HTTP ${failure.status})</li>`,
    )
    .join('');
  const mailUrl = `/internal/videos-check?key=${encodeURIComponent(key)}&mail=1`;

  const page = `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Virals video-check</title>
    <style>${SHARED_STYLES}
      ul { padding-left: 20px; line-height: 1.6; }
      .link { display: inline; padding: 0; color: #FFCC00; }
      .muted { opacity: 0.7; font-size: 14px; }
    </style>
  </head>
  <body>
    <div id="sunburst"></div>
    <div class="card">
      <h1>${heading}</h1>
      ${broken.length > 0 ? `<ul>${brokenList}</ul>` : ''}
      ${allowlisted.length > 0 ? `<p class="muted">Bewust genegeerd: ${escapeHtml(allowlisted.map((failure) => failure.cardId).join(', '))}</p>` : ''}
      <p class="muted">Gecontroleerd: ${cards.length} kaarten.</p>
      <div class="buttons">
        ${
          mailed
            ? `<p>📧 Rapport gemaild naar ${escapeHtml(env.REPORT_EMAIL_TO)}</p>`
            : `<a class="primary" href="${mailUrl}">Mail dit rapport</a>`
        }
      </div>
    </div>
  </body>
</html>`;

  return new Response(page, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/internal/videos-report' && request.method === 'POST') {
      return handleVideosReport(request, env);
    }

    if (pathname === '/internal/videos-check' && request.method === 'GET') {
      return handleManualVideosCheck(request, env);
    }

    if (pathname === '/') {
      return new Response(homepageHtml(), {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    if (
      pathname === '/.well-known/apple-app-site-association' ||
      pathname === '/apple-app-site-association'
    ) {
      return new Response(JSON.stringify(AASA), {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'Content-Type': 'application/json',
        },
      });
    }

    if (pathname === '/.well-known/assetlinks.json') {
      return new Response(JSON.stringify(ASSET_LINKS), {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'Content-Type': 'application/json',
        },
      });
    }

    const match = pathname.match(/^\/(kaart\d{4})$/i);
    if (match?.[1]) {
      return new Response(
        fallbackHtml(match[1].toLowerCase(), detectPlatform(request), env),
        {
          headers: {
            'Cache-Control': 'no-store',
            'Content-Type': 'text/html; charset=utf-8',
          },
        },
      );
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
