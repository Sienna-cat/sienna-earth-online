export const NIO_RETRIEVED_AT = '2026-11-19';
const publisher = 'NIO蔚来官网';
const version = `official-page-${NIO_RETRIEVED_AT}`;

const doc = (id, model, title, category, evidenceType, sourceUrl, content, tags, extra = {}) => ({
  id, brand: 'nio', model, title, category, evidenceType, publisher, sourceUrl,
  retrievedAt: NIO_RETRIEVED_AT, updated: NIO_RETRIEVED_AT, version, content, tags,
  ...(category === '车型资料' ? { guardrail: '官网摘要对应采集时页面，配置、选装与功能因版本而异，请核对当前配置表与实际交付车辆。辅助驾驶不能替代驾驶员。' } : {}),
  ...extra,
});

export const NIO_VEHICLES = {
  'nio-es6': { name: '蔚来 ES6', type: '智能电动全能 SUV', brand: 'nio', color: 'teal', description: '全能空间与智能体验', sourceUrl: 'https://www.nio.cn/es6' },
  'nio-et5': { name: '蔚来 ET5', type: '智能电动中型轿跑', brand: 'nio', color: 'blue', description: '高端潮流轿跑设计', sourceUrl: 'https://www.nio.cn/et5' },
  'nio-et5t': { name: '蔚来 ET5T', type: '智能电动旅行车', brand: 'nio', color: 'orange', description: '从都市到山海的旅行车', sourceUrl: 'https://www.nio.cn/et5t' },
  'nio-et7': { name: '蔚来 ET7', type: '智能电动高端行政轿车', brand: 'nio', color: 'ink', description: '行政舒适与全景互联', sourceUrl: 'https://www.nio.cn/et7' },
  'nio-es8': { name: '蔚来 ES8', type: '全场景科技旗舰 SUV', brand: 'nio', color: 'teal', description: '宽境六座与奢阔七座', sourceUrl: 'https://www.nio.cn/es8' },
  'nio-es8-five-seater': { name: '蔚来 ES8 大五座版', type: '全场景大五座旗舰 SUV', brand: 'nio', color: 'teal', description: '阔享空间与灵动装载', sourceUrl: 'https://www.nio.cn/es8-five-seater' },
  'nio-es9': { name: '蔚来 ES9', type: '科技行政旗舰 SUV', brand: 'nio', color: 'ink', description: '行政旗舰与户外探索', sourceUrl: 'https://www.nio.cn/es9' },
};

