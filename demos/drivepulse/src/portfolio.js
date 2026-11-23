export function portfolioContent(){return `
<section class="case-page">
  <div class="page-header"><div><div class="eyebrow">PRODUCT CASE STUDY · 2026</div><h1>把运营目标，交付成行动。</h1><p>DrivePulse / 面向车主运营的 Agent 工作台 · 个人开发作品</p></div><div class="case-header-actions"><a class="secondary-button compact" href="https://sienna-cat.github.io/drivefollow/portfolio/">查看完整作品集 ↗</a><a class="primary-button compact" href="#/workbench">体验工作流 ↗</a></div></div>
  <div class="case-grid"><div class="case-main"><div class="case-intro"><span class="case-number">01 /</span><div><h2>从“谁需要关怀”，<br>到“下一步做什么”。</h2><p>运营人员需要在行为数据、服务记录和触达规则之间反复核对。项目将数据查询、资格核对、人工审批和反馈组织为一项可追踪的运营任务。</p></div></div>
  <div class="case-flow">${[
    ['交办目标','识别活跃下降、仍有服务需求的车主'],
    ['收集依据','查行为数据 → 核对车主事实 → 校验触达规则'],
    ['人工决策','调整人群与文案，批准后创建待执行任务'],
    ['回收结果','记录响应与拒绝，更新下一步行动']
  ].map(([label,text],i)=>`<div class="case-flow-row"><span>0${i+1}</span><div><small>${label}</small><strong>${text}</strong></div></div>`).join('')}</div></div>
  <aside class="case-aside"><div class="case-stat"><span>主要用户</span><strong>车主运营</strong><small>以任务为核心组织工作；服务专员负责需要人工判断的后续。</small></div><div class="case-stat"><span>实现方式</span><strong>可控工作流</strong><small>24 条虚构车主记录 · 本地规则与模板 · 浏览器持久化。</small></div><div class="case-stat"><span>项目交付</span><strong>交互应用与规则校验</strong><small>独立开发，非蔚来官方产品；覆盖筛选、审批、任务与反馈。</small></div></aside></div>

  <div class="case-section"><div class="section-title"><div><span class="panel-kicker">02 / PRODUCT DESIGN</span><h2>围绕运营任务组织产品能力</h2></div><span class="tiny-label">任务编排 · 人工协作 · 结果反馈</span></div>
  <div class="comparison-table"><div class="comparison-head"><span>产品环节</span><span>项目里的设计</span><span>页面与交付</span></div>
  ${[
    ['产品定义与能力边界','只做服务关怀任务，优先解决查数与核对的摩擦','任务目标、流程设计与操作入口'],
    ['会话、任务、资料、成果的组织','交办目标挂到运行；任务关联车主事实与工具记录','工作台、任务中心、车主资料、结果复盘'],
    ['人机协作与接续工作','审批前可改文案与人群；草稿保留；失败可恢复','修改草稿、刷新继续、工具失败重试'],
    ['知识、数据与工具集成','官网知识卡片区分事实与人群假设；工具返回值与规则版本可追溯','知识库搜索与来源、执行记录、任务 JSON'],
    ['效果验收与问题归因','记录失败、人工修改、反馈；说明指标分母','规则测试、运行记录与反馈统计'],
    ['任务引导与复盘','预设任务模板，按步骤检查条件与执行结果','筛选条件、审批入口与任务复盘']
  ].map(r=>`<div class="comparison-row">${r.map(c=>`<span>${c}</span>`).join('')}</div>`).join('')}</div></div>

  <div class="case-sections"><article><span class="panel-kicker">03 / USER TASK</span><h3>先明确运营任务</h3><p>车主关怀同时涉及行为变化、服务需求与触达资格。产品将退订、投诉、联系方式和最近联系时间放入同一检查流程，让运营人员先确认依据，再批准任务。</p></article><article><span class="panel-kicker">04 / INTERACTION CHOICE</span><h3>任务是主要工作单元</h3><p>采用“交办表单 + 执行步骤 + 可编辑成果”。任务目标记录背景，城市、活跃下降阈值与服务需求控制筛选；结果支持调整人群与文案后审批。</p></article><article><span class="panel-kicker">05 / SCOPE CHOICE</span><h3>先把执行边界做清楚</h3><p>用规则与模板实现资格校验、审批和状态变化；执行前重新核对车主状态，重复审批复用已有任务。交互演示使用示例数据与浏览器存储。</p></article></div>

  <div class="case-section"><span class="panel-kicker">06 / TOOL CONTRACTS</span><h2>每个动作都有输入、结果与边界</h2><div class="tool-contracts">${[
    ['queryOwnerSegment','城市、下降阈值','返回两个 30 天窗口的访问次数、候选 ID；服务需求为必选项。'],
    ['getOwnerFacts','候选车主记录','核对退订、未解决投诉、联系方式、7 天内触达；返回排除原因。'],
    ['retrieveOperationPolicy','规则版本与演示日期','检查有效期。过期阻断；由用户更新演示规则后继续。'],
    ['createOperationTask','已审核人群、非空文案','再次检查资格；同一运行重复批准返回原结果，不重复写入。'],
    ['recordOperationOutcome','任务 ID、结果状态','保留反馈历史；拒绝后标记退订，影响未来分群与审批。']
  ].map(([name,input,output])=>`<div><code>${name}</code><span>输入 · ${input}</span><p>${output}</p></div>`).join('')}</div><p class="metric-definition">prepareOutreach 使用固定模板整理建议；工具记录展示输入、结构化结果、规则版本与执行状态。</p></div>

  <div class="case-section"><span class="panel-kicker">07 / QUALITY DESIGN</span><h2>按规则、任务与反馈检查质量</h2><div class="case-sections"><article><h3>① 资格与规则</h3><p>分别检查退订、投诉、联系方式与触达间隔；排除项显示原因，规则过期时暂停处理，更新后可继续。</p></article><article><h3>② 执行与恢复</h3><p>检查审批前编辑、执行前资格复查、重复批准和失败重试。任务、工具结果与事件记录相互对应。</p></article><article><h3>③ 反馈与复盘</h3><p>记录已响应、未响应、拒绝和需要跟进等结果，分别统计任务量、反馈分母与排除原因，支持后续规则调整。</p></article></div></div>

  <div class="case-section demo-script"><span class="panel-kicker">08 / A THREE-MINUTE DEMO</span><h2>三分钟体验完整任务</h2><ol><li><b>30 秒：</b>选择上海 / 活跃下降 ≥50%，发起关怀任务。</li><li><b>60 秒：</b>查看 9 位候选中 5 位可触达、4 位被排除的原因；修改文案后批准。</li><li><b>45 秒：</b>将一项结果记为已响应，另一项记为拒绝；打开复盘查看统计结果。</li><li><b>45 秒：</b>切换查询失败或规则过期场景，体验重试与恢复。</li></ol><p>以上人数基于初始虚构数据。操作后资格会变化，可以重置演示并撤销重置。</p></div>
  <div class="case-section"><span class="panel-kicker">09 / KNOWLEDGE SOURCES</span><h2>让知识可追溯，让画像有边界</h2><p>从蔚来官网整理车型、补能、服务套餐及社区触点，按主题保存来源链接和采集日期。车型与用户场景的对应关系标为产品定位推断；具体配置、权益和动态覆盖数量需回到官方页面核验。</p><p>资料库按主题检索，支持查看官方来源和采集日期。车型定位与客户事实分开保存，具体需求由运营人员结合客户记录确认。</p><a class="secondary-button" href="#/knowledge">查看蔚来知识库 ↗</a></div>
</section>`;}
