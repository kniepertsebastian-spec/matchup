# Toplane Matchup-Buch: Olaf & Warwick

Lokale Webapp mit jeweils 51 Toplane-Matchups plus 30 Olaf-ADC-Matchups, Lane- und Championauswahl, Suche, Filtern,
Detailansichten, Quellen und Excel-Downloads. Dieses Paket enthält das gesamte
vorhandene Projekt einschließlich Recherche, Erstellungsskripten und Prüfdateien.

## Start mit Docker / WSL

Docker mit Compose muss verfügbar sein. Unter Windows Docker Desktop starten
und die Integration für die verwendete WSL-Distribution aktivieren.
Im entpackten Projektverzeichnis:

```sh
cd olaf-local
sh start.sh
```

Anschließend http://localhost:8080 öffnen. Alternative bei belegtem Port:
`OLAF_PORT=8081 sh start.sh`. Stoppen im App-Ordner: `docker compose down`.
Der erste Build lädt das Node-Basisimage aus dem Internet.

## Start ohne Docker und Tests

Node.js ab Version 22 genügt; die App hat keine npm-Abhängigkeiten.

```sh
cd olaf-local
node --test test.mjs
node server.mjs
```

## In ein neues Git-Repository übernehmen

Den Inhalt dieses Ordners in das gewünschte Repository kopieren, einschließlich
der versteckten Dateien `.gitignore` und `.gitattributes`. Bei einem neuen Repository:

```sh
git init
git add .
git status
git commit -m "Add Olaf and Warwick top lane matchup project"
```

Danach den Remote des eigenen Git-Anbieters hinzufügen und pushen.
Es wurde kein Remote eingerichtet und nichts veröffentlicht. Eine vorhandene
Git-Historie wird nicht mitgeliefert; das Paket ist ein vollständiger Dateistand.
Bei Übernahme in ein bestehendes Repository dessen Ignore-Regeln zusammenführen.

## Struktur und Datenpflege

- `olaf-local/`: direkt startbare Webapp, Server, Tests und Docker-Dateien.
- `olaf-local/dist/`: tatsächlicher Frontend-Quellcode und aktuelle App-Daten;
  trotz des Namens kein wegwerfbares Build-Verzeichnis. Unbedingt mit einchecken.
- `olaf-local/dist/downloads/`: von der App angebotene Excel-Dateien.
- `outputs/Olaf_Top_26.18_Revision/`: überarbeitete Olaf-Sammlung und Einzeldateien.
- `outputs/Warwick_Top_26.18/`: Warwick-Sammlung und Einzeldateien.
- `outputs/Olaf_Top_26.17/`: alter Stand, nur als historisches Archiv.
- `work/`: Recherche, Datenentwürfe, Erstellungsskripte und Qualitätssicherung.
- `docs/STRUKTUR.txt`: vollständige Liste aller enthaltenen Dateien.
- `docs/ERSTELLUNG.md`: Pflegehinweise und Grenzen der ursprünglichen Skripte.
- `MANIFEST.sha256`: Prüfsummen sämtlicher übriger Paketdateien.

Die aktive App liest Olaf aus `olaf-local/dist/data.json` und Warwick aus
`olaf-local/dist/warwick.json`. ADC liegt in `olaf-local/dist/olaf-adc.json`, mit
JSON-Einzeldownloads unter `dist/downloads/adc/`. Der ADC-Leitfaden beschreibt
die vorläufigen Kit-Tiers, Support-Abhängigkeit und Hydra-/Hexplate-Builds.
Änderungen an Entwürfen in `work/` erscheinen
nicht automatisch in der App. Excel-Dateien sind separate Exporte und müssen
bei Datenänderungen ebenfalls gepflegt werden. Nach Änderungen für Docker
im App-Ordner `docker compose up -d --build` ausführen.

## Datenstand

Paket aktualisiert am 18.09.2026. Olaf ADC neu recherchiert für 26.18; keine erneute Toplane-Recherche beim Verpacken.
Olaf: Kit-Einordnung 26.18, geprüft 10.09.2026; Statistik 26.17 / 16.17.
Warwick: Kit-Abgleich 26.18, geprüft 14.09.2026; teilweise Statistik 26.18 / 16.18,
fehlende Werte ausdrücklich gekennzeichnet. Tiers sind qualitative Einschätzungen.
Historische Dateien können überholte Bewertungen und inzwischen verworfene Quellen
enthalten. Für die Nutzung gelten die aktuellen App-Daten und die 26.18-Sammlungen.

Die App hat keinen Editor, keine Datenbank und keine automatische Aktualisierung.
Lokale Node-Tests sind vorhanden. Docker/WSL konnte in der Erstellungsumgebung
nicht praktisch geprüft werden.

## Umfang des Git-Imports

Quellcode, Recherche und fertige Excel-Dateien werden standardmäßig eingecheckt.
Die ZIP enthält zusätzlich Vorschaubilder und Inspektionsausgaben; `.gitignore`
schließt diese reproduzierbaren Prüfdateien vom normalen Git-Import aus.
Keine installierten Abhängigkeiten, lokalen Laufzeitverknüpfungen, Zugangsdaten
oder plattformspezifischen Codex-Konfigurationen sind Bestandteil dieses Pakets.
