# Olaf & Warwick Matchup-Buch – lokal mit Docker und WSL

> Aktueller Betrieb: **[Docker, MariaDB, Team-Planer und Domain-Einrichtung](../docs/DEPLOYMENT.md)**.
> `sh start.sh` erzeugt die lokale Konfiguration und startet den Datenbank-Stack.
> Die folgenden Abschnitte dokumentieren zusätzlich den ursprünglichen Entwurf.

## Visuelle Runen- und Itemübersicht

Alle 132 Matchup-Ansichten zeigen die empfohlene vollständige Runenseite inklusive
zweitem Baum und Shards, Startitems, Boots, zwei Core-Items sowie bedingte Optionen
für das 3., 4. und 5. Item. Diese Übersicht steht vor Support-Einfluss und Spielplan.
Itemwerte und Effekte öffnen per Hover, Klick oder Tastatur; Escape schließt sie.

`dist/loadouts.json` hält die strukturierten Empfehlungen pro Champion/Lane/Gegner.
`dist/equipment.json` enthält Riot-Itemdaten und Runen aus Data Dragon 16.18.1
(Live-Patch 26.18, geprüft 18.09.2026). `dist/assets/` enthält die lokal gespeicherten
Originalbilder; die App benötigt zum Anzeigen keinen Internetzugriff.
Riot-Kurzbeschreibungen enthalten nicht alle dynamischen Skalierungswerte. Solche
Lücken werden im Tooltip offengelegt. Hexplate-Werte sind durch Riot 26.11 ergänzt.
Keine automatische Patch-Aktualisierung; Empfehlungen und Datenstand sind getrennt.

`python work/build-loadouts.py` aus dem Projekt-Root erzeugt die Kataloge und lädt
fehlende öffentliche Riot-Assets. Für einen neuen Patch Version und redaktionelle
Ergänzungen im Builder prüfen. Vorhandene Cache-Dateien gehören zum angegebenen
Patch. Ergänzte Nebenrunen/Itemoptionen sind qualitative Empfehlungen, keine neue
statistische Tierbewertung. Die bestehenden Excel-Dateien wurden nicht verändert.

## Lane-Auswahl und Olaf ADC (18.09.2026)

Ganz oben zwischen **Toplane** und **ADC / Botlane** wechseln. Toplane enthält
weiterhin je 51 Olaf- und Warwick-Matchups. ADC enthält 30 eigenständige
Olaf-Matchups mit Support-Einfluss, allen bisherigen Detailfeldern und einem
eigenen Leitfaden einschließlich Hydra-, Crit- und Hexplate-Überlegungen.
Warwick ist nur für Toplane verfügbar; sein Link führt ausdrücklich dorthin.
Beim Wechsel der Sammlung werden die Suchfilter zurückgesetzt.

ADC-Einstieg: `http://localhost:8080/#olaf/adc`.
Direktlink-Beispiel: `#olaf/adc/matchup/caitlyn`.
Quelle der ADC-Ansicht: `dist/olaf-adc.json`. Die neuen ADC-Downloads sind JSON;
die vorhandenen Toplane-Excel-Downloads bleiben erhalten. Die ADC-Tiers sind
vorläufige qualitative Kit-Einschätzungen für Patch 26.18, geprüft 18.09.2026,
ohne belastbare Paarungswinrates und ohne fest angenommenes Supportduo.

Der Standardbibliothek-Builder `work/build-olaf-adc.py` lässt sich aus dem
Projekt-Root mit Python ausführen und erzeugt ADC-Daten und Einzeldownloads.
Die historischen Migrationsskripte `extend-*.py` nicht erneut auf die bereits
aktualisierten App-Dateien anwenden.

Oben zwischen Olaf und Warwick Top wählen. Je 51 Matchups mit Suche, Filtern nach Tier, Keystone und Summoners, Detailansichten, eigenem Leitfaden und Excel-Dateien. Beim Championwechsel bleibt derselbe Gegner geöffnet, falls vorhanden. Warwicks eigenes Mirror-Matchup ist durch Olaf ersetzt. Alle Inhalte liegen im Projektordner. Kein Login, keine externen Schriftarten, keine CDN-Abhängigkeiten. Quellenlinks öffnen externe Seiten nur beim Anklicken.

## Start über WSL

Voraussetzung: Docker mit Compose. Bei Docker Desktop unter Windows: Docker Desktop starten und die gewünschte WSL-2-Distribution unter **Settings → Resources → WSL Integration** aktivieren. Offizielle Anleitung: https://docs.docker.com/desktop/features/wsl/

Den Ordner `olaf-local` aus dem ZIP entpacken. Im WSL-Terminal in diesen Ordner wechseln und starten:

```sh
cd /pfad/zu/olaf-local
sh start.sh
```

Danach im Windows-Browser **http://localhost:8080** öffnen. Beim ersten Build benötigt Docker Internet zum Laden des Node-Basisimages. Danach kann die App offline laufen. Der Container läuft im Hintergrund und startet wieder, sobald Docker läuft, sofern er nicht manuell gestoppt wurde.

Alternativ direkt:

```sh
docker compose up -d --build
```

Stoppen: `docker compose down`

Status: `docker compose ps`

Logs: `docker compose logs --tail=50`

Falls Port 8080 belegt ist: `OLAF_PORT=8081 sh start.sh`, anschließend http://localhost:8081 öffnen. Die Freigabe ist auf den eigenen Rechner (127.0.0.1) beschränkt.

## Datenstand und Änderungen

Olaf unverändert: Kit-Einordnung 26.18, geprüft 10.09.2026; Statistik 26.17 / 16.17. Warwick neu: Kit-Abgleich 26.18, geprüft 14.09.2026; teilweise Paarungsstatistik 26.18 / 16.18, ansonsten ausdrücklich fehlende Werte. Gemeinsamer historischer Championpool. Keine automatische Recherche oder Aktualisierung. Tiers sind qualitative Einschätzungen. Lane und späte Sidelane werden separat dargestellt.

`dist/data.json` enthält Olaf, `dist/warwick.json` Warwick mit eigener Methodik. Für eine spätere Aktualisierung die passende Datei anpassen und `docker compose up -d --build` ausführen. Die Excel-Dateien in `dist/downloads` sind separate Exporte und müssen bei Inhaltsänderungen ebenfalls aktualisiert werden. Es gibt in dieser Version keinen Editor und keine Datenbank.

Die App verändert die ursprüngliche Olaf-Sammlung nicht. Alte Links bleiben gültig, z. B. `http://localhost:8080/#matchup/volibear`. Neu: `http://localhost:8080/#warwick` und `http://localhost:8080/#warwick/matchup/olaf`. Für ein bestehendes Docker-Setup den Projektordner durch den neuen Paketinhalt aktualisieren und erneut `sh start.sh` ausführen; anschließend die Browserseite neu laden.

## Ohne Docker / Entwicklung

Mit Node.js ab Version 22: `node server.mjs`. Es sind keine npm-Pakete zu installieren. Tests: `node --test test.mjs`.

Der Server bindet ohne Docker standardmäßig an 127.0.0.1. Im Container wird HOST=0.0.0.0 verwendet; Compose begrenzt den veröffentlichten Port auf localhost.

Validierung: lokale HTTP-, Daten-, Filter- und Downloadtests. Der tatsächliche Docker-/WSL-Start konnte in der Erstellungsumgebung mangels Docker-Zugriff nicht getestet werden.
