import fs from 'node:fs/promises';
import path from 'node:path';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
import {matchups} from './matchups.mjs';
import {applyReview,stats} from './review.mjs';
applyReview(matchups);

const out=path.resolve('outputs/Olaf_Top_26.18_Revision');
const previews=path.resolve('work/previews-revision');
await fs.mkdir(path.join(out,'Matchups'),{recursive:true});
await fs.mkdir(previews,{recursive:true});
const patch='26.18', checked='10.09.2026';
const colors={Z:'#B8E0D2',A:'#D6EAD4',B:'#EAF2CD',C:'#FFF0BD',D:'#FADCAE',E:'#F3C5BA',F:'#E5B6C8'};
const tierText={Z:'Extrem Olaf-favored',A:'Deutlich Olaf-favored',B:'Leicht Olaf-favored',C:'Ausgeglichen / skillabhängig',D:'Leicht Olaf-unfavored',E:'Deutlich Olaf-unfavored',F:'Extrem schwierig für Olaf'};
const source={
 patch:'https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/',
 schedule:'https://support.riotgames.com/en-us/league-of-legends/gameplay/patch-schedule-league-of-legends/',
 olaf:'https://www.leagueoflegends.com/en-us/champions/olaf/',
 stats:'https://lolalytics.com/lol/olaf/build/',
 counters:'https://u.gg/lol/champions/olaf/counter',
 counterCheck:'https://lolalytics.com/lol/olaf/counters/',
 second:'https://www.metasrc.com/lol/tier-list/top',
 season:'https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/',
 jan:'https://www.leagueoflegends.com/en-gb/news/game-updates/patch-26-2-notes/',
 quest:'https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-12-notes/',
 pta:'https://www.leagueoflegends.com/en-au/news/game-updates/patch-14-10-notes/',
 morde:'https://www.leagueoflegends.com/en-ph/news/game-updates/patch-14-8-notes/',
 jungle:'https://u.gg/lol/champions/olaf/build/jungle',
 zaahen:'https://www.leagueoflegends.com/en-us/news/game-updates/zaahen-abilities-rundown/'
};
const rawPool=JSON.parse(await fs.readFile('work/pool.json','utf8'));
const replacement={kled:[1.79,41875],sion:[2.8,77936],tryndamere:[3.21,90628],zaahen:[2.61,73689]};
const flex=new Set(['akali','heimerdinger','sylas','vayne','vladimir','yasuo']);
const patchNotes={chogath:'26.17: E-Grundschaden erhöht; frühe Nahkampftrades entsprechend respektieren.',irelia:'26.17: Q-AD-Skalierung erhöht; frühe passive/Q-Fenster nicht anhand älterer Damage-Erwartung spielen.',nasus:'26.17: passive Heilung reduziert. Sein Stackstand und R bleiben wichtiger als eine pauschale Earlygame-Regel.',trundle:'26.17: W-Attack-Speed auf höheren Rängen erhöht; längere Kämpfe in W vermeiden.',vayne:'26.17: frühes W schwächer und frühes Q teurer; R/Q-Stealth und späterer True Damage bleiben strukturell schwierig.',yasuo:'26.17: Crit-Schadensabzug reduziert; Crit-Spike respektieren.',yone:'26.17: Crit-Schadensabzug reduziert; Crit-Spike respektieren.'};
for(const m of matchups){
 const p=rawPool.find(x=>x.slug===m.slug); if(!p)throw Error('Missing pool '+m.slug);
 m.pool={pick:Number(p.pick)/100,games:Number(p.games.replaceAll(',','')),patch:p.patch,provider:'LoLalytics',url:`https://lolalytics.com/lol/${m.slug}/build/?lane=top`};
 if(replacement[m.slug]){m.pool={pick:replacement[m.slug][0]/100,games:replacement[m.slug][1],patch:'16.17',provider:'LoLalytics',url:`https://lolalytics.com/lol/${m.slug}/build/`};}
 m.category=flex.has(m.slug)?'Häufiger Flex-Pick':'Regulärer Toplaner';
 m.file=`Olaf_vs_${m.slug}.xlsx`;
 m.official=`https://www.leagueoflegends.com/en-us/champions/${m.slug==='wukong'?'monkeyking':m.slug}/`;
 m.note=(patchNotes[m.slug]||'26.17: kein spezifischer Änderungsvermerk.')+' 26.18: Olaf unverändert; unter diesen 51 Gegnern direkt Zaahen geändert. Rageblade-Stackdauer bei entsprechenden Builds beachten. Classic/ARAM ausgeschlossen.';
 if(m.slug==='zaahen')m.note='26.18: Q2-Grundschaden erhöht. Aktive Q startet beim Eintritt in Revive ihren Cooldown. Früherer Gegenangriff nach Wiederbelebung möglich. Neue Matchup-Statistik noch nicht belastbar verfügbar.';
 for(const k of ['reason','runeReason','l1','l25','l6','threats','window','errors','wave','trade','items','situ','side','plan','override']){
  if(typeof m[k]!=='string'||m[k].length<20)throw Error('Incomplete '+m.slug+' '+k);
  m[k]=m[k].replaceAll('Scheen','Sheen');
 }
}
const shen=matchups.find(m=>m.slug==='shen');
shen.l6='R nimmt Taunt, nicht W-Auto-Block. Shen-R auf andere Lane: früh pingen. Olaf hat keinen Hard-CC, um den Kanal abzubrechen; deshalb rechtzeitig durch Crash/Turm bestrafen.';
const cols=[['name','1 · Champion'],['tier','2 · Tier'],['reason','3 · Tier-Begründung'],['rune','4 · Keystone'],['runeReason','5 · Rune: Fight Pattern'],['start','6 · Startitem'],['sums','7 · Summoner Spells'],['boots','8 · Frühe Boots'],['l1','9 · Level 1'],['l25','10 · Level 2–5'],['l6','11 · Ab Level 6'],['threats','12 · Gefährliche Fähigkeiten'],['window','13 · Kill Window'],['errors','14 · Unbedingt vermeiden'],['wave','15 · Wave-Management'],['trade','16 · Trading Pattern'],['items','17 · Erste 1–2 Items'],['situ','18 · Situative Items'],['side','19 · Side bei 1/2/3 Items'],['plan','20 · Gameplan'],['override','Comp Override'],['uncertainty','Unsicherheit']];
function statText(m){const t=m.stats;const u=t.n===null?'U.GG: keine extrahierte Paarung.':`U.GG: Olaf ${(100-t.opponentWR).toFixed(2)} % Spiel-WR, n=${t.n}; Olaf GD15=${-t.opponentGD}.`;return `${u} LoLalytics: rohe Olaf-WR ${t.rawWR.toFixed(2)} %, n=${t.ln}, Delta 2 ${t.delta2.toFixed(2)} PP. Beide Datenpatch 26.17/16.17, abgerufen 10.09.2026. Andere Populationen; nicht mitteln, keine Tierformel.`;}
function col(n){let s='';for(n++;n>0;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;}
function base(wb,name,last='B60'){
 const s=wb.worksheets.add(name);s.showGridLines=false;
 s.getRange(`A1:${last}`).format={font:{name:'Arial',size:11,color:'#202B3B'},verticalAlignment:'top',wrapText:true};
 return s;
}
function title(s,text,at='B2'){
 s.getRange(at).values=[[text]];s.getRange(at).format.font={name:'Arial',size:16,bold:true,color:'#243B61'};
 s.getRange(at).format.rowHeight=28;
 s.getRange(at).format.wrapText=false;
}
function rowHeight(text,width=106){return Math.max(30,(Math.ceil(String(text).length/width)+1)*15);}
function textRows(s,rows,start=5){
 s.getRange(`A${start}:B${start+rows.length-1}`).values=rows;
 rows.forEach((r,i)=>{
  const rr=start+i;s.getRange(`A${rr}:B${rr}`).format.rowHeight=rowHeight(r[1]);
  s.getRange(`A${rr}`).format.font={name:'Arial',size:11,bold:true,color:'#33445D'};
  if(i%2===0)s.getRange(`A${rr}:B${rr}`).format.fill='#F3F5F8';
  if(String(r[1]).startsWith('https://')){s.getRange(`B${rr}`).format.font={name:'Arial',size:11,color:'#285D91'};}
 });
}
function head(s,range){s.getRange(range).format={fill:'#243B61',font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},wrapText:true,horizontalAlignment:'center',verticalAlignment:'center',rowHeight:34};}
function tierFill(s,range){for(const [t,c]of Object.entries(colors))s.getRange(range).conditionalFormats.add('cellIs',{operator:'equal',formula:`"${t}"`,format:{fill:c,font:{bold:true,color:'#202B3B'}}});}
function table(s,range,name){const t=s.tables.add(range,true,name);t.style='TableStyleLight1';t.showFilterButton=true;return t;}
async function preview(wb,sheet,name,range){const blob=await wb.render({sheetName:sheet,range,scale:1,format:'png'});await fs.writeFile(path.join(previews,name+'.png'),new Uint8Array(await blob.arrayBuffer()));}
async function exportWb(wb,file){wb.recalculate();const x=await SpreadsheetFile.exportXlsx(wb);await x.save(file);}
function one(m){
 const wb=Workbook.create();const s=base(wb,'Matchup','B52');s.tabColor='#243B61';
 s.getRange('A1:A52').format.columnWidth=29;s.getRange('B1:B52').format.columnWidth=114;
 title(s,`Olaf vs ${m.name}`);s.getRange('B3').values=[[`Top · Ranked Solo Queue · Patch ${patch} · geprüft ${checked}`]];s.getRange('B3').format.rowHeight=26;
 const order=['plan','name','tier','rune','sums','start','boots','reason','runeReason','l1','l25','l6','threats','window','errors','wave','trade','items','situ','side','override','uncertainty'];
 const rows=order.map(k=>[cols.find(x=>x[0]===k)[1],k==='tier'?`${m.tier} · ${tierText[m.tier]}`:m[k]]);
 rows.push(['Lane-Tier',m.lane+' · '+tierText[m.lane]],['Späte Sidelane',m.late+' · '+tierText[m.late]+' (2–3 Items, vergleichbare Ressourcen)'],['Revision',m.revision],['Patch-Prüfung',m.note],['Gültigkeit','Tiers sind eigene Einschätzungen bei vergleichbarem Gold/Level. Lane umfasst auch Level 6; Side meint 2–3 abgeschlossene Items ohne Boots. Die Gesamtwertung ist kein Mittelwert beider Phasen. Keine Ingame-Testreihe und kein statistisch bewiesener optimaler Build.'],['Statistik: Einordnung',statText(m)],['Pool-Nachweis',`${m.category} · Top-Pickrate ${(m.pool.pick*100).toFixed(2)} % · ${m.pool.games.toLocaleString('de-DE')} Champion-Spiele · LoLalytics, Emerald+, global, Solo/Duo, Datenpatch ${m.pool.patch}. Historischer Pool-Snapshot; keine gemessene 26.18-Pickrate.`],['Quelle: Top-Pickrate',m.pool.url],['Quelle: Gegner-Kit',m.official],['Quelle: Olaf-Kit',source.olaf],['Quelle: Live-Patch',source.patch],['Quelle: U.GG Paarungen',source.counters],['Quelle: LoLalytics Paarungen',source.counterCheck]);
 if(m.slug==='mordekaiser')rows.push(['Quelle: Realm-Interaktion',source.morde]);
 if(m.slug==='zaahen')rows.push(['Quelle: Zaahen-Überblick',source.zaahen]);
 if(m.slug==='kled')rows.push(['Quelle: Kled-Kit-Revision','https://www.leagueoflegends.com/en-gb/news/game-updates/patch-25-14-notes/']);
 if(m.slug==='volibear')rows.push(['Quelle: W-Heilung','https://www.leagueoflegends.com/en-us/news/game-updates/patch-13-14-notes/']);
 if(m.slug==='fiora')rows.push(['Quelle: Riposte','https://nexus.leagueoflegends.com/en-us/champion/fiora/']);
 rows.push(['Zur Sammlung','Die Datei ist eigenständig lesbar. Alle Gegner und Build-Grundlagen: ../Olaf_Top_Sammlung.xlsx oder ../START.html. URLs sind Quellenlinks; taktische Empfehlungen sind eigene Synthese.']);
 textRows(s,rows);s.getRange('A5:B5').format.fill='#E9EEF6';s.getRange('B7').format.fill=colors[m.tier];s.freezePanes.freezeRows(3);
 return {wb,s,rows:rows.length+4};
}

