import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// YouTube availability check every 6 hours (4×/day). Writes each card's status
// back into Convex so the admin shows what works and what doesn't, and keeps
// "laatst gecheckt" fresh. Also runnable on demand via the "Check nu" button.
crons.interval(
  'videos availability check',
  { hours: 6 },
  internal.availability.runScheduledCheck,
);

export default crons;
