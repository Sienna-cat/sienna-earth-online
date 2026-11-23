export function portfolioContent(){return `
<section class="case-page">
  <div class="page-header"><div><div class="eyebrow">PRODUCT CASE STUDY · 2026</div><h1>把运营目标，交付成行动。</h1><p>DrivePulse / 面向车主运营的 Agent 工作台 · 个人概念项目</p></div><div class="case-header-actions"><a class="secondary-button compact" href="../evidence.html">面试证据入口 ↗</a><a class="primary-button compact" href="#/workbench">体验工作流 ↗</a></div></div>
  <div class="case-grid"><div class="case-main"><div class="case-intro"><span class="case-number">01 /</span><div><h2>从“谁需要关怀”，<br>到“下一步做什么”。</h2><p>运营人员需要在行为数据、服务记录和触达规则之间反复核对。这个项目探索：能否把这些步骤组织成一项可交办、可介入、可追溯的工作？</p></div></div>
  <div class="case-flow">${[
    ['交办目标','识别活跃下降、仍有服务需求的车主'],
    ['收集依据','查行为数据 → 核对车主事实 → 校验触达规则'],
    ['人工决策','调整人群与文案，批准后创建待执行任务'],
    ['回收结果','记录响应与拒绝，更新下一步行动']
  ].map(([label,text],i)=>`<div class="case-flow-row"><span>0${i+1}</span><div><small>${label}</small><strong>${text}</strong></div></div>`).join('')}</div></div>
  <aside class="case-aside"><div class="case-stat"><span>主要用户</span><strong>车主运营</strong><small>以任务为核心组织工作；服务专员负责需要人工判断的后续。</small></div><div class="case-stat"><span>实现方式</span><strong>可控工作流</strong><small>24 条虚构车主记录 · 本地规则与模板 · 浏览器持久化。</small></div><div class="case-stat"><span>成果边界</span><strong>产品原型</strong><small>非蔚来官方项目。没有真实访谈、业务试点或运营收益结论。</small></div></aside></div>

  <div class="case-section"><div class="section-title"><div><span class="panel-kicker">02 / ROLE FIT</span><h2>这份 JD，如何变成产品证据</h2></div><span class="tiny-label">高级 AI 产品经理 · Agent 应用</span></div>
  <div class="comparison-table"><div class="comparison-head"><span>岗位关注</span><span>项目里的设计</span><span>可以检查的证据</span></div>
  ${[
    ['产品定义与能力边界','只做服务关怀任务，优先解决查数与核对的摩擦','场景假设、MVP 边界、首版取舍'],
    ['会话、任务、资料、成果的组织','交办目标挂到运行；任务关联车主事实与工具记录','工作台、任务中心、车主资料、结果复盘'],
    ['人机协作与接续工作','审批前可改文案与人群；草稿保留；失败可恢复','修改草稿、刷新继续、工具失败重试'],
    ['知识、数据与工具集成','官网知识卡片区分事实与人群假设；工具返回值与规则版本可追溯','知识库搜索与来源、执行记录、任务 JSON'],
    ['效果验收与问题归因','记录失败、人工修改、反馈；说明指标分母','业务测试与本地复盘，不虚构业务效果'],
    ['产品运营与场景渗透','首个任务模板引导；单场景试点后再扩展','下方的验证计划，尚待真实用户执行']
  ].map(r=>`<div class="comparison-row">${r.map(c=>`<span>${c}</span>`).join('')}</div>`).join('')}</div></div>

  <div class="case-sections"><article><span class="panel-kicker">03 / PROBLEM HYPOTHESIS</span><h3>先验证问题是否成立</h3><p>假设：运营人员需要跨多个系统核对资格，且遗漏退订、投诉或最近触达记录会增加返工。下一步访谈 3–5 位运营人员，用最近一次真实任务复现流程。当前没有将假设写成访谈发现。</p></article><article><span class="panel-kicker">04 / INTERACTION CHOICE</span><h3>任务是主要工作单元</h3><p>首版采用“交办表单 + 执行步骤 + 可编辑成果”。自由文本保存目标，结构化条件控制筛选，避免暗示系统理解了任意复杂指令。多轮对话在确有任务澄清需求后再加入。</p></article><article><span class="panel-kicker">05 / SCOPE CHOICE</span><h3>先把执行边界做清楚</h3><p>采用确定性规则和模板，以稳定演示资格校验、审批与状态变更。尚未接入大模型、CRM 或外部触达渠道；未来让模型提取与组织信息，写入校验继续由程序负责。</p></article></div>

  <div class="case-section"><span class="panel-kicker">06 / TOOL CONTRACTS</span><h2>每个动作都有输入、结果与边界</h2><div class="tool-contracts">${[
    ['queryOwnerSegment','城市、下降阈值','返回两个 30 天窗口的访问次数、候选 ID；服务需求为必选项。'],
    ['getOwnerFacts','候选车主记录','核对退订、未解决投诉、联系方式、7 天内触达；返回排除原因。'],
    ['retrieveOperationPolicy','规则版本与演示日期','检查有效期。过期阻断；由用户更新演示规则后继续。'],
    ['createOperationTask','已审核人群、非空文案','再次检查资格；同一运行重复批准返回原结果，不重复写入。'],
    ['recordOperationOutcome','任务 ID、结果状态','保留反馈历史；拒绝后标记退订，影响未来分群与审批。']
  ].map(([name,input,output])=>`<div><code>${name}</code><span>输入 · ${input}</span><p>${output}</p></div>`).join('')}</div><p class="metric-definition">prepareOutreach 使用固定模板整理建议。工具记录展示实际动作和结构化结果，不展示虚构的模型推理。</p></div>

  <div class="case-section"><span class="panel-kicker">07 / VALIDATION PLAN</span><h2>技术可运行之后，还要验证是否有用</h2><div class="case-sections"><article><h3>① 任务与规则访谈</h3><p>请运营人员演示最近一次关怀任务，记录耗时、系统切换、资格判断和不可接受错误。确认“活跃下降”是否是有意义的业务信号。</p></article><article><h3>② 留出案例评测</h3><p>制作 30–50 个正常与异常案例。将开发案例和留出案例分开，以事实正确、规则合规、步骤完整、任务真正创建作为验收标准。</p></article><article><h3>③ 用户任务测试</h3><p>用难度匹配的案例比较人工和辅助流程，包含核查与修改时间。记录采用、修改、驳回及原因；没有真实试点前不宣称留存或响应提升。</p></article></div></div>

  <div class="case-section demo-script"><span class="panel-kicker">08 / A THREE-MINUTE DEMO</span><h2>面试演示顺序</h2><ol><li><b>30 秒：</b>解释运营场景与边界，从上海 / 下降 ≥50% 发起任务。</li><li><b>60 秒：</b>展示 9 位候选中 5 位可触达、4 位被排除；查看事实与规则，改文案后批准。</li><li><b>45 秒：</b>将一项结果记为已响应，另一项记为拒绝；打开复盘解释统计分母。</li><li><b>45 秒：</b>演示查询失败重试或规则过期恢复，说明为什么保留人工接管。</li></ol><p>以上人数基于初始虚构数据。操作后资格会变化，可以重置演示并撤销重置。</p></div>
  <div class="case-section"><span class="panel-kicker">09 / KNOWLEDGE SOURCES</span><h2>让知识可追溯，让画像有边界</h2><p>从蔚来官网整理车型、补能、服务套餐及社区触点，按主题保存来源链接和采集日期。车型与用户场景的对应关系标为产品定位推断；具体配置、权益和动态覆盖数量需回到官方页面核验。</p><p>当前为本地可搜索资料库，供运营人员查阅。尚未接入向量检索或大模型，也不会根据车型自动补写用户的家庭、职业或兴趣画像。</p><a class="secondary-button" href="#/knowledge">查看蔚来知识库 ↗</a></div>
</section>`;}
