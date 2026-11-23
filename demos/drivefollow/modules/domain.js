import { DEMO_DATE, KNOWLEDGE, VEHICLES, SLOTS } from './data.js';

export const uid = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
export function assessLead(lead) {
  if (!lead.consent) return { score: -20, label: '暂停联系', tone: 'muted', reason: '客户已明确拒绝营销联系', blocked: true };
  if (lead.complaint) return { score: -10, label: '人工处理', tone: 'red', reason: '先处理尚未解决的客户诉求', blocked: true };
  if (lead.status === 'booked') return { score: 0, label: '已约试驾', tone: 'green', reason: '已有确认的试驾预约', blocked: false };
  const days = Math.max(0, Math.floor((Date.parse(DEMO_DATE) - Date.parse(lead.lastContact || DEMO_DATE)) / 86400000));
  const score = 20 + (lead.requestedDrive ? 50 : 0) + Math.min(days * 3, 15);
  return {
    score, label: lead.requestedDrive ? '优先跟进' : !lead.budget ? '待补充' : '常规跟进',
    tone: lead.requestedDrive ? 'orange' : !lead.budget ? 'amber' : 'blue', blocked: false,
    reason: lead.requestedDrive ? (days >= 4 ? '客户曾表达试驾意愿，已有数日未跟进' : '客户已表达试驾意愿，等待时间确认') : !lead.budget ? '先补充预算与购车需求' : '根据最近沟通继续了解需求',
  };
}

export function buildPlan(lead, knowledge = KNOWLEDGE) {
  const assessment = assessLead(lead);
  const missing = [];
  if (!lead.budget) missing.push('购车预算');
  if (!lead.needs?.length) missing.push('主要用车需求');
  const brand = VEHICLES[lead.model]?.brand;
  const candidates = knowledge.filter(doc => (doc.model === lead.model || doc.model === 'all') && brand && doc.brand === brand);
  const sources = candidates.filter(doc => !doc.validUntil || doc.validUntil >= DEMO_DATE);
  const expiredCount = candidates.length - sources.length;
  const audience = sources.find(doc => doc.category === '用户画像' && doc.evidenceType === 'inference')?.content || '';
  const positioning = sources.find(doc => doc.category === '车型资料' && doc.evidenceType === 'fact')?.content || '';
  const warnings = [
    ...(expiredCount ? [`已过滤 ${expiredCount} 份过期活动资料，草稿不引用往期权益。`] : []),
    ...(brand === 'nio' ? ['资料采集于 2026-11-19；配置、价格、优惠、站点状态和服务权益请在沟通前核对官网或 NIO App。', '适配人群为基于官方定位的销售假设，需向客户确认；不代表该客户的真实需求。'] : []),
  ];
  const blocked = assessment.blocked;
  let action = blocked ? (lead.complaint ? '处理客户诉求' : '暂停营销联系') : lead.status === 'booked' ? '准备到店接待' : missing.length ? '补充购车需求' : '确认试驾意向与时间';
  let draft = '';
  if (!blocked) {
    const modelName = VEHICLES[lead.model]?.name || '意向车型';
    const focus = lead.needs?.length ? `您之前关注的${lead.needs.slice(0, 2).join('和')}` : '您的用车需求';
    if (lead.status === 'booked') {
      draft = `${lead.name}，您好！想和您确认一下到店前是否还有希望重点了解的项目，我们可以提前为您准备${modelName}的体验安排。`;
    } else if (missing.length) {
      draft = `${lead.name}，您好！关于您关注的${modelName}，想先了解一下${missing.join('和')}，方便为您安排更合适的体验。您方便时告诉我就好。`;
    } else {
      draft = `${lead.name}，您好！关于${focus}，建议您到店亲自体验一下${modelName}，我们可以围绕这些方面安排试驾。您这周末哪个时间比较方便？我先帮您确认可用档期。`;
    }
  }
  return {
    id: uid('plan'), leadId: lead.id, createdAt: new Date().toISOString(), mode: 'demo', blocked, action, draft, missing, brand, audience, positioning,
    title: blocked ? assessment.reason : lead.status === 'booked' ? '已有预约，做好到店准备' : missing.length ? '先了解需求，再推进邀约' : '把客户关注点，变成试驾体验',
    rationale: assessment.reason,
    facts: [{ label: '意向车型', value: VEHICLES[lead.model]?.name || '待确认' }, { label: '购车预算', value: lead.budget || '待补充' }, { label: '关注重点', value: lead.needs?.join('、') || '待补充' }],
    sources, warnings: blocked ? [assessment.reason] : [...warnings, ...(missing.length ? [`缺少${missing.join('、')}，请先补充。`] : [])],
    trace: [
      { tool: 'customer.read', label: '读取客户与沟通记录', detail: `读取 ${lead.history?.length || 0} 条记录`, status: 'done' },
      { tool: 'contact.check', label: '检查联系规则', detail: blocked ? assessment.reason : '允许跟进；无待处理投诉', status: blocked ? 'blocked' : 'done' },
      { tool: 'knowledge.search', label: '检索有效车型与门店资料', detail: blocked ? '已停止后续邀约步骤' : `引用 ${sources.length} 份有效资料`, status: blocked ? 'skipped' : 'done' },
      { tool: 'plan.compose', label: '组织跟进建议', detail: blocked ? '保留人工处理建议' : '规则驱动草稿 · 待顾问确认', status: 'done' },
    ],
  };
}