const excluded=[
 ['Aurora',.45,'Flex unter 1 %','https://lolalytics.com/lol/aurora/build/?lane=top'],
 ['Akshan',.20,'Flex unter 1 %','https://lolalytics.com/lol/akshan/build/?lane=top'],
 ['Ryze',.74,'Flex unter 1 %','https://lolalytics.com/lol/ryze/build/?lane=top'],
 ['Varus',.72,'Flex unter 1 %','https://lolalytics.com/lol/varus/build/?lane=top'],
 ['Maokai',.39,'Unter 0,5 %; neu geprüft 10.09.2026','https://lolalytics.com/lol/maokai/build/?lane=top'],
 ['Rengar',.30,'Unter 0,5 %; neu geprüft 10.09.2026','https://lolalytics.com/lol/rengar/build/?lane=top'],
 ['Viktor',.32,'Flex unter 1 %','https://lolalytics.com/lol/viktor/build/?lane=top'],
 ['Lissandra',.45,'Flex unter 1 %','https://lolalytics.com/lol/lissandra/build/?lane=top'],
 ['Ahri',.24,'Flex unter 1 %','https://lolalytics.com/lol/ahri/build/?lane=top'],
 ['Qiyana',.26,'Flex unter 1 %','https://lolalytics.com/lol/qiyana/build/?lane=top'],
 ['Zilean',.28,'Flex unter 1 %','https://lolalytics.com/lol/zilean/build/?lane=top'],
 ['Zed',.71,'Flex unter 1 %','https://lolalytics.com/lol/zed/build/?lane=top']
];
const method=[
 [
  "Geltungsbereich",
  "Revision vom 10.09.2026 für Live-Patch 26.18, Summoner’s Rift, Ranked Solo Queue, Toplane. Die unabhängig abgerufenen Paarungsstatistiken zeigen noch 26.17/16.17. Sie werden nicht als 26.18-Ergebnisse ausgegeben."
 ],
 [
  "Was wurde korrigiert?",
  "Alle 51 Einträge inhaltlich auf Konsistenz geprüft. Paarungsstatistik ersetzt, vier Pool-Belege erneuert, Lane und späte Side getrennt, überzogene Gesamturteile korrigiert. Die Änderung pro Champion steht in Übersicht und Einzeldatei. Alte Version bleibt separat erhalten."
 ],
 [
  "Quellenwahl",
  "Riot für Patchänderungen und Kit-Grundlagen, U.GG und LoLalytics für Paarungsdaten. Mobalytics und Mobafire sind keine Belegquellen dieser Revision. Ein Quellenwechsel allein beweist keinen Tierwechsel; jedes Tier bleibt eigene taktische Synthese."
 ],
 [
  "Championpool",
  "51 bisherige Gegner beibehalten. Aufnahmebasis sind gekennzeichnete 26.17-Pickraten: reguläre Toplaner ungefähr ab 0,5 %, zusätzliche Flex-Picks ab 1 %. Ein vollständig gereifter 26.18-Pool ist am Patchbeginn noch nicht belegt. Grenzfälle können sich ändern."
 ],
 [
  "Pool-Snapshots",
  "47 LoLalytics-Werte aus der bisherigen Recherche vom 08.09.2026 beibehalten. Kled, Sion, Tryndamere und Zaahen am 10.09.2026 unabhängig bei LoLalytics neu abgelesen. Alle bleiben über der Aufnahmeschwelle. Anbieter-Caches sind nicht zeitsynchron."
 ],
 [
  "Statistik lesen",
  "U.GG liefert Gegner-WR und Gegner-GD15. Die Tabelle berechnet daraus Olaf-WR = 1 − Gegner-WR und Olaf-GD15 = − Gegner-GD15. GD15 ist eine beobachtete Goldbilanz mit Jungle-/Roam-Einfluss, kein reiner mechanischer Lanetest."
 ],
 [
  "LoLalytics vergleichen",
  "Rohe Olaf-WR und Anbieter-Delta 2 stehen separat. Delta 2 normalisiert nach der Methode des Anbieters beide Champion-Winrates. Kein direkter Roh-WR-Vergleich mit U.GG und kein Mittelwert. Negative Delta 2 kann auch bei roher WR über 50 % auftreten."
 ],
 [
  "Datenlücken",
  "U.GG-Paarungswerte für Quinn, Sylas, Vladimir und Wukong waren in der abgerufenen Liste nicht enthalten. Leere Zellen bedeuten unbekannt. LoLalytics bietet hier zusätzliche kleinere Stichproben. Keine Werte aus anderen Rollen oder alten Cache-Varianten eingefüllt."
 ],
 [
  "Tier-Methode",
  "Gesamt-Tier beschreibt Olafs umsetzbaren Plan über die Partie. Frühe Druckfenster, R-Spike und erreichbarer Farm-/Turmvorteil zählen ebenso wie spätere Duelldefizite. Kein automatisches Abwerten, nur weil der Gegner bei drei Items einen offenen Statcheck gewinnen kann."
 ],
 [
  "Phasen getrennt",
  "Lane-Tier umfasst die frühe Lane inklusive Level 6. Späte Side bezieht sich auf 2–3 Items bei vergleichbaren Ressourcen. Gesamt-Tier ist kein arithmetischer Mittelwert; Einfluss auf Win Conditions und realistische Spielpläne entscheidet."
 ],
 [
  "Tier-Skala",
  "Z extrem günstig; A deutlich günstig; B leicht günstig; C ausgeglichen/skillabhängig; D leicht ungünstig; E deutlich ungünstig; F extrem schwierig. In dieser Revision weder Z noch F ausreichend sicher begründet. Extremstufen werden nicht zur Verteilungserfüllung vergeben."
 ],
 [
  "Vertrauen in die Urteile",
  "Tiers, Rune, Summoners und Itemreihenfolgen sind qualitative Empfehlungen, keine nachgewiesenen Bestwerte. Meist etwa eine Tierstufe Spielraum. K’Sante und Zaahen besonders unsicher. Die Sammlung wurde nicht durch eigene Ingame-Testreihen validiert."
 ],
 [
  "26.18-Abgleich",
  "Unter den 51 Gegnern erhält Zaahen eine direkte Änderung: höherer Q2-Grundschaden und früherer Q-Cooldown-Start beim Eintritt in Wiederbelebung. Olaf selbst bleibt unverändert. Rageblade-Stacks halten länger. Classic- und ARAM-Änderungen nicht auf Ranked übertragen."
 ],
 [
  "Skill-Reihenfolge",
  "U.GG 26.17 stützt Q → E → W als verbreiteten Standard. Drei Q-Punkte und dann E max bleibt eine mechanisch plausible Lane-Anpassung bei verlässlichem E-Kontakt, aber nicht für jedes Matchup statistisch als optimal belegt."
 ],
 [
  "Zusätzliche W-Punkte",
  "Keine belastbar belegte Empfehlung, gegen einen bestimmten Gegner früh W zu maximieren. W-Ränge erhöhen Angriffstempo und Basisschild und verkürzen den Cooldown. W selbst gibt keinen Lebensraub; Rank-ups verbessern nicht die Missing-HP-Skalierung."
 ],
 [
  "Freeze und Tiamat",
  "Sowohl Ravenous als auch Stridebreaker bauen auf Tiamat/Cleave auf. Deshalb ist Stride kein grundsätzlich freeze-freundlicher Gegenentwurf zu Hydra. Erst entscheiden, ob Farm-Denial oder schneller Crash gerade mehr wert ist."
 ],
 [
  "PTA",
  "Wählen, wenn nach einem klaren Defensiv-CD drei Autos und ein kurzes Killfenster realistisch sind. Nicht pauschal gegen Squishies. Jax-E, Akali-W, Vayne-R/Q oder Pool können die Aktivierung verhindern. Der heutige PTA-Buff ist nicht der alte Team-Expose-Debuff."
 ],
 [
  "Conqueror",
  "Wählen bei mehreren Melee-Zyklen, hohen effektiven HP und Re-engages innerhalb sinnvoller Stack-Uptime. Q/E tragen zum Aufbau bei. Vollständiger Rückzug kann Stacks verlieren lassen; die Rune rechtfertigt keine aussichtslose Verfolgung."
 ],
 [
  "Comp Override",
  "Vor Champselect-Ende prüfen: Wen erreichst du wirklich, wer hält die Side, wie lang sind die Teamfights? Die alternative Rune/Spells stehen pro Gegner. Dies ist eine Bedingung, kein nachträglicher Runenwechsel während des Spiels."
 ],
 [
  "Olaf-Grundmechanik",
  "Ragnarok verhindert/reinigt Kontrolle, nicht Schaden, Terrain, Unverwundbarkeit, Dodge oder Unsichtbarkeit. Autos und E auf Champions verlängern R; Q allein hält sie nicht am Laufen. W als Auto-Reset/Schutz im treffenden Auto-Fenster nutzen, nicht möglichst spät um jeden Preis."
 ],
 [
  "Bruiser-Olaf",
  "Stridebreaker → Death’s Dance gegen physischen Druck, Maw gegen AP-Burst oder Sterak’s gegen gemischten Burst. Stride hält Ziele erreichbar; es ist kein Lifesteal-Item. Experimental Hexplate ist eine Alternative für wiederholte R-Fenster, wenn kein dringender defensiver Kauf ansteht."
 ],
 [
  "Ravenous-Olaf",
  "Ravenous Hydra → passende Defensive oder Black Cleaver bei Armor. Gut für wiederholte Trades, Waveclear und Erholung. Frühes Tiamat kann einen wertvollen Freeze erschweren; Sustain hilft nur, wenn du zwischen den All-ins tatsächlich heilen kannst."
 ],
 [
  "PTA / offensiver Olaf",
  "Meist zuerst Stridebreaker für echten Zugang. Fiendhunter Bolts danach/als drittes, wenn drei Autos nach R und ausreichendes Überleben realistisch sind. Mehr Burst bringt nichts gegen eine frische Dodge-/Stealth-/Invulnerability-Phase."
 ],
 [
  "Kritlaf",
  "Situative Weiterentwicklung: Stridebreaker oder Ravenous → Fiendhunter Bolts → Infinity Edge, nur bei Vorsprung, sicherer Auto-Uptime und geringer Burstgefahr. Defensive kann vorgezogen werden. Mechanik: R aktiviert Bolts-Autofenster; Crit erhöht Auto-Schaden, Lifesteal profitiert von tatsächlich verursachtem Auto-Schaden. Kein pauschaler Counter gegen Jax/Vayne."
 ],
 [
  "Splitlaf",
  "Ravenous → Hullbreaker, wenn Waveclear in sichere Turmzeit umgewandelt werden kann; bei gefährlicher Side erst Defensive oder Anti-Armor. Gegen Shen/Sion-artige Rotationen plausibel. Das Label beschreibt den Spielplan, nicht einen Bonus, der jedes isolierte Duell gewinnt."
 ],
 [
  "Andere Heilpfade",
  "BotRK liefert Auto-Sustain/HP-Schaden, verlangt Kontakt und ist gegen hohe Armor kein universeller Tankkonter. Endless Hunger passt eher zu späteren langen Kämpfen/Takedowns als zum automatischen Lane-Rush. Spirit Visage lohnt besonders gegen AP mit zusätzlicher Heilung/Schilden im Team; es ersetzt fehlenden Schaden nicht."
 ],
 [
  "Boots und Antiheal",
  "Steelcaps gegen relevante Autos/physische Bedrohung; Armor stoppt keinen True Damage. Mercury’s nicht allein wegen eines mit R übergehbaren Stuns kaufen: MR und die Phasen ohne R zählen. Antiheal vor dem entscheidenden Heal-Fenster aktivieren; keine Verdopplung gleicher Grievous-Wounds-Wirkung erwarten."
 ],
 [
  "Summoners / Top-Quest",
  "Flash + Ghost ist der Standard für Chase plus Terrain-Ausweg. Ghost + Ignite ist gezielt gegen Heilduelle mit bewusstem Gankrisiko. Flash + Teleport stabilisiert schwierige Resets. Die Top-Quest kann ohne gewähltes TP später Teleport bereitstellen; der frühe Verzicht bleibt trotzdem real."
 ],
 [
  "Item-Konflikte",
  "Maw und Sterak’s sind alternative Lifeline-Käufe, kein gemeinsamer Standard. Black Cleaver nur mit relevantem Armor-/Teamschadenswert; Olafs Q-Shred und E mitdenken. Itemreihenfolgen sind bedingte Empfehlungen, keine sechs fest verdrahteten Slots."
 ],
 [
  "Jungle-Heilung",
  "Olafs Passive liefert die Basis, zusätzlicher Lebensraub braucht treffende Autos. DD-Heilung ist an Takedowns gebunden; Stride besitzt keinen Lebensraub. Gegen Stealth/Kiting mehr Kontakt oder Defensive kaufen, statt Heilwerte ohne Auto-Uptime zu stapeln."
 ],
 [
  "Jungle ohne Ravenous",
  "Mechanische Option für Schaden und Auto-Sustain: Stridebreaker, danach passende Defensive (Death’s Dance gegen AD, Maw gegen AP), BotRK bei langen erreichbaren Auto-Fights. Kein für 26.18 nachgewiesener optimaler Pfad. Smite + Flash als sichere Voreinstellung."
 ],
 [
  "Quelle: Live-Patch",
  "https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/"
 ],
 [
  "Quelle: U.GG Paarungen",
  "https://u.gg/lol/champions/olaf/counter"
 ],
 [
  "Quelle: LoLalytics Paarungen",
  "https://lolalytics.com/lol/olaf/counters/"
 ],
 [
  "Quelle: Skill-Standard",
  "https://u.gg/lol/champions/olaf/build"
 ],
 [
  "Quelle: W-Rework",
  "https://www.leagueoflegends.com/en-us/news/game-updates/patch-12-9-notes/"
 ],
 [
  "Quelle: W-Schildkorrektur",
  "https://www.leagueoflegends.com/en-us/news/game-updates/patch-12-11-notes/"
 ],
 [
  "Quelle: Saisonitems",
  "https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/"
 ],
 [
  "Quelle: Bolts-Anpassung",
  "https://www.leagueoflegends.com/en-gb/news/game-updates/patch-26-2-notes/"
 ],
 [
  "Quelle: Quest-Anpassung",
  "https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-12-notes/"
 ],
 [
  "Quelle: PTA-Rework",
  "https://www.leagueoflegends.com/en-au/news/game-updates/patch-14-10-notes/"
 ]
];

