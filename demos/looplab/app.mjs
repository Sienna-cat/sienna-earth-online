import {orders,gold,customers,DATASET_VERSION} from './data.mjs';
import {checkAddress,evaluateOrders,developStrategy,testStrategy,parseAddressCSV} from './engine.mjs';
import {shell,overview,audience,orderPage,portfolio,detailView} from './views.mjs';

const storage={read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}};
const initialReviews=storage.read('looplab-reviews-v1',{v1:{},v2:{}});
const state={page:'overview',config:{dimensions:2,minBase:40,minLift:1.2},strategy:null,final:null,testUsed:Boolean(storage.read('looplab-test-used-v1',false)),testExploratory:false,orders:[...orders],gold,version:'v2',predictions:null,imported:false,filename:'',filter:'all',search:'',orderPage:0,reviewStore:initialReviews&&typeof initialReviews==='object'?initialReviews:{v1:{},v2:{}},reviews:{},strategyRunAt:null,orderRunAt:null};
state.reviews=state.reviewStore.v2||{};
const app=document.querySelector('#app'),dialog=document.querySelector('#detail-dialog');
const pages={overview,audience,orders:orderPage,portfolio};
let toastTimer;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4000);}
function render(){
  const focused=document.activeElement?.id;
  const selection=focused==='order-search'?document.activeElement.selectionStart:null;
  app.innerHTML=shell(state,pages[state.page](state));
  document.title=`${{overview:'项目概览',audience:'客群泛化',orders:'智能核单',portfolio:'作品集说明'}[state.page]} · LoopLab`;
  if(focused==='order-search'){const input=document.getElementById(focused);input?.focus();input?.setSelectionRange(selection,selection);}
}
function route(){const next=location.hash.slice(1)||'overview';state.page=Object.hasOwn(pages,next)?next:'overview';render();window.scrollTo(0,0);}
function invalidateStrategy(){state.strategy=null;state.final=null;state.testExploratory=false;}
function download(name,data,type='application/json'){
  const blob=new Blob([typeof data==='string'?data:JSON.stringify(data,null,2)],{type});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function runStrategy(){state.strategy=developStrategy(customers,state.config);state.final=null;state.strategyRunAt=new Date().toISOString();}
function runOrders(){state.predictions=state.orders.map(o=>checkAddress(o,state.version));state.filter='all';state.orderPage=0;state.orderRunAt=new Date().toISOString();}
const actions={
  'run-all':()=>{runStrategy();runOrders();location.hash='audience';if(state.page==='audience')render();toast('已完成开发评测和核单；测试集等待你冻结策略。');},
  'run-strategy':()=>{runStrategy();render();toast(`开发评测完成，${state.strategy.selectedKeys.length} 个客群规则入选。`);},
  'dimension':el=>{state.config.dimensions=Number(el.dataset.value);invalidateStrategy();render();},
  'test-strategy':()=>{if(!state.strategy||!state.strategy.selectedKeys.length||state.final)return;state.testExploratory=state.testUsed;state.final=testStrategy(customers,state.strategy);state.testUsed=true;storage.write('looplab-test-used-v1',true);render();toast(state.testExploratory?'已完成探索性测试；此测试集曾被查看。':'冻结规则已在测试集上完成验证。');},
  'run-orders':()=>{runOrders();render();toast(`已核验 ${state.orders.length} 条记录，所有输入均保留。`);},
  'filter':el=>{state.filter=el.dataset.value;state.orderPage=0;render();},
  'prev':()=>{state.orderPage=Math.max(0,state.orderPage-1);render();},
  'next':()=>{state.orderPage++;render();},
  'detail':el=>{const i=state.orders.findIndex(r=>r.id===el.dataset.id);if(i<0||!state.predictions)return;const r=state.orders[i];dialog.innerHTML=detailView(r,state.predictions[i],Object.hasOwn(state.reviews,r.id)?state.reviews[r.id]:null,Object.hasOwn(state.gold,r.id)?state.gold[r.id]:null);dialog.showModal();},
  'close-dialog':()=>dialog.close(),
  'import':()=>document.querySelector('#csv-file').click(),
  'template':()=>download('LoopLab_核单导入模板.csv','\uFEFF订单ID,原始地址,通话证据,省,市,区县\r\nIMPORT-001,浙江省杭州市余杭区演示路12号,,浙江省,杭州市,余杭区\r\nIMPORT-002,四川省成都市锦江区示例路18号,,四川省,成都市,锦江区\r\nIMPORT-003,浙江省杭州市鱼杭区演示路26号,确认是余杭区，演示路26号,,,\r\nIMPORT-004,,,,,\r\n','text/csv;charset=utf-8'),
  'restore-orders':()=>{state.orders=[...orders];state.gold=gold;state.predictions=null;state.imported=false;state.filename='';state.reviews=storage.read('looplab-reviews-v1',{})[state.version]||{};state.reviewStore=storage.read('looplab-reviews-v1',{v1:{},v2:{}});state.filter='all';state.search='';state.orderPage=0;render();toast('已恢复 24 条模拟挑战案例。');},
  'export-audience':()=>{if(!state.strategy)return;download('LoopLab_客群泛化评测.json',{project:'LoopLab',data:'完全模拟客户数据',dataset:DATASET_VERSION,generatedAt:new Date().toISOString(),runAt:state.strategyRunAt,development:state.strategy,test:state.final,testUse:state.final?(state.testExploratory?'exploratory-reused':'first-view-in-this-browser'):'not-evaluated',limitations:['合成数据不代表线上效果','修改参数后重复查看测试集属于探索','未进行线上随机实验']});toast('已导出策略、分母、结果及使用边界。');},
  'export-orders':()=>{if(!state.predictions)return;download('LoopLab_智能核单评测.json',{project:'LoopLab',dataset:state.imported?state.filename:DATASET_VERSION,generatedAt:new Date().toISOString(),ruleVersion:state.version,runAt:state.orderRunAt,source:state.imported?'用户本地CSV，未标注':'虚构挑战样例，独立示例标注',metrics:evaluateOrders(state.orders,state.predictions,state.gold),records:state.orders.map((r,i)=>({input:r,prediction:state.predictions[i],gold:Object.hasOwn(state.gold,r.id)?state.gold[r.id]:null,humanReview:Object.hasOwn(state.reviews,r.id)?state.reviews[r.id]:null})),limitations:['本地有限规则演示，未调用外部地图/录音服务','人工裁决不改变模型评测分数']});toast('已导出逐条证据、评测指标和人工裁决。');},
  'print':()=>window.print(),
};
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.disabled)return;try{actions[el.dataset.action]?.(el);}catch(err){toast(`操作未完成：${err.message}`);}});
document.addEventListener('input',event=>{
  if(event.target.id==='order-search'){state.search=event.target.value;state.orderPage=0;render();}
  if(event.target.id==='minLift')document.querySelector('#threshold-value').textContent=`${Number(event.target.value).toFixed(1)}×`;
});
document.addEventListener('change',event=>{
  if(event.target.dataset.config){state.config[event.target.dataset.config]=Number(event.target.value);invalidateStrategy();render();}
  if(event.target.id==='order-version'){state.version=event.target.value;state.predictions=null;state.filter='all';state.orderPage=0;state.reviews=state.reviewStore[state.version]||{};render();}
});
document.querySelector('#csv-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>1_000_000)throw Error('请上传 1 MB 以内的 CSV');
    const imported=parseAddressCSV(await file.text());
    state.orders=imported;state.gold={};state.imported=true;state.filename=file.name;state.predictions=null;state.reviewStore={v1:{},v2:{}};state.reviews={};state.filter='all';state.search='';state.orderPage=0;render();toast(`已导入 ${imported.length} 条；没有标准答案的质量指标将保持待标注。`);
  }catch(err){toast(`导入失败：${err.message}`);}finally{event.target.value='';}
});
dialog.addEventListener('submit',event=>{
  if(event.target.id!=='review-form')return;event.preventDefault();const form=event.target,values=new FormData(form),id=form.dataset.id;
  const decision=values.get('decision'),address=values.get('address').trim(),note=values.get('note').trim();
  if(!note){form.querySelector('[name=note]').setCustomValidity('请填写裁决依据');form.reportValidity();return;}
  if(decision==='approve'&&!address){form.querySelector('[name=address]').setCustomValidity('确认地址不能为空');form.reportValidity();return;}
  state.reviews={...state.reviews,[id]:{decision,address,note,reviewedAt:new Date().toISOString(),ruleVersion:state.version}};state.reviewStore[state.version]=state.reviews;
  const persisted=state.imported?true:storage.write('looplab-reviews-v1',state.reviewStore);dialog.close();render();toast(persisted?'人工裁决已保存；模型原始判断与得分保持不变。':'裁决保留在本次会话；浏览器存储不可用，请导出留存。');
});
dialog.addEventListener('input',event=>event.target.setCustomValidity?.(''));
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
window.addEventListener('hashchange',route);route();
