import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createStore,context} from './lib/store.mjs';
import {profile,traitLabels} from './lib/profiles.mjs';
import {recommend,InputError} from './lib/recommend.mjs';
import {filterMatchups} from './dist/model.js';
const store=await createStore();
const data=context(store.documents);
export const closeStore=()=>store.close();
const aliases={'/data.json':'olaf-top','/warwick.json':'warwick-top','/olaf-adc.json':'olaf-adc','/olaf-mid.json':'olaf-mid','/olaf-jungle.json':'olaf-jungle','/equipment.json':'equipment','/loadouts.json':'loadouts'};
function sendJSON(req,res,value,status=200){
 const body=JSON.stringify(value),etag='"'+createHash('sha256').update(body).digest('hex')+'"';
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-cache');res.setHeader('ETag',etag);
 if(status===200&&req.headers['if-none-match']===etag){res.writeHead(304);return res.end();}
 res.writeHead(status);res.end(req.method==='HEAD'?undefined:body);
}
async function readJSON(req){
 if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw new InputError('JSON erforderlich.');
 let length=0;const chunks=[];
 for await(const chunk of req){length+=chunk.length;if(length>16384)throw new InputError('Anfrage zu groß.');chunks.push(chunk);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new InputError('Ungültiges JSON.');}
}
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const mime={'.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
export const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  try {
    const url=new URL(req.url,'http://localhost');
    const pathname=decodeURIComponent(url.pathname);
    if(pathname==='/api/recommendations'&&req.method==='POST')return sendJSON(req,res,recommend(await readJSON(req),data));
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
    if(pathname==='/health'){
      try{await store.health();res.writeHead(200,{'Content-Type':'text/plain','Cache-Control':'no-store'});return res.end(req.method==='HEAD'?undefined:'ok');}
      catch{return sendJSON(req,res,{error:'Datenbank nicht erreichbar.'},503);}
    }
    if(pathname==='/api/status')return sendJSON(req,res,{storage:store.mode,patch:data.equipment.patch,version:data.champions.version,champions:data.champions.champions.length,matchups:Object.values(data.collections).reduce((n,c)=>n+c.matchups.length,0)});
    if(pathname==='/api/champions')return sendJSON(req,res,{version:data.champions.version,traits:traitLabels,champions:data.champions.champions.map(profile)});
    if(pathname==='/api/matchups'){
      const key=url.searchParams.get('collection')||'olaf-top';
      const collection=Object.hasOwn(data.collections,key)?data.collections[key]:null;
      if(!collection)throw new InputError('Unbekannte Sammlung.');
      return sendJSON(req,res,filterMatchups(collection.matchups,{q:(url.searchParams.get('q')||'').slice(0,100),tier:url.searchParams.get('tier')||''}));
    }
    if(aliases[pathname])return sendJSON(req,res,store.documents[aliases[pathname]]);
    if(pathname.startsWith('/api/collections/')){
      const key=pathname.slice('/api/collections/'.length);
      const collection=Object.hasOwn(data.collections,key)?data.collections[key]:null;
      if(!collection)return sendJSON(req,res,{error:'Sammlung nicht gefunden.'},404);
      return sendJSON(req,res,collection);
    }
    const relative=pathname==='/'?'index.html':pathname.slice(1);
    const target=path.resolve(root,relative);
    if(!target.startsWith(root)||relative.includes('\\')){res.writeHead(403);return res.end();}
    const bytes=await readFile(target);
    res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:bytes);
  }catch(error){
    if(error instanceof InputError||error instanceof URIError)return sendJSON(req,res,{error:error.message},400);
    if(error.code==='ENOENT'||error.code==='EISDIR'){res.writeHead(404);return res.end('Nicht gefunden');}
    console.error('Request failed:',error.message);sendJSON(req,res,{error:'Anfrage konnte nicht verarbeitet werden.'},500);
  }
});
server.requestTimeout=10000;server.headersTimeout=10000;
if(process.argv[1]===fileURLToPath(import.meta.url)){
 server.listen(Number(process.env.PORT||8080),process.env.HOST||'127.0.0.1',()=>console.log(`Matchups (${store.mode}): http://localhost:${process.env.PORT||8080}`));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(async()=>{await closeStore();process.exit(0);}));
}
