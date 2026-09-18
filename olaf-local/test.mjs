import {runePage,buildPanel} from './dist/equipment-view.js';
import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {server} from './server.mjs';
import {filterMatchups,groups,tiers,parseRoute} from './dist/model.js';
const data=JSON.parse(await readFile(new URL('./dist/data.json',import.meta.url)));
const warwick=JSON.parse(await readFile(new URL('./dist/warwick.json',import.meta.url)));
const adc=JSON.parse(await readFile(new URL('./dist/olaf-adc.json',import.meta.url)));
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
after(()=>server.close());
test('51 complete matchups and guide',()=>{
 assert.equal(data.matchups.length,51);assert.equal(new Set(data.matchups.map(m=>m.slug)).size,51);
 assert.ok(data.method.length>20);
 for(const m of data.matchups){for(const [,fields] of groups)for(const [key] of fields)assert.ok(m[key],`${m.name} ${key}`);assert.ok(tiers[m.tier]);assert.ok(tiers[m.lane]);assert.ok(tiers[m.late]);}
});
test('search handles punctuation; combined filters and empty results',()=>{
 assert.equal(filterMatchups(data.matchups,{q:'cho gath'})[0].slug,'chogath');
 assert.equal(filterMatchups(data.matchups,{q:'voli',tier:'B',rune:'Conqueror',sums:'Flash + Ghost'}).length,1);
 assert.equal(filterMatchups(data.matchups,{q:'voli',tier:'F'}).length,0);
 assert.equal(filterMatchups(data.matchups).length,51);
});
test('all entrypoints and 52 downloads return correct content',async()=>{
 for(const route of ['/','/style.css','/app.js','/model.js','/data.json','/health','/downloads/Olaf_Top_Sammlung.xlsx',...data.matchups.map(m=>`/downloads/Matchups/Olaf_vs_${m.slug}.xlsx`)]){
  const r=await fetch(base+route);assert.equal(r.status,200,route);assert.ok((await r.arrayBuffer()).byteLength>0);
 }
 assert.deepEqual(await (await fetch(base+'/data.json')).json(),data);
});
test('missing paths, private files, and mutations rejected',async()=>{
 for(const path of ['/absent','/server.mjs','/%2e%2e%5cpackage.json'])assert.notEqual((await fetch(base+path)).status,200);
 assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
 assert.equal((await fetch(base+'/',{method:'HEAD'})).status,200);
});
test('Warwick has an independent complete pool; Olaf data preserved',async()=>{
 const sourceBytes=(await readFile(new URL('./dist/data.json',import.meta.url),'utf8')).replace(/\r\n/g,'\n');
 assert.equal(createHash('sha256').update(sourceBytes).digest('hex'), '6806e145932e51aaca9690d79611957392a57921a6dd014554cd2adebce35e4b');
 assert.equal(warwick.matchups.length,51);
 assert.deepEqual(warwick.matchups.map(m=>m.slug).sort(),data.matchups.map(m=>m.slug==='warwick'?'olaf':m.slug).sort());
 for(const m of warwick.matchups){
  for(const [,fields] of groups)for(const [key]of fields)assert.ok(m[key]?.length>0,`${m.slug}.${key}`);
  assert.ok(tiers[m.tier]);assert.ok(tiers[m.lane]);assert.ok(tiers[m.late]);
  assert.notEqual(m.reason,data.matchups.find(x=>x.slug===m.slug)?.reason);
  assert.ok(['PTA','Lethal Tempo'].includes(m.rune));
  for(const [,url]of m.sources)assert.ok(!/mobalytics|mobafire/.test(url));
 }
 assert.equal(warwick.matchups.find(m=>m.slug==='fiora').stats.n,null);
});
test('legacy Olaf URLs, champion selection and direct Warwick links',()=>{
 assert.deepEqual(parseRoute('#matchup/volibear'),{champion:'olaf',page:'matchup',slug:'volibear'});
 assert.deepEqual(parseRoute('#warwick/matchup/olaf'),{champion:'warwick',page:'matchup',slug:'olaf'});
 assert.equal(parseRoute('#leitfaden').page,'guide');
 assert.equal(parseRoute('#warwick/leitfaden').champion,'warwick');
 assert.equal(filterMatchups(warwick.matchups,{rune:'Lethal Tempo',sums:'Flash + Barrier'}).length,warwick.matchups.filter(m=>m.rune==='Lethal Tempo').length);
});
test('Warwick dataset and all 52 new Excel downloads served',async()=>{
 for(const route of ['/warwick.json','/downloads/Warwick_Top_Sammlung.xlsx',...warwick.matchups.map(m=>'/downloads/Matchups/'+m.file)])assert.equal((await fetch(base+route)).status,200,route);
});
test('UI rendering: both champions, guide, all details, correct downloads and missing data',async()=>{
 const source=await readFile(new URL('./dist/app.js',import.meta.url),'utf8');
 const nodes=new Map();
 const make=()=>({innerHTML:'',textContent:'',href:'',children:[{},{},{}],elements:Object.fromEntries(['q','tier','rune','sums'].map(k=>[k,{value:''}])),addEventListener(){},querySelector(){return form;},querySelectorAll(){return [];}});
 const form=make();
 const picks=['olaf','warwick'].map(id=>({...make(),dataset:{champion:id},setAttribute(){}}));
 const lanes=['top','adc'].map(id=>({...make(),dataset:{lane:id},setAttribute(){}}));
 const document={title:'',querySelector(q){if(!nodes.has(q))nodes.set(q,make());return nodes.get(q);},querySelectorAll(q){return q==='[data-lane]'?lanes:picks;}};
 const location={hash:'#warwick'};const events={};
 const execute=Object.getPrototypeOf(async function(){}).constructor;
 await new execute('mountTeamPlanner','runePage','buildPanel','tiers','filterMatchups','groups','parseRoute','document','location','window','fetch','addEventListener',source.replace(/^import[^\n]+\n/gm,''))(()=>{},runePage,buildPanel,tiers,filterMatchups,groups,parseRoute,document,location,{scrollTo(){}},url=>fetch(base+url),(name,fn)=>events[name]=fn);
 assert.match(nodes.get('#app').innerHTML,/Lethal Tempo/);
 for(const [id,dataset] of [['olaf',data],['warwick',warwick]]){
  location.hash=id==='olaf'?'#leitfaden':'#warwick/leitfaden';events.hashchange();assert.match(nodes.get('#app').innerHTML,/Geltungsbereich/);
  for(const m of dataset.matchups){location.hash=(id==='olaf'?'#matchup/':'#warwick/matchup/')+m.slug;events.hashchange();const html=nodes.get('#app').innerHTML;assert.ok(html.includes((id==='olaf'?'Olaf':'Warwick')+'_vs_'+m.slug+'.xlsx'));assert.ok(!html.includes('undefined'));assert.ok(html.includes(m.rune));}
 }
 location.hash='#warwick/matchup/fiora';events.hashchange();assert.match(nodes.get('#app').innerHTML,/Keine extrahierten/);assert.doesNotMatch(nodes.get('#app').innerHTML,/0,00 %/);
 location.hash='#warwick/matchup/missing';events.hashchange();assert.match(nodes.get('#app').innerHTML,/Matchup nicht gefunden/);
 location.hash='#olaf/adc';events.hashchange();assert.match(nodes.get('#app').innerHTML,/ADC \/ BOTLANE/);assert.match(nodes.get('#results').innerHTML,/Caitlyn/);assert.doesNotMatch(nodes.get('#results').innerHTML,/Renekton/);
 assert.equal(nodes.get('header nav').children[2].href,'/olaf-adc.json');
 for(const m of adc.matchups){location.hash='#olaf/adc/matchup/'+m.slug;events.hashchange();const html=nodes.get('#app').innerHTML;assert.match(html,/Support-Einfluss/);assert.ok(html.includes('Olaf_ADC_vs_'+m.slug+'.json'));assert.ok(!html.includes('undefined'));assert.ok(!html.includes('ROHE OLAF SIEGRATE'));}
 location.hash='#olaf/adc/leitfaden';events.hashchange();assert.match(nodes.get('#app').innerHTML,/Hexplate/);
 location.hash='#';events.hashchange();assert.equal(nodes.get('header nav').children[2].href,'/downloads/Olaf_Top_Sammlung.xlsx');assert.match(nodes.get('#results').innerHTML,/Renekton/);
});

