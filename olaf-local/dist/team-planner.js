const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roles=[['top','Top'],['jungle','Jungle'],['mid','Mid'],['adc','Bot'],['support','Support']];
const damageLabels={physical:'Überwiegend physisch',magic:'Überwiegend magisch',mixed:'Gemischt'};
let catalogPromise,revision=0,request;
const states=new Map();
async function getCatalog(){
 if(!catalogPromise)catalogPromise=fetch('/api/champions').then(async r=>{if(!r.ok)throw Error('Championdaten nicht erreichbar.');return r.json();}).catch(e=>{catalogPromise=null;throw e;});
 return catalogPromise;
}
function loadState(key){
 if(!states.has(key)){
  let saved;try{saved=JSON.parse(sessionStorage.getItem('team-'+key));}catch{}
  const valid=saved&&['lane','teamfight'].includes(saved.focus)&&typeof saved.allyAntiheal==='boolean'&&saved.enemies&&typeof saved.enemies==='object';
  states.set(key,valid?saved:{focus:'teamfight',allyAntiheal:false,enemies:{},open:false});
 }
 return states.get(key);
}
export async function mountTeamPlanner({collection,matchups,matchup}){
 const element=document.querySelector('#team-planner');if(!element)return;
 const current=++revision;request?.abort();
 const state=loadState(collection),laneRole=collection==='olaf-adc'?'adc':'top',own=collection.startsWith('olaf')?'olaf':'warwick';
 const save=()=>{try{sessionStorage.setItem('team-'+collection,JSON.stringify(state));}catch{}};
 let catalog;
 try{catalog=await getCatalog();}catch{
  if(current!==revision)return;
  element.innerHTML='<p class="planner-error">Team-Planer konnte nicht geladen werden. <button class="quiet" type="button">Erneut versuchen</button></p>';
  element.querySelector('button').onclick=()=>mountTeamPlanner({collection,matchups,matchup});return;
 }
 if(current!==revision)return;
 const normalize=v=>String(v).toLowerCase().replace(/[^a-z0-9]/g,'');
 const findChampion=slug=>catalog.champions.find(c=>normalize(c.id)===normalize(slug));
 for(const [role,enemy]of Object.entries(state.enemies))if(!roles.some(r=>r[0]===role)||!enemy||enemy.id===own||!catalog.champions.some(c=>c.id===enemy.id))delete state.enemies[role];
 if(matchup){
  const c=findChampion(matchup);
  if(c&&state.enemies[laneRole]?.id!==c.id){
   for(const [role,e]of Object.entries(state.enemies))if(e.id===c.id)delete state.enemies[role];
   state.enemies[laneRole]={id:c.id,weight:1};
  }
 }
 function render(){
  const selected=Object.values(state.enemies).map(e=>e.id);
  element.innerHTML=`<details class="team-shell" ${state.open?'open':''}><summary class="team-toggle"><span><span class="eyebrow">VOM MATCHUP ZUM TEAMFIGHT</span><strong>Gegnerteam & Build</strong></span><span>${selected.length}/5 Gegner <span aria-hidden="true">＋</span></span></summary><div class="team-content"><p class="muted">Wähle das gegnerische Team. Gefährliche Gegner, tatsächliche Builds und dein Spielplan bestimmen die weiteren Item-Slots.</p><div class="team-enemies">${roles.map(([role,label])=>{
   const enemy=state.enemies[role],champ=catalog.champions.find(c=>c.id===enemy?.id);
   const available=role===laneRole?matchups.map(m=>findChampion(m.slug)).filter(Boolean):catalog.champions.filter(c=>c.id!==own);
   return `<section class="enemy-slot"><label>${label}${role===laneRole?' · Lane-Gegner':''}<select data-role="${role}" aria-label="Gegner ${label}"><option value="">Champion wählen</option>${available.map(c=>`<option value="${escape(c.id)}" ${enemy?.id===c.id?'selected':''} ${selected.includes(c.id)&&enemy?.id!==c.id?'disabled':''}>${escape(c.name)}</option>`).join('')}</select></label>${champ?`<label>Bedrohung<select data-weight="${role}"><option value="0.5" ${enemy.weight===0.5?'selected':''}>Gering</option><option value="1" ${enemy.weight===1?'selected':''}>Normal</option><option value="2" ${enemy.weight===2?'selected':''}>Hoch / gefeedet</option></select></label><details class="enemy-assumptions"><summary>Kit & Build prüfen</summary><label>Schadensart<select data-damage="${role}">${Object.entries(damageLabels).map(([v,t])=>`<option value="${v}" ${(enemy.damage||champ.damage)===v?'selected':''}>${t}</option>`).join('')}</select></label><p class="build-caption">Aus Kit-Texten abgeleitet; Crit und Tank sind Build-Annahmen.</p>${Object.entries(catalog.traits).map(([key,text])=>`<label class="trait-toggle"><input type="checkbox" data-trait="${key}" data-enemy="${role}" ${(enemy.traits?.[key]??champ.traits[key])?'checked':''}>${escape(text)}</label>`).join('')}<a class="source-link" href="${escape(champ.source)}" target="_blank" rel="noopener noreferrer">Riot-Kitdaten ↗</a></details>`:'<p class="slot-empty">Noch offen</p>'}</section>`;
  }).join('')}</div><div class="team-controls"><label>Dein Spielplan<select id="team-focus"><option value="teamfight" ${state.focus==='teamfight'?'selected':''}>Teamfights · alle Gegner</option><option value="lane" ${state.focus==='lane'?'selected':''}>Lane / Side · Lane-Gegner stärker gewichten</option></select></label><label class="trait-toggle"><input id="team-antiheal" type="checkbox" ${state.allyAntiheal?'checked':''}>Mein Team trägt Wunden zuverlässig auf</label><button class="quiet" id="team-reset" type="button">Team zurücksetzen</button></div><p class="build-caption">Kit-Heuristik · Riot ${escape(catalog.version)} · keine Live-Spieldaten. Auswahl bleibt für diese Browser-Sitzung erhalten.</p><div id="team-result" aria-live="polite"></div></div></details>`;
  element.querySelector('.team-shell').addEventListener('toggle',e=>{state.open=e.target.open;save();});
  element.querySelectorAll('[data-role]').forEach(select=>select.onchange=()=>{
   const role=select.dataset.role;if(select.value)state.enemies[role]={id:select.value,weight:1};else delete state.enemies[role];save();render();
   element.querySelector(`[data-role="${role}"]`).focus();
  });
  element.querySelectorAll('[data-weight]').forEach(select=>select.onchange=()=>{state.enemies[select.dataset.weight].weight=Number(select.value);save();calculate();});
  element.querySelectorAll('[data-damage]').forEach(select=>select.onchange=()=>{state.enemies[select.dataset.damage].damage=select.value;save();calculate();});
  element.querySelectorAll('[data-trait]').forEach(box=>box.onchange=()=>{
   const enemy=state.enemies[box.dataset.enemy];enemy.traits??={};enemy.traits[box.dataset.trait]=box.checked;save();calculate();
  });
  element.querySelector('#team-focus').onchange=e=>{state.focus=e.target.value;save();calculate();};
  element.querySelector('#team-antiheal').onchange=e=>{state.allyAntiheal=e.target.checked;save();calculate();};
  element.querySelector('#team-reset').onclick=()=>{state.enemies={};state.allyAntiheal=false;state.focus='teamfight';save();render();element.querySelector('[data-role]').focus();};
  calculate();
 }
 async function calculate(){
  request?.abort();const controller=new AbortController();request=controller;
  const result=element.querySelector('#team-result');
  const lane=state.enemies[laneRole];
  const match=matchups.find(m=>normalize(m.slug)===normalize(lane?.id));
  if(!match){result.innerHTML='<p class="team-empty">Wähle deinen Lane-Gegner, um die Matchup-Basis mit dem Gegnerteam zu vergleichen.</p>';return;}
  result.innerHTML='<p class="muted">Build wird angepasst …</p>';
  try{
   const response=await fetch('/api/recommendations',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,
    body:JSON.stringify({collection,matchup:match.slug,focus:state.focus,allyAntiheal:state.allyAntiheal,enemies:Object.entries(state.enemies).map(([role,e])=>({...e,role}))})});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Empfehlung nicht verfügbar.');
   if(controller.signal.aborted||current!==revision)return;
   const itemCard=(entry,label)=>`<article class="team-item"><small>${escape(label)}</small><div class="team-item-title"><img src="${escape(entry.item.image)}" width="48" height="48" alt=""><strong>${escape(entry.item.localName||entry.item.name)}</strong></div><p>${escape(entry.why)}</p>${entry.caution?`<p class="item-caution">${escape(entry.caution)}</p>`:''}<details><summary>Werte & Effekte</summary><p class="item-description">${escape(entry.item.description)}</p></details></article>`;
   result.innerHTML=`<div class="team-result-heading"><div><p class="eyebrow">ANGEPASST AN ${escape(match.name.toUpperCase())} & TEAM</p><h2>Dein Build-Vorschlag</h2></div><span class="team-balance">${data.physical}% physisch · ${data.magic}% magisch<small>Gewichtete Annahme · ohne absoluten Schaden</small></span></div><p class="muted">Erstes Core-Item aus deinem Matchup; weitere Slots nach Team-Bedrohung. Reihenfolge im Spiel nach Gold und Bedarf anpassen.</p><div class="team-tags">${data.traits.map(t=>`<span title="${escape(t.enemies)}">${escape(t.label)} <small>${escape(t.enemies)}</small></span>`).join('')}</div><div class="team-build">${itemCard(data.boots,'Boots')}${data.build.map((b,i)=>itemCard(b,`${i+1}. Item`)).join('')}</div>${data.changes.length?`<p class="team-change">Gegenüber dem Lane-Core neu abgewogen: ${data.changes.map(c=>escape(c.name)).join(', ')}. Die Team-Prioritäten oben bestimmen die freien Slots.</p>`:''}<details class="team-alternatives"><summary>Weitere situative Optionen</summary><div class="team-build">${data.alternatives.map(e=>itemCard(e,'Alternative')).join('')}</div></details><details class="team-method"><summary>Warum dieser Vorschlag? Grenzen & Quellen</summary><ul>${data.warnings.map(w=>`<li>${escape(w)}</li>`).join('')}</ul><p>Patch ${escape(data.patch)} · Lane-Fokus gewichtet den Lane-Gegner 2,5-fach und andere Gegner 0,5-fach; Bedrohung gering / normal / hoch entspricht 0,5 / 1 / 2. Merkmale beeinflussen die Item-Priorität, nicht eine behauptete Winrate.</p><ul>${data.enemies.map(e=>`<li><a href="${escape(e.source)}" target="_blank" rel="noopener noreferrer">${escape(e.name)} · Riot-Kitdaten ↗</a></li>`).join('')}</ul></details>`;
  }catch(error){if(error.name==='AbortError'||current!==revision)return;result.innerHTML=`<p class="planner-error">${escape(error.message)}</p><button class="quiet" type="button">Erneut berechnen</button>`;result.querySelector('button').onclick=calculate;}
 }
 save();render();
}
