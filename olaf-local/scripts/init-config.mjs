import {mkdir,writeFile,copyFile,constants} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const root=new URL('../',import.meta.url);
await mkdir(new URL('secrets/',root),{recursive:true,mode:0o700});
async function create(name,content){try{await writeFile(new URL('secrets/'+name,root),content,{flag:'wx',mode:0o644});}catch(e){if(e.code!=='EEXIST')throw e;}}
// Files are readable by the unprivileged containers; the parent directory is private.
await create('db_password',randomBytes(32).toString('hex'));
await create('db_root_password',randomBytes(32).toString('hex'));
await create('cloudflare_token','');
try{await copyFile(new URL('.env.example',root),new URL('.env',root),constants.COPYFILE_EXCL);}catch(e){if(e.code!=='EEXIST')throw e;}
console.log('Configuration ready. Existing secrets were preserved. Cloudflare profile requires a tunnel token in secrets/cloudflare_token.');
