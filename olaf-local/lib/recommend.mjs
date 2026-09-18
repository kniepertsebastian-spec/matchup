import {profile,traitLabels} from './profiles.mjs';
export class InputError extends Error {}
const hydra=new Set([3074,3748,6631]);
const lifeline=new Set([3053,3156,3155]);
export function compatible(ids,id){return !ids.includes(id)&&!(hydra.has(id)&&ids.some(x=>hydra.has(x)))&&!(lifeline.has(id)&&ids.some(x=>lifeline.has(x)));}
export function recommend(input,{champions,equipment,loadouts,collections}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new InputError('Ungültige Anfrage.');
 const collection=Object.hasOwn(collections,input.collection)?collections[input.collection]:null;
 if(!collection)throw new InputError('Unbekannte Champion-/Lane-Auswahl.');
 const matchup=collection.matchups.find(m=>m.slug===input.matchup);
 if(!matchup)throw new InputError('Wähle zuerst deinen Lane-Gegner.');
 if(!Array.isArray(input.enemies)||input.enemies.length<1||input.enemies.length>5)throw new InputError('Wähle ein bis fünf Gegner.');
 if(!['teamfight','lane'].includes(input.focus))throw new InputError('Ungültiger Spielplan.');
 if(typeof input.allyAntiheal!=='boolean')throw new InputError('Ungültige Antiheal-Auswahl.');
 const own=input.collection.startsWith('olaf')?'olaf':'warwick';
 const roles=['top','jungle','mid','adc','support'];
 const laneRole=input.collection==='olaf-adc'?'adc':'top';
 const seen=new Set(),seenRoles=new Set();
 const enemies=input.enemies.map(e=>{
  if(!e||typeof e!=='object')throw new InputError('Ungültiger Gegner.');
  const champion=champions.champions.find(c=>c.id===e.id);
  if(!champion||e.id===own||seen.has(e.id)||!roles.includes(e.role)||seenRoles.has(e.role))throw new InputError('Gegner und Rollen müssen eindeutig sein; dein Champion gehört nicht ins Gegnerteam.');
  if(![0.5,1,2].includes(e.weight))throw new InputError('Ungültige Gegner-Gewichtung.');
  seen.add(e.id);seenRoles.add(e.role);
  const p=profile(champion);
  if(e.damage!==undefined){if(!['physical','magic','mixed'].includes(e.damage))throw new InputError('Ungültige Schadensart.');p.damage=e.damage;}
  if(e.traits!==undefined){
   if(!e.traits||typeof e.traits!=='object'||Array.isArray(e.traits))throw new InputError('Ungültige Kit-Merkmale.');
   for(const [key,val]of Object.entries(e.traits)){if(!Object.hasOwn(traitLabels,key)||typeof val!=='boolean')throw new InputError('Ungültiges Kit-Merkmal.');p.traits[key]=val;}
  }
  return {...p,role:e.role,weight:e.weight*(input.focus==='lane'?(e.role===laneRole?2.5:0.5):1)};
 });
 const laneEnemy=enemies.find(e=>e.role===laneRole);
 const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
 if(!laneEnemy||normalize(laneEnemy.id)!==normalize(matchup.slug))throw new InputError('Der Lane-Gegner muss zum ausgewählten Matchup passen.');
 const total=enemies.reduce((n,e)=>n+e.weight,0);
 const weight=key=>enemies.reduce((n,e)=>n+(e.traits[key]?e.weight:0),0)/total;
 const names=key=>enemies.filter(e=>e.traits[key]).map(e=>e.name).join(', ');
 const magic=enemies.reduce((n,e)=>n+e.weight*(e.damage==='magic'?1:e.damage==='mixed'?0.5:0),0)/total;
 const physical=1-magic;
 const base=loadouts.collections[input.collection][matchup.slug];
 const candidates=[];
 function add(id,score,why,caution=''){
  if(score<=0||!equipment.items[id])return;
  const existing=candidates.findIndex(c=>c.id===id);
  if(existing!==-1){if(candidates[existing].score>=score)return;candidates.splice(existing,1);}
  candidates.push({id,score:Math.round(score*100)/100,why,caution,item:equipment.items[id]});
 }
 add(3047,physical*5+weight('attacks')*3,'Rüstung und Schutz gegen normalen Angriffsschaden.', 'Verringert nicht pauschal On-Hit-Effekte oder absoluten Schaden.');
 add(3111,magic*4+weight('cc')*(own==='olaf'?0.7:3),'Magieresistenz; Zähigkeit gegen reduzierbare Kontrolle.',own==='olaf'?'Olafs R macht Zähigkeit während Ragnarok weniger wichtig.':'Zähigkeit verkürzt keine Knock-ups oder Unterdrückung.');
 add(3009,weight('access')*3,'Lauftempo, wenn der Zugang zum Ziel wichtiger ist als Widerstände.');
 add(6333,physical*7,'Gegen überwiegend physischen Druck; besonders wertvoll, wenn du Takedowns erreichen kannst.');
 add(3065,magic*7,'Magieresistenz und Verstärkung deiner eigenen Heilung und Schilde.');
 if(magic>=0.3)add(3156,magic*6.5,'Offensive Alternative gegen gefährliche Magieschadens-Spitzen.','Ersetzt Sterak’s; der Schild schützt nur vor Magieschaden.');
 add(3053,3.2,'Allgemeiner Puffer für Nahkampf-All-ins.','Ersetzt Maw; kein zweiter Rettungsanker im selben Build.');
 if(weight('crit'))add(3143,weight('crit')*8+physical*2,`Crit-Annahme bei ${names('crit')}: Randuin gegen deren kritische Treffer.`, 'Nur priorisieren, wenn diese Gegner tatsächlich Crit bauen.');
 if(weight('healing'))add(6609,input.allyAntiheal?weight('healing')*1.5:4+weight('healing')*5,`Heilung bei ${names('healing')}: Wunden durch deinen normalen Schaden auf die geheilten Ziele auftragen.`,input.allyAntiheal?'Verbündete decken Wunden bereits ab; nur bei Anwendungslücken selbst kaufen.':`Früh oft Executioner’s Calling (${equipment.items[3123].gold} Gold) statt sofort das fertige Item.`);
 if(weight('shielding'))add(6695,1+weight('shielding')*5,`Schilde bei ${names('shielding')}: Serpent’s Fang ist eine offensive Spezialoption.`, 'Nur wenn du die geschützten Ziele zuverlässig triffst und dein Team keinen verlässlichen Schildbrecher hat; kostet einen defensiven Slot.');
 if(weight('tank')){
  add(3153,weight('tank')*5+(own==='warwick'?2:0),`Tank-Annahme bei ${names('tank')}: BotRK für wiederholte Angriffe gegen viel Leben.`, 'Kein Ersatz für Rüstungsdurchdringung; du musst im Angriffskontakt bleiben.');
  add(3071,weight('tank')*(own==='olaf'?6:3),`Gegen angenommene Rüstungs-Builds von ${names('tank')}: Black Cleaver.`, 'Nur sinnvoll, wenn die Ziele Rüstung kaufen; Warwick verursacht auch viel Magieschaden.');
 }
 add(3026,2,'Späte Absicherung für entscheidende Kämpfe.','Nur wenn dein Team die Wiederbelebungsposition absichern kann.');
 add(3153,1.5,'Offensive Ergänzung für wiederholte Angriffe und Duelle.','Niedrige Basis-Priorität; Schutz vor der Hauptbedrohung geht vor.');
 if(own==='warwick')add(3748,1.2,'Leben und Waveclear als spätes Basis-Item.','Hydra-Gruppe: nicht mit Ravenous Hydra oder Stridebreaker kombinieren.');
 else add(3161,1.2,'Offensive Basis-Option für längere Kämpfe und häufigere Grundfähigkeiten.','Niedrige Basis-Priorität, wenn kein weiteres konkretes Gegen-Item erforderlich ist.');
 if(weight('access')){
  add(6631,weight('access')*4,`Abstand gegen ${names('access')}: Stridebreaker hilft beim Halten des Angriffskontakts.`, 'Hydra-Alternative; ersetzt Ravenous oder Titanic, nicht zusätzlich dazu kaufen.');
  if(own==='olaf')add(3073,weight('access')*4.5,'Experimental Hexplate für Angriffstempo und Lauftempo nach Ragnarok.', 'Hilft beim Verfolgen; löst keinen fehlenden ersten Zugang über Wände.');
 }
 const boots=candidates.filter(c=>[3047,3111,3009].includes(c.id)).sort((a,b)=>b.score-a.score||a.id-b.id);
 const ranked=candidates.filter(c=>![3047,3111,3009].includes(c.id)).sort((a,b)=>b.score-a.score||a.id-b.id);
 // Preserve the lane's first core item. The remaining suggestions are team-dependent.
 const first=base.core[0];
 const build=[{...first,item:equipment.items[first.id],why:`Lane-Basis bleibt: ${first.why}`,score:null,caution:''}];
 for(const c of ranked){if(build.length===5)break;if(compatible(build.map(x=>x.id),c.id))build.push(c);}
 const warnings=[
  'Regelbasierter Vorschlag, keine berechnete optimale Winrate. Schadensanteile sind gewichtete Kit-Annahmen, keine gemessenen Spielwerte.',
  'Kit-Texte sind verkürzt. Prüfe die Merkmale, tatsächliche Items und die Bedrohung der Gegner; Gold, Level und Fähigkeiten-Cooldowns werden nicht automatisch gelesen.'
 ];
 if(enemies.length<5)warnings.push(`Erst ${enemies.length}/5 Gegner gewählt. Die übrigen Teammitglieder fehlen in der Bewertung.`);
 if(weight('trueDamage'))warnings.push(`Absoluter Schaden bei ${names('trueDamage')}: Rüstung und Magieresistenz reduzieren diesen Anteil nicht. Bei prozentualem Max-Leben-Schaden ist auch reines Leben keine direkte Lösung.`);
 if(weight('airborne')||weight('suppression'))warnings.push('Knock-ups und Unterdrückung werden durch Zähigkeit nicht verkürzt. Positionierung und Fähigkeits-Timing bleiben entscheidend.');
 if(own==='olaf')warnings.push('Olaf: Kontrolle während Ragnarok anders bewerten; ohne R bleibt gegnerische Kontrolle relevant.');
 return {patch:equipment.patch,version:champions.version,focus:input.focus,enemies,physical:Math.round(physical*100),magic:Math.round(magic*100),
  traits:Object.entries(traitLabels).filter(([k])=>weight(k)>0).map(([key,label])=>({key,label,enemies:names(key)})),
  boots:boots[0],build,alternatives:ranked.filter(c=>!build.some(b=>b.id===c.id)),
  changes:base.core.filter(c=>!build.some(b=>b.id===c.id)).map(c=>({id:c.id,name:equipment.items[c.id].name})),warnings};
}
