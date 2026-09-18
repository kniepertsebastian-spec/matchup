import fs from 'node:fs/promises';
import {rows} from './warwick-data.mjs';
import './warwick-rest.mjs';
const original=JSON.parse(await fs.readFile('olaf-local/dist/data.json','utf8'));
const profiles={
 ad:{start:'Doran’s Blade + Health Potion',boots:'Plated Steelcaps gegen relevante Autos/physische Trades; frühe Boots für Ausweichen und Rückzug.',items:'Blade of the Ruined King für anhaltenden Einzelzielkontakt; danach Death’s Dance gegen physischen Druck. Brauchst du zuerst Waveclear/HP, Titanic Hydra statt BotRK erwägen.',situ:'Bramble Vest nur wenn Gegner dich tatsächlich mit Autos trifft und Heilung entscheidend ist; Executioner’s Calling für aktiv angewendetes Antiheal. Sterak’s gegen Burst, bei zusätzlichem AP-Druck MR statt mehr Armor.'},
 ap:{start:'Doran’s Blade + Health Potion',boots:'Frühe Boots für Skillshot-Abstand; Mercury’s Treads bei relevantem Magieschaden und reduzierbarer Kontrolle.',items:'Blade of the Ruined King für erreichbaren Nahkontakt; MR-Komponente bei Burstgefahr vorziehen, danach Spirit Visage gegen anhaltenden AP-Druck. Titanic Hydra als Alternative für Waveclear und HP.',situ:'Maw bei AP-Burst als Alternative zu Sterak’s; Spirit Visage stärkt eigene Heilung, ersetzt aber kein Schadensfenster. Executioner’s Calling nur bei relevanter gegnerischer Heilung.'},
 hp:{start:'Doran’s Blade + Health Potion',boots:'Boots früh für Positionierung; Steelcaps bei Auto-Druck, Mercury’s bei tatsächlicher AP-/CC-Belastung.',items:'Blade of the Ruined King bei HP-Aufbau und sicherem Auto-Kontakt; Titanic Hydra danach für HP/Waveclear. Bei gefährlichen Duellen passende Armor/MR vor dem zweiten Damage-Item.',situ:'Spirit Visage gegen AP-Anteile, Death’s Dance gegen AD. Antiheal bei tatsächlich entscheidender Heilung. Hohe Rüstung begrenzt BotRK; kein automatischer Tank-Counter durch ein einzelnes Item.'},
 ranged:{start:'Doran’s Shield + Health Potion',boots:'Frühe Boots für Erstkontakt; Plated Steelcaps bei dominanten Auto-Trades.',items:'Stridebreaker, wenn nach Erstkontakt Festhalten/Waveclear fehlen; danach BotRK nur bei verlässlicher Auto-Zeit. Bei starkem Rückschaden zuerst Death’s Dance statt zweitem offensivem Item.',situ:'Randuin’s gegen relevante Crit-Gegner; MR gegen zusätzliche Magiequellen. Stride hat keinen Lebensraub und seine Aktivierung ersetzt keinen Gapclose aus großer Distanz.'},
 aprange:{start:'Doran’s Shield + Health Potion',boots:'Frühe Boots zum Ausweichen. Mercury’s bei Magieschaden; Swifties bei überwiegender Slow-/Spacing-Problematik abwägen.',items:'Stridebreaker für Waveclear und Festhalten nach Kontakt; frühe MR-Komponente bei Poke/Burst. Spirit Visage als zweites Item gegen anhaltenden AP-Druck, BotRK nur bei sicherer Auto-Uptime.',situ:'Maw gegen AP-Burst, Spirit Visage gegen längere Magiekämpfe. Kein zusätzlicher On-Hit-Kauf, wenn fehlende Zielbarkeit oder Entfernung das eigentliche Problem ist.'},
 mixed:{start:'Doran’s Blade + Health Potion',boots:'Boots früh, Tier-2 nach gegnerischem Build: Steelcaps gegen Autos, Mercury’s bei tatsächlichem AP-/CC-Schwerpunkt.',items:'Blade of the Ruined King für erreichbare längere Duelle; danach Titanic Hydra für HP/Waveclear oder die passende Armor-/MR-Defensive vorziehen.',situ:'Spirit Visage bei relevanter Magie und Heilwert, Death’s Dance bei physischem Schwerpunkt. Antiheal nur rechtzeitig im entscheidenden Heilfenster anwenden.'}
};
// Small explicit snapshots, never copied from Warwick's default jungle counter page.
const ugg={darius:[41.1,112],vayne:[42.1,38],singed:[42.6,47],ksante:[43.7,71],sion:[44.2,43],urgot:[44.2,52],kennen:[44.7,38],renekton:[45.1,91],gnar:[45.8,59],gangplank:[45.8,96]};
const lola={zaahen:[45.78,166,-7.4],singed:[46.15,104,-6.18],urgot:[46.23,106,-6.6],jax:[46.99,266,-6.51],aatrox:[47.64,275,-6.22],shen:[48.23,141,-4.09],ksante:[48.32,149,-7.8],ornn:[48.7,154,-4.03],volibear:[48.82,170,-5.56],gnar:[48.84,129,-5.66],olaf:[50,126,-2.77],darius:[52.46,284,-.9],renekton:[53.06,196,-.41]};
const matchups=rows.map(m=>{
 const old=original.matchups.find(x=>x.slug===m.slug);
 const name=old?.name||'Olaf';
 const build=profiles[m.profile];
 const stats={opponentWR:ugg[m.slug]?100-ugg[m.slug][0]:null,n:ugg[m.slug]?.[1]??null,opponentGD:null,rawWR:lola[m.slug]?.[0]??null,ln:lola[m.slug]?.[1]??null,delta2:lola[m.slug]?.[2]??null};
 const long=m.rune==='Lethal Tempo';
 return {...m,...build,name,
  sums:'Flash + Barrier',
  runeReason:long?`Lethal Tempo als Ausgangspunkt: Mehrere treffende Autos tragen Schaden und Warwicks passive Heilung. Gegen ${name} lohnt das erst im beschriebenen Fenster: ${m.window} Kein Stapeln um jeden Preis.`:`PTA als Matchup-Option: Auto–Q–Auto bündelt Schaden in einem kurzen erreichbaren Kontakt. Gegen ${name} ist das sinnvoller als eine lange Auto-Serie vorauszusetzen. ${m.window} Die Wahl ist eine qualitative Empfehlung, keine belegte optimale Matchup-Rune.`,
  override:long?'PTA erwägen, wenn du im Gesamtspiel vor allem kurze Catches nach Kontrolle bekommst. Lethal Tempo behalten, wenn wiederholte Auto-Kämpfe deine Aufgabe bleiben. Barrier schützt das Low-HP-Fenster; Flash + Teleport bei nötigen frühen Resets, Flash + Ghost bei entscheidendem Chase und bewusstem Verzicht auf Barrier.':'Lethal Tempo statt PTA, wenn die übrige Comp verlässliche lange Auto-Kämpfe bietet und dieser Lane-Gegner nur gehalten werden muss. Flash + Teleport bei problematischen Resets; Flash + Ghost für längeren Chase mit bewusst schwächerem Barrier-Duell.',
  plan:`${m.window} ${m.errors.split(';')[0].replace(/\.$/,'')} vermeiden. ${m.wave.split('. ')[0]}.`,
  uncertainty:'Eigene qualitative Matchup-Analyse für 26.18, keine Ingame-Testreihe. Etwa eine Tierstufe Spielraum; HP, Mana, Level, Gold, Summoners und gegnerischer Build können den Kampf drehen. Fehlende Statistik ist unbekannt, nicht 0. Kleine oder widersprüchliche Stichproben beweisen keine Tier-Einstufung.',
  oldTier:null,revision:'Neu: eigenständige Warwick-Top-Analyse. Keine Umkehrung oder Kopie des Olaf-Tiers.',
  note:m.slug==='zaahen'?'26.18: Zaahen-Q2 gebufft; aktive Q beginnt ihren Cooldown beim Eintritt in Wiederbelebung. Bewertung daher vorläufig.':'26.18: keine direkte Warwick-Kit-Änderung für reguläres Summoner’s Rift in den Patchnotes. Warwick-Änderungen im Classic-Abschnitt und frühere Mayhem-Werte sind hier ausgeschlossen.',
  stats,statsPatch:'26.18 / 16.18',statsChecked:'14.09.2026',
  statsNote:ugg[m.slug]&&lola[m.slug]?'Unterschiedliche Abrufstände/Populationen, teils stark widersprüchliche kleine Samples. Nicht mitteln.':ugg[m.slug]||lola[m.slug]?'Nur eine Paarungsquelle extrahiert. Die zweite Quelle wurde für Top-Build/Grundlage geprüft, nicht als Bestätigung dieser Matchup-Zahl.':'Keine verifizierte Paarungszahl übernommen. Tier ausschließlich qualitative Einschätzung; die verlinkten Seiten liefern Kontext, keinen Zahlenbeweis.',
  official:old?.official||'https://www.leagueoflegends.com/en-us/champions/olaf/',
  pool:old?.pool||null,category:old?.category||'Regulärer Toplaner',file:`Warwick_vs_${m.slug}.xlsx`,
  sources:[['Riot · Warwick','https://www.leagueoflegends.com/en-us/champions/warwick/'],['U.GG · Warwick Top (Statistik-Snapshot)','https://u.gg/lol/champions/Warwick/build/top'],['LoLalytics · Warwick Top','https://lolalytics.com/lol/warwick/build/?lane=top'],['LoLalytics · Warwick Top gegen Top','https://lolalytics.com/lol/warwick/counters/?lane=top']]
 };
}).sort((a,b)=>a.name.localeCompare(b.name,'de'));
const specific={
 gangplank:{items:'Stridebreaker für Kontakt und Fass-Waveclear; danach Death’s Dance gegen physischen Burst. BotRK nur bei zuverlässigen Autos nach Orange/Fass-Verbrauch.'},
 jax:{items:'Frühe Steelcaps; Titanic Hydra für HP/Waveclear und kontrollierte Resets. Danach Death’s Dance gegen physischen Anteil oder MR nach Comp; BotRK erst, wenn E-Pausen tatsächlich nutzbar sind.'},
 fiora:{situ:'Antiheal vor ihrem R-Heilfeld, sofern der Kampf nicht durch Riposte/True Damage verloren ist. HP und ausreichend eigener Schaden wichtig; zusätzliche Armor neutralisiert keine Vitals.'},
 nasus:{situ:'Swifties helfen gegen den Bewegungsslow, lösen den Wither-AS-Verlust nicht. BotRK gegen HP braucht trotzdem Autos. Antiheal bei relevanter Heilung; später Teamantwort statt endloser Soloversuche.'},
 urgot:{situ:'Armor gegen W/Shotguns, HP für längere Zeit oberhalb der Execute-Schwelle. Barrier hebt aktuelle HP nicht an und ist kein verlässlicher Schutz gegen den ausgelösten Execute.'},
 akali:{items:'Titanic Hydra für HP/Waveclear, frühe MR bei Burstgefahr. Danach Spirit Visage/Maw je Magieprofil; BotRK nur, wenn du nach Shroud wirklich längeren Kontakt bekommst.'},
 teemo:{runeReason:'PTA nur für das kurze sichtbare Kontaktfenster nach Blind. Auto–Q–Auto nicht während Blind als sichere Aktivierung planen. Lethal Tempo passt erst bei dauerhaft erreichbarem Ziel; fehlende Autos lassen beide Runen wenig leisten.'}
};
for(const m of matchups)Object.assign(m,specific[m.slug]||{});
const corrections={
 mordekaiser:{errors:'R nur für den Kill in einen vollen Schild investieren; QSS als sicheren Ausstieg aus seiner R einplanen; E vor dem eigentlichen Schadensfenster verlieren.'},
 sett:{l6:'Setts R kann den laufenden Kanal stören. Eigene R möglichst nach E/R einsetzen; der W-Schild verändert das Killfenster, ist aber nicht automatisch ein Heilungsstopp.',errors:'W-Mitte tanken, E gegen True Damage planen, Setts W-Schild beim verbleibenden Kill-Schaden ignorieren.'},
 tahmkench:{l6:'Drei Stacks plus R können deine Heilphase aussetzen. Eigene R nach Stack-/Q-Stun-Fenster einsetzen und sein graues Leben beim Killbudget einrechnen.',errors:'Sein E-Schildbudget ignorieren; drei Stacks und Devour übersehen; ohne Rückweg in Q-Slow laufen.'},
 riven:{errors:'Barrier erst nach R2 planen; den zusätzlichen E-Schild beim Killbudget ignorieren; ihr über eine Wand ohne Sicht folgen.'},
 volibear:{errors:'In E stehen und trotzdem statchecken; eigene E-Reaktivierung vor seinem Burst; E-Schild und W-Heal beim Killbudget ignorieren.'},
 tryndamere:{l6:'R erzwingen, mit E-Reduktion/Fear und Bewegung überleben. Eigene R kann Zeit seiner Unsterblichkeit binden; danach musst du dennoch verbleibende R-Dauer und E-Flucht überstehen. Keine pauschale garantierte Vollheilung voraussetzen.',errors:'R und Fear gleichzeitig vor seiner R verschwenden; Unsterblichkeit mit vollständiger Unverwundbarkeit verwechseln; ohne E-/R-Restzeitplan weiterkämpfen.'}
};
for(const m of matchups){Object.assign(m,corrections[m.slug]||{});m.plan=m.window+' '+m.trade.split(/(?<=\.) /).slice(0,2).join(' ');}
const method=[
 ['Geltungsbereich','Warwick Top, Ranked Solo Queue, reguläres Summoner’s Rift. Patch 26.18, geprüft 14.09.2026. Bestehender Gegnerpool: Warwick-Mirror durch Olaf ersetzt, da im Ranked Draft kein Mirror möglich ist. Historischer Pool-Snapshot übernommen, keine neu berechnete Pickrate für jeden Gegner.'],
 ['Bewertung','Z extrem günstig; A deutlich günstig; B leicht günstig; C ausgeglichen/Skill; D leicht schwierig; E deutlich schwierig; F extrem schwierig. Gesamt-Tier berücksichtigt Lane, Side und Umsetzung im Teamspiel, ist kein Mittelwert. Lane umfasst Level 6, Side 2–3 Items bei vergleichbaren Ressourcen.'],
 ['Daten und Unsicherheit','U.GG Top und LoLalytics Top wurden getrennt geprüft. Einzelne extrahierte Paarungen auf 26.18/16.18; sonst fehlende Werte explizit leer. U.GG-Standard-Counterseite zeigt Jungle und wurde deshalb verworfen. Keine Mobalytics-/Mobafire-Quellen.'],
 ['Statistiken lesen','U.GG und LoLalytics können verschiedene Populationen und Abrufstände zeigen. LoLalytics-Rohwerte liegen nicht zwingend um 50 %. Delta 2 berücksichtigt die Championbasis nach Anbieter. Keine Mittelung, kein Tier aus einer kleinen Paarungswinrate.'],
 ['Warwick statt Olaf','E ist Schadensreduktion mit anschließendem Fear. R heilt über tatsächlich verursachten Schaden und bindet ein Ziel; Warwick erhält damit keine andauernde Ragnarok-Immunität. True Damage, Executes, fehlende Zielbarkeit und fehlendes Mana bedrohen seine Low-HP-Spielweise.'],
 ['Q-Tap / Q-Halten','Tap für kurze Heil-/Tradefenster, Halten für Seitenwechsel und passendes Follow-Timing. Halten kann dich an einen gefährlichen Zielort bringen. Verdrängungsimmunität während der Q-Wirkung ist keine pauschale Immunität gegen Stuns, Silence oder jeden Sonderfall.'],
 ['E-Timing','Vor dem relevanten Burst aktivieren; früher Recast beendet die Reduktionsphase zugunsten des Fears. Fear erst wählen, wenn er Anschluss oder Rückzug ermöglicht. True Damage wird durch normale Reduktion nicht neutralisiert.'],
 ['R-Timing','Kurze bestätigte R nach Fear/verbrauchtem gegnerischem CC ist oft verlässlicher als Maxrange. CC nach dem Aufprall kann den Kanal beenden. Unverwundbarkeit oder Reinigung begrenzen den Wert. Normale Schilde erhöhen das nötige Killbudget und sind nicht mit Schadensimmunität gleichzusetzen.'],
 ['Mana und HP','Nicht jede gegnerische Poke-Aktion mit Q auf Minions beantworten. Vor All-in Mana für Q und E, gegebenenfalls R/zweite Q sichern. Wenige HP sind nur mit treffenden Autos, verfügbarem Heal und überlebtem Burst eine Stärke.'],
 ['Skillung','Q > W > E als konservativer Top-Ausgangspunkt (U.GG). LoLalytics zeigt auch W-früh/W-Max-Pfade: Messung an späteren Levels und andere Samples erlauben keinen sicheren Sieger. Q für kurze Trades/Heilung, W-Ränge für echte Auto-Uptime abwägen; R auf 6/11/16.'],
 ['Runen','Lethal Tempo ist die Standard-Arbeitshypothese für zusammenhängende Auto-Kämpfe. PTA wird bei kurzen Auto–Q–Auto-Fenstern vorgeschlagen. Conqueror wird nicht aus Olafs Sheet übernommen. Sekundär Resolve mit Second Wind gegen Poke bzw. Bone Plating gegen kurze Bursts; Revitalize unterstützt Heilung/Schilde.'],
 ['Summoners','Flash + Barrier als allgemeiner Startpunkt. Barrier vor tödlichem Schaden und nach gegnerischem Schildbruch einsetzen, nicht erst nach Kontrollbeginn. TP stabilisiert frühe Resets; Ghost hilft beim Chase. Jede Alternative kostet das Barrier-Duellfenster.'],
 ['BotRK','Für lange erreichbare Einzelzielkämpfe und gegnerischen HP-Aufbau. Physischer On-Hit wird von Armor reduziert; kein universeller Tankkonter. Lifesteal ersetzt keine fehlenden Autos.'],
 ['Titanic / Stride','Titanic für HP, Waveclear und Auto-Orientierung. Stride für Waveclear plus Festhalten nach Erstkontakt; kein Fernkampf-Gapclose und kein Lifesteal. Beide verändern mit Cleave deine Freeze-Möglichkeiten.'],
 ['Defensive','Death’s Dance gegen relevanten physischen Druck, Spirit Visage gegen Magie mit nutzbarer Heilung, Maw bei AP-Burst. Maw und Sterak’s als alternative Lifeline-Käufe behandeln. Armor schützt nicht gegen True Damage.'],
 ['Antiheal','Nur sinnvoll, wenn du es zum entscheidenden gegnerischen Heilfenster anwendest. Bramble benötigt gegnerische Autos; Executioner’s passende Schadensanwendung. Nicht ungeprüft beide kaufen.'],
 ['Build-Grenzen','Keine pauschale Übertragung von Kritlaf oder reinem AP-Burst-Warwick. Die Empfehlungen fokussieren den spielbaren Top-Bruiser mit bedingten On-Hit-/Waveclear-Pfaden; keine gemessene optimale Itemreihenfolge.'],
 ['Quellen: Warwick','https://www.leagueoflegends.com/en-us/champions/warwick/'],
 ['Quellen: Top-Build U.GG','https://u.gg/lol/champions/Warwick/build/top'],
 ['Quellen: Top-Build LoLalytics','https://lolalytics.com/lol/warwick/build/?lane=top'],
 ['Quellen: Top-Paarungen','https://lolalytics.com/lol/warwick/counters/?lane=top'],
 ['Quellen: Live-Patch','https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/']
];
if(matchups.length!==51)throw Error('Expected 51, found '+matchups.length);
const expected=original.matchups.map(m=>m.slug==='warwick'?'olaf':m.slug).sort();
if(JSON.stringify(matchups.map(m=>m.slug).sort())!==JSON.stringify(expected))throw Error('Pool mismatch');
await fs.writeFile('olaf-local/dist/warwick.json',JSON.stringify({champion:'Warwick',id:'warwick',patch:'26.18',checked:'14.09.2026',statsPatch:'26.18 / 16.18',matchups,method},null,2));
console.log('Warwick: '+matchups.length+' independent matchups');
