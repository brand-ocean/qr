#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_VIDEOS_PATH = path.join(process.cwd(), 'src/data/videos.ts');
const DEFAULT_ALLOWLIST_PATH = path.join(
  process.cwd(),
  'config/videos-check-allowlist.json',
);
const DEFAULT_CONCURRENCY = 8;
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 10_000;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

function writeLine(message = '') {
  process.stdout.write(`${message}\n`);
}

function writeErrorLine(message = '') {
  process.stderr.write(`${message}\n`);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseArgs(args) {
  const options = {
    allowlistPath: DEFAULT_ALLOWLIST_PATH,
    concurrency: DEFAULT_CONCURRENCY,
    reportJsonPath: null,
    reportMarkdownPath: null,
    videosPath: DEFAULT_VIDEOS_PATH,
  };

  for (const arg of args) {
    if (arg.startsWith('--videos=')) {
      options.videosPath = path.resolve(arg.slice('--videos='.length));
      continue;
    }
    if (arg.startsWith('--allowlist=')) {
      options.allowlistPath = path.resolve(arg.slice('--allowlist='.length));
      continue;
    }
    if (arg.startsWith('--concurrency=')) {
      const value = Number.parseInt(arg.slice('--concurrency='.length), 10);
      if (!Number.isInteger(value) || value <= 0) {
        throw new Error(
          `Invalid --concurrency value "${arg}". Use a positive integer.`,
        );
      }
      options.concurrency = value;
      continue;
    }
    if (arg.startsWith('--report-json=')) {
      options.reportJsonPath = path.resolve(arg.slice('--report-json='.length));
      continue;
    }
    if (arg.startsWith('--report-md=')) {
      options.reportMarkdownPath = path.resolve(
        arg.slice('--report-md='.length),
      );
      continue;
    }

    throw new Error(
      `Unknown argument "${arg}". Supported: --videos=, --allowlist=, --concurrency=, --report-json=, --report-md=`,
    );
  }

  return options;
}

function extractVideoCards(videosFileContent) {
  const videosArrayMatch = videosFileContent.match(
    /export const VIDEOS:\s*ReadonlyArray<VideoCard>\s*=\s*\[([\S\s]*?)]\s*as const;/,
  );
  if (!videosArrayMatch) {
    throw new Error('Could not find `VIDEOS` array in videos.ts');
  }

  const videosArrayBody = videosArrayMatch[1];
  const objectMatches = [...videosArrayBody.matchAll(/{([\S\s]*?)},/g)];

  const cards = objectMatches
    .map((match) => {
      const objectBody = match[1];
      const cardId = objectBody.match(/id:\s*'([^']+)'/)?.[1]?.toLowerCase();
      const videoId = objectBody.match(/videoId:\s*'([^']+)'/)?.[1];

      if (!cardId || !videoId) {
        return null;
      }

      return { cardId, videoId };
    })
    .filter((card) => card !== null);

  cards.sort((a, b) => a.cardId.localeCompare(b.cardId));

  return cards;
}

function parseAllowlist(content) {
  const parsed = JSON.parse(content);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Allowlist file must contain a JSON object.');
  }
  if (!Array.isArray(parsed.entries)) {
    throw new Error('Allowlist file must include an `entries` array.');
  }

  const entries = parsed.entries.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Allowlist entry at index ${index} must be an object.`);
    }

    const cardId =
      typeof entry.cardId === 'string' ? entry.cardId.toLowerCase() : '';
    const videoId = typeof entry.videoId === 'string' ? entry.videoId : '';

    if (!cardId || !videoId) {
      throw new Error(
        `Allowlist entry at index ${index} must include non-empty "cardId" and "videoId".`,
      );
    }

    return {
      addedOn:
        typeof entry.addedOn === 'string' && entry.addedOn.length > 0
          ? entry.addedOn
          : null,
      cardId,
      expiresOn:
        typeof entry.expiresOn === 'string' && entry.expiresOn.length > 0
          ? entry.expiresOn
          : null,
      reason:
        typeof entry.reason === 'string' && entry.reason.length > 0
          ? entry.reason
          : 'No reason provided',
      videoId,
    };
  });

  const entriesByKey = new Map();
  for (const entry of entries) {
    const key = `${entry.cardId}|${entry.videoId}`;
    if (entriesByKey.has(key)) {
      throw new Error(
        `Duplicate allowlist entry for cardId "${entry.cardId}" + videoId "${entry.videoId}".`,
      );
    }
    entriesByKey.set(key, entry);
  }

  return entriesByKey;
}

function createOEmbedUrl(videoId) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const encodedWatchUrl = encodeURIComponent(watchUrl);
  return `https://www.youtube.com/oembed?url=${encodedWatchUrl}&format=json`;
}

function createBackoffDelay(attempt) {
  return 250 * (attempt + 1);
}

