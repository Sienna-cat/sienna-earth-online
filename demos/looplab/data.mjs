export const DATASET_VERSION='synthetic-v1';
// Fully synthetic fixtures. Gold labels stay separate from inference inputs.
const cases=[
 ['浙江省杭州市余杭区演示路12号3单元602室','标准地址',true],
 ['四川省成都市锦江区示例街18号2栋','标准地址',true],
 ['上海市浦东新区演示路88号5室','直辖市',true],
 ['北京市海淀区示例街16号','直辖市',true],
 ['广东省深圳市南山区演示路28号','标准地址',true],
 ['江苏省南京市鼓楼区示例路6号','标准地址',true],
 ['浙江省杭州市西湖区演示巷33号','标准地址',true],
 ['四川省成都市武侯区示例路39号','标准地址',true],
 ['浙江省 杭州市 余杭区 演示路 12号','文本规范化',true,'浙江省杭州市余杭区演示路12号'],
 ['浙江省杭州市鱼杭区演示路26号','音近字纠错',true,'浙江省杭州市余杭区演示路26号','确认是余杭区，演示路26号'],
 ['四川省成都市锦姜区示例路18号','音近字纠错',true,'四川省成都市锦江区示例路18号','确认锦江区，示例路18号'],
 ['浙江省杭州市西胡区演示路31号','证据不足',false,'','只有自动转写，尚未确认'],
 ['四川省杭州市余杭区演示路12号','行政区冲突',false,''],
 ['广东省成都市锦江区示例路18号','行政区冲突',false,''],
 ['浙江省杭州市余杭区','缺门牌',false,'浙江省杭州市余杭区'],
 ['四川省成都市锦江区演示路','缺门牌',false,'四川省成都市锦江区演示路'],
 ['','空地址',false,''],
 ['未提及','占位词',false,''],
 ['浙江省杭州市西湖区演示路30号','通话更正',false,'','不是这个地址，更正后需要再确认'],
 ['上海市浦东新区演示路88号','工具失败',false,'', '',true],
 ['浙江省杭州市余杭区西湖区演示路10号','多个候选',false,''],
 ['湖北省武汉市江岸区示例路12号','参考库外',false,''],
 ['杭州市余杭区演示路12号','省份缺失',false,''],
 ['广东省深圳市南山区示例路50号','字段冲突',false,'','','', '四川省'],
];
export const orders=cases.map((r,i)=>({id:`DEMO-${String(i+1).padStart(3,'0')}`,address:r[0],category:r[1],transcript:r[4]||'',toolError:Boolean(r[5]),province:r[6]||''}));
export const gold=Object.fromEntries(cases.map((r,i)=>[orders[i].id,{auto:r[2],address:r[3]===''?null:(r[3]??r[0]),originalCorrect:r[2]&&r[3]===undefined}]));

function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function createCustomers() {
  const rand=random(20261119),provinces=['浙江','四川','广东','江苏','重庆','山东','河南','湖南'],operators=['移动','联通','电信'],eras=['早期','中期','近期'];
  return Array.from({length:6000},(_,i)=>{
    const province=provinces[Math.floor(rand()*provinces.length)],operator=operators[Math.floor(rand()*3)],era=eras[Math.floor(rand()*3)];
    const split=i<3600?'train':i<4800?'validation':'test';
    let p=0.045+(province==='浙江'||province==='四川'?0.065:0)+(operator==='电信'?0.025:0);
    if(split==='train'&&era==='近期')p+=0.035;
    if(split!=='train'&&era==='近期')p-=0.009;
    const order=Number(rand()<p),intent=Boolean(order)||rand()<0.22,connect=intent||rand()<0.62;
    return {id:`SYN-${i+1}`,province,operator,era,split,order,intent,connect};
  });
}
export const customers=createCustomers();
export const historical=[{name:'省份 × 运营商',dimensions:'二维',train:1.560155502510567,test:1.2713861504362072,coverage:0.15783223340561802,decay:-0.1850901090370022},{name:'省份 × 运营商 × 号段世代',dimensions:'三维',train:1.6608187045743237,test:1.1689671001558937,coverage:0.21762672219801136,decay:-0.296150087341709}];
