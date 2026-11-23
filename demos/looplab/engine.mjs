const regions = [
  ['浙江省','杭州市','余杭区'],['浙江省','杭州市','西湖区'],
  ['四川省','成都市','锦江区'],['四川省','成都市','武侯区'],
  ['上海市','上海市','浦东新区'],['江苏省','南京市','鼓楼区'],
  ['广东省','深圳市','南山区'],['北京市','北京市','海淀区'],
];
const typos = {'鱼杭区':'余杭区','西胡区':'西湖区','锦姜区':'锦江区'};
const normalized = value => String(value ?? '').replace(/\s/g,'');
const ratio = (n,d) => d ? n/d : null;

// A bounded, transparent demo adapter. No map/audio service is called.
export function checkAddress(record, version='v2') {
  const original=String(record.address ?? '');
  let suggested=normalized(original);
  const trace=[{step:'输入保全',text:`保留订单 ${record.id} 的原始值；空地址也保留。`,state:'ok'}];
  const finish=(status,reason)=>({id:record.id,status,suggested,original,changed:normalized(original)!==suggested,reasons:[reason],trace:[...trace,{step:'分流决策',text:reason,state:status==='pass'?'ok':'warn'}]});
  if (!suggested || /^(未知|不详|未提及)$/.test(suggested)) return finish('review','地址缺失，需回拨补采');
  trace.push({step:'文本规范化',text:'清理空白，保留楼栋、单元、门牌。',state:'ok'});
  if (record.toolError && version==='v2') return finish('retry','模拟依赖失败，等待重试；未完成外部核验');
  if (version==='v1') {
    for (const [wrong,right] of Object.entries(typos)) suggested=suggested.replaceAll(wrong,right);
    return /\d+(号|栋|幢|室)/.test(suggested) ? finish('pass','基础字段通过；未交叉核验行政区与通话证据') : finish('review','详细地址不足，需要补充门牌');
  }
  for (const [wrong,right] of Object.entries(typos)) {
    if (!suggested.includes(wrong)) continue;
    suggested=suggested.replaceAll(wrong,right);
    if (!normalized(record.transcript).includes(right)) return finish('review',`发现音近候选「${right}」，缺少确认依据`);
    trace.push({step:'音近字证据',text:`${wrong} → ${right}；通话文本包含确认地名。`,state:'ok'});
  }
  const matches=regions.filter(([, ,district])=>suggested.includes(district));
  if (matches.length!==1) return finish('review',matches.length?'出现多个区县，需要确认最终地址':'超出内置 8 个区县样例范围，需人工核实');
  const [province,city,district]=matches[0];
  const knownProvinces=[...new Set(regions.map(r=>r[0]))];
  const knownCities=[...new Set(regions.map(r=>r[1]))];
  const incompatible=knownProvinces.some(p=>p!==province&&suggested.includes(p)) || knownCities.some(c=>c!==city&&suggested.includes(c)) || (record.province&&normalized(record.province)!==province) || (record.city&&normalized(record.city)!==city) || (record.district&&normalized(record.district)!==district);
  if (incompatible) return finish('invalid','省市区或结构化字段存在冲突，不能自动放行');
  if (!suggested.includes(province)||!suggested.includes(city)) return finish('review','省市信息不完整，需要确认归属');
  trace.push({step:'行政区交叉校验',text:`${province} / ${city} / ${district} 与内置参考一致。`,state:'ok'});
  if (/更正|改成|另一个|不是|两个地址/.test(record.transcript||'')) return finish('review','通话中存在更正或否定，需人工确认最终收货地');
  if (!/\d+(号|栋|幢|室)/.test(suggested)) return finish('review','缺少门牌或楼栋信息，不补造地址');
  trace.push({step:'详细地址检查',text:'保留输入中的数字及门牌；未调用地图验证地点存在性。',state:'ok'});
  return finish('pass','内置规则通过，可进入演示放行队列');
}