async function checkVideoAvailability(card) {
  const oEmbedUrl = createOEmbedUrl(card.videoId);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(
      () => timeoutController.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(oEmbedUrl, {
        headers: {
          accept: 'application/json',
          'user-agent': 'viralsgame-videos-check/1.0',
        },
        redirect: 'follow',
        signal: timeoutController.signal,
      });

      if (response.status === 200) {
        clearTimeout(timeoutId);
        return {
          attempts: attempt + 1,
          cardId: card.cardId,
          ok: true,
          status: response.status,
          videoId: card.videoId,
        };
      }

      if (
        attempt < MAX_RETRIES &&
        RETRYABLE_STATUS_CODES.has(response.status)
      ) {
        clearTimeout(timeoutId);
        await sleep(createBackoffDelay(attempt));
        continue;
      }

      clearTimeout(timeoutId);
      return {
        attempts: attempt + 1,
        cardId: card.cardId,
        message: `HTTP ${response.status}`,
        ok: false,
        status: response.status,
        videoId: card.videoId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const shouldRetry = attempt < MAX_RETRIES;

      clearTimeout(timeoutId);

      if (shouldRetry) {
        await sleep(createBackoffDelay(attempt));
        continue;
      }

      return {
        attempts: attempt + 1,
        cardId: card.cardId,
        message,
        ok: false,
        status: 0,
        videoId: card.videoId,
      };
    }
  }

  return {
    attempts: MAX_RETRIES + 1,
    cardId: card.cardId,
    message: 'Unknown error',
    ok: false,
    status: 0,
    videoId: card.videoId,
  };
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({
    length: Math.min(concurrency, items.length),
  }).map(async () => {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  });

  await Promise.all(workers);
  return results;
}

function createCheckKey(cardId, videoId) {
  return `${cardId}|${videoId}`;
}

function escapeMarkdownCell(value) {
  return String(value ?? '')
    .replaceAll('|', String.raw`\|`)
    .replaceAll('\n', ' ')
    .trim();
}

function formatFailureMessage(result) {
  return result.message ?? `HTTP ${result.status}`;
}

function createMarkdownTable(headers, rows) {
  const headerLine = `| ${headers.map(escapeMarkdownCell).join(' | ')} |`;
  const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const bodyLines = rows.map((row) => {
    return `| ${row.map(escapeMarkdownCell).join(' | ')} |`;
  });
  return [headerLine, separatorLine, ...bodyLines].join('\n');
}

function createMarkdownReport(report) {
  let lines = [
    '# YouTube Availability Report',
    '',
    `Generated at: ${report.generatedAt}`,
    `Videos file: ${report.videosFile}`,
    `Allowlist file: ${report.allowlistFile}`,
    `Concurrency: ${report.concurrency}`,
    '',
    '## Summary',
    '',
    createMarkdownTable(
      [
        'Total checked',
        'Passed',
        'Allowlisted failures',
        'Blocking failures',
        'Stale allowlist entries',
      ],
      [
        [
          report.summary.totalChecked,
          report.summary.passed,
          report.summary.allowlistedFailures,
          report.summary.blockingFailures,
          report.summary.staleAllowlistEntries,
        ],
      ],
    ),
    '',
  ];

  if (report.allowlistedFailures.length > 0) {
    lines = lines.concat([
      '## Allowlisted Failures',
      '',
      createMarkdownTable(
        ['Card ID', 'Video ID', 'Status', 'Message', 'Reason'],
        report.allowlistedFailures.map((item) => {
          return [
            item.cardId,
            item.videoId,
            item.status,
            item.message,
            item.reason,
          ];
        }),
      ),
      '',
    ]);
  }

  if (report.blockingFailures.length > 0) {
    lines = lines.concat([
      '## Blocking Failures',
      '',
      createMarkdownTable(
        ['Card ID', 'Video ID', 'Status', 'Message'],
        report.blockingFailures.map((item) => {
          return [item.cardId, item.videoId, item.status, item.message];
        }),
      ),
      '',
    ]);
  }

  if (report.staleAllowlistEntries.length > 0) {
    lines = lines.concat([
      '## Stale Allowlist Entries',
      '',
      createMarkdownTable(
        ['Card ID', 'Video ID', 'Reason', 'Added On', 'Expires On'],
        report.staleAllowlistEntries.map((item) => {
          return [
            item.cardId,
            item.videoId,
            item.reason,
            item.addedOn ?? '',
            item.expiresOn ?? '',
          ];
        }),
      ),
      '',
    ]);
  }

  if (
    report.allowlistedFailures.length === 0 &&
    report.blockingFailures.length === 0 &&
    report.staleAllowlistEntries.length === 0
  ) {
    lines = lines.concat([
      'No failures or stale allowlist entries detected.',
      '',
    ]);
  }

  return lines.join('\n');
}

