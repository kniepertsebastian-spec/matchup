# Erstellung und Pflege

## Laufende Anwendung

Die Webapp ist eigenständig und verwendet nur Node-Standardbibliotheken.
`dist/app.js`, `dist/model.js`, `dist/style.css` und `dist/index.html` sind die
gepflegten Frontend-Dateien; ein Bundler oder eine Installation ist nicht nötig.
Tests aus `olaf-local` mit `node --test test.mjs` ausführen.

## Ursprüngliche Erstellungsskripte

Die Dateien in `work/` werden zur vollständigen Nachvollziehbarkeit unverändert
mitgeliefert. Relative Pfade der Skripte beziehen sich meist auf das Projekt-Root.
Sie bilden den historischen Arbeitsablauf ab, keine durchgehend portable Build-Pipeline.
Insbesondere Migrationsskripte nicht pauschal erneut ausführen: Sie können Dateien
überschreiben und setzen zum Teil ältere Zwischenstände voraus.

- `matchups*.mjs`, `review.mjs`: ursprüngliche Olaf-Daten und Überarbeitung.
- `build.mjs`: Olaf-Tabellenerzeugung mit `@oai/artifact-tool`.
- `warwick-data.mjs`, `warwick-rest.mjs`, `build-warwick.mjs`: Warwick-Datenaufbau.
- `warwick-sheets.mjs`: Warwick-Tabellenerzeugung mit `@oai/artifact-tool`.
- `package.py`, `finalize-warwick.py`, `check_links.py`: Export-/Prüfschritte.
- `revise_builder.py`, `revise_package.py`, `extend-app.mjs`: historische Migrationen.
- `pool-raw.txt`, `kit-sources.txt`, `pool.json`: ursprüngliches Recherchematerial.

`@oai/artifact-tool` stammt aus der ursprünglichen Erstellungsumgebung und wird
nicht mitgeliefert. Es ist keine Voraussetzung für App, Docker, Tests oder die
Nutzung fertiger Excel-Dateien. Für portable Neugenerierung müsste dieser Teil
beispielsweise auf eine frei verfügbare Excel-Bibliothek umgestellt werden.
Die Python-Skripte verwenden je nach Datei zusätzlich `openpyxl` und `Pillow`.
Eine verifizierte portable Installation der gesamten historischen Exportpipeline
ist nicht Bestandteil dieses Dateipakets.

## Prüfsummen

`MANIFEST.sha256` dokumentiert den ausgelieferten Stand, nicht spätere Änderungen.
Unter WSL kann er im Projekt-Root mit `sha256sum -c MANIFEST.sha256` geprüft werden.
