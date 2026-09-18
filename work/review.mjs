// Independent observations, retrieved 2026-09-10; providers still display 26.17/16.17.
export const statRows = [
 ['aatrox',51.67,1796,89,48.63,1933,-4.27],
 ['akali',49.69,1296,160,51.45,1347,-1.68],
 ['ambessa',48.94,1514,-82,52.06,1556,-1.56],
 ['camille',53.16,2218,-119,47.06,2327,-4.53],
 ['chogath',49.65,1003,-521,52.34,1070,.82],
 ['darius',51.34,2659,126,49.79,2868,-2.37],
 ['drmundo',46.70,1062,-755,54.21,1140,1.90],
 ['fiora',50.55,1452,-51,50.40,1518,-2.27],
 ['gangplank',48.79,3011,-10,52.36,3268,1.04],
 ['garen',50.94,2491,-113,50.26,2744,-.47],
 ['gnar',46.73,1498,-214,54.19,1622,.88],
 ['gragas',50.21,960,-124,51.12,1023,-1.14],
 ['gwen',52.38,861,-387,49.31,939,-2.67],
 ['heimerdinger',48.06,566,431,54.15,650,2.45],
 ['illaoi',51.49,1206,331,50.08,1332,-1.01],
 ['irelia',49.53,1383,543,51.27,1500,-.50],
 ['jax',49.23,3291,0,52.41,3530,-.25],
 ['jayce',47.31,3126,-199,53.61,3350,-1.25],
 ['ksante',48.68,1325,241,53.68,1412,-1.86],
 ['kayle',52.53,790,-730,49.82,845,-1.12],
 ['kennen',46.52,847,-289,54.61,921,2.99],
 ['kled',52.75,1111,454,48.80,1166,-2.25],
 ['malphite',51.00,1806,-472,51.42,1933,.67],
 ['mordekaiser',48.61,3205,-466,53.95,3581,1.66],
 ['nasus',50.51,3987,-748,51.53,4450,.74],
 ['ornn',49.41,1281,-486,52.21,1381,1.28],
 ['pantheon',50.51,1085,-121,50.88,1189,-.89],
 ['poppy',49.33,446,-315,51.47,476,-.81],
 ['quinn',null,null,null,51.38,362,1.55],
 ['renekton',49.57,1854,171,51.64,1956,-.88],
 ['riven',43.96,894,-275,56.57,951,3.79],
 ['rumble',52.93,733,-384,49.87,788,-4.12],
 ['sett',50.30,1992,260,51.14,2151,-.30],
 ['shen',49.97,1469,-829,51.75,1573,.55],
 ['singed',50.85,995,-463,51.03,1064,.48],
 ['sion',50.23,856,-110,51.79,921,-1.20],
 ['sylas',null,null,null,57.81,301,6.07],
 ['tahmkench',51.59,597,-405,48.71,661,-3.43],
 ['teemo',44.18,2395,-624,56.96,2793,6.63],
 ['trundle',52.89,1766,153,48.72,1946,-4.15],
 ['tryndamere',54.38,1611,306,48.97,1744,-2.55],
 ['urgot',48.67,1315,-453,53.54,1440,2.37],
 ['vayne',49.00,951,-507,51.38,1016,-3.68],
 ['vladimir',null,null,null,53.99,363,1.27],
 ['volibear',48.29,1286,30,52.72,1379,-.65],
 ['warwick',48.79,578,-304,53.55,633,3.15],
 ['wukong',null,null,null,49.64,413,-1.73],
 ['yasuo',45.77,1029,-78,54.85,1103,2.13],
 ['yone',47.86,2804,-299,52.71,3041,.69],
 ['yorick',50.86,934,-225,51.09,1051,-1.55],
 ['zaahen',49.25,1005,-433,51.48,1078,-1.08]
];
export const stats=Object.fromEntries(statRows.map(([slug,opponentWR,n,opponentGD,rawWR,ln,delta2])=>[slug,{opponentWR,n,opponentGD,rawWR,ln,delta2}]));

