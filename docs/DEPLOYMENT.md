# Matchup-Webanwendung betreiben

## Stack

Node.js 24 liefert Weboberfläche, API und Team-Planer aus. MariaDB 11.8 LTS speichert
Matchups, Leitfäden, Loadouts, Items und Kits dauerhaft. Cloudflare Tunnel oder Caddy
veröffentlicht die App unter `matchup.pwa-tree.de`. Alle Dienste laufen in Docker.
Der Host benötigt nur Docker mit Compose und Git, keine zusätzliche Node-/DB-Installation.

Die 132 Matchups werden einmal geladen und sofort im Browser gefiltert. Die API
verwendet einen beim Start aus MariaDB geladenen Snapshot. Änderungen an der DB
werden nach Neustart von `web` sichtbar. MariaDB hat keinen veröffentlichten Port.
Es gibt noch keinen öffentlichen Editor, keine Benutzerverwaltung und keinen
automatischen Patchwechsel. Excel-Dateien bleiben separate, manuell gepflegte Exporte.

## Start (Linux / WSL)

```sh
git clone https://github.com/kniepertsebastian-spec/matchup.git
cd matchup/olaf-local
sh start.sh
```

Das Skript erzeugt `.env` und zufällige Datenbankpasswörter über einen einmaligen
Node-Container. Bestehende Geheimnisse werden erhalten. Danach startet es App und
Datenbank. Die leere Datenbank wird automatisch aus dem Repository befüllt.
Lokal: `http://localhost:8080`. Einen anderen Port in `.env` als `OLAF_PORT` setzen.

PowerShell mit Docker Desktop, im Ordner `olaf-local`:

```powershell
docker run --rm -v "${PWD}:/app" -w /app node:24-alpine node scripts/init-config.mjs
docker compose up -d --build --wait
```

## A: Cloudflare Tunnel

Diese Variante braucht keine eingehenden Portfreigaben. Caddy bleibt ausgeschaltet.

1. In Cloudflare One einen verwalteten Cloudflared-Tunnel erstellen.
2. Den **Tunnel-Token** als reinen Text in `olaf-local/secrets/cloudflare_token`
   speichern. Nicht ins Repository oder in Chatnachrichten schreiben.
3. Für den Tunnel eine veröffentlichte Anwendung anlegen:
   **Hostname** `matchup.pwa-tree.de`, **Typ** `HTTP`, **Dienstadresse** `web:8080`.
4. In `.env` `COMPOSE_PROFILES=tunnel` ergänzen und starten:

```sh
docker compose up -d --build --wait
docker compose logs --tail 50 tunnel
```

Alternativ: `docker compose --profile tunnel up -d --build`. Der DNS-Eintrag muss
auf diesen Tunnel zeigen; widersprechende A-/AAAA-Einträge für genau diesen
Hostnamen vorher entfernen. TLS endet bei Cloudflare. Die Verbindung zum Connector
ist durch den Tunnel geschützt; `tunnel → web` ist HTTP innerhalb des Docker-Netzes.

Ein Connector aus **einem anderen Compose-Projekt** kann `web:8080` nicht automatisch
auflösen. Den mitgelieferten Connector nutzen oder bewusst ein gemeinsames Netz
konfigurieren. Ein direkt auf demselben Host laufender Connector kann stattdessen
`http://127.0.0.1:8080` nutzen. Tunnel-Token und bestehende Cloudflare-Konfiguration
müssen auf dem tatsächlichen Host eingerichtet werden.

## B: direkter Server mit Caddy

Voraussetzung: öffentliche Server-IP, freie eingehende TCP-Ports 80/443 und ein
A-Eintrag `matchup.pwa-tree.de` auf diese IP. AAAA nur setzen, wenn IPv6 zum Server
funktioniert. Bei Cloudflare DNS für die erste Einrichtung **DNS only** verwenden.

In `.env` `COMPOSE_PROFILES=direct` setzen:

```sh
docker compose up -d --build --wait
docker compose logs --tail 50 caddy
```

`DOMAIN` ist auf `matchup.pwa-tree.de` voreingestellt. Caddy stellt und verlängert
das Zertifikat automatisch, leitet HTTP auf HTTPS um und speichert Zertifikate in
einem Volume. Beim Wechsel der Variante den alten Proxy ausdrücklich stoppen,
z. B. `docker compose --profile direct stop caddy`.

## Datenpflege

| Datei | Inhalt |
| --- | --- |
| `dist/data.json`, `dist/warwick.json`, `dist/olaf-adc.json` | Matchups und Leitfäden |
| `dist/loadouts.json`, `dist/equipment.json` | Lane-Builds, Items und Runen |
| `data/champions.json` | 173 Riot-Kits, Data Dragon 16.18.1 |
| `lib/profiles.mjs` | Kit-Merkmale und explizite Korrekturen |
| `lib/recommend.mjs` | Gewichtung und Item-Regeln |

Ein normales Deployment überschreibt **keine vorhandenen Datenbankeinträge**.
Geprüfte Repository-Daten ausdrücklich übernehmen:

