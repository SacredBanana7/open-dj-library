// Adds every track of an Internet Archive upload to the catalog. Artists upload
// their music to archive.org with a Creative Commons license, then submit the
// link (directly or through the "Track einreichen" issue form).
//
//   node tools/submit.mjs https://archive.org/details/<identifier> [--genre techno]
// SPDX-License-Identifier: GPL-3.0-or-later
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import OpenMusic from '../lib/openmusic.js';
import { analyzeMp3 } from '../lib/analyze.js';
import { makeEntry, entryFile, validateEntry } from '../lib/entry.js';
import { foldEntry } from '../lib/tempo.js';

const [link = ''] = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !all[i - 1]?.startsWith('--'));
const gi = process.argv.indexOf('--genre');
const genreKey = gi > 0 ? process.argv[gi + 1] : '';
const genre = OpenMusic.GENRES[genreKey]?.label || undefined;
const id = /archive\.org\/(?:details|download)\/([A-Za-z0-9._-]+)/.exec(link)?.[1] || (/^[A-Za-z0-9._-]+$/.test(link) ? link : '');
if (!id) { console.error('Bitte einen archive.org-Link angeben: https://archive.org/details/<name>'); process.exit(2); }

const root = fileURLToPath(new URL('../tracks/archive.org/', import.meta.url));
const { item, tracks } = await OpenMusic.archiveTracks(id);
const lic = tracks[0]?.license;
if (!lic?.url || !/creativecommons\.org|publicdomain/i.test(lic.url)) {
  console.error(`„${item.title}“ hat keine Creative-Commons-Lizenz. Auf archive.org beim Upload eine CC-Lizenz wählen.`);
  process.exit(3);
}
console.log(`${item.title} · ${lic.label} · ${tracks.length} Tracks`);
let added = 0;
for (const r of tracks.filter((t) => /\.mp3$/i.test(t.streamUrl)).slice(0, 40)) {
  const file = `${root}${entryFile(r.source, r.id)}`;
  if (existsSync(file)) { console.log(`  schon drin: ${r.title}`); continue; }
  try {
    const res = await fetch(r.streamUrl, { headers: { 'User-Agent': 'open-dj-library/0.1 (+https://github.com/SacredBanana7/open-dj-library)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > 40e6) throw new Error('Datei zu groß');
    const entry = makeEntry(r, await analyzeMp3(bytes), { genre });
    foldEntry(entry);
    const errs = validateEntry(entry);
    if (errs.length) throw new Error(errs.join(', '));
    mkdirSync(root, { recursive: true });
    writeFileSync(file, JSON.stringify(entry, null, 2) + '\n');
    added++;
    console.log(`  + ${entry.artist} – ${entry.title} | ${entry.analysis.bpm} BPM ${entry.analysis.key.camelot}`);
  } catch (e) { console.log(`  Fehler bei ${r.title}: ${e.message}`); }
}
console.log(`${added} neue Einträge`);
process.exit(added ? 0 : 1);