// Tiers are editorial judgments, never calculated from either provider's WR.
// Lane covers the lane including level 6; side assumes equal resources at 2–3 items.
const reviews=[
 ['aatrox','C','C','C','Q-Abstand und E-Repositionierung gegen Olafs R-All-in ergeben ein beidseitig spielbares Matchup. Nach verfehlten Sweetspots hat Olaf echte Killfenster; gegen sauberes Spacing ist ein genereller Vorteil nicht ausreichend begründet.'],
 ['akali','D','C','D','Shroud erschwert Kills und R-Verlängerung, macht Olaf aber nicht automatisch zum Verlierer der Lane. Waveclear und Sustain erlauben Druck ohne Solokill. Leichter Nachteil durch ihre Kontrolle über Kontakt und Carry-Zugriff.'],
 ['ambessa','C','B','D','Olaf kann frühe Energie-Autos bestrafen und ihren CC mit R übergehen. Ihre Dashes und spätere Heilung erschweren das Verfolgen, rechtfertigen aber keinen pauschalen Nachteil schon ab Lane-Beginn.'],
 ['camille','D','B','E','Früh kann Olaf nach Schild und Hookshot lange Trades erzwingen. Später bestimmen Q2, kurze Trades und Terrain-Flucht viele Duelle. Der Gesamt-Nachteil ist real, aber die frühe Druckphase wurde zuvor zu wenig gewichtet.'],
 ['chogath','B','B','B','Olaf kann den immobilen Cho nach verfehltem Q lange treffen. Feast zwingt zu früherem W und begrenzt Low-HP-Spiel. Gute Drucklane, aber AP-Burst und späterer Objective-Wert verhindern eine extreme Bewertung.'],
 ['darius','C','C','C','Q-Außenring, Bleed-Stacks, Ghost und Axe-Pickups entscheiden. Olaf hat genug Dauerschaden für gewinnbare All-ins; wer zuerst den gegnerischen Hauptschaden ohne Antwort nimmt, verliert häufig.'],
 ['drmundo','A','A','C','Mundos fehlender Dash und schwache frühe Kontrolle lassen Olaf Farmzugang bedrohen. Die Passive blockiert Olafs Slow nicht. R, HP und Armor verlangen später passende Schadens- und Heilungsantworten.'],
 ['fiora','D','C','E','Frühe Duelle sind über Riposte und Vital-Positionierung spielbar. Spätere wiederholte Vitals und Q-Rückzüge verschieben das 1v1 zu Fiora. Das ist ein leichter Gesamt-Nachteil mit deutlicherem späten Side-Risiko.'],
 ['gangplank','B','C','C','Fässer bestimmen frühe Trades. Ab 6 kann Olaf Slows übergehen und ohne vorbereitetes Fassnetz Kontakt erzwingen. Gangplanks sichere Fernwirkung bleibt ein eigener Gesamtspiel-Faktor.'],
 ['garen','C','B','C','Olaf kann früh lange Trades gewinnen und mit Sustain Garens Resetspiel beantworten. Garens W, Q-Disengage und R bestrafen Fehler, nehmen Olaf aber keinen grundsätzlich spielbaren Duellplan.'],
 ['gnar','A','B','B','Olafs R nimmt viel vom Mega-Gnar-CC. Nach verbrauchtem Sprung ist Mini-Gnar auf langer Lane gut angreifbar. Vor Kontakt abgegebene HP und ein vorbereiteter Doppelsprung bleiben entscheidend.'],
 ['gragas','B','C','B','Vor 6 begrenzen Body Slam und Sustain Olafs Zugang. Mit R wird Gragas als Disengage-Gegner leichter zu verfolgen. Der Vorteil besteht im langen Kontakt, nicht im wiederholten kurzen W-Trade.'],
 ['gwen','D','B','E','Olaf besitzt frühe Druckfenster. Gwens späterer Q-/R-Dauerschaden und Heilung verschieben gleichwertige lange Duelle zu ihr. Deshalb Early nutzen, ohne einen gewonnenen ersten Trade mit dauerhaftem Outscaling gleichzusetzen.'],
 ['heimerdinger','B','D','C','Das frühe Turret-Nest kann Olaf Farm und HP kosten. Nach Abbau des Nests und mit R ist Heimer ohne Dash gut fangbar. Lane-Nachteil und spätere Catch-Stärke müssen getrennt bleiben.'],
 ['illaoi','D','D','D','E und R erzwingen mehr Positionsarbeit als in vielen Melee-Lanes. Nach E-Miss oder verbrauchter R kann Olaf jedoch aktiv Druck machen. Ein Kampf im vollen Nest ist schlecht, nicht jede Spielsituation gegen Illaoi.'],
 ['irelia','C','D','C','Passive und Minion-Resets geben Irelia starke Lane-Fenster. Auf leerer Lane und nach E/W kann Olaf den längeren Kampf gewinnen. Die Wave entscheidet stärker als ein pauschaler Champion-Statcheck.'],
 ['jax','C','C','D','Jax-E blockiert Autos und Lifesteal, Olafs E bleibt als Antwort verfügbar. Nach Counter Strike existieren frühe lange Killfenster, besonders nach offensivem Q. Häufigere E-Zyklen erschweren die späte Side, begründen aber kein F für das gesamte Matchup.'],
 ['jayce','B','C','B','Jayce kann vor 6 mit Poke und Hammer-E Abstand halten. Olaf erhält auf 6 einen neuen Zugriff, während Jayce keinen neuen Ultimate-Button bekommt. Gesundes Ankommen bleibt die Bedingung.'],
 ['ksante','B','C','C','Olafs E und R helfen gegen Tankwerte und Kontrolle. K’Santes W-/All-Out-Fenster können das Duell dennoch drehen. Der leichte Vorteil setzt sauberes Dodging und das Erkennen seiner neuen Cooldown-Situation voraus.'],
 ['kayle','C','A','E','Olaf hat eine reale frühe Denial- und Killphase, die vorher vom späten Scaling überdeckt wurde. Kayles R und spätere Reichweite verlangen, diesen Vorteil umzusetzen. Gesamt ausgeglichen mit klar unterschiedlicher Zeitpräferenz.'],
 ['kennen','A','B','B','Nach verbrauchtem E kann Olaf ab 6 den Stun übergehen und nah bleiben. Kennen darf vorher keinen großen HP-Vorsprung aufbauen. Sein Teamfight ist gefährlicher als sein ungeschütztes Side-Duell.'],
 ['kled','D','D','C','W-Burst und Remount machen Fehler teuer. Nach verbrauchtem W und bei kontrollierter Courage besitzt Olaf aber echte Gegenfenster. Kled-Q hat keinen eingebauten Antiheal mehr; darauf darf kein negativer Tier beruhen.'],
 ['malphite','B','B','B','E-True-Damage und R erlauben Olaf einen sinnvollen Plan gegen Armor und CC. Malphite kann mit Q-Tempo und R Kämpfe verweigern. Vorteil im Duell bedeutet keinen automatischen Sieg über seinen Team-Engage.'],
 ['mordekaiser','A','A','B','Olaf kann lange Kontakte erzwingen und mit rechtzeitiger R den Banish verhindern. W-Schild und isolierte Qs bleiben gefährlich. Ein bereits abgeschlossener Death-Realm-Cast lässt sich nicht nachträglich reinigen.'],
 ['nasus','B','A','D','Olaf kann frühe Q-Last-Hits bedrohen und während Ragnarok Wither übergehen. Das schafft mehr als eine bloß neutrale Lane. Freie Stacks, Nasus-R und auslaufende eigene R können die spätere Side trotzdem drehen.'],
 ['ornn','B','A','B','Olaf kann CC übergehen und Ornn auf langer Lane unter Druck setzen. Ornn muss aber keine Soloduells gewinnen, um über Upgrades und Engage wirksam zu sein. Deshalb deutlicher Lane-, aber nur leichter Gesamtvorteil.'],
 ['pantheon','B','C','B','Vor 6 sind Q-Poke und empowered W ernst. Nach seiner E-Defensive und ab Olaf-R ist der lange Kontakt günstiger. Seine Roams und spätere Armor-Penetration verhindern einen bedingungslosen Vorteil.'],
 ['poppy','B','B','B','Olaf läuft statt zu dashen und kann ihren kontrollierenden Disengage mit R übergehen. Q-Schaden, Schild und Armor erlauben Poppy trotzdem gutes Stallen. Der erreichbare Dauerkampf ist Olafs Vorteil.'],
 ['quinn','B','C','C','Quinn kontrolliert Reichweite, Olaf bekommt mit R eine Antwort auf ihren CC. Nach Vault ist der lange Rückweg nutzbar. Ihre eigene Bewegung und Roams bleiben bestehen, auch wenn der Knockback scheitert.'],
 ['renekton','C','D','B','Renektons vorbereitete Fury und kurze E-Trades sind früh stark. Olaf kann nach E2 und empowered W verlängern und wird im direkten längeren Duell konkurrenzfähiger. W-Schild-Timing bleibt zentral.'],
 ['riven','A','B','B','Riven braucht ihre CC- und Dash-Kette für sichere Trades. Olaf-R nimmt viel von der Kontrolle; nach verbrauchter Mobilität ist sein langer Fight stark. Q-Vorbereitung und R2-Burst müssen trotzdem respektiert werden.'],
 ['rumble','D','C','C','Olaf kann Rumble erreichen und früh Druck machen, muss dabei aber Heat, Q und R-Fläche ausspielen. Magischer Dauerschaden und Rumbles Objective-Wert begrenzen den Nutzen von Ragnarok. Leichter Gesamt-Nachteil, keine automatisch verlorene Lane.'],
 ['sett','C','D','C','Sett bestraft frühe unkontrollierte Melee-Trades. Olaf kann nach W oder mit vermiedenem Zentrum weiterkämpfen und E-CC während R übergehen. Setts Burst ist eine Bedingung des Duells, kein genereller Beleg für ein schlechtes Gesamtmatchup.'],
 ['shen','B','C','B','Shens frühes Q und W sind echte Duellwerkzeuge. Nach deren Ablauf und mit Waveclear kann Olaf lange Trades und Turmgegenwert erzeugen. Shens globale R verhindert, dass Side-Druck allein das Gesamtspiel beschreibt.'],
 ['singed','B','B','C','Olaf kann direkten Kontakt gewinnen und mit R Fling/Slow übergehen. Singed kann Duelle verweigern und über Proxy oder Teamkampf gewinnen. Vorteil nur beim Abschneiden seines Wegs, nicht beim Hinterherlaufen durch Gift.'],
 ['sion','B','B','B','Nach verfehltem Q kann Olaf Sustain und True Damage für Druck nutzen. Sion kann mit HP, Waveclear und Flucht-R Zeit gewinnen. Die Lane ist günstig, ein deutlicher Gesamtvorteil war zu sicher formuliert.'],
 ['sylas','B','B','C','Olaf kann nach E2-Verfehlung lange Melee-Fights suchen. Sylas-W und gestohlene Ults verändern das Fenster. Die günstige Statistik besitzt eine kleinere Stichprobe und rechtfertigt allein kein höheres Tier.'],
 ['tahmkench','C','B','C','Olaf kann Tahm nach verfehltem Q bedrohen und Devour mit aktiver R verhindern. Heilung, Schild und große effektive HP machen den Abschluss schwer. Lane-Druck lässt sich nicht automatisch in Kills umwandeln.'],
 ['teemo','A','A','B','Olaf-R entfernt den Blind als wichtigstes direktes Duellhindernis. Mit gesundem Einstieg kann Olaf ihn auf langer Lane verfolgen. Pilze und vor Kontakt erlittener Poke bleiben relevante Grenzen.'],
 ['trundle','E','D','E','AD-Verschiebung durch Q, W und R-Stat-Steal treffen Olafs langen Nahkampf direkt. Olaf muss W-Zone und R-Zeitfenster gezielt umgehen. Der deutliche Nachteil hat sowohl einen Kit-Grund als auch negative unterstützende Paarungsdaten.'],
 ['tryndamere','E','D','E','Olaf kann vor 6 über Fury und Äxte Druck erzeugen. Danach erzwingt Tryndameres R eine Überlebensphase, die Olaf nicht mit eigener CC-Immunität auflöst. Sehr schwierig, aber mit Armor, Q-Kiting und Fury-Denial kein pauschales F.'],
 ['urgot','A','B','B','Olaf-R ist eine starke Antwort auf Urgots Kontrolle und Execute-Zugriff. Nach E-Miss und auf verbrauchter Beinseite kann Olaf lange kämpfen. Urgots Level- und W-Spikes bleiben gefährlich, wenn R ausläuft.'],
 ['vayne','D','C','E','Olaf kann über Q, Wave-Druck und R gegen Condemn frühe Vorteile erzielen. R/Q-Stealth und späterer On-hit-Schaden machen die offene Side schwieriger. Das späte Problem allein rechtfertigt kein F für die gesamte Partie.'],
 ['vladimir','B','B','C','Nach Pool hat Olaf auf langer Lane ein klares Verfolgungsfenster. Vladimir kann R und Burst später stärker nutzen, aber sein frühes Sustain verhindert nicht jeden Druck. Pool vor der eigenen R herauszuziehen bleibt zentral.'],
 ['volibear','B','C','B','Vor 6 sind E-Schild und markiertes W starke Trade-Werkzeuge. Mit R und ausgewichenem E kann Olaf einen erreichbaren Gegner dauerhaft treffen und selbst lange Kämpfe gewinnen. W2 ist ein abzuwägendes Risiko, kein automatischer Rückzugsbefehl.'],
 ['warwick','C','D','B','Warwicks Low-HP-Heilung macht frühe rohe Statchecks riskant. Nach E-Ende und mit R gegen Fear/Suppress besitzt Olaf einen guten längeren Kampfplan. Die frühe Gefahr wurde vorher zu stark auf das Gesamtspiel übertragen.'],
 ['wukong','B','C','B','Clone kann Kontakt unterbrechen, aber nach dessen Verbrauch kann Olaf mit R beide Knock-up-Phasen übergehen. Wukongs Team-Engage bleibt wertvoll. Kein automatischer Kill, wenn Wukong über Terrain entkommt.'],
 ['yasuo','B','B','C','Olaf bedroht lange Kontakte ohne viele Dash-Minions und kann Knock-up-Setup mit R verhindern. Windwall stoppt Q und sein Crit-Spike bleibt relevant. Die Lane ist günstiger als ein spätes Duell in voller Wave.'],
 ['yone','B','B','C','Nach E-Rückkehr und verbrauchtem W kann Olaf lange Druck machen. R nimmt CC, nicht Yones verzögerten Schaden. Später entscheiden Build und Ausführung stärker als der frühe Lane-Vorteil.'],
 ['yorick','D','B','D','Olaf kann vor aufgebauten Pets Druck erzeugen. Käfig und Maiden erschweren später den direkten Zugriff, lassen aber gezieltes Pet-Management und frühe Wavekontrolle zu. Deshalb leichter statt pauschal deutlicher Gesamt-Nachteil.'],
 ['zaahen','C','B','D','Olaf hat frühe Druckfenster, bevor Zaahen volle Passive und mehrere Heilzyklen bekommt. R-Defensive und Revive verlängern spätere Duelle. Der 26.18-Q2-Buff erhöht die Unsicherheit; C ist eine vorläufige Arbeitseinschätzung.']
];

