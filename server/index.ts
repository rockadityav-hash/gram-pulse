import {connect,migrate} from './db.js';
import {createApp} from './app.js';
const db=await connect();await migrate(db);
const server=createApp(db).listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('GRAM-PULSE ready at '+(process.env.APP_ORIGIN||'http://localhost:3000')));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{void db.close().then(()=>process.exit(0))}));
