// Announces the videos listed in a report file (written by add-youtube-videos.mjs --report)
// in a Discord channel through a webhook.
//
// Usage: node scripts/post-to-discord.mjs <report.json> [--dry-run]
// The webhook URL is read from the DISCORD_WEBHOOK_URL environment variable (a repo secret).
// Without it nothing is sent. --dry-run prints the messages instead of sending them.
import { readFile } from 'node:fs/promises';


const [, , reportFile] = process.argv;
const dryRun = process.argv.includes('--dry-run');
if (!reportFile) throw new Error('Usage: node scripts/post-to-discord.mjs <report.json> [--dry-run]');

const videos = JSON.parse(await readFile(reportFile, 'utf8'));
const webhook = process.env.DISCORD_WEBHOOK_URL;

if (!videos.length) {
  console.log('No new videos to announce');
} else if (!webhook && !dryRun) {
  console.log('DISCORD_WEBHOOK_URL is not set, skipping');
} else {
  for (const { id, heading, text } of videos) {
    // The same heading and intro text as on the course page. The presenter names in it come from
    // the video title but have already been stripped of markup by add-youtube-videos.mjs.
    if (!/^[\w-]{11}$/.test(id)) { console.warn(`Skipping odd video id: ${id}`); continue; }
    const content = `**${heading}**\n${text}\nhttps://youtu.be/${id}`;
    // parse: [] means the message can never ping @everyone, @here, roles or users.
    const body = JSON.stringify({ content, allowed_mentions: { parse: [] } });
    if (dryRun) { console.log(body); continue; }
    const res = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    if (!res.ok) throw new Error(`Discord answered ${res.status} for ${id}`);
    console.log(`Posted ${id}`);
  }
}
