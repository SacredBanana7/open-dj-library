// Decodes an MP3 and runs Pulsar DJ's analysis (BPM, beat grid, key, loudness)
// in Node. The analysis code is Pulsar's analysis-worker.js, loaded unchanged.
// SPDX-License-Identifier: GPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { MPEGDecoder } from 'mpg123-decoder';

export const ANALYZER = 'pulsar-dj/analysis-worker 0.1';

const src = readFileSync(new URL('./analysis-worker.js', import.meta.url), 'utf8');
const analyzeMono = new Function('self', `${src}\nreturn analyze;`)({ postMessage() {} });

let decoder = null;
async function getDecoder() {
  if (!decoder) {
    decoder = new MPEGDecoder();
    await decoder.ready;
  }
  return decoder;
}

// bytes: Uint8Array of an MP3 file -> analysis result without the waveform
export async function analyzeMp3(bytes) {
  const dec = await getDecoder();
  await dec.reset();
  const { channelData, samplesDecoded, sampleRate } = dec.decode(bytes);
  if (!samplesDecoded) throw new Error('MP3 konnte nicht dekodiert werden');
  const n = samplesDecoded, ch = channelData.length;
  const mono = new Float32Array(n);
  for (let c = 0; c < ch; c++) {
    const d = channelData[c];
    for (let i = 0; i < n; i++) mono[i] += d[i] / ch;
  }
  const r = analyzeMono(mono, sampleRate, () => {});
  return {
    durationSec: Math.round(r.duration * 100) / 100,
    bpm: Math.round(r.bpm * 100) / 100,
    bpmConfidence: Math.round(r.bpmConfidence * 100) / 100,
    beatOffset: Math.round(r.beatOffset * 10000) / 10000,
    key: { name: r.key.name, camelot: r.key.camelot, confidence: Math.round(r.key.confidence * 100) / 100 },
    rmsDb: Math.round(r.rmsDb * 10) / 10,
    analyzer: ANALYZER,
  };
}
