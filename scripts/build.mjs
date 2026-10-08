import {build} from 'esbuild';
await build({entryPoints:['public/api-client.ts'],outfile:'public/api-client.js',bundle:true,format:'iife',target:'es2022'});
