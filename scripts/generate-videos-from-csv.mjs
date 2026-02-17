#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_CSV_PATH =
  '/Users/brandocean/Downloads/Virals Meme lijst - Blad1.csv';
const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), 'src/data/videos.ts');

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        const nextChar = content[i + 1];
        if (nextChar === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (char === '\r') {
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function getValue(row, indexByHeader, headerName) {
  const index = indexByHeader.get(headerName);
  if (typeof index !== 'number') {
    return '';
  }
  return (row[index] ?? '').trim();
}

function extractCardId(urlSpelValue) {
  const match = urlSpelValue.match(/kaart\d{4}/i);
  return match ? match[0].toLowerCase() : null;
}

const youtubeIdPatterns = [
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([\w-]{11})(?:[#&/?]|$)/i,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:[^\s#]*?&)?v=\/?([\w-]{11})(?:[#&/?]|$)/i,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:live|shorts|embed)\/([\w-]{11})(?:[#&/?]|$)/i,
];

function extractYouTubeId(urlValue) {
  for (const pattern of youtubeIdPatterns) {
    const match = urlValue.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function parseNumber(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.floor(parsed);
}

function parseYear(value) {
  const matches = value.match(/(?:19|20)\d{2}/g);
  if (!matches || matches.length === 0) {
    return 0;
  }
  return Number.parseInt(matches.at(-1), 10);
}

function escapeSingleQuotedString(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", String.raw`\'`);
}

function createVideosFile(videos) {
  const records = videos
    .map((video) => {
      return [
        '  {',
        `    id: '${escapeSingleQuotedString(video.id)}',`,
        `    quote: '${escapeSingleQuotedString(video.quote)}',`,
        `    videoId: '${escapeSingleQuotedString(video.videoId)}',`,
        `    startTime: ${video.startTime},`,
        `    endTime: ${video.endTime},`,
        `    year: ${video.year},`,
        `    contentWarning: ${video.contentWarning},`,
        '  },',
      ].join('\n');
    })
    .join('\n');

  return `/**
 * Video data for the VIRALS Meme Editie app.
 *
 * This file is auto-generated from CSV source data.
 * Source: /Users/brandocean/Downloads/Virals Meme lijst - Blad1.csv
 */

export type VideoCard = {
  readonly id: string;
  readonly quote: string;
  readonly videoId: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly year: number;
  readonly contentWarning: boolean;
};

export const VIDEOS: ReadonlyArray<VideoCard> = [
${records}
] as const;

/**
 * Lookup map for O(1) video access by ID.
 */
export const VIDEO_BY_ID = new Map<string, VideoCard>(
  VIDEOS.map((video) => [video.id, video]),
);

/**
 * Get a video by its ID.
 * @param id - The video ID (e.g., 'kaart0001')
 * @returns The video card or null if not found
 */
export function getVideoById(id: string): VideoCard | null {
  return VIDEO_BY_ID.get(id) ?? null;
}

/**
 * Get a random video from the collection.
 * @returns A random video card
 */
export function getRandomVideo(): VideoCard {
  const randomIndex = Math.floor(Math.random() * VIDEOS.length);
  return VIDEOS[randomIndex];
}
`;
}

function main() {
  const csvPath = process.argv[2] ?? process.env.CSV_PATH ?? DEFAULT_CSV_PATH;
  const outputPath = process.argv[3] ?? DEFAULT_OUTPUT_PATH;

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsv(csvContent);

  if (rows.length < 2) {
    throw new Error('CSV appears empty or missing data rows.');
  }

  const headers = rows[0].map((header) => header.trim());
  const indexByHeader = new Map(
    headers.map((header, index) => [header, index]),
  );

  const videos = [];
  const ids = new Set();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const id = extractCardId(getValue(row, indexByHeader, 'URL Spel'));
    const youtubeUrl = getValue(row, indexByHeader, 'URL Youtube');
    const videoId = extractYouTubeId(youtubeUrl);

    if (!id || !videoId) {
      continue;
    }

    if (ids.has(id)) {
      throw new Error(`Duplicate card ID found: ${id}`);
    }
    ids.add(id);

    videos.push({
      contentWarning: getValue(row, indexByHeader, '☠️').toUpperCase() === 'X',
      endTime: parseNumber(getValue(row, indexByHeader, 'Eind')),
      id,
      quote: getValue(row, indexByHeader, 'Quote'),
      startTime: parseNumber(getValue(row, indexByHeader, 'Start')),
      videoId,
      year: parseYear(getValue(row, indexByHeader, 'Jaar')),
    });
  }

  videos.sort((a, b) => a.id.localeCompare(b.id));

  const output = createVideosFile(videos);
  fs.writeFileSync(outputPath, output, 'utf8');
  process.stdout.write(`Generated ${videos.length} videos at ${outputPath}\n`);
}

main();