```sh
sh scripts/backup.sh
docker compose build web
docker compose run --rm web node scripts/import-data.mjs --replace
docker compose up -d web
docker compose restart web
```

`--replace` ersetzt die importierten Datensätze durch den Image-Stand, einschließlich
eventueller manueller DB-Änderungen. Die Tabellen `documents` (mit Herkunfts-Hash)
und `matchups` werden transaktional befüllt. Indizes liegen auf Sammlung, Name und Tier.

Riot-Kits gezielt für einen Patch aktualisieren, anschließend Regeln, Items und
Loadouts gemeinsam prüfen; nicht ungeprüft veröffentlichen:

```sh
docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/app" -w /app node:24-alpine node scripts/sync-champions.mjs 16.18.1
```

## Team-Planer und Grenzen

Das erste Core-Item bleibt aus der vorhandenen Lane-Empfehlung. Vier weitere Slots
und Boots werden anhand des Teams priorisiert. Alternative Karten können ein
enthaltenes Item ersetzen; sie sind keine zusätzlichen Slots. Doppelte Items,
mehrere Hydra-Items und Maw plus Sterak’s werden ausgeschlossen.

Bedrohung gering / normal / hoch hat Gewicht 0,5 / 1 / 2. Im Lane-/Side-Fokus erhält
der Lane-Gegner zusätzlich Faktor 2,5, andere Gegner Faktor 0,5. Gemischter Schaden
wird als 50:50-Annahme behandelt. Die Prozentwerte sind **keine gemessenen Spielwerte
oder Winrates**. Absoluter Schaden wird separat betrachtet.

Die Kit-Texte sind verkürzt. Crit und Tank sind Build-Annahmen. Alle erkannten
Merkmale können pro Gegner korrigiert werden. Eigene Antiheal-Priorität sinkt,
wenn das Team Wunden schon zuverlässig aufträgt. Empfehlungen erklären Auslöser
und Grenzen, etwa Olafs R bei Kontrolle oder Zähigkeit gegen Knock-ups.
Der Planer liest kein Live-Spiel: Items, Gold, Level und Cooldowns werden nicht
automatisch erfasst. Die Auswahl bleibt nur für die Browser-Sitzung auf dem Gerät.

## Backups, Update, Restore

```sh
sh scripts/backup.sh
git pull --ff-only
docker compose pull
docker compose up -d --build --wait
```

Backups unter `backups/` zusätzlich auf einen anderen Datenträger kopieren.
`secrets/` separat sichern. Image-Tags folgen Release-Linien; Cloudflared verwendet
`latest`. Für vollständig eingefrorene Produktionsversionen Image-Digests pinnen.

Bewusst gewähltes Backup wiederherstellen (ersetzt Daten):

```sh
docker compose stop web
docker compose exec -T db sh -c 'export MYSQL_PWD="$(cat /run/secrets/db_root_password)"; exec mariadb -uroot matchup' < backups/DEIN-BACKUP.sql
docker compose start web
```

`docker compose down` erhält Daten. **`down -v` löscht die Volumes inklusive Datenbank**
und ist nur für bewusst wegwerfbare Testumgebungen vorgesehen.

## Tests und Diagnose

```sh
docker compose ps
docker compose logs --tail 100 web db
curl --fail http://127.0.0.1:8080/health
curl --fail http://127.0.0.1:8080/api/status
```

`/health` prüft die DB-Verbindung. `/api/status` zeigt Speicher und Patch-Stand.
Bei DB-Ausfall kann die App ihren Snapshot noch ausliefern, meldet aber keine
gesunde Bereitschaft. Der DB-Modus fällt nicht heimlich auf Dateien zurück.

GitHub Actions prüft Logik/API, echten Docker-/MariaDB-Start, Import, Datenerhalt,
Caddy-Konfiguration, Backup und Browser-Bedienung auf Desktop- und Smartphone-Breite.
Screenshots erscheinen als Testartefakte. Öffentliche Domain, Zertifikatausstellung
und Tunnel-Verbindung müssen zusätzlich auf dem tatsächlichen Host geprüft werden.

Ohne Docker ist `node server.mjs` eine Dateivorschau. Tests:
`node --test test.mjs test/*.test.mjs`. Für Browser-Tests zusätzlich `pnpm install`,
`pnpm exec playwright install chromium` und bei laufender App
`node scripts/browser-smoke.mjs`. `TEST_URL` kann eine andere lokale Adresse wählen.

## Offizielle Referenzen

- [Riot Data Dragon](https://developer.riotgames.com/docs/lol/#data-dragon)
- [MariaDB Node.js Connector](https://mariadb.com/docs/connectors/mariadb-connector-nodejs/getting-started-with-the-node-js-connector)
- [MariaDB 11.8 LTS](https://mariadb.org/11-8-is-lts/)
- [Caddy Automatic HTTPS](https://caddyserver.com/docs/automatic-https)
- [Cloudflare Tunnel-Parameter](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/run-parameters/)
