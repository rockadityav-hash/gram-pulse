import {scrypt,randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import type {DB} from './db.js';
import type {User} from '../shared/models.js';
const derive=promisify(scrypt);
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const key=await derive(password,salt,64) as Buffer;return `${salt}:${key.toString('hex')}`;}
export async function verifyPassword(password:string,hash:string){const[salt,hex]=hash.split(':');if(!salt||!hex)return false;const key=await derive(password,salt,64) as Buffer;const expected=Buffer.from(hex,'hex');return expected.length===key.length&&timingSafeEqual(key,expected);}
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export const token=()=>randomBytes(32).toString('hex');
export async function session(db:DB,value:string|undefined){if(!value)return null;const rows=await db.query<User&{csrf:string}>(`SELECT u.id,u.name,u.email,u.role,u.village_id AS "villageId",u.disabled,s.csrf FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND NOT u.disabled`,[tokenHash(value)]);return rows[0]||null;}
