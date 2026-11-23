import { buildPlan } from './domain.js';

export async function requestPlan(lead, { staticMode = false, request = globalThis.fetch } = {}) {
  if (staticMode) {
    const plan = buildPlan(lead);
    return { ...plan, mode: plan.blocked ? 'rule-blocked' : 'demo' };
  }
  try {
    const response = await request(new URL('../api/plan', import.meta.url), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lead }),
      signal: AbortSignal.timeout(15000)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || '请求失败');
    return payload;
  } catch {
    const plan = buildPlan(lead);
    return { ...plan, mode: 'offline', warnings: [...plan.warnings, '本地服务不可用，当前展示浏览器规则生成的结果。'] };
  }
}
