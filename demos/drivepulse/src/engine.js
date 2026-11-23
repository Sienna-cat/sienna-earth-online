import {DEMO_DATE, POLICY, OWNERS, clone} from './data.js';

export const STEPS = [
  {name:'queryOwnerSegment',label:'查询车主行为数据',source:'行为数据 · 两个连续 30 天窗口'},
  {name:'getOwnerFacts',label:'核对服务需求与触达资格',source:'车主档案 · 服务记录 · 触达历史'},
  {name:'retrieveOperationPolicy',label:'检索并校验运营规则',source:'示例运营手册 §3.2'},
  {name:'prepareOutreach',label:'整理人群与关怀方案',source:'本地规则工作流 · 模板 v1'}
];
export const OUTCOMES = {pending:'待执行',contacted:'已触达',responded:'已响应',declined:'拒绝联系',manual:'转人工'};
export const drop = owner => owner.before > 0 ? Math.round((owner.before-owner.current)/owner.before*100) : 0;
const byId = (state,id) => {const run=state.runs.find(x=>x.id===id);if(!run)throw new Error('找不到此任务');return run;};
const addLog=(run,step,status,output)=>run.logs.push({...step,status,output,at:new Date().toISOString()});
export function createState(){return {version:1,owners:clone(OWNERS),policy:clone(POLICY),runs:[],operations:[]};}