export function createTask(state, leadId, plan, editedDraft = plan.draft) {
  const lead = state.customers.find(item => item.id === leadId);
  if (!lead) throw new Error('客户不存在');
  if (assessLead(lead).blocked || plan.blocked) throw new Error('此客户当前不能创建营销跟进任务');
  if (!editedDraft.trim()) throw new Error('请先填写跟进草稿');
  const existing = state.tasks.find(task => task.leadId === leadId && task.status === 'pending');
  if (existing) return existing;
  const task = { id: uid('task'), leadId, planId: plan.id, title: plan.action, draft: editedDraft.trim(), status: 'pending', createdAt: new Date().toISOString() };
  state.tasks.unshift(task);
  state.feedback.unshift({ id: uid('feedback'), leadId, planId: plan.id, type: editedDraft.trim() === plan.draft.trim() ? 'accepted' : 'edited', createdAt: task.createdAt });
  return task;
}

export function reserveSlot(state, leadId, slotId, confirmed) {
  const lead = state.customers.find(item => item.id === leadId);
  if (!lead) throw new Error('客户不存在');
  if (assessLead(lead).blocked) throw new Error('客户当前不可进行营销联系或预约');
  if (!confirmed) throw new Error('请先确认客户已同意该试驾时段');
  const slot = SLOTS.find(item => item.id === slotId);
  if (!slot || slot.model !== lead.model) throw new Error('请选择此车型的有效试驾档期');
  const prior = state.bookings.find(item => item.leadId === leadId && item.status === 'confirmed');
  if (prior?.slotId === slotId) return prior;
  if (prior) throw new Error('此客户已有预约，请先完成已有预约');
  if (state.bookings.some(item => item.slotId === slotId && item.status === 'confirmed')) throw new Error('该时段已被占用，请选择其他时段');
  const booking = { id: uid('booking'), leadId, slotId, status: 'confirmed', createdAt: new Date().toISOString(), seeded: false };
  state.bookings.unshift(booking);
  lead.status = 'booked';
  lead.lastContact = DEMO_DATE;
  lead.history.unshift({ date: DEMO_DATE, text: `已确认 ${slot.date.slice(5).replace('-', '月')}日 ${slot.time} 的模拟试驾预约。` });
  state.tasks.filter(task => task.leadId === leadId && task.status === 'pending').forEach(task => { task.status = 'completed'; task.result = '已约试驾'; });
  return booking;
}

export function recordOutcome(state, leadId, outcome, note = '') {
  const lead = state.customers.find(item => item.id === leadId);
  if (!lead) throw new Error('客户不存在');
  const outcomes = { contacted: '已联系，继续跟进', noanswer: '暂未接通', later: '客户希望稍后联系', declined: '客户拒绝后续联系', resolved: '客户诉求已解决' };
  if (!outcomes[outcome]) throw new Error('请选择有效跟进结果');
  if (outcome === 'resolved' && !lead.complaint) throw new Error('此客户没有待处理诉求');
  if (outcome === 'declined') { lead.consent = false; lead.status = 'paused'; }
  if (outcome === 'resolved') { lead.complaint = false; lead.status = 'following'; }
  lead.lastContact = DEMO_DATE;
  lead.history.unshift({ date: DEMO_DATE, text: `${outcomes[outcome]}${note.trim() ? `：${note.trim()}` : ''}` });
  state.tasks.filter(task => task.leadId === leadId && task.status === 'pending').forEach(task => { task.status = 'completed'; task.result = outcomes[outcome]; });
  delete state.plans[leadId];
  return outcomes[outcome];
}
