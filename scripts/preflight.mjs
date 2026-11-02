import { loadEnv } from 'vite';
Object.assign(process.env, loadEnv('development', process.cwd(), ''));
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const files = ['package.json','src/router.jsx','src/store/useAppStore.js','api/agent.js','api/tour.js','api/weather.js','api/heritage.js','server/tour.js','server/weather.js','server/heritage.js','supabase/schema.sql'];
let failed = 0;
for (const file of files) {if (!existsSync(file)) {console.error('MISSING',file);failed++;} else console.log('FOUND',file);}
for(const file of files.filter(f=>f.endsWith('.js') && existsSync(f))) {try{execFileSync('node',['--check',file],{stdio:'pipe'});console.log('SYNTAX OK',file);}catch{console.error('SYNTAX ERROR',file);failed++;}}
const gitignore=readFileSync('.gitignore','utf8');
if(!gitignore.includes('*.local')){console.error('CHECK .env.local ignore');failed++}
const keys=['DATA_GO_KR_KEY','ANTHROPIC_API_KEY','VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY'];
for(const k of keys) console.log('ENV',k,process.env[k]?'CONFIGURED':'MISSING');
console.log('DEPENDENCIES',existsSync('node_modules/.bin/vite')?'INSTALLED':'NOT INSTALLED');
process.exitCode=failed?1:0;