async function master(){
 const wb=Workbook.create();
 const s=base(wb,'Übersicht','M60');s.tabColor='#243B61';title(s,'Olaf Top · Matchup-Sammlung','A2');
 s.getRange('A3:I3').values=[[`Patch ${patch}`,'','51 Gegner','Emerald+ / global',`Geprüft ${checked}`,'Filter in Zeile 5','Einzeldateien: START.html','','']];s.getRange('A3:I3').format.rowHeight=30;
 const heads=['Champion','Tier','Keystone','Summoner Spells','Tier-Begründung','Kill Window','Rune: Fight Pattern','Einzeldatei','Patch / geprüft','Lane-Tier','Späte Side','Bisheriges Tier','Revision'];
 s.getRange('A5:M56').values=[heads,...matchups.map(m=>[m.name,m.tier,m.rune,m.sums,m.reason,m.window,m.runeReason,`Matchups/${m.file}`,`${patch} · ${checked}`,m.lane,m.late,m.oldTier,m.revision])];
 [19,8,16,23,65,60,70,36,22,13,13,15,90].forEach((w,i)=>s.getRange(`${col(i)}1:${col(i)}60`).format.columnWidth=w);
 table(s,'A5:M56','OlafUebersicht');head(s,'A5:M5');s.getRange('A6:M56').format.rowHeight=80;tierFill(s,'B6:B56');s.freezePanes.freezeRows(5);
 matchups.forEach((m,i)=>s.getRange(`B${i+6}`).format.fill=colors[m.tier]);
 s.freezePanes.freezeColumns(1);
 s.getRange('H6:H56').format.font={name:'Arial',size:11,color:'#285D91'};
 const d=base(wb,'Alle Details','AB58');title(d,'Alle Matchups · vollständige Filtertabelle','A2');
 const dh=[...cols.map(x=>x[1]),'Patch','Geprüft am','Lane-Tier','Späte Side','Bisheriges Tier','Revision'];
 d.getRange('A5:AB56').values=[dh,...matchups.map(m=>[...cols.map(([k])=>m[k]),patch,checked,m.lane,m.late,m.oldTier,m.revision])];
 table(d,'A5:AB56','OlafDetails');head(d,'A5:AB5');d.getRange('A6:AB56').format.rowHeight=145;
 cols.forEach(([k],i)=>d.getRange(`${col(i)}1:${col(i)}58`).format.columnWidth=k==='tier'?8:k==='name'?19:['rune'].includes(k)?16:['sums','start'].includes(k)?25:65);
 d.getRange('W1:AA58').format.columnWidth=18;d.getRange('AB1:AB58').format.columnWidth=90;tierFill(d,'B6:B56');d.freezePanes.freezeRows(5);
 d.freezePanes.freezeColumns(2);
 const p=base(wb,'Championpool','H80');title(p,'Aufgenommener Toplane-Pool','A2');
 const ph=['Champion','Einordnung','Top-Pickrate','Champion-Spiele','Datenpatch','Anbieter','Aufnahmegrund','Quelle'];
 p.getRange('A5:H56').values=[ph,...matchups.map(m=>[m.name,m.category,m.pool.pick,m.pool.games,m.pool.patch,m.pool.provider,flex.has(m.slug)?'Flex ≥ 1 %':'Etablierter Toplaner ≥ 0,5 %',m.pool.url])];
 [19,24,15,19,14,18,31,96].forEach((w,i)=>p.getRange(`${col(i)}1:${col(i)}80`).format.columnWidth=w);
 table(p,'A5:H56','ToplanePool');head(p,'A5:H5');p.getRange('A6:H56').format.rowHeight=30;p.getRange('C6:C56').setNumberFormat('0.00%');p.getRange('D6:D56').setNumberFormat('#,##0');p.freezePanes.freezeRows(5);
 p.getRange('A59').values=[['Geprüfte Ausschlüsse']];p.getRange('A59').format.font={bold:true,color:'#243B61',size:14};
 p.getRange('A61:H73').values=[ph,...excluded.map(([n,v,r,u])=>[n,'Nicht aufgenommen',v===null?null:v/100,null,'16.17','LoLalytics',r,u])];table(p,'A61:H73','Ausschluesse');head(p,'A61:H61');p.getRange('C62:C73').setNumberFormat('0.00%');p.getRange('A62:H73').format.rowHeight=45;
 const st=base(wb,'Statistik','M66');title(st,'Paarungsdaten aus zwei Quellen','A2');
 st.getRange('A3').values=[['Datenpatch 26.17/16.17 · abgerufen 10.09.2026 · Emerald+, weltweit · keine Lane-Winrates']];st.getRange('A3').format.wrapText=false;
 const statHeads=['Gegner','U.GG Gegner-WR','U.GG Olaf-WR','U.GG Spiele','Gegner-GD15','Olaf-GD15','LoLA rohe Olaf-WR','LoLA Spiele','LoLA Delta 2 (PP)','Datenpatch','Gesamt-Tier','Quelle U.GG','Quelle LoLA'];
 st.getRange('A5:M56').values=[statHeads,...matchups.map(m=>{const t=m.stats;return [m.name,t.opponentWR===null?null:t.opponentWR/100,null,t.n,t.opponentGD,null,t.rawWR/100,t.ln,t.delta2,'26.17 / 16.17',m.tier,source.counters,source.counterCheck];})];
 [20,19,19,15,18,18,21,15,21,19,15,57,57].forEach((w,i)=>st.getRange(`${col(i)}1:${col(i)}66`).format.columnWidth=w);
 matchups.forEach((m,i)=>{const r=i+6;if(m.stats.n!==null){st.getRange(`C${r}`).formulas=[[`=1-B${r}`]];st.getRange(`F${r}`).formulas=[[`=-E${r}`]];}});
 st.getRange('B6:C56').setNumberFormat('0.00%');st.getRange('G6:G56').setNumberFormat('0.00%');st.getRange('D6:F56').setNumberFormat('#,##0');st.getRange('H6:H56').setNumberFormat('#,##0');st.getRange('I6:I56').setNumberFormat('0.00');
 table(st,'A5:M56','Paarungsdaten');head(st,'A5:M5');st.getRange('A6:M56').format.rowHeight=42;tierFill(st,'K6:K56');st.freezePanes.freezeRows(5);
 const l=base(wb,'Leitfaden','B65');l.tabColor='#8F9AA9';title(l,'Bewertung, Builds und Quellen');l.getRange('A1:A65').format.columnWidth=29;l.getRange('B1:B65').format.columnWidth=114;textRows(l,method);
 wb.recalculate();
 console.log((await wb.inspect({kind:'region',sheetId:'Statistik',range:'A5:F8',maxChars:1800})).ndjson);
 await exportWb(wb,path.join(out,'Olaf_Top_Sammlung.xlsx'));
 for(const [sheet,range]of [['Übersicht','A1:D13'],['Alle Details','A1:E9'],['Championpool','A1:G14'],['Statistik','A1:K13'],['Leitfaden','A1:B12']])await preview(wb,sheet,'master-'+sheet,range);
 await preview(wb,'Leitfaden','master-builds','A19:B33');
 await preview(wb,'Übersicht','master-phasen','I5:M13');
 return wb;
}
const mode=process.argv[2]||'all';
if(mode==='help'){const w=Workbook.create();w.worksheets.add('Info');console.log(w.help('fx.HYPERLINK',{include:'index,examples,notes',maxChars:2000}).ndjson);}
else {
 if(mode==='all'||mode==='master')await master();
 if(mode==='all'||mode==='single'){
  const chosen=mode==='single'?matchups.slice(0,1):matchups;
  for(const m of chosen){const {wb,rows}=one(m);await exportWb(wb,path.join(out,'Matchups',m.file));
   for(let first=1,part=1;first<=rows;first+=12,part++)await preview(wb,'Matchup',m.slug+'-'+part,`A${first}:B${Math.min(rows,first+11)}`);
   console.log('Saved '+m.name);
  }
 }
 await fs.writeFile('work/data-revision.json',JSON.stringify({patch,checked,matchups,source,excluded,method},null,2));
}
