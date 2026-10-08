import {connect,migrate} from './db.js';
import {seed} from './seed.js';
const db=await connect();try{await migrate(db);if(process.argv[2]==='seed')console.log(await seed(db)?'Demo database seeded.':'Database already seeded; no records overwritten.');else console.log('Migrations applied.');}finally{await db.close()}
