import { assessLead } from './domain.js';
import { DEMO_DATE, KNOWLEDGE, VEHICLES } from './data.js';
import { buildFollowEvidence } from './evidence.js';

export const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
export const vehicle = model => VEHICLES[model] || { name: '待确认车型' };
export const evidenceLabel = doc => ({ fact: '官方事实', inference: '定位推断', guardrail: '销售边界' })[doc.evidenceType] || '待核查';
export const clockTime = value => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export function pipelineView(state) {
  const columns = [['new', '新线索'], ['following', '跟进中'], ['booked', '已约试驾'], ['service', '人工处理 / 暂停']];
  const rows = status => state.customers.filter(lead => lead.status === status || status === 'service' && lead.status === 'paused');
  const tasks = state.tasks;
  return `<div class="subpage-heading"><div><div class="eyebrow">PIPELINE</div><h1>客户管线</h1><p>从客户的当前状态，看到下一步行动。</p></div><button class="secondary-button" data-view-link="workspace">← 返回今日跟进</button></div>
    <div class="pipeline-board">${columns.map(([status, label]) => `<section class="pipeline-column"><h3>${label} <b>${rows(status).length}</b></h3>${rows(status).map(lead => `<button class="pipeline-card" data-open-lead="${lead.id}"><strong>${esc(lead.name)}</strong><small>${esc(vehicle(lead.model).name)} · ${esc(lead.needs?.[0] || '待补充需求')}</small><span class="status-label ${assessLead(lead).tone}">${assessLead(lead).label}</span></button>`).join('') || '<p class="empty-column">暂无客户</p>'}</section>`).join('')}</div>
    <section class="panel task-panel"><div class="panel-header"><div><h2>跟进待办</h2><p>采用建议后创建；记录联系结果后完成。</p></div><span class="demo-pill">${tasks.filter(t => t.status === 'pending').length} 待处理</span></div>${tasks.length ? tasks.map(task => `<button class="task-row" data-open-lead="${task.leadId}"><span class="task-check ${task.status}">${task.status === 'completed' ? '✓' : '○'}</span><div><b>${esc(state.customers.find(c => c.id === task.leadId)?.name)} · ${esc(task.title)}</b><p>${esc(task.result || task.draft)}</p></div><span class="status-label ${task.status === 'completed' ? 'green' : 'orange'}">${task.status === 'completed' ? '已完成' : '待联系'}</span></button>`).join('') : '<div class="empty-list">暂时没有待办。采用一份跟进建议，即可开始。</div>'}</section>`;
}

