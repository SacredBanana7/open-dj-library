// Combines tracks/**/*.json into catalog.json (the file DJ apps download) and
// prints a short summary. Fails on invalid entries.
// SPDX-License-Identifier: GPL-3.0-or-later
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateEntry } from '../lib/entry.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const tracksDir = `${root}tracks/`;
const entries = [];
let bad = 0;
if (existsSync(tracksDir)) {
  for (const source of readdirSync(tracksDir)) {
    for (const f of readdirSync(`${tracksDir}${source}`).filter((x) => x.endsWith('.json'))) {
      const e = JSON.parse(readFileSync(`${tracksDir}${source}/${f}`, 'utf8'));
      const errs = validateEntry(e);
      if (errs.length) { bad++; console.error(`${source}/${f}: ${errs.join(', ')}`); continue; }
      entries.push(e);
    }
  }
}
if (bad) { console.error(`${bad} ungültige Einträge`); process.exit(1); }
entries.sort((a, b) => (a.genre || '').localeCompare(b.genre || '') || a.analysis.bpm - b.analysis.bpm || a.id.localeCompare(b.id));

const count = (key) => entries.reduce((m, e) => { const k = key(e) || '–'; m[k] = (m[k] || 0) + 1; return m; }, {});
const catalog = {
  format: 'open-dj-library',
  version: 1,
  generated: new Date().toISOString(),
  license: 'CC0-1.0 (catalog data); each track keeps its own Creative Commons / public domain license',
  homepage: 'https://github.com/SacredBanana7/open-dj-library',
  count: entries.length,
  tracks: entries,
};
writeFileSync(`${root}catalog.json`, JSON.stringify(catalog) + '\n');
console.log(`catalog.json: ${entries.length} Tracks`);
console.log('Genres:', count((e) => e.genre));
console.log('Quellen:', count((e) => e.source));
console.log('Kommerziell auflegbar:', entries.filter((e) => e.license.commercial && e.license.derivatives).length);
