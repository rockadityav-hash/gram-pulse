import {connect,migrate} from './db.js';
import {seed} from './seed.js';

if(!process.env.DATABASE_URL&&!process.env.POSTGRES_URL)throw new Error('Connect a PostgreSQL database and set DATABASE_URL before deploying.');
const db=await connect();
try{
 await migrate(db);
 await db.transaction(async tx=>{
  await tx.query('SELECT pg_advisory_xact_lock(73428012)');
  // The seed helper's transaction runs inside this transaction to make
  // concurrent first deployments idempotent without using another connection.
  await seed({...tx,transaction:fn=>fn(tx)});
 });
 console.log('Deployment database is ready. Existing records were preserved.');
}finally{await db.close()}
