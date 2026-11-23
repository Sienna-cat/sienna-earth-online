import { DEMO_DATE, KNOWLEDGE, VEHICLES, SLOTS, createInitialState } from './modules/data.js';
import { assessLead, createTask, recordOutcome, reserveSlot, uid } from './modules/domain.js';
import { requestPlan } from './modules/plan-client.js';
import { persistState, readState } from './modules/store.js';
import { runEvaluation } from './modules/evaluation.js';
import { esc, vehicle, evidenceLabel, pipelineView, knowledgeView, qualityView } from './modules/views.js';

let state = readState();
const STATIC_MODE = document.documentElement.dataset.hosting === 'static';
const ui = { selectedId: null, filter: 'all', knowledgeFilter: 'all', query: '', view: 'workspace', busy: new Set() };
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const dialog = $('#detailDialog');

function toast(message, error = false) {
  const node = document.createElement('div');
  node.className = `toast${error ? ' error' : ''}`;
  node.textContent = message;
  $('#toastRegion').append(node);
  setTimeout(() => node.remove(), 4300);
}
function save() {
  try { persistState(state); } catch { toast('浏览器存储不可用；本次操作仍保留在页面内。', true); }
  render();
}
function modal(title, content, eyebrow = 'DRIVEFOLLOW') {
  dialog.innerHTML = `<div class="modal-content"><div class="modal-header"><div><span class="eyebrow">${eyebrow}</span><h2 id="detailTitle">${esc(title)}</h2></div><button class="icon-button" data-close-dialog aria-label="关闭弹窗">×</button></div>${content}</div>`;
  dialog.showModal();
}
function filteredCustomers() {
  const q = ui.query.trim().toLowerCase();
  return state.customers.filter(lead => {
    const a = assessLead(lead);
    const matches = ui.filter === 'all' || ui.filter === 'priority' && a.label === '优先跟进' || ui.filter === 'missing' && a.label === '待补充' || ui.filter === 'booked' && lead.status === 'booked';
    return matches && (!q || `${lead.name}${vehicle(lead.model).name}${lead.needs?.join('')}`.toLowerCase().includes(q));
  }).sort((a, b) => assessLead(b).score - assessLead(a).score);
}
function renderLeadList() {
  const leads = filteredCustomers();
  $('#leadList').innerHTML = leads.length ? leads.map(lead => {
    const a = assessLead(lead);
    return `<button class="lead-row ${lead.id === ui.selectedId ? 'selected' : ''}" data-open-lead="${esc(lead.id)}" aria-pressed="${lead.id === ui.selectedId}"><span class="lead-avatar">${esc(lead.name.slice(0,1))}</span><span class="lead-main"><span class="lead-topline"><strong>${esc(lead.name)}</strong><small>${esc(vehicle(lead.model).name)}</small></span><span class="lead-detail">${esc(lead.history?.[0]?.text || '暂无跟进记录')}</span></span><span class="lead-meta"><span class="status-label ${a.tone}">${a.label}</span><small class="lead-time">${lead.status === 'booked' ? '已有确认预约' : `${lead.lastContact.slice(5).replace('-', ' / ')} 沟通`}</small></span></button>`;
  }).join('') : '<div class="empty-list">没有符合条件的客户。试试其他关键词或筛选条件。</div>';
}
function renderMetrics() {
  const priority = state.customers.filter(c => assessLead(c).label === '优先跟进').length;
  $('#pendingCount').textContent = state.customers.filter(c => !assessLead(c).blocked && c.status !== 'booked').length;
  $('#taskCount').textContent = state.tasks.filter(t => t.status === 'pending').length;
  $('#taskHint').textContent = state.tasks.length ? `已完成 ${state.tasks.filter(t => t.status === 'completed').length} 项 · 本浏览器记录` : '采用建议后创建跟进待办';
  $('#bookingCount').textContent = state.bookings.filter(b => b.status === 'confirmed').length;
  $('#priorityHint').textContent = `↗ 其中 ${priority} 位已表达试驾意愿`;
  $('#bookingHint').textContent = `包含 ${state.bookings.filter(b => b.seeded).length} 场初始模拟预约`;
  $('.nav-count').textContent = $('#pendingCount').textContent;
  $('#allCount').textContent = state.customers.length;
  $('#priorityCount').textContent = priority;
  $('#missingCount').textContent = state.customers.filter(c => assessLead(c).label === '待补充').length;
  $('#bookedCount').textContent = state.customers.filter(c => c.status === 'booked').length;
  $$('.filter-chip').forEach(chip => chip.classList.toggle('active', chip.dataset.filter === ui.filter));
}
function bookingSummary(booking, lead) {
  const slot = SLOTS.find(s => s.id === booking.slotId);
  return `<div class="booking-row"><span>客户</span><b>${esc(lead.name)}</b></div><div class="booking-row"><span>时间</span><b>${slot.date.slice(5).replace('-', '月')}日 ${slot.time}</b></div><div class="booking-row"><span>状态</span><b class="text-green">已确认 · 模拟预约</b></div>`;
}
function actionPanel() {
  const lead = state.customers.find(c => c.id === ui.selectedId);
  if (!lead) {
    $('#actionPanel').innerHTML = `<div class="empty-action"><div class="empty-illustration"><span>✦</span><span>↗</span><span>◎</span></div><h3>每次跟进，都有一个好起点</h3><p>选择一位客户，查看事实与沟通记录，<br>让 Agent 为你准备下一步行动。</p><button class="secondary-button" id="selectPriority">从优先客户开始 →</button><span class="demo-footnote">虚构客户 · 规则驱动演示 · 本地保存</span></div>`;
    return;
  }
  const plan = state.plans[lead.id];
  const a = assessLead(lead);
  const busy = ui.busy.has(lead.id);
  $('#actionPanel').innerHTML = `<div class="action-detail"><div class="action-header"><div class="action-identity"><span class="lead-avatar">${esc(lead.name.slice(0,1))}</span><div><h2>${esc(lead.name)}</h2><p>${esc(vehicle(lead.model).name)} · ${esc(lead.source)}</p></div></div><button class="icon-button action-close" id="closeAction" aria-label="关闭客户详情">×</button></div>
    <div class="action-body"><div class="priority-banner ${a.blocked ? 'blocked-banner' : ''}"><span class="priority-burst">${a.blocked ? '!' : '✦'}</span><div><b>${a.label}</b><span>${a.reason}</span></div></div>
    <div class="action-section"><div class="section-label">客户事实 <button class="trace-toggle" id="editFacts">补充 / 修改 ↗</button></div><div class="facts-grid">${[{ label: '意向车型', value: vehicle(lead.model).name }, { label: '购车预算', value: lead.budget || '待补充' }, { label: '关注重点', value: lead.needs.join('、') || '待补充' }].map(fact => `<div class="fact-card"><span>${fact.label}</span><b>${esc(fact.value)}</b></div>`).join('')}</div></div>
    <details class="history-details"><summary>最近沟通 <span>${lead.lastContact}</span></summary>${lead.history.map(h => `<div class="history-entry"><small>${h.date}</small><p>${esc(h.text)}</p></div>`).join('')}</details>
    ${plan ? renderPlan(plan, lead) : `<div class="action-section plan-cta"><div class="section-label">下一步</div><p class="helper-text">${a.blocked ? '当前客户需要人工处理。生成建议将显示规则阻断与处理方向。' : '结合客户记录、车型资料与门店规则，准备一份可修改、有来源的跟进建议。'}</p><button class="primary-button" id="generatePlan" ${busy ? 'disabled' : ''}>${busy ? '<span class="spinner"></span> 正在准备建议…' : '✦ 生成跟进建议'}</button><p class="demo-footnote">默认规则模式 · 配置模型后可生成模型草稿</p></div>`}
    </div></div>`;
}
function renderPlan(plan, lead) {
  const task = state.tasks.find(t => t.leadId === lead.id && t.status === 'pending');
  const booking = state.bookings.find(b => b.leadId === lead.id && b.status === 'confirmed');
  const mode = { model: '模型草稿 · 待顾问核查', fallback: '模型不可用 · 已回退到规则', offline: '服务不可用 · 本地规则结果', demo: '规则草稿 · 待顾问确认', 'rule-blocked': '业务规则已阻止邀约' }[plan.mode] || '规则草稿';
  return `<div class="action-section"><div class="section-label">${plan.blocked ? '处理建议' : 'Agent 建议'} <button class="trace-toggle" id="traceToggle" aria-expanded="false">查看执行过程 ↗</button></div>
    ${!plan.blocked && plan.audience ? `<details class="knowledge-context"><summary>车型定位与适配参考 <span>销售假设 · 待确认</span></summary>${plan.positioning ? `<h4>官方定位摘要</h4><p>${esc(plan.positioning)}</p>` : ''}<h4>适配人群 · 定位推断</h4><p>${esc(plan.audience)}</p></details>` : ''}
    ${plan.blocked ? `<div class="result-card error"><b>${esc(plan.action)}</b><p>不生成营销邀约。${lead.complaint ? '请先与客户核实并处理诉求，完成后再恢复常规跟进。' : '保留客户拒绝联系的记录，停止营销任务。'}</p></div>` : `<div class="draft-box"><textarea id="draftText" rows="5" maxlength="2000" aria-label="可编辑的跟进草稿">${esc(plan.editedDraft ?? plan.draft)}</textarea><div class="draft-footer"><small>${mode}</small><button id="copyDraft">复制文案</button></div></div>`}
    <ul class="warning-list">${plan.warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>
    ${!plan.blocked ? `<div class="action-section"><div class="section-label">可核查的参考资料 <span>${plan.sources.length} 份有效来源</span></div><div class="source-list">${plan.sources.map(s => `<button class="source-chip" data-source-id="${s.id}"><i>▤</i>${esc(s.title)} · ${s.version}</button>`).join('')}</div></div>` : ''}
    <div class="trace-section" id="traceSection" hidden><div class="section-label">实际执行步骤</div><div class="trace-list">${plan.trace.map(step => `<div class="trace-step ${step.status}"><b>${esc(step.label)}</b><small>${esc(step.detail)} · ${esc(step.tool)}</small></div>`).join('')}</div></div>
    ${booking ? `<div class="action-section"><div class="section-label">已确认试驾</div><div class="booking-box">${bookingSummary(booking,lead)}</div></div>` : !plan.blocked ? `<div class="action-section"><div class="section-label">模拟试驾档期 <span>客户确认后登记</span></div><div class="slot-grid">${SLOTS.filter(s => s.model === lead.model).map(slot => { const taken = state.bookings.some(b => b.slotId === slot.id && b.status === 'confirmed'); return `<button class="slot-option ${taken ? 'taken' : ''}" data-slot-id="${slot.id}" ${taken ? 'disabled' : ''}><b>${slot.date.slice(5).replace('-', '月')}日 · ${slot.time}</b><small>${taken ? '已被预约' : '可预约 · 点击确认'}</small></button>`; }).join('')}</div></div>` : ''}
    <div class="action-actions">${plan.blocked ? lead.complaint ? '<button class="secondary-button" id="recordOutcome">记录处理结果 →</button>' : '<span class="helper-text">当前处于停止联系状态</span>' : task || booking ? '<button class="primary-button" id="recordOutcome">记录跟进结果 →</button>' : '<button class="secondary-button" id="rejectPlan">暂不采用</button><button class="primary-button" id="adoptPlan">采用并创建待办 →</button>'}</div>`;
}
async function generatePlan(lead) {
  if (ui.busy.has(lead.id)) return;
  ui.busy.add(lead.id); actionPanel();
  const start = performance.now();
  try {
    const plan = await requestPlan(lead, { staticMode: STATIC_MODE });
    state.plans[lead.id] = plan;
    state.runs.unshift({ id: uid('run'), leadId: lead.id, planId: plan.id, mode: plan.mode, duration: Math.round(performance.now()-start), completedAt: new Date().toISOString() });
    save(); toast(plan.blocked ? '已停止邀约，显示人工处理建议' : plan.brand === 'nio' ? '已引用蔚来官方资料；人群假设需向客户确认' : '建议已生成，请核查后采用');
  } finally { ui.busy.delete(lead.id); if (ui.selectedId === lead.id) actionPanel(); }
}
function sourceModal(id) {
  const s = KNOWLEDGE.find(d => d.id === id);
  if (!s) return;
  modal(s.title, `<div class="source-metadata"><span class="evidence-badge ${s.evidenceType || 'demo'}">${evidenceLabel(s)}</span><span>${esc(s.version)}</span><span>${s.retrievedAt ? '采集' : '更新'}：${s.retrievedAt || s.updated}</span>${s.validUntil ? `<span>有效至：${s.validUntil}</span>` : ''}</div>${s.sourceUrl ? `<p class="source-origin">依据：${esc(s.publisher)}<br><a href="${esc(s.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(s.sourceUrl)} ↗</a></p>` : ''}<p class="source-content">${esc(s.content)}</p>${s.guardrail ? `<div class="policy-note"><b>使用边界</b><p>${esc(s.guardrail)}</p></div>` : ''}<p class="source-disclaimer">${s.brand === 'nio' ? s.evidenceType === 'inference' ? '项目整理的销售假设，非官网用户画像或真实调研结论。请向客户核实。' : s.evidenceType === 'guardrail' ? '依据官方说明整理的销售沟通边界；非独立官方承诺。' : '人工整理的官方页面摘要，非逐字原文。配置以当前官方信息为准。' : `本地演示资料${s.category === '已过期' ? ' · 已从有效检索中排除' : ''}`}</p><div class="modal-actions"><button class="secondary-button" data-close-dialog>关闭</button></div>`, 'KNOWLEDGE SOURCE');
}
function bookingModal(lead, slotId) {
  const slot = SLOTS.find(s => s.id === slotId);
  modal('确认试驾预约', `<div class="booking-box modal-spacing"><div class="booking-row"><span>客户 / 车型</span><b>${esc(lead.name)} · ${vehicle(lead.model).name}</b></div><div class="booking-row"><span>时段</span><b>${slot.date} · ${slot.time}</b></div><div class="booking-row"><span>门店</span><b>华东体验中心 · 模拟</b></div></div><form id="bookingForm"><label class="checkbox-row"><input name="confirmed" type="checkbox" required>客户已明确同意上述试驾时间</label><p class="helper-text">只有确认后才会占用模拟档期。此操作不会向客户发送消息。</p><p id="bookingError" class="form-error" role="alert"></p><div class="modal-actions"><button type="button" class="secondary-button" data-close-dialog>暂不预约</button><button class="primary-button">确认预约</button></div></form>`, 'TEST DRIVE');
  $('#bookingForm').addEventListener('submit', event => {
    event.preventDefault();
    try { reserveSlot(state, lead.id, slotId, new FormData(event.target).has('confirmed')); dialog.close(); delete state.plans[lead.id]; save(); toast('试驾已登记，客户状态已更新'); generatePlan(lead); }
    catch (error) { $('#bookingError').textContent = error.message; }
  });
}
function outcomeModal(lead) {
  const options = lead.complaint ? [['resolved','客户诉求已解决'],['later','仍需后续处理']] : [['contacted','已联系，继续跟进'],['noanswer','暂未接通'],['later','客户希望稍后联系'],['declined','客户拒绝后续联系']];
  modal('记录跟进结果', `<form id="outcomeForm" class="modal-spacing"><label>跟进结果<select name="outcome">${options.map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>备注<textarea name="note" maxlength="800" rows="3" placeholder="记录客户反馈，方便下一次接续沟通"></textarea></label><label>下一次行动（可选）<input name="nextAction" maxlength="120" placeholder="例如：周六上午确认到店路线"></label><div class="modal-actions"><button type="button" class="secondary-button" data-close-dialog>取消</button><button class="primary-button">保存跟进结果</button></div></form>`, esc(lead.name));
  $('#outcomeForm').addEventListener('submit', event => {
    event.preventDefault(); const values = new FormData(event.target);
    try {
      recordOutcome(state, lead.id, values.get('outcome'), values.get('note'));
      const nextAction = values.get('nextAction').trim();
      if (nextAction && lead.consent) state.tasks.unshift({ id: uid('task'), leadId: lead.id, title: nextAction, draft: values.get('note'), status: 'pending', createdAt: new Date().toISOString() });
      dialog.close(); save(); toast('结果已保存，客户记录已更新');
    } catch (error) { toast(error.message, true); }
  });
}
function rejectModal(lead, plan) {
  modal('这条建议哪里需要改进？', `<form id="rejectForm" class="modal-spacing"><label>原因<select name="reason"><option>不符合当前客户阶段</option><option>事实或资料存在问题</option><option>话术不够自然</option><option>建议缺乏可执行性</option><option>其他</option></select></label><label>补充说明<textarea name="note" rows="3" maxlength="500" placeholder="帮助定位下次要改进的部分"></textarea></label><div class="modal-actions"><button type="button" class="secondary-button" data-close-dialog>取消</button><button class="primary-button">保存反馈</button></div></form>`, 'FEEDBACK');
  $('#rejectForm').addEventListener('submit', event => {
    event.preventDefault(); const values = new FormData(event.target);
    state.feedback.unshift({ id: uid('feedback'), leadId: lead.id, planId: plan.id, type: 'rejected', reason: `${values.get('reason')}${values.get('note') ? `：${values.get('note')}` : ''}`, createdAt: new Date().toISOString() });
    delete state.plans[lead.id]; dialog.close(); save(); toast('反馈已保存到质量与迭代');
  });
}
function editFacts(lead) {
  modal('补充客户事实', `<form id="factsForm" class="modal-spacing"><label>购车预算<input name="budget" maxlength="80" value="${esc(lead.budget)}" placeholder="未确认可留空"></label><label>关注重点<input name="needs" maxlength="200" value="${esc(lead.needs.join('、'))}" placeholder="用顿号分隔，例如：后排空间、家庭用车"></label><label class="checkbox-row"><input name="requestedDrive" type="checkbox" ${lead.requestedDrive ? 'checked' : ''}>客户已表达试驾意愿</label><p class="helper-text">仅填写客户明确说明的信息。保存后需要重新生成建议。</p><div class="modal-actions"><button type="button" class="secondary-button" data-close-dialog>取消</button><button class="primary-button">保存事实</button></div></form>`);
  $('#factsForm').addEventListener('submit', event => {
    event.preventDefault(); const values = new FormData(event.target);
    lead.budget = values.get('budget').trim(); lead.needs = values.get('needs').split(/[、,，]/).map(v => v.trim()).filter(Boolean); lead.requestedDrive = values.has('requestedDrive');
    lead.history.unshift({ date: DEMO_DATE, text: `顾问补充：预算${lead.budget || '待确认'}；关注${lead.needs.join('、') || '待确认'}；${lead.requestedDrive ? '已' : '尚未'}表达试驾意愿。` });
    delete state.plans[lead.id]; dialog.close(); save(); toast('事实已更新，请重新生成建议');
  });
}
function exportState() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), environment: 'demo-customers-real-vehicles', ...state }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'drivefollow-demo-records.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000); toast('本地记录已导出');
}
function guide() {
  modal('3 分钟，体验完整工作流', `<ol class="guide-steps"><li><b>选择客户</b><p>选择陈先生，生成有来源的跟进建议。</p></li><li><b>核查与采用</b><p>查看引用资料、修改草稿，再创建待办。</p></li><li><b>确认与记录</b><p>登记试驾时间，或记录未接通等跟进结果。</p></li><li><b>观察与验证</b><p>在质量页运行规则评测，查看真实操作记录。</p></li></ol><div class="policy-note">客户与档期为虚构演示，蔚来知识依据官方资料。默认规则驱动，所有操作只保存在本浏览器；演示业务日固定为 2026-11-19。</div><div class="modal-actions"><button class="primary-button" data-close-dialog>开始体验 →</button></div>`, 'QUICK START');
}
function render() {
  $$('.view').forEach(section => section.classList.toggle('active-view', section.id === `${ui.view}View`));
  $$('.nav-item').forEach(button => { button.classList.toggle('active', button.dataset.view === ui.view); button.setAttribute('aria-current', button.dataset.view === ui.view ? 'page' : 'false'); });
  if (ui.view === 'workspace') { renderMetrics(); renderLeadList(); actionPanel(); }
  if (ui.view === 'pipeline') $('#pipelineView').innerHTML = pipelineView(state);
  if (ui.view === 'knowledge') $('#knowledgeView').innerHTML = knowledgeView(ui.knowledgeFilter);
  if (ui.view === 'quality') $('#qualityView').innerHTML = qualityView(state);
}
function switchView(view) { ui.view = view; $('#sidebar').classList.remove('open'); render(); }

