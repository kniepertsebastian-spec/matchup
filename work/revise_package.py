from pathlib import Path
p=Path('work/package.py');s=p.read_text(encoding='utf-8')
s=s.replace('outputs/Olaf_Top_26.17','outputs/Olaf_Top_26.18_Revision').replace("work/'data.json'","work/'data-revision.json'")
s=s.replace("assert '26.17' in vals['B3']","assert '26.18' in vals['B3']")
a=s.index("            sheet=ET.fromstring(z.read('xl/worksheets/sheet4.xml'))")
b=s.index("        results.append",a)
s=s[:a]+'''            sheet=ET.fromstring(z.read('xl/worksheets/sheet4.xml'))
            assert len([c for c in sheet.findall('.//s:c',ns) if c.find('s:f',ns) is not None])==94
''' +s[b:]
s=s.replace("('Level 1',m['l1'])", "('Lane-Tier',m['lane']),('Späte Side',m['late']),('Änderung',m['revision']),('Level 1',m['l1'])")
s=s.replace('Matchup-Sammlung 26.17','Matchup-Sammlung 26.18')
s=s.replace('PATCH 26.17 · GEPRÜFT 09.09.2026','PATCH 26.18 · REVISION 10.09.2026')
s=s.replace('Statistik-Snapshots vom 08.09.2026.', 'Paarungsdaten: Patch 26.17, abgerufen am 10.09.2026. Keine gemessenen 26.18-Winrates.')
s=s.replace('Z bleibt bewusst unbesetzt.', 'Z und F bleiben mangels belastbarer Extrembewertung unbesetzt.')
s=s.replace('Der häufiger gelistete offensive Pfad nutzt Fiendhunter Bolts statt BotRK; BotRK ist hier die gezielte Anpassung für zusätzlichen Auto-Sustain.', 'Das ist eine mechanische Sustain-Option, kein statistisch nachgewiesener Optimalbuild für 26.18.')
s=s.replace('Quellen und Abweichungen stehen in den Excel-Dateien.', 'Riot, U.GG und LoLalytics ersetzen die bisherigen Quellen. Lane und späte Side stehen getrennt in jeder Detailansicht. Quellen, Datenlücken und Änderungsgründe stehen in den Excel-Dateien.')
a=s.index("(out/'LESEN.txt').write_text(");b=s.index('\n# Keep generation diagnostics',a)
s=s[:a]+'''changes=[f"{m['name']}: {m['oldTier']} -> {m['tier']}" for m in ms if m['oldTier']!=m['tier']]
(out/'LESEN.txt').write_text("""OLAF TOP — REVISION FÜR PATCH 26.18
Geprüft: 10.09.2026 | Ranked Solo Queue | Emerald+, global

START.html öffnet den filterbaren Katalog mit allen 51 Gegnern.
Olaf_Top_Sammlung.xlsx enthält Übersicht, alle Details, Championpool, Statistik und Leitfaden.
Matchups/ enthält die 51 einzelnen, eigenständig lesbaren Excel-Dateien.

Die Paarungsstatistik stammt von U.GG und LoLalytics, Datenpatch 26.17/16.17,
abgerufen am 10.09.2026. Diese Werte sind keine 26.18-Winrates.
Der Championpool basiert auf gekennzeichneten 26.17-Snapshots. Der neue Patch ist
noch zu jung für einen belastbaren vollständigen Statistikwechsel.

Mobalytics und Mobafire sind keine Belegquellen dieser Revision.
Alle 51 Einträge wurden auf Konsistenz überprüft. Die Tiers bleiben qualitative
Einschätzungen mit Unsicherheit. Es wurde keine eigene Ingame-Testreihe durchgeführt.
Lane-Tier, späte Side und Gesamt-Tier sind getrennt. Die Quellen beweisen nicht,
dass eine konkrete Rune, Skillorder oder Itemfolge jedes Matchups optimal ist.

Inhaltliche Korrekturen: Volibear-W2 kein automatischer Rückzugsbefehl; Volibear-E
gibt Schild statt Heilung. Olafs W selbst gibt keinen Lebensraub. Beide Tiamat-
Buildrichtungen können Freezes erschweren. Kayles zusätzliche Range kommt auf 16.
Zaahens 26.18-Q-/Revive-Änderung ist berücksichtigt. Classic/ARAM wurden ausgeschlossen.

Geänderte Gesamt-Tiers:
"""+'\\n'.join(changes)+"""

Der alte 26.17-Ordner bleibt als historische Version erhalten. Verwende für die
überarbeiteten Einschätzungen diesen 26.18_Revision-Ordner.
ZIP vollständig entpacken und Ordnerstruktur beibehalten, damit die Links funktionieren.
""",encoding='utf-8')
''' +s[b:]
s=s.replace("work/'inspection'", "work/'inspection-revision'").replace("work/'contacts'", "work/'contacts-revision'").replace("work/'previews'", "work/'previews-revision'").replace('for part in (1,2):','for part in (1,3,4):')
s=s.replace("work/'validation.json'", "work/'validation-revision.json'")
s=s.replace('Olaf_Top_26.17_Komplett.zip','Olaf_Top_26.18_Revision_Komplett.zip')
p.write_text(s,encoding='utf-8')
q=Path('work/check_links.py');s=q.read_text(encoding='utf-8').replace('Olaf_Top_26.17','Olaf_Top_26.18_Revision')
q.write_text(s,encoding='utf-8')
print('Packaging revised')
