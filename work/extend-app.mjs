import fs from 'node:fs/promises';
const file='olaf-local/dist/app.js';let s=await fs.readFile(file,'utf8');
s=s.replace('let data;','let data;\nlet roster;\nlet active="olaf";\nconst home=()=>active===\'olaf\'?\'#\':\'#warwick\';\nconst matchLink=slug=>active===\'olaf\'?`#matchup/${slug}`:`#warwick/matchup/${slug}`;\nconst champion=()=>active===\'olaf\'?\'Olaf\':\'Warwick\';\nconst statPatch=()=>data.statsPatch||\'26.17 / 16.17\';');
s=s.replace('51 Gegner. Ein klarer Plan vor dem ersten Minion.','${data.matchups.length} Gegner. Ein klarer Plan für ${champion()} vor dem ersten Minion.');
s=s.replaceAll('Statistik: 26.17','Statistik: ${esc(statPatch())}');
s=s.replace("options(['Conqueror','PTA'])","options([...new Set(data.matchups.map(m=>m.rune))])");
s=s.replace('Tiers aus Olafs Sicht','Tiers aus ${champion()}s Sicht');
s=s.replaceAll('href="#matchup/${m.slug}"','href="${matchLink(m.slug)}"');
s=s.replaceAll('href="#">← Alle Matchups','href="${home()}">← Alle Matchups');
s=s.replace('OLAF VS.','${champion().toUpperCase()} VS.');
s=s.replace('/downloads/Matchups/Olaf_vs_${m.slug}.xlsx','/downloads/Matchups/${champion()}_vs_${m.slug}.xlsx');
s=s.replace('Statistik 26.17 / 16.17.','Statistik ${esc(statPatch())}.');
s=s.replaceAll('OLAF SIEGRATE','${champion().toUpperCase()} SIEGRATE');
s=s.replace("stats.n??'Keine'","stats.n??'Keine extrahierten'");
s=s.replace("stats.ln??'Keine'","stats.ln??'Keine extrahierten'");
s=s.replace('<div class="statgrid">','${m.statsNote?`<p class="muted">${esc(m.statsNote)}</p>`:\'\'}<div class="statgrid">');
s=s.replace("const links=[['Riot · Patch", "if(active==='warwick')return [...m.sources,['Riot · '+m.name,m.official],['Riot · Patch 26.18','https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/']].map(([name,url])=>`<li><a href=\"${esc(url)}\" target=\"_blank\" rel=\"noopener noreferrer\">${esc(name)} ↗</a></li>`).join('');\n const links=[['Riot · Patch");
s=s.replace('· Statistik 26.17</p>','· Statistik ${esc(statPatch())}</p>');
const start=s.indexOf('function route()');
s=s.slice(0,start)+`function route(){
 const parsed=parseRoute(location.hash);
 active=parsed.champion;data=roster[active];
 if(filters.rune&&!data.matchups.some(m=>m.rune===filters.rune))filters.rune='';
 if(filters.sums&&!data.matchups.some(m=>m.sums===filters.sums))filters.sums='';
 document.querySelector('.brand').innerHTML=champion().toUpperCase()+' <span>/ MATCHUP-BUCH</span>';
 document.querySelector('.brand').href=home();
 const nav=document.querySelector('header nav');
 nav.children[0].href=home();nav.children[1].href=active==='olaf'?'#leitfaden':'#warwick/leitfaden';nav.children[2].href='/downloads/'+champion()+'_Top_Sammlung.xlsx';
 document.querySelectorAll('[data-champion]').forEach(a=>{
  a.setAttribute('aria-current',a.dataset.champion===active?'page':'false');
  const id=a.dataset.champion;
  a.href=id==='olaf'?'#':'#warwick';
  if(parsed.page==='matchup'&&roster[id].matchups.some(m=>m.slug===parsed.slug))a.href=id==='olaf'?'#matchup/'+parsed.slug:'#warwick/matchup/'+parsed.slug;
  else if(parsed.page==='guide')a.href=id==='olaf'?'#leitfaden':'#warwick/leitfaden';
 });
 if(parsed.page==='guide')guide();
 else if(parsed.page==='matchup'){
  const m=data.matchups.find(m=>m.slug===parsed.slug);
  if(m)detail(m);else app.innerHTML='<h1>Matchup nicht gefunden</h1><a href="'+home()+'">Zur Sammlung</a>';
 }else listing();
 window.scrollTo(0,0);
 document.title=parsed.page==='matchup'?champion()+' vs. '+(data.matchups.find(m=>m.slug===parsed.slug)?.name||'Unbekannt'):champion()+' · Matchup-Buch';
}
try{
 const datasets=await Promise.all(['/data.json','/warwick.json'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error('Daten fehlen');return r.json();}));
 roster={olaf:datasets[0],warwick:datasets[1]};route();addEventListener('hashchange',route);
}catch{app.innerHTML='<h1>Die Sammlung konnte nicht geladen werden.</h1><p>Bitte lade die Seite neu. Falls der Fehler bleibt, starte die App erneut.</p>';}
`;
s=s.replace('tiers,filterMatchups,groups','tiers,filterMatchups,groups,parseRoute');
await fs.writeFile(file,s);
let html=await fs.readFile('olaf-local/dist/index.html','utf8');
html=html.replace('<main id="app">','<div class="championbar" aria-label="Eigenen Champion auswählen"><span>DEIN CHAMPION</span><a href="#" data-champion="olaf" aria-current="page">Olaf</a><a href="#warwick" data-champion="warwick">Warwick</a></div><main id="app">');
html=html.replace('Lokale Olaf Top Matchup-Sammlung','Lokale Olaf und Warwick Top Matchup-Sammlung');
await fs.writeFile('olaf-local/dist/index.html',html);
