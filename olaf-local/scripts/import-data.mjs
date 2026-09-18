import {createStore,readSeed,importDocuments} from '../lib/store.mjs';
if(process.argv[2]!=='--replace')throw Error('Explicit replacement requires --replace. Back up the database first.');
const store=await createStore({mode:'mariadb'});
try{await importDocuments(store.pool,await readSeed(),{overwrite:true});console.log('Imported seed data. Restart web to refresh its snapshot.');}finally{await store.close();}
