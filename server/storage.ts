import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {dataDir,type DB} from './db.js';

// PostgreSQL stores small private demo images on Vercel. This keeps access
// checks intact and avoids non-durable function filesystem writes.
export async function storeImage(db:DB,id:string,userId:string,content:Buffer){
 const filename=id+'.webp';
 const durable=process.env.VERCEL==='1'||process.env.UPLOAD_STORAGE==='database';
 if(!durable){await mkdir(path.join(dataDir,'uploads'),{recursive:true});await writeFile(path.join(dataDir,'uploads',filename),content,{flag:'wx'});}
 await db.query('INSERT INTO uploads(id,user_id,path,mime,size,content) VALUES($1,$2,$3,$4,$5,$6)',[id,userId,filename,'image/webp',content.length,durable?content:null]);
}
export async function readImage(db:DB,id:string,filename:string){
 const [row]=await db.query<{content:Uint8Array|null}>('SELECT content FROM uploads WHERE id=$1',[id]);
 if(row?.content)return Buffer.from(row.content);
 return readFile(path.join(dataDir,'uploads',filename));
}
