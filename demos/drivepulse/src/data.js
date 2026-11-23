export const DEMO_DATE = '2026-11-19';
export const POLICY = {version:'1.0', title:'车主服务关怀规则', validUntil:'2026-12-31', source:'示例运营手册 §3.2', updatedAt:'2026-11-10'};
const rows = [
  ['林知夏','上海','ET5',14,5,'冬季车辆检查',18,'normal'],
  ['周予安','上海','ES6',12,4,'保养咨询',25,'normal'],
  ['沈嘉木','上海','ET7',8,6,'轮胎检查',20,'normal'],
  ['顾言川','上海','EC6',10,2,'保养咨询',40,'optout'],
  ['唐若晴','上海','ES8',11,2,'服务工单',14,'complaint'],
  ['许承泽','上海','ET5T',9,3,'补能咨询',30,'missing'],
  ['蒋清越','上海','ES7',15,4,'冬季车辆检查',3,'recent'],
  ['苏晚宁','上海','ET7',16,4,'保养咨询',32,'normal'],
  ['陆景行','杭州','ET5',13,3,'冬季车辆检查',22,'normal'],
  ['叶南乔','上海','EC6',10,3,null,19,'normal'],
  ['陈星野','上海','ET5T',18,7,'轮胎检查',15,'normal'],
  ['温以宁','上海','ES6',20,6,'补能咨询',26,'normal'],
  ['程书远','杭州','ES8',14,4,'保养咨询',17,'normal'],
  ['方雨桐','杭州','ET7',11,3,'冬季车辆检查',6,'recent'],
  ['江屿白','杭州','EC6',12,11,null,31,'normal'],
  ['何念初','上海','ES6',9,10,null,28,'normal'],
  ['赵亦辰','上海','ET5',14,12,'保养咨询',42,'normal'],
  ['谢清和','杭州','ET5T',10,8,null,20,'normal'],
  ['宋予书','上海','ES8',8,9,null,35,'normal'],
  ['秦墨然','杭州','ET7',12,4,'轮胎检查',40,'optout'],
  ['许知意','上海','EC6',16,15,null,26,'normal'],
  ['吴云舟','杭州','ES6',9,7,'保养咨询',24,'normal'],
  ['季明舒','上海','ET5',13,12,null,30,'normal'],
  ['林见溪','杭州','ES8',11,13,null,19,'normal']
];
export const OWNERS = rows.map((r,i)=>({id:`OW-${1001+i}`,name:r[0],city:r[1],model:r[2],before:r[3],current:r[4],need:r[5],lastContactDays:r[6],contact:r[7]!=='missing',optOut:r[7]==='optout',complaint:r[7]==='complaint',source:`虚构车主记录 #${1001+i}`,note:r[5]?`最近一次服务咨询：${r[5]}；需求尚未确认解决。`:'暂无待处理服务需求记录。'}));
export const clone = value => structuredClone(value);
