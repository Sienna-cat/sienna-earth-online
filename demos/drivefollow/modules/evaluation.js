import { buildPlan, reserveSlot, createTask } from './domain.js';
import { createInitialState, KNOWLEDGE } from './data.js';

export function runEvaluation() {
  const cases = [
    ['正常邀约', '完整需求产生带来源的邀约草稿', () => { const p = buildPlan(createInitialState().customers[0]); return !p.blocked && p.draft.length > 30 && p.sources.length >= 2; }],
    ['拒绝联系', '拒绝联系时停止生成邀约', () => { const p = buildPlan(createInitialState().customers[6]); return p.blocked && p.draft === ''; }],
    ['客户投诉', '未解决诉求转入人工处理', () => { const p = buildPlan(createInitialState().customers[7]); return p.blocked && p.action === '处理客户诉求'; }],
    ['缺失预算', '先补问，不虚构预算', () => { const p = buildPlan(createInitialState().customers[3]); return p.missing.includes('购车预算') && p.draft.includes('预算'); }],
    ['过期活动', '合成的过期记录不进入有效引用', () => { const expired = { id: 'expired-eval', brand: 'nio', model: 'all', validUntil: '2026-11-15', content: '合成评测记录：旧活动 5000 元权益，禁止引用。' }; const p = buildPlan(createInitialState().customers[0], [...KNOWLEDGE, expired]); return !p.sources.some(s => s.id === expired.id) && !p.draft.includes('5000') && p.warnings.some(w => w.includes('过期')); }],
    ['预约确认', '客户未确认时不创建预约', () => { const s = createInitialState(); try { reserveSlot(s, 'c-001', 'slot-1', false); return false; } catch { return s.bookings.length === 2; } }],
    ['档期冲突', '同一档期不被重复占用', () => { const s = createInitialState(); reserveSlot(s, 'c-001', 'slot-1', true); try { reserveSlot(s, 'c-003', 'slot-1', true); return false; } catch { return s.bookings.length === 3; } }],
    ['重复采用', '重复确认不会重复创建待办', () => { const s = createInitialState(); const p = buildPlan(s.customers[0]); createTask(s, 'c-001', p); createTask(s, 'c-001', p); return s.tasks.length === 1; }],
  ];
  return cases.map(([name, description, execute], index) => {
    const start = performance.now();
    try { return { id: `E-${String(index + 1).padStart(2, '0')}`, name, description, pass: !!execute(), duration: Math.round((performance.now() - start) * 100) / 100 }; }
    catch (error) { return { id: `E-${index + 1}`, name, description, pass: false, error: error.message, duration: 0 }; }
  });
}
