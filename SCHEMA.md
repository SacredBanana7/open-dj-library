# Katalogformat `open-dj-library` v1

Die Datei `catalog.json` enthält alle Tracks. Jeder Track liegt außerdem einzeln unter
`tracks/<quelle>/<name>.json`, damit Korrekturen per Pull Request einfach sind.

```json
{
  "format": "open-dj-library",
  "version": 1,
  "generated": "2026-11-01T08:30:00.000Z",
  "license": "CC0-1.0 (catalog data); each track keeps its own Creative Commons / public domain license",
  "count": 1,
  "tracks": [ { "...": "Eintrag wie unten" } ]
}
```

## Eintrag

```json
{
  "version": 1,
  "id": "archive.org:WkBw0034/01-Monochromatic-Immobility-.mp3",
  "source": "archive.org",
  "title": "01 - Monochromatic - Immobility-",
  "artist": "MonoChromatic",
  "album": "Hear it, feel it, ignore it [Wk/Bw 034]",
  "pageUrl": "https://archive.org/details/WkBw0034",
  "audioUrl": "https://archive.org/download/WkBw0034/01-Monochromatic-Immobility-.mp3",
  "fileName": "01-Monochromatic-Immobility-.mp3",
  "sizeBytes": 13524289,
  "license": {
    "code": "by-nc-sa", "version": "3.0", "label": "CC BY-NC-SA 3.0 DE",
    "url": "http://creativecommons.org/licenses/by-nc-sa/3.0/de/",
    "attribution": true, "commercial": false, "derivatives": true, "shareAlike": true, "publicDomain": false
  },
  "genre": "Techno",
  "tags": ["Techno", "Electronica"],
  "analysis": {
    "durationSec": 336.64,
    "bpm": 125,
    "bpmConfidence": 1,
    "beatOffset": 0.4062,
    "key": { "name": "Em", "camelot": "9A", "confidence": 0.83 },
    "rmsDb": -12.4,
    "analyzer": "pulsar-dj/analysis-worker 0.1"
  },
  "added": "2026-11-01"
}
```

| Feld | Bedeutung |
|---|---|
| `id` | `<source>:<id der Quelle>`, eindeutig und stabil |
| `source` | `archive.org`, `openverse`, `ccmixter` oder `jamendo` |
| `pageUrl` | Seite des Werks bei der Quelle, für die Namensnennung |
| `audioUrl` | Direkter Link zur Audiodatei bei der Quelle. Die Datei selbst liegt nicht in diesem Repo |
| `license.commercial` | `false` bei NC-Lizenzen, dann nicht für bezahlte Auftritte |
| `license.derivatives` | `false` bei ND-Lizenzen, dann keine Edits oder Remixe |
| `license.attribution` | `true` bei BY, dann Urheber nennen (z. B. in der Tracklist) |
| `analysis.bpm` | Tempo in BPM |
| `analysis.beatOffset` | Zeit (s) der ersten Takt-Eins im Track. Weitere Beats liegen bei `beatOffset + n * 60 / bpm` |
| `analysis.key.camelot` | Tonart im Camelot-System (`1A` … `12B`) |
| `analysis.rmsDb` | Durchschnittliche Lautheit (dBFS RMS), für Auto-Gain |

## Korrekturen

Stimmt ein Beatgrid oder eine Tonart nicht? Dann die Datei unter `tracks/` direkt
bearbeiten, `npm run build` ausführen und einen Pull Request öffnen. Wird ein Wert von
Hand korrigiert, setzt man `analysis.analyzer` auf `"manual"`.
