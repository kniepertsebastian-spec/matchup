import {runePage,buildPanel} from './equipment-view.js';
import {tiers,filterMatchups,groups,parseRoute} from './model.js';
const app=document.querySelector('#app');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge=t=>`<span class="tier tier-${t}">${t}</span>`;
let data;
let equipment;
let loadouts;
let roster;
let active="olaf";
let lane="top";
let previousCollection;
const isADC=()=>lane==='adc';
const laneLabel=()=>isADC()?'ADC / Botlane':'Toplane';
const home=()=>isADC()?'#olaf/adc':active==='olaf'?'#':'#warwick';
const matchLink=slug=>isADC()?`#olaf/adc/matchup/${slug}`:active==='olaf'?`#matchup/${slug}`:`#warwick/matchup/${slug}`;
const champion=()=>active==='olaf'?'Olaf':'Warwick';
const statPatch=()=>data.statsPatch||'26.17 / 16.17';
const filters={q:'',tier:'',rune:'',sums:''};
const pct=v=>v==null?'–':`${v.toFixed(2).replace('.',',')} %`;
function options(values){return values.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');}
function listing(){
 app.innerHTML=`<section class="intro"><div><p class="eyebrow">${laneLabel().toUpperCase()} · DEIN NÄCHSTER GEGNER</p><h1>Wähle dein Matchup.</h1><p>${data.matchups.length} Gegner. Ein klarer Plan für ${champion()} vor dem ersten Minion.</p>${isADC()?`<p class="lane-note">Vorläufige Kit-Tiers · Botlane ist ein 2v2. Lies den Support-Einfluss im Matchup; keine belastbaren Olaf-ADC-Paarungswinrates.</p>`:''}</div><div class="patch">KIT-STAND <strong>${esc(data.patch)}</strong><span>Geprüft ${esc(data.checked)}<br>Statistik: ${esc(statPatch())}</span></div></section><form class="filters" aria-label="Matchups filtern"><label class="search">Champion suchen<input name="q" type="search" placeholder="${isADC()?'z. B. Caitlyn, Jinx, Yunara':'z. B. Volibear, Fiora, Jax'}" value="${esc(filters.q)}"></label><label>Gesamt-Tier<select name="tier"><option value="">Alle Tiers</option>${Object.entries(tiers).map(([t,s])=>`<option value="${t}">${t} · ${s}</option>`).join('')}</select></label><label>Keystone<select name="rune"><option value="">Alle Runen</option>${options([...new Set(data.matchups.map(m=>m.rune))])}</select></label><label>Summoners<select name="sums"><option value="">Alle Spells</option>${options([...new Set(data.matchups.map(m=>m.sums))])}</select></label><button type="reset" class="quiet">Zurücksetzen</button></form><div class="listhead"><p id="count" aria-live="polite"></p><span>Tiers aus ${champion()}s Sicht · Z günstig → F schwierig</span></div><section class="grid" id="results" aria-label="Matchups"></section>`;
 const form=app.querySelector('form');
 for(const k of ['tier','rune','sums'])form.elements[k].value=filters[k];
 form.addEventListener('submit',e=>e.preventDefault());
 form.addEventListener('input',()=>{for(const k in filters)filters[k]=form.elements[k].value;results();});
 form.addEventListener('reset',()=>{for(const k in filters)filters[k]='';setTimeout(results,0);});
 results();
}
function results(){
 const rows=filterMatchups(data.matchups,filters);
 document.querySelector('#count').textContent=`${rows.length} von ${data.matchups.length} Matchups`;
 document.querySelector('#results').innerHTML=rows.length?rows.map(m=>`<a class="card" href="${matchLink(m.slug)}"><div class="cardtop"><span class="opponent">${esc(m.name)}</span>${badge(m.tier)}</div><p class="cardreason">${esc(m.reason)}</p><div class="phases"><span>Lane <b>${m.lane}</b></span><span>Späte Side <b>${m.late}</b></span></div><div class="cardfoot"><strong>${esc(m.rune)}</strong><span>${esc(m.sums)}</span><span aria-hidden="true">↗</span></div></a>`).join(''):'<div class="empty"><h2>Kein passendes Matchup</h2><p>Ändere die Suche oder setze die Filter zurück.</p></div>';
}
function detail(m){
 const stats=m.stats;
 const build=loadouts.collections[active+'-'+lane][m.slug];
 app.innerHTML=`<a class="back" href="${home()}">← Alle Matchups</a><section class="detailtitle"><div><p class="eyebrow">${champion().toUpperCase()} · ${laneLabel().toUpperCase()} VS.</p><h1>${esc(m.name)}</h1></div><div class="rating">${badge(m.tier)}<span>${tiers[m.tier]}<small>${isADC()?'Vorläufig · Support abhängig':'Gesamt-Matchup'}</small></span></div></section><div class="loadout visual-loadout"><div class="keystone-panel"><small>KEYSTONE</small><strong>${esc(m.rune)}</strong>${runePage(build,equipment)}</div><div><small>SUMMONERS</small><strong>${esc(m.sums)}</strong></div><div><small>LANE-TIER</small><strong>${m.lane} · ${tiers[m.lane]}</strong></div><div><small>SPÄTE SIDELANE</small><strong>${m.late} · ${tiers[m.late]}</strong></div></div>${buildPanel(build,equipment)}${isADC()?`<section class="support-note"><h2>Support-Einfluss im 2v2</h2><p>${esc(m.support)}</p></section>`:''}<section class="gameplan"><p class="eyebrow">VOR DEM SPIEL LESEN</p><p>${esc(m.plan)}</p></section><nav class="sectionnav">${groups.map(([title],i)=>`<a href="#section-${i}" data-section="section-${i}">${title}</a>`).join('')}${isADC()?`<a href="/downloads/adc/Olaf_ADC_vs_${m.slug}.json" download>Matchup-Daten ↗</a>`:`<a href="/downloads/Matchups/${champion()}_vs_${m.slug}.xlsx" download>Matchup als Excel ↗</a>`}</nav><div class="details">${groups.map(([title,fields],i)=>`<section id="section-${i}"><h2><span>0${i+1}</span> ${title}</h2><dl>${fields.map(([key,label])=>`<div><dt>${label}</dt><dd>${esc(m[key])}</dd></div>`).join('')}</dl></section>`).join('')}<section><h2><span>04</span> Daten & Quellen</h2><p class="muted">Kit-Abgleich ${esc(data.patch)} · geprüft ${esc(data.checked)}. Statistik ${esc(statPatch())}. Unterschiedliche Populationen; keine gemittelte Winrate und keine Tier-Formel.</p>${m.statsNote?`<p class="muted">${esc(m.statsNote)}</p>`:''}${isADC()?'':`<div class="statgrid"><div><small>U.GG · ${champion().toUpperCase()} SIEGRATE</small><strong>${pct(stats.opponentWR==null?null:100-stats.opponentWR)}</strong><p>${stats.n??'Keine extrahierten'} Spiele · Gold @15: ${stats.opponentGD==null?'–':-stats.opponentGD}</p></div><div><small>LOLALYTICS · ROHE ${champion().toUpperCase()} SIEGRATE</small><strong>${pct(stats.rawWR)}</strong><p>${stats.ln??'Keine extrahierten'} Spiele · Delta 2: ${stats.delta2??'–'} pp</p></div></div><p class="muted">Die rohe LoLalytics-Siegrate ist nicht unmittelbar mit U.GG vergleichbar. Delta 2 berücksichtigt die Champion-Basiswerte nach der Methode des Anbieters.</p>`}<ul class="sources">${sourceLinks(m)}</ul></section></div>`;
 app.querySelectorAll('.item-card').forEach(card=>{
  let pinned=false;
  const place=()=>{const rect=card.getBoundingClientRect(),below=window.innerHeight-rect.bottom-20,above=rect.top-20;const up=above>below;card.classList.toggle('tooltip-above',up);card.style.setProperty('--tooltip-height',Math.max(120,Math.min(window.innerHeight*.55,up?above:below))+'px');};
  card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){place();card.open=true;}});
  card.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!pinned)card.open=false;});
  card.querySelector('summary').addEventListener('click',e=>{e.preventDefault();place();pinned=!pinned;card.open=pinned;});
  card.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=false;card.open=false;card.querySelector('summary').focus();}});
 });
 app.querySelectorAll('[data-section]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById(a.dataset.section).scrollIntoView({behavior:'smooth'});}));
}
function sourceLinks(m){
 if(active==='warwick'||isADC())return [...m.sources,['Riot · '+m.name,m.official],['Riot · Patch 26.18','https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/']].map(([name,url])=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a></li>`).join('');
 const links=[['Riot · Patch 26.18','https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/'],['U.GG · Olaf Matchups','https://u.gg/lol/champions/olaf/counter'],['LoLalytics · Olaf Matchups','https://lolalytics.com/lol/olaf/counters/'],['Riot · Olaf','https://www.leagueoflegends.com/en-us/champions/olaf/']];
 if(m.pool?.url)links.push(['LoLalytics · Championpool',m.pool.url]);
 if(m.official)links.push(['Riot · '+m.name,m.official]);
 if(Array.isArray(m.sources))for(const s of m.sources)if(Array.isArray(s))links.push(s);
 return links.filter((s,i,a)=>a.findIndex(x=>x[1]===s[1])===i).filter(s=>/^https:\/\//.test(s[1])).map(([name,url])=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a></li>`).join('');
}
function guide(){app.innerHTML=`<a class="back" href="${home()}">← Alle Matchups</a><section class="intro"><div><p class="eyebrow">GRUNDLAGEN & METHODIK</p><h1>Der Plan hinter den Tiers.</h1><p>Kit-Stand ${esc(data.patch)} · Statistik ${esc(statPatch())}</p></div></section><div class="details"><dl>${data.method.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${/^https:\/\//.test(value)?`<a target="_blank" rel="noopener noreferrer" href="${esc(value)}">Quelle öffnen ↗</a>`:esc(value)}</dd></div>`).join('')}</dl></div>`;}
function route(){
 const parsed=parseRoute(location.hash);
 active=parsed.champion;lane=parsed.role||'top';
 if(lane==='adc'&&active!=='olaf'){location.hash='#olaf/adc';return;}
 const collection=active+(isADC()?'-adc':'');
 if(previousCollection&&previousCollection!==collection)for(const k in filters)filters[k]='';
 previousCollection=collection;data=roster[collection];
 document.querySelectorAll('[data-lane]').forEach(a=>{a.setAttribute('aria-current',a.dataset.lane===lane?'page':'false');a.href=a.dataset.lane==='adc'?'#olaf/adc':active==='warwick'?'#warwick':'#';});
 document.querySelector('footer').innerHTML='Ranked Solo Queue · '+laneLabel()+' <span>Lokale Sammlung · keine automatische Patch-Aktualisierung</span>';
 if(filters.rune&&!data.matchups.some(m=>m.rune===filters.rune))filters.rune='';
 if(filters.sums&&!data.matchups.some(m=>m.sums===filters.sums))filters.sums='';
 document.querySelector('.brand').innerHTML=champion().toUpperCase()+' <span>/ MATCHUP-BUCH</span>';
 document.querySelector('.brand').href=home();
 const nav=document.querySelector('header nav');
 nav.children[0].href=home();nav.children[1].href=isADC()?'#olaf/adc/leitfaden':active==='olaf'?'#leitfaden':'#warwick/leitfaden';nav.children[2].href=isADC()?'/olaf-adc.json':'/downloads/'+champion()+'_Top_Sammlung.xlsx';nav.children[2].textContent=isADC()?'Daten ↗':'Excel ↗';
 document.querySelectorAll('[data-champion]').forEach(a=>{
  a.setAttribute('aria-current',a.dataset.champion===active?'page':'false');
  const id=a.dataset.champion;
  a.textContent=id==='warwick'&&isADC()?'Warwick · Toplane':id==='warwick'?'Warwick':'Olaf';
  if(isADC()){a.href=id==='olaf'?home():'#warwick';return;}
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
 document.title=parsed.page==='matchup'?champion()+' vs. '+(data.matchups.find(m=>m.slug===parsed.slug)?.name||'Unbekannt'):champion()+' · '+laneLabel()+' · Matchup-Buch';
}
try{
 const datasets=await Promise.all(['/data.json','/warwick.json','/olaf-adc.json','/equipment.json','/loadouts.json'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error('Daten fehlen');return r.json();}));
 equipment=datasets[3];loadouts=datasets[4];
 roster={olaf:datasets[0],warwick:datasets[1],'olaf-adc':datasets[2]};route();addEventListener('hashchange',route);
}catch{app.innerHTML='<h1>Die Sammlung konnte nicht geladen werden.</h1><p>Bitte lade die Seite neu. Falls der Fehler bleibt, starte die App erneut.</p>';}
