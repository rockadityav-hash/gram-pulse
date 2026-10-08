import 'dotenv/config';
import {PGlite} from '@electric-sql/pglite';
import pg from 'pg';
import {mkdir,readFile} from 'node:fs/promises';
import path from 'node:path';
export interface DB {query<T=Record<string,unknown>>(sql:string,params?:unknown[]):Promise<T[]>;transaction<T>(fn:(db:DB)=>Promise<T>):Promise<T>;close():Promise<void>}
export const dataDir=path.resolve(process.env.DATA_DIR||'data');
export async function connect():Promise<DB>{
 if(process.env.DATABASE_URL){const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:10});const wrap=(client:pg.Pool|pg.PoolClient):DB=>({query:async<T>(sql:string,params:unknown[]=[])=> (await client.query(sql,params)).rows as T[],transaction:async fn=>{const c=await pool.connect();try{await c.query('BEGIN');const result=await fn(wrap(c));await c.query('COMMIT');return result}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}},close:()=>pool.end()});return wrap(pool)}
 await mkdir(dataDir,{recursive:true});const p=new PGlite(path.join(dataDir,'postgres'));await p.waitReady;
 const wrap=(client:Pick<PGlite,'query'>):DB=>({query:async<T>(sql:string,params:unknown[]=[])=> (await client.query<T>(sql,params)).rows,transaction:fn=>p.transaction(t=>fn(wrap(t))),close:()=>p.close()});return wrap(p);
}
export async function migrate(db:DB){const exists=await db.query<{table_name:string}>("SELECT table_name FROM information_schema.tables WHERE table_name='schema_migrations'");if(exists.length)return;const sql=await readFile(path.resolve('migrations/001_initial.sql'),'utf8');await db.transaction(async tx=>{for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await tx.query(statement)});}
