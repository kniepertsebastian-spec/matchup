// Explicit, reviewable patch import. Never runs during an application request.
import {mkdir, writeFile} from 'node:fs/promises';
const version=process.argv[2] || '16.18.1';
if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Expected a Data Dragon version');
const base=`https://ddragon.leagueoflegends.com/cdn/${version}`;
async function json(url){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`${r.status}: ${url}`);return r.json();}
const index=await json(`${base}/data/en_US/champion.json`);
const queue=Object.keys(index.data), champions=[];
await Promise.all(Array.from({length:6},async()=>{
  while(queue.length){
    const id=queue.shift();
    const source=`${base}/data/en_US/champion/${id}.json`;
    const c=(await json(source)).data[id];
    champions.push({id:id==='MonkeyKing'?'wukong':id.toLowerCase(),riotId:id,name:c.name,tags:c.tags,source,
      abilities:[{name:c.passive.name,text:c.passive.description},...c.spells.map(s=>({name:s.name,text:s.description}))]});
  }
}));
champions.sort((a,b)=>a.name.localeCompare(b.name));
const dest=new URL('../data/',import.meta.url);await mkdir(dest,{recursive:true});
await writeFile(new URL('champions.json',dest),JSON.stringify({version,source:`${base}/data/en_US/champion.json`,champions},null,2)+'\n');
console.log(`Imported ${champions.length} champion kits for ${version}. Review profiles before publishing a new patch.`);
