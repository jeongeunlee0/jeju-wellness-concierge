import test from 'node:test';
import assert from 'node:assert/strict';
import { distanceKm,visitInfo } from '../server/visit.js';
import { preparation } from '../src/lib/preparation.js';
test('distance is a straight-line estimate and zero for same coordinates',()=>{assert.equal(distanceKm({lat:33.5,lng:126.5},{lat:33.5,lng:126.5}),0);assert.ok(Math.abs(distanceKm({lat:33.5,lng:126.5},{lat:33.51,lng:126.5})-1.11)<.02)});
test('rain and cool weather produce relevant preparations',()=>{const t=preparation({temp:16,rain:'비',pop:80},{uv:4,grade:'보통'});assert.ok(t.items.includes('우산 또는 우비'));assert.ok(t.clothes.some(x=>x.includes('겉옷')));assert.ok(t.items.includes('모자와 자외선 차단용품'))});
test('missing weather does not invent a temperature recommendation',()=>{assert.ok(preparation(null,null).clothes[0].includes('기온을 확인'));assert.ok(preparation(null,null).cautions.some(x=>x.includes('확인되지 않습니다')))});
test('invalid coordinates and non-numeric attraction IDs never call upstream',async()=>{await assert.rejects(visitInfo({lat:0,lng:0}),/좌표/);await assert.rejects(visitInfo({id:'javascript:bad',lat:33.5,lng:126.5}),/올바르/)});
