import {randomBytes} from 'node:crypto';
import {writeFile,access} from 'node:fs/promises';
try{await access('.env');console.log('.env already exists; credentials preserved.')}catch{
const password=randomBytes(18).toString('base64url');
await writeFile('.env',`DATA_DIR=./data\nPORT=3000\nHOST=127.0.0.1\nAPP_ORIGIN=http://localhost:3000\nNODE_ENV=development\nSEED_PASSWORD=${password}\n`,{flag:'wx'});
await writeFile('LOCAL-CREDENTIALS.txt',`GRAM-PULSE local demo credentials\n\nAdmin: admin@gram-pulse.demo\nOfficer: officer@gram-pulse.demo\nCitizen: citizen@gram-pulse.demo\nPassword for seeded accounts: ${password}\n\nChange passwords in Account > Profile. Do not publish this file.\n`,{flag:'wx'});
console.log('Created .env and LOCAL-CREDENTIALS.txt with a generated demo password.');
}
