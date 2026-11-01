// Catalog entry format "open-dj-library/track" v1 (see SCHEMA.md).
// SPDX-License-Identifier: GPL-3.0-or-later

export const ENTRY_VERSION = 1;

export function entryId(source, id) { return `${source}:${id}`; }

// file name inside tracks/<source>/ for an entry id
export function entryFile(source, id) {
  let h = 0;
  for (const c of id) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  const slug = id.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+/g, '_').slice(0, 90).replace(/^[_.]+|[_.]+$/g, '');
  return `${slug || 'track'}-${h.toString(36)}.json`;
}

// normalised OpenMusic result + analysis -> catalog entry
export function makeEntry(r, analysis, { genre } = {}) {
  const lic = r.license || {};
  return {
    version: ENTRY_VERSION,
    id: entryId(r.source, r.id),
    source: r.source,
    provider: r.provider || undefined,
    title: r.title || '',
    artist: r.artist || '',
    artistUrl: r.artistUrl || undefined,
    album: r.album || undefined,
    pageUrl: r.pageUrl,
    audioUrl: r.streamUrl,
    fileName: r.fileName || undefined,
    sizeBytes: r.size || undefined,
    license: {
      code: lic.code,
      version: lic.version || undefined,
      label: lic.label,
      url: lic.url,
      attribution: !!lic.by,
      commercial: !lic.nc,
      derivatives: !lic.nd,
      shareAlike: !!lic.sa,
      publicDomain: !!lic.publicDomain,
    },
    genre: genre || r.genre || undefined,
    tags: r.tags?.length ? r.tags.slice(0, 12) : undefined,
    analysis,
    added: new Date().toISOString().slice(0, 10),
  };
}

const req = (cond, msg, errs) => { if (!cond) errs.push(msg); };

export function validateEntry(e) {
  const errs = [];
  req(e.version === ENTRY_VERSION, 'version', errs);
  req(typeof e.id === 'string' && e.id.startsWith(`${e.source}:`), 'id must be "<source>:<id>"', errs);
  req(['archive.org', 'openverse', 'ccmixter', 'jamendo'].includes(e.source), 'unknown source', errs);
  req(/^https:\/\//.test(e.pageUrl || ''), 'pageUrl must be https', errs);
  req(/^https:\/\//.test(e.audioUrl || ''), 'audioUrl must be https', errs);
  req(e.title, 'title', errs);
  req(e.license && e.license.url && e.license.label, 'license url/label', errs);
  req(/creativecommons\.org|publicdomain/i.test(e.license?.url || ''), 'license must be Creative Commons or public domain', errs);
  const a = e.analysis || {};
  req(a.bpm >= 0 && a.bpm < 300, 'analysis.bpm', errs);
  req(typeof a.beatOffset === 'number', 'analysis.beatOffset', errs);
  req(/^\d{1,2}[AB]$/.test(a.key?.camelot || ''), 'analysis.key.camelot', errs);
  req(a.durationSec > 0, 'analysis.durationSec', errs);
  return errs;
}
