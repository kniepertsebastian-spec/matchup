import assert from 'node:assert/strict';
import {createStore,readSeed,importDocuments} from '../lib/store.mjs';
if(process.env.INTEGRATION_TEST!=='1')throw Error('Only run against a disposable integration database (INTEGRATION_TEST=1).');
const store=await createStore({mode:'mariadb'});
try{
 assert.equal((await store.pool.query('SELECT COUNT(*) AS n FROM matchups'))[0].n,132);
 const row=(await store.pool.query("SELECT payload FROM documents WHERE id='equipment'"))[0];
 try{
  const marker={...JSON.parse(row.payload),integrationMarker:'preserve-on-restart'};
  await store.pool.query("UPDATE documents SET payload=? WHERE id='equipment'",[JSON.stringify(marker)]);
  const restarted=await createStore({mode:'mariadb'});
  try{assert.equal(restarted.documents.equipment.integrationMarker,'preserve-on-restart');}finally{await restarted.close();}
  await importDocuments(store.pool,await readSeed(),{overwrite:true});
  const updated=JSON.parse((await store.pool.query("SELECT payload FROM documents WHERE id='equipment'"))[0].payload);
  assert.equal(updated.integrationMarker,undefined);
 }finally{await store.pool.query("UPDATE documents SET payload=? WHERE id='equipment'",[row.payload]);}
 const status=await(await fetch('http://127.0.0.1:8080/api/status')).json();assert.equal(status.storage,'mariadb');assert.equal(status.matchups,132);
 const health=await fetch('http://127.0.0.1:8080/health');assert.equal(health.status,200);
 console.log('MariaDB stack passed: schema, 132 imported rows, persisted edits, explicit reimport, API and readiness.');
}finally{await store.close();}
