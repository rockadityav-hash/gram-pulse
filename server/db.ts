import 'dotenv/config';
import {PGlite} from '@electric-sql/pglite';
import pg from 'pg';
import {mkdir,readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
export interface DB {query<T=Record<string,unknown>>(sql:string,params?:unknown[]):Promise<T[]>;transaction<T>(fn:(db:DB)=>Promise<T>):Promise<T>;close():Promise<void>}
export const dataDir=path.resolve(process.env.DATA_DIR||'data');
export async function connect():Promise<DB>{
 const connectionString=process.env.DATABASE_URL||process.env.POSTGRES_URL;
 if(connectionString){
  const pool=new pg.Pool({connectionString,max:process.env.VERCEL?3:10,idleTimeoutMillis:5000,connectionTimeoutMillis:10000});
  const transaction:DB['transaction']=async fn=>{
   const client=await pool.connect();
   try{
    await client.query('BEGIN');
    // Transaction-local settings work with Neon's transaction pooler.
    await client.query('SET LOCAL search_path TO gram_pulse');
    const tx:DB={query:async<T>(sql:string,params:unknown[]=[]) => (await client.query(sql,params)).rows as T[],transaction:fn=>fn(tx),close:async()=>{}};
    const result=await fn(tx);await client.query('COMMIT');return result;
   }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
  };
  return {query:<T>(sql:string,params:unknown[]=[])=>transaction(tx=>tx.query<T>(sql,params)),transaction,close:()=>pool.end()};
 }
 if(process.env.VERCEL)throw new Error('DATABASE_URL is required on Vercel; embedded storage is local-only.');
 await mkdir(dataDir,{recursive:true});const p=new PGlite(path.join(dataDir,'postgres'));await p.waitReady;
 const wrap=(client:Pick<PGlite,'query'>):DB=>({query:async<T>(sql:string,params:unknown[]=[])=> (await client.query<T>(sql,params)).rows,transaction:fn=>p.transaction(t=>fn(wrap(t))),close:()=>p.close()});return wrap(p);
}
export async function migrate(db:DB,isolated=Boolean(process.env.DATABASE_URL||process.env.POSTGRES_URL)){await db.transaction(async tx=>{
 if(process.env.DATABASE_URL||process.env.POSTGRES_URL)await tx.query('SELECT pg_advisory_xact_lock(73428011)');
 if(isolated)await tx.query('CREATE SCHEMA IF NOT EXISTS gram_pulse');
 await tx.query('CREATE TABLE IF NOT EXISTS schema_migrations(version integer PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())');
 const applied=new Set((await tx.query<{version:number}>('SELECT version FROM schema_migrations')).map(row=>row.version));
 const files=(await readdir('migrations')).filter(name=>/^\d+_.*\.sql$/.test(name)).sort();
 for(const name of files){if(applied.has(Number(name.split('_')[0])))continue;const sql=await readFile(path.join('migrations',name),'utf8');for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await tx.query(statement);}
});}
