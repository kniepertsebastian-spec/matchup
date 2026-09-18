import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export const files={
 'olaf-top':'dist/data.json','warwick-top':'dist/warwick.json','olaf-adc':'dist/olaf-adc.json',
 equipment:'dist/equipment.json',loadouts:'dist/loadouts.json',champions:'data/champions.json'
};
const root=new URL('../',import.meta.url);
export async function readSeed(){
 return Object.fromEntries(await Promise.all(Object.entries(files).map(async([key,file])=>[key,JSON.parse(await readFile(new URL(file,root),'utf8'))])));
}
export function context(documents){return {champions:documents.champions,equipment:documents.equipment,loadouts:documents.loadouts,collections:Object.fromEntries(['olaf-top','warwick-top','olaf-adc'].map(k=>[k,documents[k]]))};}
async function password(){return process.env.DB_PASSWORD_FILE?(await readFile(process.env.DB_PASSWORD_FILE,'utf8')).trim():process.env.DB_PASSWORD;}
export async function createStore({mode=process.env.STORAGE||'files'}={}){
 if(!['files','mariadb'].includes(mode))throw Error('STORAGE must be files or mariadb');
 if(mode==='files'){const documents=await readSeed();return {mode,documents,health:async()=>true,close:async()=>{}};}
 const {default:mariadb}=await import('mariadb');
 const pool=mariadb.createPool({host:process.env.DB_HOST||'db',port:Number(process.env.DB_PORT||3306),
  user:process.env.DB_USER||'matchup',password:await password(),database:process.env.DB_NAME||'matchup',
  connectionLimit:5,connectTimeout:5000,acquireTimeout:8000,bigIntAsNumber:true,jsonStrings:true});
 try{
  await pool.query(`CREATE TABLE IF NOT EXISTS documents (
   id VARCHAR(40) PRIMARY KEY, payload LONGTEXT NOT NULL CHECK(JSON_VALID(payload)),
   seed_hash CHAR(64) NOT NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await pool.query(`CREATE TABLE IF NOT EXISTS matchups (
   collection_id VARCHAR(40) NOT NULL, slug VARCHAR(80) NOT NULL, name VARCHAR(100) NOT NULL,
   tier CHAR(1) NOT NULL, payload LONGTEXT NOT NULL CHECK(JSON_VALID(payload)),
   PRIMARY KEY(collection_id,slug), INDEX matchup_name(collection_id,name), INDEX matchup_tier(collection_id,tier)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  // Import once. Deployments never silently overwrite edited database contents.
  // Explicit updates use scripts/import-data.mjs and one transaction.
  const seed=await readSeed();
  await importDocuments(pool,seed,{overwrite:false});
  const documents=Object.fromEntries((await pool.query('SELECT id,payload FROM documents')).map(r=>[r.id,JSON.parse(r.payload)]));
  for(const key of Object.keys(files))if(!documents[key])throw Error(`Missing database document: ${key}`);
  return {mode,documents,pool,health:async()=>{await pool.query('SELECT 1');return true;},close:()=>pool.end()};
 }catch(error){await pool.end();throw error;}
}
export async function importDocuments(pool,documents,{overwrite=false}={}){
 const connection=await pool.getConnection();
 try{
  await connection.beginTransaction();
  for(const [id,doc]of Object.entries(documents)){
   const payload=JSON.stringify(doc),hash=createHash('sha256').update(payload).digest('hex');
   const sql=overwrite?'INSERT INTO documents(id,payload,seed_hash) VALUES(?,?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload),seed_hash=VALUES(seed_hash)':'INSERT IGNORE INTO documents(id,payload,seed_hash) VALUES(?,?,?)';
   const result=await connection.query(sql,[id,payload,hash]);
   if(doc.matchups&&(overwrite||result.affectedRows>0)){
    await connection.query('DELETE FROM matchups WHERE collection_id=?',[id]);
    await connection.batch('INSERT INTO matchups(collection_id,slug,name,tier,payload) VALUES(?,?,?,?,?)',doc.matchups.map(m=>[id,m.slug,m.name,m.tier,JSON.stringify(m)]));
   }
  }
  await connection.commit();
 }catch(error){await connection.rollback();throw error;}finally{connection.release();}
}
