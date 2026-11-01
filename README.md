# open-dj-library

**Der erste offene, DJ-fertige Katalog legal freier Musik.**
*An open, DJ-ready catalog of freely licensed music: BPM, beat grid, musical key, loudness and clear licence flags for every track.*

Es gibt viel freie Musik unter Creative-Commons-Lizenzen und gemeinfreie Musik, etwa im Internet Archive, bei Jamendo oder bei ccMixter. Für DJs ist sie trotzdem mühsam zu nutzen. Keine dieser Quellen liefert verlässliche BPM, Beatgrids oder Tonarten, und ob man einen Track auf einem bezahlten Gig spielen darf, muss man aus der Lizenz herauslesen.

Dieses Repo schließt die Lücke:

- **Katalog statt Dateien:** Jeder Eintrag verweist auf das Original bei der Quelle, mit Urheber, Link und Lizenz. Die Musik bleibt bei ihren Urhebern.
- **DJ-Daten:** BPM, Beatgrid (Takt-Eins), Tonart in Camelot-Notation, Lautheit und Länge, berechnet mit der Analyse von [Pulsar DJ](https://github.com/SacredBanana7/pulsar-dj).
- **Klare Lizenz-Flags:** `commercial` (kein NC), `derivatives` (kein ND) und `attribution` (BY).
- **Offen für jede Software:** `catalog.json` ist ein einfaches, [dokumentiertes Format](SCHEMA.md). Jede DJ-App, jedes Skript und jede Webseite darf es nutzen.

Pulsar DJ lädt den Katalog automatisch: Freie Tracks sind dort sofort mit Beatgrid und Tonart durchsuchbar und spielbar.

## Benutzen

```
https://raw.githubusercontent.com/SacredBanana7/open-dj-library/main/catalog.json
```

Die Datei ist per CORS von überall abrufbar.

## Erweitern

```bash
npm install
node tools/add-tracks.mjs --genre house --count 10     # neue Tracks suchen und analysieren
node tools/add-tracks.mjs --query "deep techno" --license commercial
npm run build                                          # prüft alle Einträge, schreibt catalog.json
```

Die Audiodateien werden nur kurz für die Analyse geladen und nicht gespeichert. Quellen sind ausschließlich frei lizenzierte Angebote: Internet Archive (Netlabels), Openverse (u. a. Jamendo, Wikimedia) und ccMixter. Inhalte von Streaming-Diensten oder urheberrechtlich geschützte Musik kommen nicht in den Katalog.

Korrekturen (falsches Beatgrid, falsche Tonart, falsches Genre) sind sehr willkommen, siehe [SCHEMA.md](SCHEMA.md#korrekturen). Jeder Pull Request wird automatisch geprüft.

## Lizenzen

- **Katalogdaten** (`catalog.json`, `tracks/`): [CC0 1.0](LICENSE-DATA), also gemeinfrei und ohne Bedingungen nutzbar.
- **Werkzeuge** (`tools/`, `lib/`): [GPL-3.0-or-later](LICENSE), weil sie die Analyse aus Pulsar DJ enthalten.
- **Die Musik** gehört ihren Urhebern und steht unter der jeweils im Eintrag angegebenen Lizenz. Bei CC BY bitte den Urheber nennen. NC-Tracks sind nicht für kommerzielle Auftritte, ND-Tracks nicht für Edits oder Remixe.