async function writeOptionalFile(filePath, content) {
  if (!filePath) {
    return;
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

function printConsoleReport(report) {
  writeLine('YouTube availability check (oEmbed)');
  writeLine(`Videos file : ${report.videosFile}`);
  writeLine(`Allowlist   : ${report.allowlistFile}`);
  writeLine(`Concurrency : ${report.concurrency}`);
  writeLine('');

  writeLine('Summary');
  writeLine(`- Total cards checked : ${report.summary.totalChecked}`);
  writeLine(`- Passed              : ${report.summary.passed}`);
  writeLine(`- Allowlisted failures: ${report.summary.allowlistedFailures}`);
  writeLine(`- Blocking failures   : ${report.summary.blockingFailures}`);
  writeLine('');

  if (report.allowlistedFailures.length > 0) {
    writeLine('Allowlisted failures');
    for (const item of report.allowlistedFailures) {
      writeLine(
        `- ${item.cardId} (${item.videoId}) -> ${item.message} [${item.reason}]`,
      );
    }
    writeLine('');
  }

  if (report.staleAllowlistEntries.length > 0) {
    writeLine('Stale allowlist entries (not found in videos.ts)');
    for (const item of report.staleAllowlistEntries) {
      writeLine(`- ${item.cardId} (${item.videoId})`);
    }
    writeLine('');
  }

  if (report.blockingFailures.length > 0) {
    writeErrorLine('Blocking failures');
    for (const item of report.blockingFailures) {
      writeErrorLine(`- ${item.cardId} (${item.videoId}) -> ${item.message}`);
    }
    return;
  }

  writeLine('Result: PASS');
}

function createReport({
  allowlistByKey,
  allowlistPath,
  cards,
  checkResults,
  concurrency,
  videosPath,
}) {
  const passed = [];
  const allowlistedFailures = [];
  const blockingFailures = [];

  const seenCardKeys = new Set(
    cards.map((card) => createCheckKey(card.cardId, card.videoId)),
  );

  for (const result of checkResults) {
    if (result.ok) {
      passed.push(result);
      continue;
    }

    const checkKey = createCheckKey(result.cardId, result.videoId);
    const allowlistEntry = allowlistByKey.get(checkKey);
    if (allowlistEntry) {
      allowlistedFailures.push({
        attempts: result.attempts,
        cardId: result.cardId,
        message: formatFailureMessage(result),
        reason: allowlistEntry.reason,
        status: result.status,
        videoId: result.videoId,
      });
      continue;
    }

    blockingFailures.push({
      attempts: result.attempts,
      cardId: result.cardId,
      message: formatFailureMessage(result),
      status: result.status,
      videoId: result.videoId,
    });
  }

  const staleAllowlistEntries = [];
  for (const [key, entry] of allowlistByKey.entries()) {
    if (!seenCardKeys.has(key)) {
      staleAllowlistEntries.push(entry);
    }
  }

  staleAllowlistEntries.sort((a, b) => a.cardId.localeCompare(b.cardId));
  allowlistedFailures.sort((a, b) => a.cardId.localeCompare(b.cardId));
  blockingFailures.sort((a, b) => a.cardId.localeCompare(b.cardId));

  return {
    allowlistedFailures,
    allowlistFile: allowlistPath,
    blockingFailures,
    concurrency,
    generatedAt: new Date().toISOString(),
    staleAllowlistEntries,
    summary: {
      allowlistedFailures: allowlistedFailures.length,
      blockingFailures: blockingFailures.length,
      passed: passed.length,
      staleAllowlistEntries: staleAllowlistEntries.length,
      totalChecked: cards.length,
    },
    videosFile: videosPath,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const videosFileContent = await fs.readFile(options.videosPath, 'utf8');
  const cards = extractVideoCards(videosFileContent);

  if (cards.length === 0) {
    throw new Error('No cards found in videos.ts');
  }

  const allowlistContent = await fs.readFile(options.allowlistPath, 'utf8');
  const allowlistByKey = parseAllowlist(allowlistContent);

  const checkResults = await runWithConcurrency(
    cards,
    options.concurrency,
    checkVideoAvailability,
  );

  const report = createReport({
    allowlistByKey,
    allowlistPath: options.allowlistPath,
    cards,
    checkResults,
    concurrency: options.concurrency,
    videosPath: options.videosPath,
  });

  const markdownReport = createMarkdownReport(report);
  const jsonReport = `${JSON.stringify(report, null, 2)}\n`;

  await Promise.all([
    writeOptionalFile(options.reportJsonPath, jsonReport),
    writeOptionalFile(options.reportMarkdownPath, markdownReport),
  ]);

  printConsoleReport(report);

  return report.summary.blockingFailures > 0 ? 1 : 0;
}

try {
  const exitCode = await main();
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  writeErrorLine(`videos:check failed: ${message}`);
  process.exit(1);
}
