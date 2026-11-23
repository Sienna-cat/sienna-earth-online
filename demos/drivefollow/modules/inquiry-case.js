// A bounded, deterministic simulation. No model, messaging, CRM or pricing API.
export const CASE_STORAGE_KEY = 'drivefollow-inquiry-case-v1';
export const CONDITION_LABELS = {
  city: '购车城市', model: '车型', configuration: '具体配置', payment: '付款方式',
  battery: '电池购买口径', tradeIn: '置换条件', fees: '落地费用范围', loanMonths: '分期期数（月）', downPayment: '首付条件',
};
const REQUIRED = ['city', 'model', 'configuration', 'payment', 'battery', 'tradeIn', 'fees'];
const clone = value => JSON.parse(JSON.stringify(value));
const time = () => new Date().toISOString();
const unique = values => [...new Set(values)];
const field = () => ({ value: '', source: 'unknown', evidenceTurnIds: [], eventId: null });
const permission = () => ({ status: 'unknown', evidenceTurnIds: [] });
const permissions = () => ({ phone: { quote: permission(), marketing: permission() }, wecom: { quote: permission(), marketing: permission() } });
const QUOTE_PERMISSION = /^(?:请)?报价发(?:已经加的|已加的)?企微(?:就好|即可)?$|^(?:请|可以|同意)(?:通过|用)?(?:企微|微信)(?:给我)?发(?:送)?报价$/;
const QUOTE_WITHDRAWAL = /^(?:不要|别|不用|停止)(?:再)?(?:给我)?发(?:送)?(?:报价|消息)?(?:了)?$/;
const signature = state => JSON.stringify(Object.keys(CONDITION_LABELS).map(key => [key, state.conditions[key].value]));
const missingConditions = state => [...REQUIRED, ...(state.conditions.payment.value === 'finance' ? ['loanMonths', 'downPayment'] : [])].filter(key => !state.conditions[key].value.trim());

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function audit(state, type, details = {}, now = time()) {
  const event = { id: `E${state.audit.length + 1}`, type, revision: state.revision, at: now, ...clone(details) };
  state.audit.push(event);
  return event;
}

function paymentPreference(text) {
  if (!/分(?:三|3)年|(?:36|三十六)期|分期|全款/.test(text)) return null;
  const compact = text.replace(/[，。！？；,!?;\s]/g, '');
  if (/^(?:那|改成|改为|我要|我想|按)?全款(?:呢|吧)?$|^(?:我)?(?:不是|不要|不选)(?:分(?:三|3)年|(?:36|三十六)期|分期)(?:而)?(?:是|改成|改为|要|选)全款$/.test(compact)) return 'cash';
  if (/^(?:那|改成|改为|我要|我想)?(?:分(?:三|3)年|(?:36|三十六)期)(?:呢|吧)?$|^(?:我)?(?:不是|不要|不选)全款(?:而)?(?:是|改成|改为|要|选)(?:分(?:三|3)年|(?:36|三十六)期)$/.test(compact)) return 'finance';
  return 'unknown';
}

function understoodClause(clause) {
  return QUOTE_PERMISSION.test(clause) || QUOTE_WITHDRAWAL.test(clause) || [
    /^(?:价格)?(?:有点|太|有些)贵$/,
    /^(?:最近|暂时|现在)?不(?:急|着急)(?:着买|买|购车)?$/,
    /^(?:请问)?(?:现在)?(?:优惠后)?(?:落地多少|落地价(?:多少)?|多少钱)$/,
    /^(?:我)?(?:可)?(?:没说不买|没有说不买|不是不买)$/,
    /^(?:不要|别|不许|禁止)(?:再)?(?:给我)?(?:打电话|电话)(?:了)?$/,
    /^(?:不要再联系|别再联系|停止联系)(?:我)?$|^不要联系我$|^取消.{0,4}报价$/,
    /^(?:企微|微信)(?:也)?(?:不要|别)(?:再)?发(?:了)?$/,
    /^(?:已经加的企微|已加的企微)$/,
  ].some(pattern => pattern.test(clause));
}