test('ADC route, complete independent records and downloadable data',async()=>{
 assert.deepEqual(parseRoute('#olaf/adc/matchup/vayne'),{champion:'olaf',role:'adc',page:'matchup',slug:'vayne'});
 assert.equal(adc.matchups.length,30);assert.equal(new Set(adc.matchups.map(m=>m.slug)).size,30);
 for(const m of adc.matchups){
  for(const [,fields] of groups)for(const [key]of fields)assert.ok(m[key]?.length>0,`${m.slug}.${key}`);
  assert.ok(m.support);assert.equal(m.stats.n,null);assert.ok(['PTA','Conqueror'].includes(m.rune));
  const r=await fetch(base+'/downloads/adc/Olaf_ADC_vs_'+m.slug+'.json');assert.equal(r.status,200);assert.equal((await r.json()).slug,m.slug);
 }
 assert.equal((await fetch(base+'/olaf-adc.json')).status,200);
 assert.equal(adc.matchups.find(m=>m.slug==='nilah').rune,'Conqueror');
 assert.ok(adc.matchups.find(m=>m.slug==='yunara'));
});

test('visual equipment: complete assets, legal rune pages and conditional item slots',async()=>{
 const catalog=JSON.parse(await readFile(new URL('./dist/equipment.json',import.meta.url)));
 const builds=JSON.parse(await readFile(new URL('./dist/loadouts.json',import.meta.url)));
 assert.equal(catalog.version,'16.18.1');
 const paths=new Set();
 for(const [key,dataset]of [['olaf-top',data],['warwick-top',warwick],['olaf-adc',adc]]){
  assert.equal(Object.keys(builds.collections[key]).length,dataset.matchups.length);
  for(const m of dataset.matchups){
   const b=builds.collections[key][m.slug];
   const primary=catalog.trees.find(t=>t.id===b.primaryTree),secondary=catalog.trees.find(t=>t.id===b.secondaryTree);
   b.primary.forEach((id,i)=>assert.ok(primary.slots[i].runes.some(r=>r.id===id),m.slug));
   const secondarySlots=b.secondary.map(id=>secondary.slots.findIndex(s=>s.runes.some(r=>r.id===id)));
   assert.equal(new Set(secondarySlots).size,2);assert.ok(secondarySlots.every(i=>i>0));
   assert.equal(b.core.length,2);assert.deepEqual(b.situational.map(g=>g.slot),[3,4,5]);
   assert.ok(!(b.core.some(o=>o.id===3156)&&b.core.some(o=>o.id===3053)));
   for(const o of [...b.start,...b.boots,...b.core,...b.alternatives,...b.situational.flatMap(g=>g.options)]){assert.ok(catalog.items[o.id],`${key}/${m.slug}: ${o.id}`);paths.add(catalog.items[o.id].image);}
   for(const id of [...b.primary,...b.secondary])paths.add(catalog.runes[id].image);
   paths.add(primary.image);paths.add(secondary.image);
   for(const shard of catalog.shards)paths.add(shard.image);
   const panel=buildPanel(b,catalog);assert.match(panel,/Startitems/);assert.match(panel,/3\. Item/);assert.match(panel,/5\. Item/);assert.ok(!panel.includes('undefined'));assert.match(runePage(b,catalog),/Zweiter Baum/);
  }
 }
 for(const path of paths){const r=await fetch(base+path);assert.equal(r.status,200,path);assert.equal(r.headers.get('content-type'),'image/png');const bytes=new Uint8Array(await r.arrayBuffer());assert.deepEqual(Array.from(bytes.slice(0,8)),[137,80,78,71,13,10,26,10],path);}
 assert.equal((await fetch(base+'/equipment.css')).status,200);
});