export function knowledgeView(filter = 'all') {
  const filters = [['all','全部'], ['models','车型资料'], ['audience','适配人群'], ['services','服务'], ['guardrails','销售边界']];
  const docs = KNOWLEDGE.filter(doc => filter === 'all' || filter === 'models' && doc.category === '车型资料' || filter === 'audience' && doc.category === '用户画像' || filter === 'services' && ['加电服务','售后服务','社区服务','服务工具'].includes(doc.category) || filter === 'guardrails' && doc.evidenceType === 'guardrail');
  const nioCount = KNOWLEDGE.filter(doc => doc.brand === 'nio').length;
  const expiredCount = KNOWLEDGE.filter(doc => doc.validUntil && doc.validUntil < DEMO_DATE).length;
  return `<div class="subpage-heading"><div><div class="eyebrow">KNOWLEDGE BASE</div><h1>产品知识库</h1><p>蔚来官方资料与适配人群假设，随时回到来源核查。</p></div><span class="demo-pill">${nioCount} 份蔚来知识 · ${Object.keys(VEHICLES).length} 个真实车型版本</span></div>
    <div class="knowledge-filters" aria-label="知识分类">${filters.map(([id,label]) => `<button class="knowledge-filter ${filter === id ? 'active' : ''}" data-knowledge-filter="${id}" aria-pressed="${filter === id}">${label}</button>`).join('')}<span class="knowledge-count">${docs.length} 条</span></div>
    <div class="knowledge-layout"><div class="knowledge-list">${docs.map(doc => `<button class="knowledge-card" data-source-id="${doc.id}"><span class="knowledge-icon">▤</span><span class="knowledge-copy"><span class="knowledge-labels"><span class="evidence-badge ${doc.evidenceType || 'demo'}">${evidenceLabel(doc)}</span><span>NIO 蔚来</span></span><h3>${esc(doc.title)}</h3><p>${esc(doc.category)} · ${doc.retrievedAt ? '采集' : '更新'}于 ${doc.retrievedAt || doc.updated}${doc.validUntil ? ` · 有效至 ${doc.validUntil}` : ''}</p><span class="knowledge-tags">${doc.tags.map(tag => esc(tag)).join(' / ')}</span></span><span class="knowledge-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>
    <aside class="subpage-card"><div class="eyebrow">SOURCE POLICY</div><h3>有来源，才有依据</h3><p>蔚来资料采集于 2026-11-19，保留官网链接。所有车型均来自官网，按车型和有效期检索。${expiredCount ? `${expiredCount} 份过期活动已归档。` : ''}</p><p>“定位推断”是基于官方产品定位的销售假设，尚未经过真实用户调研，需要向客户确认。</p><div class="policy-note">价格、优惠、续航和服务权益不能直接变成承诺。站点数量属于历史快照，沟通前请核对官网或 NIO App。</div><p>独立作品集 Demo，非蔚来官方产品；资料为人工整理摘要，点击卡片可查看来源。</p></aside></div>`;
}

export function qualityView(state) {
  const results = state.evaluations;
  const evidence = buildFollowEvidence(state);
  const passed = results.filter(item => item.pass).length;
  const decisions = new Set(state.feedback.map(item => item.planId)).size;
  const accepted = new Set(state.feedback.filter(item => item.type !== 'rejected').map(item => item.planId)).size;
  const durations = state.runs.filter(run => Number.isFinite(run.duration)).map(run => run.duration);
  const average = durations.length ? (durations.reduce((a,b) => a+b,0) / durations.length / 1000).toFixed(2) : null;
  return `<div class="subpage-heading"><div><div class="eyebrow">QUALITY LOOP</div><h1>质量与迭代</h1><p>记录可观察的行为，把失败案例留给下一次改进。</p></div><button class="primary-button" id="runEvaluation">${results.length ? '重新运行评测' : '运行评测集'} <span>↗</span></button></div>
    <section class="follow-evidence-card"><div><span class="eyebrow">ADVISOR FEEDBACK</span><h2>顾问是否接受了建议？</h2><p>把直接采用、修改后采用和驳回分开记录，避免把一次点击当作完整的业务采用。</p></div><div class="follow-evidence-grid"><div><span>反馈分母</span><strong>${evidence.feedback.denominator || '—'}</strong><small>有明确反馈的建议</small></div><div><span>直接采用</span><strong>${evidence.feedback.accepted}</strong><small>无需修改</small></div><div><span>修改后采用</span><strong>${evidence.feedback.edited}</strong><small>顾问编辑后采用</small></div><div><span>规则场景</span><strong>${evidence.evaluations.total ? `${evidence.evaluations.passed}/${evidence.evaluations.total}` : '—'}</strong><small>${evidence.evidenceBoundary.status}</small></div></div><div class="follow-evidence-note">${evidence.feedback.adoptionRate === null ? '暂无采用分母；先在工作区完成一次建议反馈。' : `采用率 ${evidence.feedback.adoptionRate}%（直接采用 + 修改后采用 / 有明确反馈）`} · 反馈数据来自本浏览器的演示操作。</div></section>
    <div class="quality-summary"><div class="quality-stat"><span>规则场景通过率</span><strong>${results.length ? `${passed}/${results.length}` : '—'}</strong><small>${results.length ? `${passed} 个案例通过 · v1.0` : '尚未运行 · 8 个合成案例'}</small></div><div class="quality-stat"><span>建议采用 / 已反馈</span><strong>${accepted} / ${decisions}</strong><small>仅统计本浏览器操作 · 含修改后采用</small></div><div class="quality-stat"><span>本地生成平均耗时</span><strong>${average === null ? '—' : `${average}s`}</strong><small>${state.runs.length} 次记录 · 不含顾问核查时间</small></div></div>
    <div class="quality-layout"><div class="evaluation-table"><div class="evaluation-row header"><span>ID</span><span>评测场景</span><span>结果</span><span class="duration">耗时</span></div>${results.length ? results.map(item => `<div class="evaluation-row"><span>${item.id}</span><span><b>${esc(item.name)}</b><small class="case-description">${esc(item.description)}</small></span><span class="${item.pass ? 'eval-pass' : 'eval-fail'}">${item.pass ? '通过' : '失败'}</span><span class="duration">${item.duration} ms</span></div>`).join('') : '<div class="empty-list">点击「运行评测集」，实际执行拒绝联系、过期活动、预约冲突等规则检查。</div>'}</div>
    <aside class="subpage-card"><div class="eyebrow">REGRESSION CHECKS</div><h3>这是规则回归评测</h3><p>用八类示例场景检查拒绝联系、资料时效、预约确认和重复提交等规则；逐条查看执行结果与耗时。</p><p class="evaluation-time">${state.evaluatedAt ? `运行于 ${clockTime(state.evaluatedAt)}（北京时间）` : '未执行评测'}</p><a class="secondary-button" href="./portfolio.html#validation">查看验证方法 →</a></aside></div>
    <section class="panel task-panel"><div class="panel-header"><div><h2>顾问反馈与 Bad Case</h2><p>包括采用、修改后采用与驳回原因。</p></div><button class="secondary-button" data-export>导出记录 ↥</button></div>${state.feedback.length ? state.feedback.map(item => `<div class="feedback-row"><span class="status-label ${item.type === 'rejected' ? 'red' : 'green'}">${({ accepted: '直接采用', edited: '修改后采用', rejected: '暂不采用' })[item.type] || '已反馈'}</span><div><b>${esc(state.customers.find(c => c.id === item.leadId)?.name)}</b><p>${esc(item.reason || '顾问确认后创建待办')}</p></div><small>${clockTime(item.createdAt)}</small></div>`).join('') : '<div class="empty-list">还没有顾问反馈。尝试采用一条建议，或记录一条驳回原因。</div>'}</section>`;
}
