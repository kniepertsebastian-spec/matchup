import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {server,closeStore} from '../server.mjs';
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
after(async()=>{await new Promise(resolve=>server.close(resolve));await closeStore();});
test('collection API, normalized search, ETags and full champion roster',async()=>{
 const response=await fetch(base+'/api/collections/olaf-top');assert.equal(response.status,200);assert.equal((await response.json()).matchups.length,51);
 assert.equal((await fetch(base+'/api/collections/olaf-top',{headers:{'If-None-Match':response.headers.get('etag')}})).status,304);
 assert.equal((await(await fetch(base+'/api/matchups?q=cho%20gath')).json())[0].slug,'chogath');
 assert.equal((await(await fetch(base+'/api/champions')).json()).champions.length,173);
 assert.equal((await fetch(base+'/api/collections/invalid')).status,404);
 assert.equal((await fetch(base+'/api/matchups?collection=invalid')).status,400);
});
test('recommendation API accepts a team and rejects malformed or excessive input',async()=>{
 const post=body=>fetch(base+'/api/recommendations',{method:'POST',headers:{'Content-Type':'application/json'},body});
 const response=await post(JSON.stringify({collection:'warwick-top',matchup:'aatrox',focus:'teamfight',allyAntiheal:false,enemies:[{id:'aatrox',role:'top',weight:1}]}));
 assert.equal(response.status,200);assert.equal((await response.json()).build.length,5);
 assert.equal((await post('{')).status,400);assert.equal((await post('x'.repeat(17000))).status,400);
 assert.equal((await post(JSON.stringify({collection:'missing'}))).status,400);
 assert.equal((await fetch(base+'/api/recommendations',{method:'POST',body:'{}'})).status,400);
 assert.equal((await fetch(base+'/secrets/db_password')).status,404);
 assert.equal((await fetch(base+'/data/champions.json')).status,404);
});