function interpret(transcript) {
  const result = {
    inquiry: { landingPrice: false, priceConcern: false, financeMonths: null, paymentPreference: 'unknown', paymentEvidenceTurnIds: [], evidenceTurnIds: [] },
    purchaseTiming: { value: 'unknown', urgency: 'unknown', evidenceTurnIds: [] },
    intent: { value: 'unknown', evidenceTurnIds: [], reason: '询价、价格顾虑和不着急均不足以判断成交意向。' },
    permissions: permissions(), unrecognizedTurnIds: [],
  };
  for (const turn of transcript) {
    const text = turn.text.trim();
    const clauses = text.split(/[，。！？；,!?;\n]/).map(clause => clause.trim()).filter(Boolean);
    const unsafe = /[<>]|忽略.{0,8}(规则|指令)|绕过|系统提示/.test(text);
    const ambiguousPermission = /报价/.test(text) && /企微|微信/.test(text) && /如果|假如|没(?:有)?同意|未授权|不代表|但.{0,8}(?:别|不要)|[“”"「」]/.test(text);
    const deferredPermission = /(?:等|待).{0,18}(?:确认|同意|答复|回复|通知|决定)|(?:确认|同意|答复|回复|通知|决定)(?:后|以后|了).{0,8}(?:再|才).{0,4}(?:发|联系)|(?:先|暂时|现在|目前).{0,4}(?:别|不要|不用).{0,6}(?:发|联系)|(?:明天|后天|稍后|晚点|以后|之后|过几天).{0,4}(?:再|才).{0,4}(?:发|联系)|(?:如果|假如|只有|除非|等到).{0,30}(?:发|联系)/.test(text);
    const uncertainPermission = ambiguousPermission || deferredPermission;
    let recognized = false;
    let ambiguousPayment = false;
    let understoodPayment = false;
    const citeInquiry = () => { result.inquiry.evidenceTurnIds.push(turn.id); recognized = true; };
    const setPermission = (channel, purpose, status) => { result.permissions[channel][purpose] = { status, evidenceTurnIds: [turn.id] }; recognized = true; };
    // Negative permissions always take effect, including inside an otherwise unknown turn.
    const optOut = /不要再联系|别再联系|不要联系我|停止联系|取消.{0,4}报价/.test(text);
    const phoneDenied = /(?:不要|别|不许|禁止).{0,4}(?:打电话|电话)/.test(text);
    const wecomDenied = clauses.some(clause => /(?:不要|别|停止).{0,8}(?:企微|微信|发报价|发送报价)|(?:企微|微信).{0,4}(?:不要|别).{0,4}发/.test(clause));
    const quoteWithdrawn = clauses.some(clause => QUOTE_WITHDRAWAL.test(clause));
    if (optOut) for (const channel of ['phone', 'wecom']) for (const purpose of ['quote', 'marketing']) setPermission(channel, purpose, 'denied');
    if (phoneDenied) for (const purpose of ['quote', 'marketing']) setPermission('phone', purpose, 'denied');
    if (wecomDenied) for (const purpose of ['quote', 'marketing']) setPermission('wecom', purpose, 'denied');
    if (quoteWithdrawn) for (const channel of ['phone', 'wecom']) setPermission(channel, 'quote', 'denied');
    // New sending conditions supersede earlier permission. Human review cannot
    // turn a pending customer confirmation into permission to send now.
    if (uncertainPermission && !optOut && !wecomDenied && !quoteWithdrawn) setPermission('wecom', 'quote', 'unknown');
    if (!unsafe) {
      if (/落地多少|落地价|优惠后.{0,4}多少|现在.{0,4}多少钱/.test(text)) { result.inquiry.landingPrice = true; citeInquiry(); }
      if (/有点贵|太贵|价格.{0,3}贵/.test(text)) { result.inquiry.priceConcern = true; citeInquiry(); }
      if (/不急|不着急|暂时不急/.test(text)) { result.purchaseTiming = { value: 'unknown', urgency: 'not_urgent', evidenceTurnIds: [turn.id] }; recognized = true; }
      if (/没说不买|没有说不买|不是不买/.test(text)) { result.intent.evidenceTurnIds = [turn.id]; recognized = true; }
      const payment = result.inquiry.landingPrice ? paymentPreference(text) : null;
      if (payment) {
        result.inquiry.financeMonths = payment === 'finance' ? 36 : null;
        result.inquiry.paymentPreference = payment;
        result.inquiry.paymentEvidenceTurnIds = [turn.id];
        ambiguousPayment = payment === 'unknown';
        understoodPayment = !ambiguousPayment;
        citeInquiry();
      }
      const allowsQuote = clauses.some(clause => QUOTE_PERMISSION.test(clause));
      if (!optOut && !wecomDenied && !quoteWithdrawn && !uncertainPermission && allowsQuote) setPermission('wecom', 'quote', 'allowed');
      if (/^(?:已经加的企微|已加的企微)$/.test(text)) recognized = true;
    }
    if (!recognized || unsafe || uncertainPermission || ambiguousPayment || (!understoodPayment && !clauses.every(understoodClause))) {
      result.unrecognizedTurnIds.push(turn.id);
      // Fail closed for the entire turn, including qualifiers outside our
      // vocabulary. A previously allowed fragment cannot survive unknown text.
      if (result.permissions.wecom.quote.status !== 'denied') setPermission('wecom', 'quote', 'unknown');
    }
  }
  result.inquiry.evidenceTurnIds = unique(result.inquiry.evidenceTurnIds);
  return result;
}

function refresh(state, now = time()) {
  const understood = interpret(state.transcript);
  const unresolved = understood.unrecognizedTurnIds.filter(id => !state.reviewedTurnIds.includes(id));
  state.analysis = {
    schemaVersion: 1, revision: state.revision, method: 'rule_based_simulation', evaluatedAt: now,
    ...understood, reviewRequired: unresolved.length > 0, unresolvedTurnIds: unresolved,
    conditions: clone(state.conditions), relationship: clone(state.relationship), knowledge: clone(state.knowledge),
  };
  state.analysisHistory.push(clone(state.analysis));
  for (const task of state.tasks) {
    if (task.kind === 'customer_contact' && task.status === 'pending' && state.analysis.permissions[task.channel]?.[task.purpose]?.status === 'denied') {
      task.status = 'cancelled';
      task.cancelledAt = now;
      task.cancellationReason = '客户撤回了此渠道／用途的许可';
      audit(state, 'task_cancelled', { taskId: task.id, reason: task.cancellationReason, evidenceTurnIds: state.analysis.permissions[task.channel][task.purpose].evidenceTurnIds }, now);
    }
  }
  state.updatedAt = now;
}

export function createCase(now = time()) {
  const state = {
    schemaVersion: 1, caseId: 'synthetic-price-inquiry', revision: 1, createdAt: now, updatedAt: now,
    transcript: [{ id: 'T1', role: 'customer', text: '有点贵，最近不急着买，现在优惠后落地多少？', at: now }],
    conditions: Object.fromEntries(Object.keys(CONDITION_LABELS).map(key => [key, field()])),
    relationship: { status: 'unknown', source: 'unknown', evidenceTurnIds: [], checkedAt: null },
    knowledge: { status: 'unchecked', source: '尚未核验', checkedAt: null, validUntil: null, conditionsSignature: null, reference: null, amount: null },
    reviewedTurnIds: [], tasks: [], audit: [], analysisHistory: [],
  };
  audit(state, 'case_started', { evidenceTurnIds: ['T1'], synthetic: true }, now);
  refresh(state, now);
  return state;
}

export function appendCustomerTurn(state, input, now = time()) {
  if (typeof input !== 'string' || !input.trim() || input.length > 2000) throw new Error('请输入 1–2000 字的客户原话。');
  state.revision++;
  const turn = { id: `T${state.transcript.length + 1}`, role: 'customer', text: input.trim(), at: now };
  state.transcript.push(turn);
  const event = audit(state, 'customer_turn_added', { evidenceTurnIds: [turn.id] }, now);
  const interpreted = interpret(state.transcript);
  if (interpreted.inquiry.paymentEvidenceTurnIds.includes(turn.id)) {
    const preference = interpreted.inquiry.paymentPreference;
    const updates = [['payment', preference === 'unknown' ? '' : preference], ['loanMonths', preference === 'finance' ? '36' : '']];
    if (preference !== 'finance') updates.push(['downPayment', '']);
    for (const [key, value] of updates) state.conditions[key] = { value, source: 'customer_turn', evidenceTurnIds: [turn.id], eventId: event.id };
  }
  if (!/[<>]/.test(turn.text) && /已经加的企微|已加的企微/.test(turn.text) && state.relationship.status !== 'verified') {
    state.relationship = { status: 'claimed', source: 'customer_self_report', evidenceTurnIds: [turn.id], checkedAt: null };
  }
  refresh(state, now);
  return turn;
}

export function updateConditions(state, updates, provenance = {}, now = time()) {
  let entries = Object.entries(updates);
  if (entries.some(([key, value]) => !Object.hasOwn(CONDITION_LABELS, key) || typeof value !== 'string' || value.length > 200)) throw new Error('报价条件格式无效。');
  if (updates.payment && !['cash', 'finance'].includes(updates.payment)) throw new Error('请选择全款或分期。');
  if (updates.loanMonths && !/^[1-9]\d{0,2}$/.test(updates.loanMonths)) throw new Error('分期期数需要填写正整数。');
  const ids = unique(provenance.evidenceTurnIds ?? []);
  if (ids.some(id => !state.transcript.some(turn => turn.id === id))) throw new Error('引用的对话回合不存在。');
  entries = entries.filter(([key, value]) => value.trim() !== state.conditions[key].value);
  if (!entries.length) return;
  state.revision++;
  const event = audit(state, 'conditions_updated', { fields: entries.map(([key]) => key), evidenceTurnIds: ids, source: 'advisor_record' }, now);
  for (const [key, value] of entries) state.conditions[key] = { value: value.trim(), source: 'advisor_record', evidenceTurnIds: ids, eventId: event.id };
  refresh(state, now);
}

export function setRelationship(state, status, now = time()) {
  if (!['unknown', 'claimed', 'verified', 'failed'].includes(status)) throw new Error('关系核验状态无效。');
  state.revision++;
  const event = audit(state, 'relationship_checked', { status, simulation: true }, now);
  state.relationship = { status, source: 'simulated_relationship_check', evidenceTurnIds: state.relationship.evidenceTurnIds, checkedAt: now, eventId: event.id };
  refresh(state, now);
}

export function recordQuoteCheck(state, result, now = time()) {
  if (!['valid', 'expired', 'unavailable'].includes(result)) throw new Error('报价核验结果无效。');
  state.revision++;
  const event = audit(state, 'quote_checked', { result, simulation: true, conditions: clone(state.conditions) }, now);
  state.knowledge = {
    status: result, source: '模拟门店报价核验（无真实价格数据）', checkedAt: now,
    validUntil: result === 'unavailable' ? null : new Date(Date.parse(now) + (result === 'expired' ? -1 : 1) * 86400000).toISOString(),
    conditionsSignature: signature(state), completeAtCheck: missingConditions(state).length === 0,
    reference: `SIM-CHECK-${event.id}`, eventId: event.id, amount: null,
  };
  refresh(state, now);
}

export function reviewUnknownTurns(state, now = time()) {
  state.revision++;
  const ids = state.analysis.unrecognizedTurnIds;
  state.reviewedTurnIds = unique([...state.reviewedTurnIds, ...ids]);
  audit(state, 'manual_review', { evidenceTurnIds: ids, decision: '保留未知，不推断意向或新增许可' }, now);
  refresh(state, now);
}

export function contactEligibility(state, now = time()) {
  const reasons = [];
  const missing = missingConditions(state);
  if (state.analysis.permissions.wecom.quote.status !== 'allowed') reasons.push('permission_missing');
  if (state.relationship.status !== 'verified') reasons.push('relationship_unverified');
  if (missing.length) reasons.push('conditions_incomplete');
  if (state.analysis.reviewRequired) reasons.push('manual_review_required');
  const validUntil = Date.parse(state.knowledge.validUntil);
  const checkedNow = Date.parse(now);
  if (state.knowledge.status !== 'valid' || !state.knowledge.completeAtCheck || !Number.isFinite(validUntil) || !Number.isFinite(checkedNow) || validUntil <= checkedNow || state.knowledge.conditionsSignature !== signature(state)) reasons.push('knowledge_invalid');
  return { allowed: reasons.length === 0, reasons, missing, channel: 'wecom', purpose: 'quote' };
}

export function buildCasePlan(state, kind = 'customer_contact', now = time()) {
  if (!['customer_contact', 'internal_quote_check'].includes(kind)) throw new Error('任务类型无效。');
  const eligibility = contactEligibility(state, now);
  const c = state.conditions;
  const draft = kind === 'customer_contact'
    ? `【模拟发送预览】已按${c.city.value}、${c.model.value} ${c.configuration.value}核对本次报价口径（${c.payment.value === 'finance' ? `${c.loanMonths.value} 期分期，首付 ${c.downPayment.value}` : '全款'}；${c.battery.value}；${c.tradeIn.value}；${c.fees.value}）。金额仍待门店确认，本演示不提供真实落地价。此企微消息仅用于本次报价。`
    : '仅在内部核对报价来源、适用条件与有效期，不向客户发送消息。';
  return { id: `${kind}:r${state.revision}`, revision: state.revision, kind, channel: kind === 'customer_contact' ? 'wecom' : 'internal', purpose: 'quote', eligible: kind === 'internal_quote_check' || eligibility.allowed, reasons: eligibility.reasons, draft };
}

export function confirmTask(state, plan, now = time()) {
  if (!plan || plan.revision !== state.revision) throw new Error('建议已过期：证据发生变化，请重新检查并确认。');
  const current = buildCasePlan(state, plan.kind, now);
  if (current.id !== plan.id || !current.eligible) throw new Error('当前条件不允许创建客户触达任务，请补齐许可、关系、条件和知识核验。');
  const existing = state.tasks.find(task => task.planId === current.id && ['pending', 'completed'].includes(task.status));
  if (existing) return existing;
  const task = {
    id: `Q${state.tasks.length + 1}`, planId: current.id, kind: current.kind, channel: current.channel, purpose: current.purpose,
    status: 'pending', createdAt: now, confirmedBy: 'human_operator', executionMode: 'simulation', draft: current.draft,
    snapshot: { revision: state.revision, evidenceTurnIds: state.transcript.map(turn => turn.id), analysis: clone(state.analysis), conditions: clone(state.conditions), relationship: clone(state.relationship), knowledge: clone(state.knowledge) },
  };
  state.tasks.push(task);
  audit(state, 'task_created', { taskId: task.id, kind: task.kind, planId: task.planId, snapshotRevision: task.snapshot.revision }, now);
  return task;
}

export function executeTask(state, taskId, { quoteResult = 'valid', now = time() } = {}) {
  const task = state.tasks.find(item => item.id === taskId);
  if (!task) return { ok: false, message: '任务不存在。' };
  if (task.status === 'completed') return { ok: true, message: '此任务已模拟执行，不重复执行。' };
  if (task.status !== 'pending') return { ok: false, message: '此任务已取消或已过期，请检查当前建议。' };
  if (task.snapshot.revision !== state.revision || (task.kind === 'customer_contact' && !contactEligibility(state, now).allowed)) {
    task.status = 'stale';
    audit(state, 'task_blocked', { taskId, reason: '执行前重校验失败，证据已变更或当前条件不满足。' }, now);
    return { ok: false, message: '执行被拦截：证据或核验条件已变化，请按当前状态重新确认任务。' };
  }
  if (task.kind === 'internal_quote_check') recordQuoteCheck(state, quoteResult, now);
  task.status = 'completed';
  task.executedAt = now;
  audit(state, 'task_executed', { taskId, kind: task.kind, simulation: true, customerContacted: false }, now);
  return { ok: true, message: task.kind === 'customer_contact' ? '模拟发送已完成，未实际联系客户。' : '内部模拟核验已完成，客户未被联系。' };
}

function validateStoredCase(state) {
  if (state?.schemaVersion !== 1 || state.caseId !== 'synthetic-price-inquiry' || !Number.isInteger(state.revision) || state.revision < 1) return false;
  if (!Array.isArray(state.transcript) || !state.transcript.length || state.transcript.some((turn, index) => turn.id !== `T${index + 1}` || turn.role !== 'customer' || typeof turn.text !== 'string' || turn.text.length > 2000)) return false;
  const turnIds = new Set(state.transcript.map(turn => turn.id));
  const validTurnRefs = ids => Array.isArray(ids) && ids.every(id => typeof id === 'string' && turnIds.has(id));
  if (Object.keys(CONDITION_LABELS).some(key => typeof state.conditions?.[key]?.value !== 'string' || !validTurnRefs(state.conditions[key].evidenceTurnIds))) return false;
  if (!['unknown', 'claimed', 'verified', 'failed'].includes(state.relationship?.status) || !['unchecked', 'valid', 'expired', 'unavailable'].includes(state.knowledge?.status)) return false;
  if (!validTurnRefs(state.relationship.evidenceTurnIds) || !validTurnRefs(state.reviewedTurnIds) || !Array.isArray(state.audit) || !Array.isArray(state.analysisHistory) || !Array.isArray(state.tasks) || !state.analysis) return false;
  if (state.audit.some(event => !event || typeof event.id !== 'string' || typeof event.type !== 'string' || !Number.isInteger(event.revision) || (event.evidenceTurnIds !== undefined && !validTurnRefs(event.evidenceTurnIds)))) return false;
  return state.tasks.every(task => ['customer_contact', 'internal_quote_check'].includes(task.kind) && ['pending', 'completed', 'cancelled', 'stale'].includes(task.status) && task.snapshot?.analysis && task.snapshot?.conditions && Number.isInteger(task.snapshot.revision));
}

export function saveCase(state, storage = globalThis.localStorage) {
  try { storage.setItem(CASE_STORAGE_KEY, JSON.stringify(state)); return { ok: true }; }
  catch { return { ok: false, message: '浏览器未允许保存，本次操作仍可继续；请导出证据保存。' }; }
}

export function loadCase(storage = globalThis.localStorage, now = time()) {
  try {
    const raw = storage.getItem(CASE_STORAGE_KEY);
    if (!raw) return { state: createCase(now), recovered: false };
    const state = JSON.parse(raw);
    if (!validateStoredCase(state)) throw new Error('invalid case storage');
    // Re-derive current facts rather than trusting a cached eligibility flag.
    const understood = interpret(state.transcript);
    state.analysis = { ...state.analysis, ...understood, reviewRequired: understood.unrecognizedTurnIds.some(id => !state.reviewedTurnIds.includes(id)), unresolvedTurnIds: understood.unrecognizedTurnIds.filter(id => !state.reviewedTurnIds.includes(id)) };
    return { state, recovered: false };
  } catch { return { state: createCase(now), recovered: true, message: '案例记录不可用，已恢复默认合成案例；原工作台数据不受影响。' }; }
}

export function resetCase(storage = globalThis.localStorage, now = time()) {
  const state = createCase(now);
  return { state, ...saveCase(state, storage) };
}

export function exportEvidence(state, now = time()) {
  return JSON.stringify({ format: 'drivefollow-inquiry-evidence-v1', exportedAt: now, notice: '合成开发／回归案例。规则模拟理解；关系、知识核验及任务执行均为模拟。无真实价格、真实触达或准确率结论。', state }, null, 2);
}
