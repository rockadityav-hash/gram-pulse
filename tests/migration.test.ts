import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {migrate,type DB} from '../server/db.js';

test('hosted migrations isolate existing public users and survive redeployment',async()=>{
 delete process.env.DATABASE_URL;delete process.env.POSTGRES_URL;
 const client=new PGlite();await client.waitReady;
 const wrap=(connection:Pick<PGlite,'query'>):DB=>({
  query:async<T>(sql:string,params:unknown[]=[]) => (await connection.query<T>(sql,params)).rows,
  transaction:fn=>client.transaction(tx=>fn(wrap(tx))),close:()=>client.close(),
 });
 const db=wrap(client);
 try{
  await db.query('CREATE TABLE public.users(id integer PRIMARY KEY, note text)');
  await db.query("INSERT INTO public.users VALUES(1,'existing data')");
  await db.query('SET search_path TO gram_pulse');
  await migrate(db,true);
  await db.query("INSERT INTO villages(id,data) VALUES('preserved','{}')");
  await migrate(db,true);
  assert.deepEqual(await db.query('SELECT * FROM public.users'),[{id:1,note:'existing data'}]);
  assert.deepEqual(await db.query('SELECT version FROM schema_migrations ORDER BY version'),[{version:1},{version:2}]);
  assert.equal((await db.query('SELECT id FROM villages')).length,1);
  assert.equal((await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='gram_pulse' AND table_name='uploads' AND column_name='content'")).length,1);
  assert.equal((await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='gram_pulse' AND table_name='users' AND column_name='password_hash'")).length,1);
 }finally{await db.close()}
});
