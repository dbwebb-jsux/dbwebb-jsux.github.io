// Adds the weekly lecture videos from the course's YouTube playlist to the kmom pages.
//
// Reads the playlist's RSS feed and picks the videos titled
// "[jsux] genomgång kmomNN ..." or "[jsux] föreläsning kmomNN ...". Each video is
// embedded once, in a "Veckans genomgång" / "Veckans föreläsning" section at the end of
// "Läsa & titta" (kmom10: before "Projektets upplägg"). Running it again changes nothing
// unless a new video has appeared.
//
// Usage: node scripts/add-youtube-videos.mjs [--feed feed.xml]
import { readFile, writeFile } from 'node:fs/promises';

const PLAYLIST_ID = 'PLVDGHjA5-1qY';
const DOCS = new URL('../src/content/docs/', import.meta.url);

// The intro uses the presenters from the title ("... kmom01 med Emil (och Mattias)"),
// falling back to the usual line-up when the title doesn't say.
const TYPES = {
  'genomgång': {
    heading: 'Veckans genomgång',
    intro: (who = 'Emil') => `${who} går igenom veckans material och uppgifter i videon nedan.`,
  },
  'föreläsning': {
    heading: 'Veckans föreläsning',
    intro: (who = 'Kenneth, Mattias och Emil') => `${who} håller veckans föreläsning, här kan du se inspelningen.`,
  },
};
const TITLE = /^\[jsux\]\s*(genomgång|föreläsning)\s*kmom\s*(\d{1,2})\b(?:.*?\bmed\s+(.+?))?\s*$/i;
const IMPORT = "import { YouTube } from 'astro-embed';";

const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }[e]));

// The presenters end up in the MDX text, so drop anything MDX could read as markup or code
// ({ } < > [ ] backticks and so on). Names, spaces, commas, "&" and parentheses are kept.
const cleanWho = (s) => s.replace(/[^\p{L}\p{N}\s,&()'.-]/gu, '').replace(/\s+/g, ' ').trim() || undefined;

async function readFeed() {
  const i = process.argv.indexOf('--feed');
  if (i !== -1) return readFile(process.argv[i + 1], 'utf8');
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`);
  if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
  return res.text();
}

function parseVideos(xml) {
  const videos = [];
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
    const title = decode(entry.match(/<title>(.*?)<\/title>/)?.[1] ?? '');
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? '';
    const m = title.match(TITLE);
    if (id && m) videos.push({ id, published, type: m[1].toLowerCase(), kmom: m[2].padStart(2, '0'), who: m[3] && cleanWho(m[3]) });
  }
  // Oldest first, so several videos for one kmom end up in the order they were published.
  return videos.sort((a, b) => a.published.localeCompare(b.published));
}

function embed(id) {
  return `<YouTube posterQuality="max" id="${id}" />`;
}

function addVideo(text, { id, type, who }) {
  const { heading, intro } = TYPES[type];
  const lines = text.split('\n');
  const find = (re, from = 0) => { for (let i = from; i < lines.length; i++) if (re.test(lines[i])) return i; return -1; };

  // Section already there: add the embed after its last video.
  const sec = find(new RegExp(`^#{2,3} ${heading}\\s*$`));
  if (sec !== -1) {
    let end = find(/^#{2,3} /, sec + 1);
    if (end === -1) end = lines.length;
    let last = sec;
    for (let i = sec; i < end; i++) if (lines[i].startsWith('<YouTube')) last = i;
    lines.splice(last + 1, 0, '', embed(id));
    return lines.join('\n');
  }

  // New section, at the end of "Läsa & titta" (or before "Projektets upplägg" in kmom10).
  const watch = find(/^## Läsa & titta\s*$/);
  let anchor = watch !== -1 ? find(/^## /, watch + 1) : find(/^## Projektets upplägg\s*$/);
  // The genomgång (Tuesday) always comes before the föreläsning (Wednesday).
  const lecture = type === 'genomgång' ? find(new RegExp(`^#{2,3} ${TYPES['föreläsning'].heading}\\s*$`)) : -1;
  if (lecture !== -1) anchor = lecture;
  if (anchor === -1) throw new Error('Found no place to add the section');
  const level = watch !== -1 ? '###' : '##';
  lines.splice(anchor, 0, `${level} ${heading}`, '', intro(who), '', embed(id), '', '');
  return lines.join('\n');
}

function ensureImport(text) {
  if (text.includes(IMPORT)) return text;
  const end = text.indexOf('\n---', 4);
  return text.slice(0, end + 4) + `\n\n${IMPORT}\n` + text.slice(end + 4);
}

const videos = parseVideos(await readFeed());
let added = 0;
for (const video of videos) {
  const file = new URL(`kmom${video.kmom}.mdx`, DOCS);
  let text;
  try { text = await readFile(file, 'utf8'); } catch { console.warn(`No page kmom${video.kmom}, skipping ${video.id}`); continue; }
  if (text.includes(`id="${video.id}"`)) continue;
  await writeFile(file, ensureImport(addVideo(text, video)));
  console.log(`kmom${video.kmom}: added ${video.type} ${video.id}`);
  added++;
}
console.log(added ? `${added} video(s) added` : 'No new videos');
