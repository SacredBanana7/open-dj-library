// Genre tempo ranges: automatic BPM detection often lands on double or half the
// real tempo. If a value lies outside the usual range of its genre, it is
// halved or doubled when that brings it inside. Genres without a clear range
// (ambient, IDM) are left alone.
// SPDX-License-Identifier: GPL-3.0-or-later

export const TEMPO_RANGES = {
  'Techno': [115, 150],
  'House': [110, 135],
  'Drum & Bass': [155, 185],
  'Disco / Funk': [95, 135],
  'Electro': [100, 140],
  'Breakbeat': [110, 145],
  'Hip Hop': [65, 115],
  'Dubstep': [125, 155],
  'Trance': [125, 150],
};

// returns { bpm, folded } where folded is the factor applied (1 = unchanged)
export function foldTempo(bpm, genre) {
  const range = TEMPO_RANGES[genre];
  if (!range || !bpm) return { bpm, folded: 1 };
  const [lo, hi] = range;
  if (bpm >= lo && bpm <= hi) return { bpm, folded: 1 };
  for (const f of [0.5, 2]) {
    const b = bpm * f;
    if (b >= lo && b <= hi) return { bpm: Math.round(b * 100) / 100, folded: f };
  }
  return { bpm, folded: 1 };
}

// apply to a catalog entry in place; returns true if changed
export function foldEntry(e) {
  if (e.analysis?.analyzer === 'manual') return false;
  const { bpm, folded } = foldTempo(e.analysis.bpm, e.genre);
  if (folded === 1) return false;
  e.analysis.bpm = bpm;
  e.analysis.tempoFolded = folded;
  return true;
}
