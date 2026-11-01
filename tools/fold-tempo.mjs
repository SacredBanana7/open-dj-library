// Applies the genre tempo ranges (lib/tempo.js) to all existing entries.
// SPDX-License-Identifier: GPL-3.0-or-later
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { foldEntry } from '../lib/tempo.js';

const dir = fileURLToPath(new URL('../tracks/', import.meta.url));
let changed = 0;
for (const source of readdirSync(dir)) {
  for (const f of readdirSync(dir + source).filter((x) => x.endsWith('.json'))) {
    const path = `${dir}${source}/${f}`;
    const e = JSON.parse(readFileSync(path, 'utf8'));
    const before = e.analysis.bpm;
    if (foldEntry(e)) {
      writeFileSync(path, JSON.stringify(e, null, 2) + '\n');
      changed++;
      console.log(`${e.genre}: ${before} -> ${e.analysis.bpm}  ${e.artist} – ${e.title}`);
    }
  }
}
console.log(`${changed} Einträge angepasst`);