export function applyReview(matchups){
 const map=Object.fromEntries(reviews.map(([slug,tier,lane,late,reason])=>[slug,{tier,lane,late,reason}]));
 for(const m of matchups){
  const r=map[m.slug];if(!r||!stats[m.slug])throw Error('Missing audit '+m.slug);
  m.oldTier=m.tier;Object.assign(m,r);
  m.revision=(m.oldTier===m.tier?'Tier beibehalten.':`Tier ${m.oldTier} → ${m.tier}.`)+` Lane ${m.lane}, späte Side ${m.late}: `+m.reason;
  m.uncertainty='Eigene qualitative Einschätzung, keine getestete optimale Spielweise. Gesamt-Tier meist mit etwa einer Stufe Spielraum. Lane und Side sind getrennte Phasenurteile; Teamcomp, Gold, Level und Build können sie verschieben. Statistik nur Patch 26.17, Kit-Abgleich mit 26.18.';
  if(['ksante','zaahen'].includes(m.slug))m.uncertainty+=' Erhöhte Unsicherheit durch Kit-Revisionen bzw. aktuellen Buff.';
  m.stats=stats[m.slug];
 }
 const edit=(slug,values)=>Object.assign(matchups.find(m=>m.slug===slug),values);
 edit('volibear',{
  l25:'E-Kreis verlassen. In kurzen Trades W-Markierung auslaufen lassen, wenn Voli den Folgefight gewinnen würde. Bei eigenem HP-/Wave-Vorteil und fehlendem E darf Olaf verlängern; nicht jeden ersten W-Treffer automatisch mit Rückzug beantworten.',
  l6:'R übergeht Q-Stun. E verursacht Schaden und gibt Voli einen Schild; W auf markiertem Ziel heilt ihn. Mit gutem HP-Stand und ohne E-Treffer kann Olaf trotzdem durchkämpfen. Voli-R gibt HP und schaltet beim Dive den Turm zeitweise aus.',
  errors:'E-Treffer plus Schild gratis schenken. Einen bereits gewonnenen All-in allein wegen W2 abbrechen oder einen verlorenen nur wegen eigener R fortsetzen. Den Turm gegen seine R als sicheren Schutz ansehen.',
  trade:'Q treffen und Volis E seitlich verlassen. Bei gutem HP-Stand Auto–E, W als Reset/Schild im echten Kontakt, R gegen Q-Stun und mit kurzen Äxten dranbleiben. Nur lösen, wenn W2-Heilung, E-Schild oder Wave den langen Kampf zu Voli drehen.',
  plan:'Weiche zuerst E aus und halte HP für den All-in. Ab 6 kannst du mit R und W lange durchkämpfen, wenn du gesund ankommst. Brich wegen W2 nur ab, wenn sein Heal das tatsächliche Kräfteverhältnis kippt.',
  side:'1 Item: E-Treffer, HP und erster Core entscheiden. 2 Items: Olaf kann mit passender Defensive und Auto-Uptime gute Duelle haben. 3 Items: gegen Tank/Bruiser weiter angreifbar; AP-/On-hit-Voli separat beurteilen, kein garantierter Olaf-Outscale.'
 });
 edit('jax',{
  side:'1 Item: nach E-Verbrauch und offensivem Q aktiv Killdruck suchen. 2 Items: häufigere E-Zyklen verlangen kürzere Zwischenpausen und gutes eigenes W-Timing. 3 Items: Jax kann im wiederholten Duell Vorteile haben; eigener Vorsprung und Build bleiben entscheidend, kein automatisches Side-Verbot.',
  plan:'Bestrafe Counter Strike mit Abstand und eigenem E, halte W für treffende Autos danach. Nach offensivem Jax-Q kann der lange Rückweg dein Killfenster sein. Spiele frühe Vorteile aktiv aus; bewerte spätere Duelle nach E-Zyklen und Items neu.'
 });
 edit('warwick',{
  l6:'R ist eine Antwort auf Fear und Suppress. Nach Ende seiner E-Reduktion kann Olaf mit W und dauerhaftem Kontakt gewinnen. Heilung, Barrier und HP vorher prüfen; Antiheal hilft, ist aber kein Ersatz für ein tatsächlich gewinnbares Schadensfenster.',
  side:'1 Item: Low-HP-Heilung, Barrier und E entscheiden den Einstieg. 2 Items: mit R und geeigneter Defensive sind lange Kämpfe für Olaf gut spielbar. 3 Items: tatsächliche On-hit-/Tank-Items prüfen; frühe Warwick-Stärke bedeutet keinen garantierten späten Warwick-Sieg.',
  plan:'Vermeide frühe rohe Low-HP-Statchecks in Warwick-E. Ziehe E, warte die Reduktion ab und nutze R gegen seine Kontrolle. Dann darfst du den langen Kampf suchen, wenn Heal, Barrier und dein eigener W-Zyklus einkalkuliert sind.'
 });
 edit('nasus',{
  wave:'Erste Waves kontrolliert slowpushen und vollständig crashen, wenn Olaf die Prio hat. Den Bounce auf eigener Seite halten und Q-Last-Hits bedrohen. Freeze nur halten, wenn du Nasus noch zonen kannst. Für Recall, Dive, Turm oder Objective bewusst crashen; nicht dauerhaft pushen, bloß um Tower-Stackverluste zu hoffen.',
  items:'Ravenous Hydra nach der frühen Denial-Phase für Sustain und Waveclear. Stridebreaker, wenn Chase oder Zugriff im Gesamtspiel wichtiger ist; auch dessen Tiamat/Cleave erschwert Freezes. Zweites Death’s Dance gegen AD-Druck oder Black Cleaver bei relevanter Armor.',
  plan:'Schaffe nach einem vollständigen frühen Crash einen Bounce und bedrohe seine Q-Last-Hits auf deiner Seite. Ab 6 hält eigene R Wither aus dem Kampf, aber Nasus-R und Stackstand bleiben relevant. Löse den Freeze für echten Gegenwert statt ihm automatisch jede Wave unter den Turm zu liefern.'
 });
 edit('illaoi',{errors:'In Geist plus R stehenbleiben, obwohl HP und Tentakel den Kampf klar verlieren lassen. Auto-Heilung gegen mehrere Treffer überschätzen. Olafs W selbst gibt keinen Lebensraub.'});
 edit('garen',{threats:'Q-Slowcleanse/Silence, W-Defensive, E mit verstärktem Schaden am nächsten Ziel, R-Burst, Passive.'});
 edit('kayle',{l6:'Kayle wird ranged und erhält R als Schadensschutz. R herauslocken, sicher folgen und E/Finisher für danach halten. Level 11 verstärkt DPS und Waves; die zusätzliche Angriffsreichweite kommt auf 16, nicht 11.',window:'R verbraucht plus W fehlt. Vor 6 Q-Miss bei langer Lane. Ab 11 höheren DPS und ab 16 zusätzliche Range berücksichtigen.'});
 edit('vayne',{side:'1 Item: Olaf kann nach Q/E-Verbrauch mit Stride und R echte Catches erzwingen. 2 Items: mehr On-hit-DPS und R/Q-Unterbrechungen machen Zugriff schwieriger. 3 Items: auf offener Lane eher Vayne; Wave, Sicht, Vorsprung und Hilfe können den Plan ändern. 26.18 verlängert Rageblade-Stacks, falls sie dieses Item kauft.'});
 edit('zaahen',{l6:'Seine R besitzt eine defensive Castphase und Heilung über den Treffer. Ragnarok verhindert weder diese Defensive noch Revive. 26.18 startet der Cooldown einer aktiven Q bereits beim Eintritt in Wiederbelebung; beim Aufstehen nicht von sicher fehlender Q ausgehen.',plan:'Nutze frühe Fenster vor voller Passive und nach verbrauchtem E. Spiele um R-Defensive und plane die Wiederbelebung mit ein. Seit 26.18 kann Q nach Revive früher wieder bereit sein; nach dem Aufstehen keine freie zweite Schadensphase voraussetzen.'});
 return matchups;
}