export function queryOwnerSegment(state,filters={}){
  const city=filters.city||'全部城市'; const minDrop=Number(filters.minDrop??50);
  return state.owners.filter(o=>o.before>0&&(o.before-o.current)/o.before*100>=minDrop&&(city==='全部城市'||o.city===city)&&Boolean(o.need)).map(o=>clone(o));
}
export function screenOwners(owners){
  const eligible=[],excluded=[];
  for(const owner of owners){
    let code,reason;
    if(owner.optOut){code='opt_out';reason='已退订 / 明确拒绝联系';}
    else if(owner.complaint){code='complaint';reason='存在未解决投诉，建议人工优先处理';}
    else if(!owner.contact){code='missing_contact';reason='联系方式不完整，需补全资料';}
    else if(owner.lastContactDays<7){code='frequency';reason='7 天内已有联系，暂缓再次触达';}
    if(code)excluded.push({owner:clone(owner),code,reason});else eligible.push(clone(owner));
  }
  return {eligible,excluded};
}
export function beginRun(state,input={}){
  if(!String(input.goal||'').trim())throw new Error('请填写运营目标');
  if(!['上海','杭州','全部城市'].includes(input.city))throw new Error('请选择支持的城市');
  if(![30,50,70].includes(Number(input.minDrop)))throw new Error('请选择有效下降阈值');
  const run={id:`DP-${String(state.runs.length+1).padStart(3,'0')}`,goal:input.goal.trim(),filters:{city:input.city,minDrop:Number(input.minDrop)},scenario:input.scenario||'normal',status:'running',step:0,logs:[],candidates:[],eligible:[],excluded:[],message:'',policy:clone(state.policy),createdAt:new Date().toISOString(),edited:false,error:null};
  state.runs.unshift(run);return run;
}
export function advanceRun(state,id){
  const run=byId(state,id);if(run.status!=='running')return run;
  const step=STEPS[run.step];if(!step)return run;
  if(run.step===0&&run.scenario==='tool_failure'&&!run.faultInjected){
    run.faultInjected=true;run.status='blocked';run.error='行为数据查询超时。已保留任务目标，可以从当前步骤重试。';
    addLog(run,step,'failed',{code:'DEMO_TIMEOUT',message:run.error});return run;
  }
  let output;
  if(run.step===0){run.candidates=queryOwnerSegment(state,run.filters);output={filters:run.filters,candidateCount:run.candidates.length,ownerIds:run.candidates.map(o=>o.id)};}
  if(run.step===1){Object.assign(run,screenOwners(run.candidates));output={eligible:run.eligible.length,excluded:run.excluded.map(e=>({ownerId:e.owner.id,reason:e.reason}))};}
  if(run.step===2){
    if(run.scenario==='expired_policy'&&!run.policyUpdated)run.policy.validUntil='2026-11-01';
    if(run.policy.validUntil<DEMO_DATE){run.status='blocked';run.error='当前规则已过期，尚未生成可批准的方案。更新演示规则后继续。';addLog(run,step,'failed',{code:'EXPIRED_POLICY',validUntil:run.policy.validUntil});return run;}
    output={...run.policy,rules:['拒绝联系不触达','投诉优先转人工','联系间隔至少 7 天','执行前人工确认']};
  }
  if(run.step===3){
    run.message='您好，我是您的车主服务伙伴。看到您近期有用车服务咨询，想了解问题是否已解决。如仍需要帮助，您可以回复希望咨询的事项和方便联系的时间，我们会协助跟进。若暂不需要，回复“无需联系”即可。';
    run.draftMessage=run.message;run.draftSelectedIds=run.eligible.map(o=>o.id);
    output={recommendedCount:run.eligible.length,channel:'App 服务消息（模拟）',approvalRequired:true};
  }
  addLog(run,step,'success',output);run.step++;
  if(run.step===4)run.status='awaiting_approval';return run;
}
export function retryRun(state,id){
  const run=byId(state,id);if(run.status!=='blocked')throw new Error('此任务不需要重试');
  if(run.policy.validUntil<DEMO_DATE){run.policy={...clone(POLICY),version:'1.1',updatedAt:DEMO_DATE};run.policyUpdated=true;}
  run.error=null;run.status='running';return run;
}
export function approveRun(state,id,payload={}){
  const run=byId(state,id);
  if(['approved','completed'].includes(run.status))return state.operations.filter(o=>o.runId===id);
  if(run.status!=='awaiting_approval')throw new Error('方案尚未完成，请等待执行完成');
  if(run.policy.validUntil<DEMO_DATE)throw new Error('规则已过期，请重新生成方案');
  const ids=[...new Set(payload.selectedIds||[])];const message=String(payload.message||'').trim();
  if(!ids.length)throw new Error('至少选择一位车主');if(!message)throw new Error('请填写触达文案');
  const current=screenOwners(queryOwnerSegment(state,run.filters)).eligible;
  if(ids.some(id=>!run.eligible.some(o=>o.id===id)||!current.some(o=>o.id===id)))throw new Error('车主触达资格已变化，请重新生成方案');
  run.edited=message!==run.message||ids.length!==run.eligible.length;run.approvedMessage=message;run.selectedIds=ids;
  for(const ownerId of ids){
    const owner=current.find(o=>o.id===ownerId);
    state.operations.push({id:`${run.id}-${ownerId}`,runId:id,ownerId,owner:clone(owner),message,status:'pending',outcome:null,history:[],nextAction:'按审核文案完成服务关怀',createdAt:new Date().toISOString()});
  }
  run.status='approved';addLog(run,{name:'createOperationTask',label:'创建待执行运营任务',source:'本地运营任务库'},'success',{created:ids.length,ownerIds:ids,message,externalMessagesSent:0});
  return state.operations.filter(o=>o.runId===id);
}
export function recordOutcome(state,id,outcome){
  if(!['contacted','responded','declined','manual'].includes(outcome))throw new Error('不支持的反馈类型');
  const op=state.operations.find(o=>o.id===id);if(!op)throw new Error('运营任务不存在');if(op.outcome===outcome)return op;
  op.status=outcome;op.outcome=outcome;op.history.push({outcome,at:new Date().toISOString()});
  op.nextAction={contacted:'等待车主回复，不追加重复触达',responded:'人工确认需求与服务时间；尚未预约',declined:'停止后续触达，已更新退订状态',manual:'由服务专员核实情况并跟进'}[outcome];
  const owner=state.owners.find(o=>o.id===op.ownerId);if(owner){if(outcome!=='manual')owner.lastContactDays=0;if(outcome==='declined')owner.optOut=true;}
  const run=byId(state,op.runId);addLog(run,{name:'recordOperationOutcome',label:'保存执行反馈',source:'本地运营任务库'},'success',{ownerId:op.ownerId,outcome,nextAction:op.nextAction});
  run.status=state.operations.filter(o=>o.runId===run.id).every(o=>o.status!=='pending')?'completed':'approved';return op;
}
export function getMetrics(state){
  const ops=state.operations;const logs=state.runs.flatMap(r=>r.logs);const successes=logs.filter(l=>l.status==='success').length;
  const responded=ops.filter(o=>o.status==='responded').length;const feedback=ops.filter(o=>o.status!=='pending').length;
  return {operations:ops.length,responded,feedback,pending:ops.length-feedback,declined:ops.filter(o=>o.status==='declined').length,manual:ops.filter(o=>o.status==='manual').length,responseRate:ops.length?Math.round(responded/ops.length*100):0,feedbackRate:ops.length?Math.round(feedback/ops.length*100):0,toolCalls:logs.length,toolFailures:logs.length-successes,toolSuccessRate:logs.length?Math.round(successes/logs.length*100):null,editedRuns:state.runs.filter(r=>r.edited).length,approvedRuns:state.runs.filter(r=>['approved','completed'].includes(r.status)).length};
}
