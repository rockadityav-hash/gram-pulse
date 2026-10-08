import type {ApiResult,Snapshot,User} from '../shared/models.js';
export class ApiError extends Error{constructor(public code:string,message:string,public status:number){super(message)}}
class Client{
 csrf='';user:User|null=null;
 async request<T>(route:string,method='GET',body?:unknown):Promise<T>{
 const headers:Record<string,string>={};if(this.csrf)headers['X-CSRF-Token']=this.csrf;if(body!==undefined)headers['Content-Type']='application/json';
 let response:Response;try{response=await fetch('/api'+route,{method,headers,credentials:'same-origin',body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)})}catch{throw new ApiError('OFFLINE','Unable to connect to GRAM-PULSE services',0)}
 const result=await response.json() as ApiResult<T>;if(!result.success)throw new ApiError(result.error.code,result.error.message,response.status);return result.data;
 }
 async page<T>(route:string):Promise<{data:T[];pagination:{page:number;pageSize:number;total:number}}>{const response=await fetch('/api'+route,{credentials:'same-origin',signal:AbortSignal.timeout(30000)});const result=await response.json() as ApiResult<T[]>;if(!result.success)throw new ApiError(result.error.code,result.error.message,response.status);return{data:result.data,pagination:result.pagination!}}
 async authenticate(){const s=await this.request<{user:User;csrf:string}>('/auth/me');this.user=s.user;this.csrf=s.csrf;return s.user}
 async login(email:string,password:string){const s=await this.request<{user:User;csrf:string}>('/auth/login','POST',{email,password});this.user=s.user;this.csrf=s.csrf;return s.user}
 async logout(){await this.request('/auth/logout','POST');this.user=null;this.csrf=''}
 state(){return this.request<Snapshot>('/state')}
 async upload(file:File){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)throw new ApiError('INVALID_IMAGE','Choose JPEG, PNG or WebP up to 8 MB.',400);const response=await fetch('/api/uploads',{method:'POST',headers:{'Content-Type':file.type,'X-CSRF-Token':this.csrf},body:file,credentials:'same-origin',signal:AbortSignal.timeout(30000)});const result=await response.json() as ApiResult<{id:string;url:string}>;if(!result.success)throw new ApiError(result.error.code,result.error.message,response.status);return result.data}
}
declare global{interface Window{api:Client}}
window.api=new Client();