export function evaluateOrders(records,predictions,gold={}) {
  let auto=0, labeled=0, reviewedAuto=0, errors=0, problematic=0,caught=0,changed=0,correctChanges=0,originalGood=0,falseChanges=0;
  records.forEach((r,i)=>{
    const p=predictions[i]; if(!p) return;
    if(p.status==='pass') auto++;
    const g=Object.hasOwn(gold,r.id)?gold[r.id]:null; if(!g) return;
    labeled++;
    if(p.status==='pass') {reviewedAuto++; if(!g.auto||normalized(p.suggested)!==normalized(g.address)) errors++;}
    if(!g.auto) {problematic++; if(p.status!=='pass') caught++;}
    if(p.changed&&g.address!==null&&g.address!==undefined) {changed++; if(normalized(p.suggested)===normalized(g.address)) correctChanges++;}
    if(g.originalCorrect) {originalGood++; if(normalized(p.suggested)!==normalized(g.address)) falseChanges++;}
  });
  return {total:records.length,auto,labeled,reviewedAuto,errors,problematic,caught,changed,correctChanges,originalGood,falseChanges,coverage:ratio(auto,records.length),errorRate:ratio(errors,reviewedAuto),recall:ratio(caught,problematic),correctionPrecision:ratio(correctChanges,changed),falseChangeRate:ratio(falseChanges,originalGood)};
}
export function wilson(k,n) {
  if(!n) return null;
  const z=1.96,p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;
  return [Math.max(0,c-h),Math.min(1,c+h)];
}
const groupKey=(r,dimensions)=>[r.province,r.operator,...(dimensions===3?[r.era]:[])].join(' × ');
function validateCustomers(rows) {
  const seen=new Set();
  for(const r of rows) {if(seen.has(r.id)) throw Error('客户标识重复：必须先去重并隔离集合'); seen.add(r.id);}
}
function summarize(rows,keys,config) {
  const picked=rows.filter(r=>keys.has(groupKey(r,config.dimensions)));
  const orders=picked.reduce((n,r)=>n+r.order,0),allOrders=rows.reduce((n,r)=>n+r.order,0);
  const rate=ratio(orders,picked.length),baseline=ratio(allOrders,rows.length);
  return {total:rows.length,allOrders,selected:picked.length,orders,rate,baseline,lift:rate!==null&&baseline>0?rate/baseline:null,coverage:ratio(picked.length,rows.length),interval:wilson(orders,picked.length)};
}
export function developStrategy(customers,config) {
  validateCustomers(customers);
  const cfg={dimensions:Number(config.dimensions),minBase:Number(config.minBase),minLift:Number(config.minLift)};
  if(![2,3].includes(cfg.dimensions)||cfg.minBase<1||!Number.isFinite(cfg.minBase)||cfg.minLift<=0||!Number.isFinite(cfg.minLift)) throw Error('策略参数无效');
  const train=customers.filter(r=>r.split==='train'),validation=customers.filter(r=>r.split==='validation');
  const groups=new Map();
  for(const r of train) {const key=groupKey(r,cfg.dimensions),g=groups.get(key)||{key,total:0,orders:0};g.total++;g.orders+=r.order;groups.set(key,g);}
  const base=ratio(train.reduce((n,r)=>n+r.order,0),train.length);
  const details=[...groups.values()].map(g=>({...g,rate:g.orders/g.total,lift:base>0?(g.orders/g.total)/base:null,eligible:g.total>=cfg.minBase}));
  const selectedKeys=details.filter(g=>g.eligible&&g.lift!==null&&g.lift>=cfg.minLift).map(g=>g.key);
  const keys=new Set(selectedKeys);
  return {config:cfg,selectedKeys,groups:details.sort((a,b)=>(b.lift||0)-(a.lift||0)),train:summarize(train,keys,cfg),validation:summarize(validation,keys,cfg),eligibleCoverage:ratio(details.filter(g=>g.eligible).reduce((n,g)=>n+g.total,0),train.length)};
}
export function testStrategy(customers,frozen) {
  validateCustomers(customers);
  return summarize(customers.filter(r=>r.split==='test'),new Set(frozen.selectedKeys),frozen.config);
}

export function parseAddressCSV(text) {
  if(text.length>1_000_000) throw Error('请导入 1 MB 以内的 CSV');
  const table=[];let row=[],cell='',quoted=false;
  const s=text.replace(/^\uFEFF/,'');
  for(let i=0;i<s.length;i++) {
    const c=s[i];
    if(c==='"') {if(quoted&&s[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(cell);cell='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&s[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))table.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(quoted) throw Error('CSV 引号未闭合');
  row.push(cell);if(row.some(v=>v.trim()))table.push(row);
  const headers=(table.shift()||[]).map(h=>h.trim());
  const addr=headers.indexOf('原始地址'),id=headers.indexOf('订单ID');
  if(addr<0||id<0) throw Error('需要「订单ID」和「原始地址」列，请下载模板');
  if(!table.length) throw Error('文件中没有数据行');
  if(table.length>1000) throw Error('演示版最多导入 1,000 条');
  const seen=new Set();
  return table.map((values,i)=>{
    if(values.length!==headers.length) throw Error(`第 ${i+2} 行列数不一致`);
    const key=values[id].trim();
    if(!key) throw Error(`第 ${i+2} 行订单ID为空`);
    if(seen.has(key)) throw Error(`订单ID重复：${key}`);
    seen.add(key);
    const get=header=>values[headers.indexOf(header)]||'';
    return {id:key,address:values[addr],province:get('省'),city:get('市'),district:get('区县'),transcript:get('通话证据'),category:'本地导入'};
  });
}
