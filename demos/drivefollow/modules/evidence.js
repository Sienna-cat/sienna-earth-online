const percent = (numerator, denominator) => denominator ? Math.round(numerator / denominator * 100) : null;

export function buildFollowEvidence(state) {
  const feedback = state.feedback || [];
  const evaluations = state.evaluations || [];
  const accepted = feedback.filter(item => item.type === 'accepted').length;
  const edited = feedback.filter(item => item.type === 'edited').length;
  const rejected = feedback.filter(item => item.type === 'rejected').length;
  const passed = evaluations.filter(item => item.pass).length;

  return {
    tasks: {
      pending: (state.tasks || []).filter(task => task.status === 'pending').length,
      completed: (state.tasks || []).filter(task => task.status === 'completed').length,
    },
    feedback: {
      denominator: feedback.length,
      accepted,
      edited,
      rejected,
      adoptionRate: percent(accepted + edited, feedback.length),
    },
    evaluations: {
      total: evaluations.length,
      passed,
      passRate: percent(passed, evaluations.length),
    },
    evidenceBoundary: {
      status: '规则回归 + 本地操作记录',
      excludes: ['真实顾问盲评', '真实模型质量', '业务预约/到店提升'],
    },
  };
}
