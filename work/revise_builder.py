from pathlib import Path
import json
p=Path('work/build.mjs')
s=p.read_text(encoding='utf-8')
start=s.index(" rows.push(['Patch-Prüfung'")
end=s.index(" if(m.slug==='mordekaiser')",start)
s=s[:start]+''' rows.push(['Lane-Tier',m.lane+' · '+tierText[m.lane]],['Späte Sidelane',m.late+' · '+tierText[m.late]+' (2–3 Items, vergleichbare Ressourcen)'],['Revision',m.revision],['Patch-Prüfung',m.note],['Gültigkeit','Tiers sind eigene Einschätzungen bei vergleichbarem Gold/Level. Lane umfasst auch Level 6; Side meint 2–3 abgeschlossene Items ohne Boots. Die Gesamtwertung ist kein Mittelwert beider Phasen. Keine Ingame-Testreihe und kein statistisch bewiesener optimaler Build.'],['Statistik: Einordnung',statText(m)],['Pool-Nachweis',`${m.category} · Top-Pickrate ${(m.pool.pick*100).toFixed(2)} % · ${m.pool.games.toLocaleString('de-DE')} Champion-Spiele · LoLalytics, Emerald+, global, Solo/Duo, Datenpatch ${m.pool.patch}. Historischer Pool-Snapshot; keine gemessene 26.18-Pickrate.`],['Quelle: Top-Pickrate',m.pool.url],['Quelle: Gegner-Kit',m.official],['Quelle: Olaf-Kit',source.olaf],['Quelle: Live-Patch',source.patch],['Quelle: U.GG Paarungen',source.counters],['Quelle: LoLalytics Paarungen',source.counterCheck]);
''' +s[end:]
s=s.replace(" const order=['plan'", " const order=['plan'")
# Add mechanics references where they support a specific corrected claim.
at=" rows.push(['Zur Sammlung'"
idx=s.index(at)
s=s[:idx]+''' if(m.slug==='volibear')rows.push(['Quelle: W-Heilung','https://www.leagueoflegends.com/en-us/news/game-updates/patch-13-14-notes/']);
 if(m.slug==='fiora')rows.push(['Quelle: Riposte','https://nexus.leagueoflegends.com/en-us/champion/fiora/']);
''' +s[idx:]
# Removed-only provider values are unavailable until independently corroborated.
s=s.replace("['Maokai',.4,'Unter 0,5 %; Mobalytics 16.17','https://mobalytics.gg/lol/champions/maokai/build/top?champion=maokai']", "['Maokai',null,'Alter Zahlenbeleg verworfen; Ausschluss vorläufig','https://lolalytics.com/lol/maokai/build/?lane=top']")
s=s.replace("['Rengar',.3,'Unter 0,5 %; Mobalytics 16.17','https://mobalytics.gg/lol/champions/rengar/build/top']", "['Rengar',null,'Alter Zahlenbeleg verworfen; Ausschluss vorläufig','https://lolalytics.com/lol/rengar/build/?lane=top']")
old=json.loads(Path('work/data.json').read_text(encoding='utf-8'))
retain={'PTA','Conqueror','Comp Override','Olaf-Grundmechanik','Bruiser-Olaf','Ravenous-Olaf','PTA / offensiver Olaf','Kritlaf','Splitlaf','Andere Heilpfade','Boots und Antiheal','Summoners / Top-Quest','Item-Konflikte','Jungle-Heilung'}
method=[
 ['Geltungsbereich','Revision vom 10.09.2026 für Live-Patch 26.18, Summoner’s Rift, Ranked Solo Queue, Toplane. Die unabhängig abgerufenen Paarungsstatistiken zeigen noch 26.17/16.17. Sie werden nicht als 26.18-Ergebnisse ausgegeben.'],
 ['Was wurde korrigiert?','Alle 51 Einträge inhaltlich auf Konsistenz geprüft. Paarungsstatistik ersetzt, vier Pool-Belege erneuert, Lane und späte Side getrennt, überzogene Gesamturteile korrigiert. Die Änderung pro Champion steht in Übersicht und Einzeldatei. Alte Version bleibt separat erhalten.'],
 ['Quellenwahl','Riot für Patchänderungen und Kit-Grundlagen, U.GG und LoLalytics für Paarungsdaten. Mobalytics und Mobafire sind keine Belegquellen dieser Revision. Ein Quellenwechsel allein beweist keinen Tierwechsel; jedes Tier bleibt eigene taktische Synthese.'],
 ['Championpool','51 bisherige Gegner beibehalten. Aufnahmebasis sind gekennzeichnete 26.17-Pickraten: reguläre Toplaner ungefähr ab 0,5 %, zusätzliche Flex-Picks ab 1 %. Ein vollständig gereifter 26.18-Pool ist am Patchbeginn noch nicht belegt. Grenzfälle können sich ändern.'],
 ['Pool-Snapshots','47 LoLalytics-Werte aus der bisherigen Recherche vom 08.09.2026 beibehalten. Kled, Sion, Tryndamere und Zaahen am 10.09.2026 unabhängig bei LoLalytics neu abgelesen. Alle bleiben über der Aufnahmeschwelle. Anbieter-Caches sind nicht zeitsynchron.'],
 ['Statistik lesen','U.GG liefert Gegner-WR und Gegner-GD15. Die Tabelle berechnet daraus Olaf-WR = 1 − Gegner-WR und Olaf-GD15 = − Gegner-GD15. GD15 ist eine beobachtete Goldbilanz mit Jungle-/Roam-Einfluss, kein reiner mechanischer Lanetest.'],
 ['LoLalytics vergleichen','Rohe Olaf-WR und Anbieter-Delta 2 stehen separat. Delta 2 normalisiert nach der Methode des Anbieters beide Champion-Winrates. Kein direkter Roh-WR-Vergleich mit U.GG und kein Mittelwert. Negative Delta 2 kann auch bei roher WR über 50 % auftreten.'],
 ['Datenlücken','U.GG-Paarungswerte für Quinn, Sylas, Vladimir und Wukong waren in der abgerufenen Liste nicht enthalten. Leere Zellen bedeuten unbekannt. LoLalytics bietet hier zusätzliche kleinere Stichproben. Keine Werte aus anderen Rollen oder alten Cache-Varianten eingefüllt.'],
 ['Tier-Methode','Gesamt-Tier beschreibt Olafs umsetzbaren Plan über die Partie. Frühe Druckfenster, R-Spike und erreichbarer Farm-/Turmvorteil zählen ebenso wie spätere Duelldefizite. Kein automatisches Abwerten, nur weil der Gegner bei drei Items einen offenen Statcheck gewinnen kann.'],
 ['Phasen getrennt','Lane-Tier umfasst die frühe Lane inklusive Level 6. Späte Side bezieht sich auf 2–3 Items bei vergleichbaren Ressourcen. Gesamt-Tier ist kein arithmetischer Mittelwert; Einfluss auf Win Conditions und realistische Spielpläne entscheidet.'],
 ['Tier-Skala','Z extrem günstig; A deutlich günstig; B leicht günstig; C ausgeglichen/skillabhängig; D leicht ungünstig; E deutlich ungünstig; F extrem schwierig. In dieser Revision weder Z noch F ausreichend sicher begründet. Extremstufen werden nicht zur Verteilungserfüllung vergeben.'],
 ['Vertrauen in die Urteile','Tiers, Rune, Summoners und Itemreihenfolgen sind qualitative Empfehlungen, keine nachgewiesenen Bestwerte. Meist etwa eine Tierstufe Spielraum. K’Sante und Zaahen besonders unsicher. Die Sammlung wurde nicht durch eigene Ingame-Testreihen validiert.'],
 ['26.18-Abgleich','Unter den 51 Gegnern erhält Zaahen eine direkte Änderung: höherer Q2-Grundschaden und früherer Q-Cooldown-Start beim Eintritt in Wiederbelebung. Olaf selbst bleibt unverändert. Rageblade-Stacks halten länger. Classic- und ARAM-Änderungen nicht auf Ranked übertragen.'],
 ['Skill-Reihenfolge','U.GG 26.17 stützt Q → E → W als verbreiteten Standard. Drei Q-Punkte und dann E max bleibt eine mechanisch plausible Lane-Anpassung bei verlässlichem E-Kontakt, aber nicht für jedes Matchup statistisch als optimal belegt.'],
 ['Zusätzliche W-Punkte','Keine belastbar belegte Empfehlung, gegen einen bestimmten Gegner früh W zu maximieren. W-Ränge erhöhen Angriffstempo und Basisschild und verkürzen den Cooldown. W selbst gibt keinen Lebensraub; Rank-ups verbessern nicht die Missing-HP-Skalierung.'],
 ['Freeze und Tiamat','Sowohl Ravenous als auch Stridebreaker bauen auf Tiamat/Cleave auf. Deshalb ist Stride kein grundsätzlich freeze-freundlicher Gegenentwurf zu Hydra. Erst entscheiden, ob Farm-Denial oder schneller Crash gerade mehr wert ist.'],
]
method += [r for r in old['method'] if r[0] in retain]
method += [
 ['Jungle ohne Ravenous','Mechanische Option für Schaden und Auto-Sustain: Stridebreaker, danach passende Defensive (Death’s Dance gegen AD, Maw gegen AP), BotRK bei langen erreichbaren Auto-Fights. Kein für 26.18 nachgewiesener optimaler Pfad. Smite + Flash als sichere Voreinstellung.'],
 ['Quelle: Live-Patch','https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/'],
 ['Quelle: U.GG Paarungen','https://u.gg/lol/champions/olaf/counter'],
 ['Quelle: LoLalytics Paarungen','https://lolalytics.com/lol/olaf/counters/'],
 ['Quelle: Skill-Standard','https://u.gg/lol/champions/olaf/build'],
 ['Quelle: W-Rework','https://www.leagueoflegends.com/en-us/news/game-updates/patch-12-9-notes/'],
 ['Quelle: W-Schildkorrektur','https://www.leagueoflegends.com/en-us/news/game-updates/patch-12-11-notes/'],
 ['Quelle: Saisonitems','https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/'],
 ['Quelle: Bolts-Anpassung','https://www.leagueoflegends.com/en-gb/news/game-updates/patch-26-2-notes/'],
 ['Quelle: Quest-Anpassung','https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-12-notes/'],
 ['Quelle: PTA-Rework','https://www.leagueoflegends.com/en-au/news/game-updates/patch-14-10-notes/']
]
a=s.index('const method=[');b=s.index('\nasync function master()',a)
s=s[:a]+'const method='+json.dumps(method,ensure_ascii=False,indent=1)+';\n'+s[b:]
# Expand the existing overview and detail tables to expose phases and the revision rationale.
s=s.replace("'Übersicht','I60'", "'Übersicht','M60'")
s=s.replace("'Patch / geprüft'];", "'Patch / geprüft','Lane-Tier','Späte Side','Bisheriges Tier','Revision'];")
s=s.replace("s.getRange('A5:I56').values", "s.getRange('A5:M56').values")
s=s.replace("`${patch} · ${checked}`])];", "`${patch} · ${checked}`,m.lane,m.late,m.oldTier,m.revision])];")
s=s.replace('[19,8,16,23,65,60,70,36,22]', '[19,8,16,23,65,60,70,36,22,13,13,15,90]')
s=s.replace("table(s,'A5:I56'", "table(s,'A5:M56'").replace("head(s,'A5:I5')", "head(s,'A5:M5')").replace("s.getRange('A6:I56')", "s.getRange('A6:M56')")
s=s.replace("'Alle Details','X58'", "'Alle Details','AB58'")
s=s.replace("'Patch','Geprüft am'];", "'Patch','Geprüft am','Lane-Tier','Späte Side','Bisheriges Tier','Revision'];")
s=s.replace("d.getRange('A5:X56').values", "d.getRange('A5:AB56').values").replace("m[k]),patch,checked])];", "m[k]),patch,checked,m.lane,m.late,m.oldTier,m.revision])];")
s=s.replace("table(d,'A5:X56'", "table(d,'A5:AB56'").replace("head(d,'A5:X5')", "head(d,'A5:AB5')").replace("d.getRange('A6:X56')", "d.getRange('A6:AB56')")
s=s.replace("d.getRange('W1:X58').format.columnWidth=18;", "d.getRange('W1:AA58').format.columnWidth=18;d.getRange('AB1:AB58').format.columnWidth=90;")
s=s.replace("v/100,null,'16.17',u.includes('mobalytics')?'Mobalytics':'LoLalytics'", "v===null?null:v/100,null,'16.17','LoLalytics'")
a=s.index(" const st=base(wb,'Statistik'");b=s.index(" const l=base(wb,'Leitfaden'",a)
s=s[:a]+''' const st=base(wb,'Statistik','M66');title(st,'Paarungsdaten aus zwei Quellen','A2');
 st.getRange('A3').values=[['Datenpatch 26.17/16.17 · abgerufen 10.09.2026 · Emerald+, weltweit · keine Lane-Winrates']];st.getRange('A3').format.wrapText=false;
 const statHeads=['Gegner','U.GG Gegner-WR','U.GG Olaf-WR','U.GG Spiele','Gegner-GD15','Olaf-GD15','LoLA rohe Olaf-WR','LoLA Spiele','LoLA Delta 2 (PP)','Datenpatch','Gesamt-Tier','Quelle U.GG','Quelle LoLA'];
 st.getRange('A5:M56').values=[statHeads,...matchups.map(m=>{const t=m.stats;return [m.name,t.opponentWR===null?null:t.opponentWR/100,null,t.n,t.opponentGD,null,t.rawWR/100,t.ln,t.delta2,'26.17 / 16.17',m.tier,source.counters,source.counterCheck];})];
 [20,19,19,15,18,18,21,15,21,19,15,57,57].forEach((w,i)=>st.getRange(`${col(i)}1:${col(i)}66`).format.columnWidth=w);
 matchups.forEach((m,i)=>{const r=i+6;if(m.stats.n!==null){st.getRange(`C${r}`).formulas=[[`=1-B${r}`]];st.getRange(`F${r}`).formulas=[[`=-E${r}`]];}});
 st.getRange('B6:C56').setNumberFormat('0.00%');st.getRange('G6:G56').setNumberFormat('0.00%');st.getRange('D6:F56').setNumberFormat('#,##0');st.getRange('H6:H56').setNumberFormat('#,##0');st.getRange('I6:I56').setNumberFormat('0.00');
 table(st,'A5:M56','Paarungsdaten');head(st,'A5:M5');st.getRange('A6:M56').format.rowHeight=42;tierFill(st,'K6:K56');st.freezePanes.freezeRows(5);
 const notes=[['Lesart','U.GG zeigt Gegner-WR/GD15. C und F rechnen in Olafs Sicht um. GD15 enthält Jungle-, Recall- und Roam-Einfluss.'],['Vergleich','LoLalytics-Rohwerte nicht direkt mit U.GG mitteln. Delta 2 ist die anbietereigene Normalisierung beider Champion-Winrates, in Prozentpunkten.'],['Lücken','Leere U.GG-Zellen: Paarung im abrufbaren Datensatz nicht enthalten. Keine Null-Winrate.'],['Patchgrenze','Bewertungen auf 26.18 geprüft. Diese Zahlen beschreiben 26.17. Insbesondere Zaahens neuen Buff bilden sie nicht ab.']];
 st.getRange('A59:B62').values=notes;st.getRange('A59:B62').format.rowHeight=95;
 st.getRange('B59:B62').format.columnWidth=19;
 // Notes use the existing wide source columns for legibility without widening the numerical table.
 st.getRange('B59:B62').clear({applyTo:'contents'});st.getRange('L59:L62').values=notes.map(x=>[x[1]]);st.getRange('L59:L62').format.rowHeight=95;
''' +s[b:]
s=s.replace("'Leitfaden','B50'", "'Leitfaden','B65'").replace("l.getRange('A1:A50')", "l.getRange('A1:A65')").replace("l.getRange('B1:B50')", "l.getRange('B1:B65')")
s=s.replace("['Statistik','A1:F23']", "['Statistik','A1:K13']")
s=s.replace("'work/data.json'", "'work/data-revision.json'")
# Central text mirrors the supporting table, without implying current-patch observations.
idx=s.index('function col(')
s=s[:idx]+'''function statText(m){const t=m.stats;const u=t.n===null?'U.GG: keine extrahierte Paarung.':`U.GG: Olaf ${(100-t.opponentWR).toFixed(2)} % Spiel-WR, n=${t.n}; Olaf GD15=${-t.opponentGD}.`;return `${u} LoLalytics: rohe Olaf-WR ${t.rawWR.toFixed(2)} %, n=${t.ln}, Delta 2 ${t.delta2.toFixed(2)} PP. Beide Datenpatch 26.17/16.17, abgerufen 10.09.2026. Andere Populationen; nicht mitteln, keine Tierformel.`;}
''' +s[idx:]
assert 'mobalytics.gg' not in s and 'mobafire.com' not in s
p.write_text(s,encoding='utf-8')
print('Builder revised; method rows:',len(method))