document.addEventListener('click', async event => {
  const button = event.target.closest('button, a'); if (!button) return;
  const lead = state.customers.find(c => c.id === ui.selectedId);
  if (button.dataset.view || button.dataset.viewLink) { event.preventDefault(); switchView(button.dataset.view || button.dataset.viewLink); }
  else if (button.dataset.openLead) { ui.selectedId = button.dataset.openLead; switchView('workspace'); if (innerWidth <= 1150) $('#actionPanel').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  else if (button.dataset.sourceId) sourceModal(button.dataset.sourceId);
  else if (button.dataset.knowledgeFilter) { ui.knowledgeFilter = button.dataset.knowledgeFilter; render(); }
  else if (button.dataset.slotId && lead) bookingModal(lead, button.dataset.slotId);
  else if (button.hasAttribute('data-close-dialog')) dialog.close();
  else if (button.hasAttribute('data-export')) exportState();
  else if (button.dataset.filter) { ui.filter = button.dataset.filter; renderMetrics(); renderLeadList(); }
  else switch (button.id) {
    case 'selectPriority': ui.selectedId = state.customers.find(c => c.id === 'c-001')?.id || filteredCustomers()[0]?.id; render(); break;
    case 'closeAction': ui.selectedId = null; render(); break;
    case 'generatePlan': await generatePlan(lead); break;
    case 'editFacts': editFacts(lead); break;
    case 'traceToggle': { const trace = $('#traceSection'); trace.hidden = !trace.hidden; button.setAttribute('aria-expanded', String(!trace.hidden)); button.textContent = trace.hidden ? '查看执行过程 ↗' : '收起执行过程 ↑'; break; }
    case 'copyDraft': try { await navigator.clipboard.writeText($('#draftText').value); toast('草稿已复制'); } catch { toast('无法访问剪贴板，可直接选择草稿复制。', true); } break;
    case 'adoptPlan': try { createTask(state, lead.id, state.plans[lead.id], $('#draftText').value); save(); toast('已创建跟进待办'); } catch (error) { toast(error.message, true); } break;
    case 'recordOutcome': outcomeModal(lead); break;
    case 'rejectPlan': rejectModal(lead, state.plans[lead.id]); break;
    case 'runEvaluation': state.evaluations = runEvaluation(); state.evaluatedAt = new Date().toISOString(); save(); toast(`${state.evaluations.filter(r=>r.pass).length} / 8 个规则场景通过`); break;
    case 'menuToggle': $('#sidebar').classList.toggle('open'); break;
    case 'helpButton': guide(); break;
    case 'exportButton': exportState(); break;
    case 'filterButton': ui.filter = ['all','priority','missing','booked'][(['all','priority','missing','booked'].indexOf(ui.filter)+1)%4]; renderMetrics(); renderLeadList(); break;
    case 'newLeadButton': $('#newLeadDialog').showModal(); break;
    case 'closeNewLead': case 'cancelNewLead': $('#newLeadDialog').close(); break;
    case 'resetDemo': modal('重置演示数据', '<p class="modal-intro">这会清除本浏览器创建的客户、任务、反馈和预约，并恢复初始演示客户与预约。</p><div class="modal-actions"><button class="secondary-button" data-close-dialog>取消</button><button class="primary-button" id="confirmReset">确认重置</button></div>'); break;
    case 'confirmReset': state = createInitialState(); ui.selectedId = null; ui.filter = 'all'; ui.query = ''; $('#leadSearch').value = ''; dialog.close(); switchView('workspace'); save(); toast('已恢复初始演示数据'); break;
  }
});
$('#leadSearch').addEventListener('input', event => { ui.query = event.target.value; renderLeadList(); });
document.addEventListener('input', event => {
  if (event.target.id === 'draftText' && state.plans[ui.selectedId]) { state.plans[ui.selectedId].editedDraft = event.target.value; try { persistState(state); } catch { /* save() reports storage availability at mutation boundaries. */ } }
});
$('#newLeadForm').addEventListener('submit', event => {
  event.preventDefault(); const values = new FormData(event.target); const name = values.get('name').trim(); if (!name) return;
  const lead = { id: uid('c'), name, model: values.get('model'), budget: values.get('budget').trim(), needs: [], source: '手动添加', lastContact: DEMO_DATE, consent: true, complaint: false, requestedDrive: false, status: 'new', history: [{ date: DEMO_DATE, text: values.get('history').trim() || '尚未完成需求沟通。' }] };
  state.customers.unshift(lead); $('#newLeadDialog').close(); event.target.reset(); ui.selectedId = lead.id; ui.filter = 'all'; ui.query = ''; $('#leadSearch').value = ''; ui.view = 'workspace'; save(); toast('客户已添加，请核对并补充客户事实');
});
$('#newLeadForm select[name="model"]').innerHTML = Object.entries(VEHICLES).map(([id,item]) => `<option value="${id}">${esc(item.name)} · ${esc(item.type)}</option>`).join('');
render();
