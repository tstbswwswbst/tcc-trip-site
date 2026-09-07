import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const assets=path.resolve(here,'../assets');
export function validate(d){
  const fail=m=>{throw new Error(m)};
  if(!d.meta?.title || !Number.isInteger(d.meta.people)||d.meta.people<1) fail('meta.title / people 无效');
  for(const k of ['cities','spots','days','transport','stays','budget','tips']) if(!Array.isArray(d[k]))fail(k+' 必须是数组');
  for(const k of ['cities','spots','days']) {const ids=new Set();for(const x of d[k]){if(typeof x.id!=='string'||!x.id||ids.has(x.id))fail(k+' id 缺失/重复');ids.add(x.id);}}
  if(!d.days.length)fail('至少需要一天');
  const ci=new Set(d.cities.map(c=>c.id)),si=new Set(d.spots.map(s=>s.id));
  for(const c of d.cities)if(!/^#[0-9a-f]{6}$/i.test(c.color))fail('城市 color 应为 #RRGGBB');
  for(const s of d.spots){
    if(!ci.has(s.city))fail('地点 city 不存在: '+s.id);
    if((s.lat==null)!==(s.lng==null))fail('经纬度须同时提供');
    if(s.lat!=null && (typeof s.lat!=='number'||typeof s.lng!=='number'||!Number.isFinite(s.lat)||!Number.isFinite(s.lng)||Math.abs(s.lat)>90||Math.abs(s.lng)>180))fail('经纬度越界: '+s.id);
    if(!['GCJ-02','WGS84','unknown'].includes(s.coordSystem))fail('坐标系无效: '+s.id);
  }
  for(const day of d.days){if(!ci.has(day.city)||!Array.isArray(day.spotIds)||day.spotIds.some(id=>!si.has(id))||!Array.isArray(day.timeline))fail('日程引用无效: '+day.id);}
  for(const b of d.budget){if(!['person','group'].includes(b.basis))fail('预算 basis 无效');if((b.low==null)!==(b.high==null))fail('预算上下界须同时提供');if(b.low!=null&&(!Number.isFinite(b.low)||!Number.isFinite(b.high)||b.low<0||b.high<b.low))fail('预算金额无效');}
  return d;
}
export function totals(d){return d.budget.reduce((a,b)=>{if(b.low==null){a.unknown++;return a;}const m=b.basis==='person'?d.meta.people:1;a.low+=Math.round(b.low*100)*m;a.high+=Math.round(b.high*100)*m;return a;},{low:0,high:0,unknown:0});}
export function toCard(d){return {v:1,title:d.meta.title,start:d.meta.start||'',end:d.meta.end||'',people:d.meta.people,brand:'Trip Site · 随身摘要',ctaUrl:'index.html',transport:d.transport.map(t=>({type:t.mode,from:t.from,to:t.to,note:[t.duration,t.price,t.note].filter(Boolean).join(' · ')})),stays:d.stays.map(s=>({name:s.name,note:[s.price,s.note].filter(Boolean).join(' · ')})),days:d.days.map((day,i)=>({label:'Day '+(i+1)+' · '+day.title,date:day.date,items:day.spotIds.map(id=>{const s=d.spots.find(x=>x.id===id);return {name:s.name,note:[s.ticket,s.hours,s.description].filter(Boolean).join(' · '),...(s.coordSystem==='GCJ-02'&&s.lat!=null?{lat:s.lat,lng:s.lng}:{})};})})),costs:[],notes:[d.meta.notice||'', '预算不是实际支出，未导入 AA 账单。',...d.tips].filter(Boolean)};}
export function build(d,out){
  validate(d);fs.mkdirSync(out,{recursive:true});
  const json=JSON.stringify(d).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const template=fs.readFileSync(path.join(assets,'template.html'),'utf8');
  const render=fs.readFileSync(path.join(assets,'render.js'),'utf8');
  const css=fs.readFileSync(path.join(assets,'leaflet.css'),'utf8')+'\n'+fs.readFileSync(path.join(assets,'style.css'),'utf8');
  const leaflet=fs.readFileSync(path.join(assets,'leaflet.js'),'utf8').replace(/\/\/# sourceMappingURL=.*$/m,'');
  const make=card=>template.replace('/*__CSS__*/',()=>css).replace('/*__DATA__*/',()=>`const TRIP_DATA=${json}; const CARD_MODE=${card};`).replace('/*__RENDER__*/',()=>render).replace('/*__LEAFLET__*/',()=>leaflet);
  fs.writeFileSync(path.join(out,'index.html'),make(false));
  fs.writeFileSync(path.join(out,'card.html'),make(true));
  fs.copyFileSync(path.join(assets,'LEAFLET-LICENSE.txt'),path.join(out,'LEAFLET-LICENSE.txt'));
  fs.copyFileSync(path.join(here,'../LICENSE'),path.join(out,'LICENSE'));
  fs.writeFileSync(path.join(out,'trip-card.json'),JSON.stringify(toCard(d),null,2));
  const warnings=d.spots.filter(s=>!s.sourceUrl||!s.checkedAt||!s.coordinateSource||s.lat==null||s.coordSystem!=='GCJ-02').map(s=>s.name+'：来源、核查日期或可用坐标未完整');
  if(totals(d).unknown)warnings.push('预算含未知项目，只能展示已知费用小计');
  fs.writeFileSync(path.join(out,'build-report.json'),JSON.stringify({title:d.meta.title,days:d.days.length,spots:d.spots.length,budgetCents:totals(d),warnings},null,2));
  return {out,warnings};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const [input,out]=process.argv.slice(2);if(!input||!out)throw new Error('用法: node build.mjs trip.json output-directory');console.log(JSON.stringify(build(JSON.parse(fs.readFileSync(input,'utf8')),path.resolve(out)),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}

