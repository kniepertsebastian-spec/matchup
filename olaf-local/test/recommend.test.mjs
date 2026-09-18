import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readSeed,context} from '../lib/store.mjs';
import {recommend,compatible,InputError} from '../lib/recommend.mjs';
import {profile} from '../lib/profiles.mjs';
const data=context(await readSeed());
const enemy=(id,role,extra={})=>({id,role,weight:1,...extra});
const input=(enemies,extra={})=>({collection:'olaf-top',matchup:'aatrox',focus:'teamfight',allyAntiheal:false,enemies,...extra});
const ap=[enemy('aatrox','top'),enemy('elise','jungle'),enemy('syndra','mid'),enemy('ziggs','adc'),enemy('lux','support')];
const ad=[enemy('aatrox','top'),enemy('masteryi','jungle'),enemy('zed','mid'),enemy('jinx','adc'),enemy('pyke','support')];
test('same lane opponent gets different builds against AD and AP teams',()=>{
 const a=recommend(input(ap),data),b=recommend(input(ad),data);
 assert.equal(a.build[0].id,data.loadouts.collections['olaf-top'].aatrox.core[0].id);
 assert.ok(a.magic>b.magic);assert.ok(a.build.some(i=>i.id===3065||i.id===3156));
 assert.ok(b.build.some(i=>i.id===6333));assert.notDeepEqual(a.build.map(i=>i.id),b.build.map(i=>i.id));
 assert.equal(b.boots.id,3047);
});
test('healing, shields, ally coverage and true damage produce actionable explanations',()=>{
 const enemies=[enemy('aatrox','top'),enemy('warwick','jungle'),enemy('vladimir','mid'),enemy('vayne','adc'),enemy('lulu','support')];
 const a=recommend(input(enemies),data),b=recommend(input(enemies,{allyAntiheal:true}),data);
 const all=r=>[...r.build,...r.alternatives];
 assert.ok(all(a).find(i=>i.id===6609).score>all(b).find(i=>i.id===6609).score);
 assert.ok(all(a).find(i=>i.id===6695).why.includes('Lulu'));
 assert.ok(a.warnings.some(w=>w.includes('Absoluter Schaden')));
 assert.ok(!b.build.some(i=>i.id===6609));
});
test('weight, damage correction and lane focus materially affect threat evaluation',()=>{
 const a=recommend(input(ap),data);
 const b=recommend(input(ap.map(e=>e.id==='aatrox'?{...e,weight:2}:e),{focus:'lane'}),data);
 assert.ok(b.physical>a.physical);
 const c=recommend(input(ap.map(e=>({...e,damage:'physical'}))),data);assert.equal(c.physical,100);
});
test('all matchups can produce legal six-slot builds without duplicate items',()=>{
 for(const [collection,rows]of Object.entries(data.collections))for(const m of rows.matchups){
  const normalize=s=>s.replace(/[^a-z0-9]/g,'');const c=data.champions.champions.find(c=>normalize(c.id)===normalize(m.slug));assert.ok(c,m.slug);
  const r=recommend(input([enemy(c.id,collection==='olaf-adc'?'adc':'top')],{collection,matchup:m.slug}),data);
  const ids=[r.boots.id,...r.build.map(i=>i.id)];assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);
  assert.ok(!(ids.includes(3053)&&ids.includes(3156)));assert.ok(ids.filter(i=>[3074,3748,6631].includes(i)).length<=1);
  assert.ok(r.warnings.some(w=>w.includes('1/5')));
 }
});
test('invalid inputs rejected rather than silently ignored',()=>{
 const base=input(ap);
 for(const invalid of [null,{}, {...base,enemies:[]},{...base,enemies:[...ap,enemy('garen','top')]},{...base,enemies:[enemy('olaf','top')]},{...base,enemies:[enemy('aatrox','top',{weight:99})]},{...base,enemies:[enemy('aatrox','top',{damage:'true'})]},{...base,enemies:[enemy('aatrox','top',{traits:{bad:true}})]},{...base,enemies:[enemy('garen','top')]},{...base,enemies:[enemy('aatrox','top'),enemy('aatrox','mid')]},{...base,enemies:[enemy('aatrox','top'),enemy('lux','top')]},{...base,collection:'__proto__'}])assert.throws(()=>recommend(invalid,data));
 assert.throws(()=>recommend({...base,focus:'bad'},data),InputError);
 assert.equal(compatible([3074],6631),false);assert.equal(compatible([3053],3156),false);
});
test('kit assumptions cover every champion and avoid common false positives',()=>{
 assert.equal(data.champions.champions.length,173);
 for(const c of data.champions.champions){const p=profile(c);assert.ok(['physical','magic','mixed'].includes(p.damage));assert.ok(p.source.startsWith('https://ddragon.leagueoflegends.com/'));}
 const p=id=>profile(data.champions.champions.find(c=>c.id===id));
 assert.equal(p('garen').traits.healing,false);assert.equal(p('aatrox').traits.cc,false);assert.equal(p('soraka').traits.healing,true);assert.equal(p('lulu').traits.shielding,true);assert.equal(p('morgana').traits.shielding,false);
});
