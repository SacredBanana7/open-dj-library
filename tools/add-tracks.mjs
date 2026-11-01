// Finds freely licensed tracks, analyses them with Pulsar's analysis and writes
// one catalog entry per track to tracks/<source>/. Audio is only downloaded
// temporarily for the analysis and never stored in the repository.
//
//   node tools/add-tracks.mjs --genre techno --count 15 [--license any|commercial|cc0]
//                             [--sources archive.org,openverse] [--query "..."]
// SPDX-License-Identifier: GPL-3.0-or-later
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import OpenMusic from '../lib/openmusic.js';
import { analyzeMp3 } from '../lib/analyze.js';
import { makeEntry, entryFile, validateEntry } from '../lib/entry.js';
import { foldEntry } from '../lib/tempo.js';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return acc;
}, []));
const genre = args.genre || '';
const query = args.query || '';
const count = Number(args.count) || 10;
const license = args.license || 'any';
const sources = (args.sources || 'archive.org,openverse').split(',');
const MIN_SEC = 150, MAX_SEC = 12 * 60, MAX_BYTES = 30e6;
const root = fileURLToPath(new URL('../tracks/', import.meta.url));
const genreLabel = OpenMusic.GENRES[genre]?.label || genre || undefined;

const pathOf = (r) => `${root}${r.source}/${entryFile(r.source, r.id)}`;
const fits = (r) => r.kind === 'track' && r.streamUrl && /\.mp3($|\?)|format=mp3/i.test(r.streamUrl + (r.fileName || '')) &&
  (!r.durationSec || (r.durationSec >= MIN_SEC && r.durationSec <= MAX_SEC)) && (!r.size || r.size <= MAX_BYTES);

async function candidates() {
  const out = [];
  for (let page = 1; page <= 4 && out.length < count * 3; page++) {
    const groups = await OpenMusic.searchAll({ query, genre, license, page, sources, rows: 20 });
    for (const g of groups) {
      if (!g.ok) { console.warn(`  ${g.source}: ${g.error}`); continue; }
      for (const r of g.results) {
        if (r.kind === 'album') {
          try {
            const tracks = (await r.tracks()).filter(fits);
            // at most two tracks per release keeps the catalog varied
            out.push(...tracks.slice(0, 2));
          } catch (e) { console.warn(`  album ${r.id}: ${e.message}`); }
        } else if (fits(r)) out.push(r);
      }
    }
  }
  return out;
}

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'open-dj-library/0.1 (+https://github.com/SacredBanana7/open-dj-library)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

const list = await candidates();
console.log(`${genreLabel || query || 'alle'}: ${list.length} Kandidaten, Ziel ${count}`);
let added = 0;
for (const r of list) {
  if (added >= count) break;
  const file = pathOf(r);
  if (existsSync(file)) continue;
  try {
    const t0 = Date.now();
    const bytes = await download(r.streamUrl);
    const analysis = await analyzeMp3(bytes);
    if (analysis.durationSec < MIN_SEC || analysis.durationSec > MAX_SEC) { console.log(`  übersprungen (Länge): ${r.title}`); continue; }
    const entry = makeEntry(r, analysis, { genre: genreLabel });
    foldEntry(entry);
    const errs = validateEntry(entry);
    if (errs.length) { console.log(`  ungültig (${errs.join(', ')}): ${r.title}`); continue; }
    mkdirSync(`${root}${r.source}`, { recursive: true });
    writeFileSync(file, JSON.stringify(entry, null, 2) + '\n');
    added++;
    console.log(`  + ${entry.artist} – ${entry.title} | ${analysis.bpm} BPM ${analysis.key.camelot} | ${entry.license.label} | ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  } catch (e) {
    console.log(`  Fehler bei ${r.title}: ${e.message}`);
  }
}
console.log(`${added} neue Einträge`);
