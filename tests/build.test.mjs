import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {validate,totals,toCard,build} from '../skills/trip-site/scripts/build.mjs';
const example=JSON.parse(fs.readFileSync(new URL('../skills/trip-site/assets/example.json',import.meta.url),'utf8'));
const copy=()=>structuredClone(example);
test('混合全团与人均预算按分计算，未知不当免费',()=>assert.deepEqual(totals(example),{low:2000000,high:2760000,unknown:1}));
test('重复 ID 与失效日程引用被拒绝',()=>{let d=copy();d.days[1].id=d.days[0].id;assert.throws(()=>validate(d));d=copy();d.days[0].spotIds=['missing'];assert.throws(()=>validate(d));});
test('非法人数、错序预算和越界坐标被拒绝',()=>{for(const mutate of [d=>d.meta.people=0,d=>d.budget[0].high=-1,d=>d.spots[0].lat=100]){const d=copy();mutate(d);assert.throws(()=>validate(d));}});
test('允许未知坐标与单点、空路线日；不导出错误坐标系',()=>{const d=copy();d.spots[0].lat=null;d.spots[0].lng=null;d.days[0].spotIds=[];d.days[1].spotIds=[d.spots[0].id];assert.doesNotThrow(()=>validate(d));assert.equal(toCard(d).days[1].items[0].lat,undefined);});
test('兼容卡片不将预算写成实际 AA 付款',()=>{const card=toCard(example);assert.deepEqual(card.costs,[]);assert.equal(card.days.length,example.days.length);assert.equal(card.people,example.meta.people);});
test('脚本结束标签与替换字符串安全，输出自包含两页',()=>{const d=copy();d.meta.title='测试 </script><script>alert(1)</script> $&';const out=fs.mkdtempSync(path.join(os.tmpdir(),'trip-site-test-'));try{build(d,out);const h=fs.readFileSync(path.join(out,'index.html'),'utf8');assert.ok(!h.includes('测试 </script>'));assert.ok(h.includes('\\u003c/script>'));assert.ok(h.includes('$&'));assert.ok(fs.statSync(path.join(out,'card.html')).size>100000);assert.ok(!h.includes('/*__DATA__*/'));}finally{assert.equal(path.dirname(path.resolve(out)),path.resolve(os.tmpdir()));assert.ok(path.basename(out).startsWith('trip-site-test-'));fs.rmSync(out,{recursive:true});}});

