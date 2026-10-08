import express from 'express';
import {connect} from './server/db.js';
import {createApp} from './server/app.js';

// Vercel recognizes this root Express entry point. Reuse the pool per instance;
// schema changes and seeding run in vercel-build, never during an API request.
const app=express();
let ready:Promise<ReturnType<typeof createApp>>|undefined;
app.use(async(req,res,next)=>{
 try{
  ready??=connect().then(db=>createApp(db)).catch(error=>{ready=undefined;throw error});
  (await ready)(req,res,next);
 }catch{
  res.status(503).json({success:false,error:{code:'SERVICE_UNAVAILABLE',message:'GRAM-PULSE could not connect to its database. Please retry.'}});
 }
});
export default app;