export const NIO_KNOWLEDGE = [
  doc('nio-es6-positioning', 'nio-es6', '蔚来 ES6 · 官方产品定位与体验重点', '车型资料', 'fact', 'https://www.nio.cn/es6', '蔚来官网将 ES6 定位为智能电动全能 SUV，强调长轴距带来的二排空间、多层舒适座椅、NOMI Mate 3.0、六屏生态，以及可充可换可升级的补能方式。页面同时列出 NOP+、领航换电、Pilot+、NIO Link 超感泊车和主动安全 2.0 等能力。', ['全能 SUV', '二排空间', '智能座舱', '可充可换']),
  doc('nio-es6-audience', 'nio-es6', '蔚来 ES6 · 适配人群销售假设', '用户画像', 'inference', 'https://www.nio.cn/es6', '基于官方产品定位的销售假设：适合重视家庭二排空间、座椅舒适、智能座舱和日常补能便利性的城市家庭用户。具体适配仍需顾问通过家庭成员、装载需求和补能条件确认，不能把画像当成真实用户调研结论。', ['家庭用户', '空间舒适', '补能便利'], { summary: '重视家庭空间、舒适和补能便利的城市家庭（销售假设）' }),
  doc('nio-et5-positioning', 'nio-et5', '蔚来 ET5 · 官方产品定位与体验重点', '车型资料', 'fact', 'https://www.nio.cn/et5', '蔚来官网将 ET5 定位为智能电动中型轿跑，强调高端潮流轿跑设计、环抱感座舱、15.6 英寸 AMOLED 中控、18.8 英寸 HUD、全系智能四驱、4D 全域舒适领航和 NOMI Mate 3.0。页面还列出可充可换可升级的补能体系。', ['中型轿跑', '智能四驱', '科技座舱', '潮流设计']),
  doc('nio-et5-audience', 'nio-et5', '蔚来 ET5 · 适配人群销售假设', '用户画像', 'inference', 'https://www.nio.cn/et5', '基于官方产品定位的销售假设：适合偏好轿跑造型、重视驾驶质感、智能座舱和城市通勤体验的个人用户或年轻家庭。顾问应进一步确认乘员数量、后备厢使用和驾驶场景，避免只凭年龄或审美替客户下结论。', ['轿跑审美', '驾驶体验', '城市通勤'], { summary: '偏好轿跑设计、驾驶质感与智能体验的用户（销售假设）' }),
  doc('nio-et5t-positioning', 'nio-et5t', '蔚来 ET5T · 官方产品定位与体验重点', '车型资料', 'fact', 'https://www.nio.cn/et5t', '蔚来官网将 ET5T 定位为智能电动旅行车，强调从都市到山海的旅程场景、约 1687L 最大放倒空间、约 75kg 车顶行李架承载、隐藏式电动拖钩、露营模式和对外放电。页面还列出双电机智能四驱、EP Mode 赛道模式和 7.1.4 Dolby Atmos 音响。', ['旅行车', '装载空间', '露营', '对外放电']),
  doc('nio-et5t-audience', 'nio-et5t', '蔚来 ET5T · 适配人群销售假设', '用户画像', 'inference', 'https://www.nio.cn/et5t', '基于官方产品定位的销售假设：适合有周末出游、露营、运动装备或宠物装载需求，且希望兼顾城市通勤和旅行场景的用户。实际适配应通过装载物品、出行频率、拖挂与补能条件逐项确认。', ['旅行出游', '露营', '装载需求'], { summary: '有旅行、露营和多装备装载需求的用户（销售假设）' }),
  doc('nio-et7-positioning', 'nio-et7', '蔚来 ET7 · 官方产品定位与体验重点', '车型资料', 'fact', 'https://www.nio.cn/et7', '蔚来官网将 ET7 定位为智能电动高端行政轿车，强调全新飞航座椅、后排商务舱舒适、NIO Link 全景互联智能屏、NIO Phone 生态和会谈模式隐私保护。页面还展示 NOP+、领航换电、Pilot+、NIO Link 泊车与主动安全能力。', ['行政轿车', '后排舒适', '商务场景', '互联生态']),
  doc('nio-et7-audience', 'nio-et7', '蔚来 ET7 · 适配人群销售假设', '用户画像', 'inference', 'https://www.nio.cn/et7', '基于官方产品定位的销售假设：适合重视后排舒适、商务接待、移动办公和隐私体验的行政或高端家庭用户。顾问应确认后排乘坐频率、办公需求和使用者角色，配置与权益仍以具体版本和官方页面为准。', ['商务接待', '后排舒适', '移动办公'], { summary: '重视后排舒适、商务接待和移动办公的用户（销售假设）' }),
  doc('nio-es8-positioning', 'nio-es8', '蔚来 ES8 · 多排家庭与旗舰空间', '车型资料', 'fact', 'https://www.nio.cn/es8', '蔚来官网将 ES8 定位为全场景科技旗舰 SUV，提供宽境 6 席与奢阔 7 座布局，强调旗舰座舱、大三排空间、二排零重力、第三排独立座椅及移动办公室、亲子互动间和户外社交等多元空间。部分配置与座位布局因版本而异。', ['六座', '七座', '大三排', '家庭出行']),
  doc('nio-es8-audience', 'nio-es8', '蔚来 ES8 · 适配人群销售假设', '用户画像', 'inference', 'https://www.nio.cn/es8', '基于官方产品定位的销售假设：适合经常多人出行、需要三排座椅和较大行李空间的多成员家庭或高频接待用户。销售沟通应先确认实际乘员数量、儿童座椅和行李装载，再比较六座或七座布局。', ['多人出行', '三排空间', '家庭用车'], { summary: '经常多人出行、需要三排和行李空间的用户（销售假设）' }),
  doc('nio-es8-five-seater-positioning', 'nio-es8-five-seater', '蔚来 ES8 大五座版 · 官方产品定位', '车型资料', 'fact', 'https://www.nio.cn/es8-five-seater', '蔚来官网将 ES8 大五座版展示为全场景大五座旗舰 SUV，强调五座新境、阔享从容与灵动装载。页面围绕大五座空间、后备舱分舱、后排舒适、智能系统与安全展开介绍，具体配置应按版本核对。', ['大五座', '后备舱', '舒展空间']),
  doc('nio-es8-five-seater-audience', 'nio-es8-five-seater', '蔚来 ES8 大五座版 · 适配人群销售假设', '用户画像', 'inference', 'https://www.nio.cn/es8-five-seater', '基于官方产品定位的销售假设：适合偏好宽敞五座、重视后备舱装载和乘储分离，同时不需要第三排的家庭或商务兼顾用户。具体座舱和装载体验应以实际版本与交付车辆为准。', ['大五座', '装载', '家庭商务'], { summary: '偏好大五座、装载能力且不需要第三排的用户（销售假设）' }),
  doc('nio-es9-positioning', 'nio-es9', '蔚来 ES9 · 行政旗舰与全场景能力', '车型资料', 'fact', 'https://www.nio.cn/es9', '蔚来官网将 ES9 定位为科技行政旗舰 SUV，突出行政中岛、双飞航零重力行政座椅、后排办公与会客、隐私体验、旗舰空间和旗舰声学，同时覆盖户外探索与智能地形场景。具体配置因版本不同，以 NIO App 配置和实际交付为准。', ['行政旗舰', '中岛座椅', '后排办公', '户外探索']),
  doc('nio-es9-audience', 'nio-es9', '蔚来 ES9 · 适配人群销售假设', '用户画像', 'inference', 'https://www.nio.cn/es9', '基于官方产品定位的销售假设：适合重视行政接待、后排会客和旗舰空间，同时希望兼顾多人出行与户外探索的用户。顾问需要通过接待人数、座舱隐私、装载和路况需求进一步核实，不应直接承诺某一配置。', ['行政接待', '旗舰空间', '户外场景'], { summary: '重视行政接待、旗舰空间和户外场景的用户（销售假设）' }),
  doc('nio-power-services', 'all', 'NIO Power · 可充可换可升级智能能源服务', '加电服务', 'fact', 'https://www.nio.cn/nio-power', '蔚来官网将 NIO Power 定位为可充可换可升级智能能源服务体系，覆盖家充桩、家用快充桩、换电站、超充站、目的地充电、一键加电、充电地图、电池灵活升级和能源云。页面截至 2026-11-19 展示 4,270 座换电站、32,761 根蔚来充电桩及 1,782,669 根接入第三方充电桩，这些数量会随网络建设变化。', ['换电', '充电地图', '一键加电', '电池升级'], { guardrail: '实时数量、预约状态、站点可用性和服务范围随时间与地区变化，必须以官方加电地图或 NIO App 为准；销售话术不得承诺固定数量、固定速度或一定可用。' }),
  doc('nio-service-overview', 'all', 'NIO Service · 全程无忧的用车养车服务', '售后服务', 'fact', 'https://www.nio.cn/nio-service', '蔚来官网以 Service Guardian 服务卫士系统提供一站式用车养车服务，包含一键维保、上门补胎、事故安心、驾享服务和道路救援。服务无忧覆盖保险、维修、保养、事故救援、洗车、代驾、代泊等 20+ 用车场景；页面截至 2026-10-31 展示 374 家服务中心覆盖 216 个地级市。', ['售后', '道路救援', '服务无忧', '服务卫士'], { guardrail: '服务权益、免费范围、地区、套餐和服务中心数量具有时间与条件限制，必须以用户权益页、实际订单和 NIO App 为准；销售沟通不得将概览文案当作个人固定权益。' }),
  doc('nio-house-community', 'all', 'NIO House · 用户与朋友的生活空间', '社区服务', 'fact', 'https://www.nio.cn/nio-house', '蔚来官网将 NIO House 定位为属于蔚来用户和朋友们的生活空间，包含 Forums、Living Café、Gallery、Joy Camp 等区域，可用于头脑风暴、分享会、生日派对、音乐会和生活方式活动。官网页面展示全球 162 家 NIO House，数量以页面更新时间为准。', ['NIO House', '社区活动', '生活方式'], { guardrail: '门店开放时间、活动安排、空间可用性和全球门店数量可能变化，具体以当地 NIO House 或 NIO App 公布为准。' }),
  doc('nio-app-service', 'all', 'NIO App · 补能查询与服务入口', '服务工具', 'fact', 'https://www.nio.cn/nio-power', 'NIO Power 官网介绍了充电地图与一键加电服务：用户可通过 App 下单，由专员取车加电或提供移动充电服务。页面也介绍换电、家充、公共充电及电池灵活升级。具体地区、站点和可用服务需查询当前官方信息。', ['NIO App', '加电地图', '一键加电'], { guardrail: '实时价格、优惠、库存、权益、站点状态和服务预约结果必须以客户所在地区的官方页面或 NIO App 为准，不写入固定推荐话术。' }),
  doc('nio-sales-guardrails', 'all', '蔚来销售沟通 · 事实与边界', '销售边界', 'guardrail', 'https://www.nio.cn/es6', '车型配置可能因版本不同而变化，实际信息以量产车型、配置表、NIO App 和交付车辆为准；辅助驾驶不能替代驾驶员，续航与性能受环境、路况、载重等因素影响。用户画像仅是基于官方产品定位的销售假设，需通过顾问提问确认。', ['版本核对', '辅助驾驶', '续航边界', '用户确认'], { guardrail: '不承诺实时价格、优惠、固定续航、固定服务权益或辅助驾驶替代驾驶；涉及购买权益时引导客户咨询蔚来顾问并查看官方实时信息。' }),
];
