const percent = (numerator, denominator) => denominator ? Math.round(numerator / denominator * 100) : null;

export function buildPulseEvidence(state) {
  const run = state.runs?.[0] || null;
  const runOperations = run ? (state.operations || []).filter(operation => operation.runId === run.id) : [];
  const feedbackDenominator = runOperations.filter(operation => operation.status !== 'pending').length;
  const responded = runOperations.filter(operation => operation.status === 'responded').length;
  const exclusionReasons = [...new Set((run?.excluded || []).map(item => item.reason).filter(Boolean))];

  return {
    goal: run ? {
      text: run.goal,
      city: run.filters?.city || '全部城市',
      minDrop: Number(run.filters?.minDrop ?? 0),
      scenario: run.scenario || 'normal',
    } : null,
    audience: {
      candidates: run?.candidates?.length || 0,
      eligible: run?.eligible?.length || 0,
      excluded: run?.excluded?.length || 0,
      exclusionReasons,
    },
    execution: {
      created: runOperations.length,
      completed: feedbackDenominator,
      feedbackDenominator,
      responded,
      responseRate: percent(responded, feedbackDenominator),
    },
    evidenceBoundary: {
      status: '示例数据 · 浏览器任务记录',
      implementation: '规则驱动工作流 · 人工审核 · 本地任务写回',
      excludes: ['真实触达', '用户留存提升', '真实 CRM 接入'],
    },
  };
}
