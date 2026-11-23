export const CATEGORY_OPTIONS = ['全部', '车型', '用户场景', '服务', '补能'];

const sourceDate = '2026-11-19';
const positioningNote = '适配人群属于产品定位推断，不是用户真实画像；实际配置、功能和交付版本以 NIO App 配置器及交付信息为准。';

export const KNOWLEDGE_BASE = [
  {
    id: 'model-et5',
    category: '车型',
    title: 'ET5 · 智能电动中型轿跑',
    summary: '面向城市驾驶的智能电动中型轿跑，官网强调超跑基因、科技美学与个性化设计。',
    facts: ['15.6 英寸 AMOLED 中控屏', '18.8 英寸 HUD', 'NOMI Mate 3.0', '10 种驾驶模式', '双电机智能四驱；支持可充、可换、可升级'],
    inferredAudience: ['重视设计、运动感与个性化的城市用户', '日常通勤中仍希望保留驾驶乐趣的人群', '偏好智能座舱与数字体验的用户'],
    sourceUrl: 'https://www.nio.cn/et5',
    sourceLabel: '蔚来官网 · ET5',
    sourceDate,
    confidence: 'official',
    verificationNote: positioningNote
  },
  {
    id: 'model-et5t',
    category: '车型',
    title: 'ET5T · 智能电动旅行车',
    summary: '以旅行和户外生活方式为核心的智能电动旅行车，兼顾轿车操控感与装载灵活性。',
    facts: ['最大放倒空间 1,687L', '后排 4/2/4 灵活放倒', '车顶行李架与隐藏式电动拖钩', '最大允许牵引质量 1,400kg', '支持对外放电、露营模式、双电机智能四驱'],
    inferredAudience: ['喜欢旅行、露营、摄影或户外运动的人', '需要装载装备，又希望保持轿车驾驶感的人', '经常周末或长途出行的双人、小家庭用户'],
    sourceUrl: 'https://www.nio.cn/et5t',
    sourceLabel: '蔚来官网 · ET5T',
    sourceDate,
    confidence: 'official',
    verificationNote: positioningNote
  },
  {
    id: 'model-et7',
    category: '车型',
    title: 'ET7 · 智能电动高端行政轿车',
    summary: '强调后排舒适、行政出行和车内数字协同的高端行政轿车。',
    facts: ['车长 5,101mm、车宽 1,987mm、轴距 3,060mm', 'NIO Link 全景互联行政屏，支持视频会议、导航流转和跨屏协同', '150kWh 超长续航电池；量产车风阻系数 0.208', '智能空气悬架、4D 舒适领航、双电机智能四驱', '支持 NOP+ 与 33 个高精度传感器'],
    inferredAudience: ['重视商务出行、后排舒适和行政感受的人', '经常跨城长途，关注乘坐空间与舒适度的人', '希望在车内处理会议、办公和影音的用户'],
    sourceUrl: 'https://www.nio.cn/et7',
    sourceLabel: '蔚来官网 · ET7',
    sourceDate,
    confidence: 'official',
    verificationNote: `${positioningNote}官网提示功能与配置可能随版本和实际交付变化。`
  },
  {
    id: 'model-es6',
    category: '车型',
    title: 'ES6 · 智能电动全能 SUV',
    summary: '兼顾城市穿行、长途驾驶、乘坐舒适和智能座舱体验的全能 SUV。',
    facts: ['后备箱最大 670L，二排放倒后最大 1,496L', '主副驾座椅加热、通风、按摩，支持女王副驾', '7.1.4 沉浸声音响、六屏生态、NOMI Mate 3.0', '全系高性能双电机；中欧双五星安全认证', '支持 NOP+、高速服务区领航换电、超感泊车与主动安全 2.0'],
    inferredAudience: ['需要城市与长途兼顾的全能家用 SUV 用户', '三四位朋友或小家庭出行者', '关注舒适座椅、后排空间、智能座舱和安全的人'],
    sourceUrl: 'https://www.nio.cn/es6',
    sourceLabel: '蔚来官网 · ES6',
    sourceDate,
    confidence: 'official',
    verificationNote: positioningNote
  },
  {
    id: 'model-es8',
    category: '车型',
    title: 'ES8 六/七座版 · 全场景科技旗舰 SUV',
    summary: '大三排科技旗舰 SUV，强调多人出行与全场景空间；大五座版单独收录。',
    facts: ['提供 2+2+2 六座与七座布局', '777L 前后备舱空间，七座最大可扩展至 3,230L', '21.4 英寸天空屏、38 英寸 AR-HUD、27 个扬声器', 'AI 全能伙伴 NOMI Intelligence 与高阶智能辅助驾驶硬件', '六座版本页面标注 11 个安全气囊；支持可充、可换、可升级'],
    inferredAudience: ['多孩家庭或需要三排座椅的家庭', '经常多人出行，同时需要装载空间和舒适性的用户', '重视旗舰座舱、娱乐、商务与全场景空间的人'],
    sourceUrl: 'https://www.nio.cn/es8',
    sourceLabel: '蔚来官网 · ES8',
    sourceDate,
    confidence: 'official',
    verificationNote: `${positioningNote}安全气囊数量按官网六座版本页面记录，不外推至其他版本。`
  },
  {
    id: 'service-network',
    category: '服务',
    title: 'NIO Service · 一站式用车养车服务',
    summary: '以 Service Guardian 服务卫士系统为基础，主动识别需求并串联维保、救援和日常用车服务。',
    facts: ['覆盖一键维保、上门补胎、事故安心、驾享等场景', '蔚来无忧服务覆盖保险、维修、保养、事故救援、洗车、代驾、代泊等 20 多个用车场景', '官网页面显示服务中心 374 家，覆盖全国 216 个地级市（数据截至 2026-10-31）', '24 小时上门补胎、专人上门取送车等服务需按地区和条款核验'],
    inferredAudience: ['希望把维保、救援和日常用车交给统一服务入口的车主', '用车场景较多、需要主动提醒和上门服务的人', '需要在服务中心覆盖城市内获得连续服务的用户'],
    sourceUrl: 'https://www.nio.cn/nio-service',
    sourceLabel: '蔚来官网 · NIO Service',
    sourceDate,
    confidence: 'official',
    verificationNote: '服务覆盖、权益和适用条件可能受地区、套餐、车辆和服务条款影响；触达前应以 NIO App 与当前服务条款核验。'
  },
  {
    id: 'service-guardian',
    category: '服务',
    title: 'Service Guardian · 服务卫士',
    summary: '通过车联网远程监测异常信号、预判车辆问题，并由诊断专家跟进的服务卫士系统。',
    facts: ['具备秒级远程诊断能力', '通过车联网信号远程监测，抓取异常信号并预判车辆问题', '必要时主动预警，由诊断专家第一时间跟进处理'],
    inferredAudience: ['已有车辆异常提示、需要诊断专家跟进的车主', '希望更早发现车辆异常并安排检修的人'],
    sourceUrl: 'https://www.nio.cn/nio-service',
    sourceLabel: '蔚来官网 · NIO Service',
    sourceDate,
    confidence: 'official',
    verificationNote: '这里的用户群体是产品匹配推断。Demo 未接入服务卫士或车辆遥测，不能声称已诊断车辆问题。'
  },
  {
    id: 'power-network',
    category: '补能',
    title: 'NIO Power · 可充、可换、可升级',
    summary: '覆盖家充、换电、超充、目的地充电和一键加电的智能能源服务体系。',
    facts: ['支持家充桩、家用快充桩、换电站、超充站、目的地充电站', '蔚来官网实时数字（截至 2026-11-19）：4,270 座换电站、32,761 根蔚来充电桩、1,782,669 根接入第三方充电桩', '换电约 3 分钟，自动完成并在每次换电时进行自检', '提供 640kW 全液冷超快充桩', '支持按日、按月、按年灵活升级长续航电池包'],
    inferredAudience: ['依赖高频补能、希望减少等待时间的车主', '经常跨城出行，需要在路线中规划换电或充电的人', '希望按阶段升级续航能力的用户'],
    sourceUrl: 'https://www.nio.cn/nio-power',
    sourceLabel: '蔚来官网 · NIO Power',
    sourceDate,
    confidence: 'official',
    verificationNote: '站点数量和网络覆盖是截至 2026-11-19 的动态数据；实际可用站点、费用和权益应以 NIO App 充电地图及当前服务规则为准。'
  },
  {
    id: 'power-on-demand',
    category: '补能',
    title: '一键加电 · 充电地图',
    summary: '由能源云根据用户位置和需求选择加电方案，适合作为高意向补能服务的运营入口。',
    facts: ['一键加电提供 7×24 小时服务', '蔚来 App 可下单，由能源云选择加电方案', '充电地图可用于查找蔚来与接入的第三方充电资源'],
    inferredAudience: ['临时无法方便充电、希望获得代加电服务的用户', '长途或夜间出行，需要快速找到补能方案的人', '对补能路线和站点可用性有明确咨询需求的车主'],
    sourceUrl: 'https://www.nio.cn/nio-power',
    sourceLabel: '蔚来官网 · NIO Power',
    sourceDate,
    confidence: 'official',
    verificationNote: '服务可用性、价格和响应范围应以 NIO App 当前页面、地区和服务条款为准。'
  },
  {
    id: 'scene-outdoor',
    category: '用户场景',
    title: '旅行、露营与户外装载',
    summary: '以周末旅行、露营和户外装备装载为代表的产品匹配假设。',
    facts: ['ET5T 官网强调旅行生活方式、1,687L 最大放倒空间、对外放电和露营模式'],
    inferredAudience: ['周末短途与长途旅行用户', '需要装载户外装备或使用对外放电的人', '在意旅行舒适度与空间灵活性的双人、小家庭用户'],
    sourceUrl: 'https://www.nio.cn/et5t',
    sourceLabel: '蔚来官网 · ET5T',
    sourceDate,
    confidence: 'inferred',
    verificationNote: '这是把官方产品特征映射到运营场景的产品匹配假设，只有在车主服务记录出现相关需求时才可用于建议。'
  },
  {
    id: 'scene-family',
    category: '用户场景',
    title: '多孩家庭与多人出行',
    summary: '以三排空间、多人乘坐和亲子出行为代表的产品匹配假设。',
    facts: ['ES8 官网强调大三排、六座/七座布局和全场景空间'],
    inferredAudience: ['多孩家庭', '经常接送家人或多人出行的车主', '同时需要乘坐舒适和大装载空间的人'],
    sourceUrl: 'https://www.nio.cn/es8',
    sourceLabel: '蔚来官网 · ES8',
    sourceDate,
    confidence: 'inferred',
    verificationNote: '这是产品定位到用户场景的匹配假设，不能从车型直接推断家庭结构。'
  },
  {
    id: 'scene-business',
    category: '用户场景',
    title: '商务出行与后排舒适',
    summary: '以行政出行、跨城商务和车内办公为代表的产品匹配假设。',
    facts: ['ET7 官网强调高端行政轿车、飞航商务舱和 NIO Link 全景互联行政屏'],
    inferredAudience: ['高频商务出行用户', '经常跨城出差并重视后排体验的人', '希望在车内处理会议、导航和影音协同的用户'],
    sourceUrl: 'https://www.nio.cn/et7',
    sourceLabel: '蔚来官网 · ET7',
    sourceDate,
    confidence: 'inferred',
    verificationNote: '这是产品定位到用户场景的匹配假设，触达前仍需以车主真实需求记录为依据。'
  },
  {
    id: 'scene-urban',
    category: '用户场景',
    title: '城市通勤与运动设计',
    summary: '以日常通勤、设计偏好和智能座舱体验为代表的产品匹配假设。',
    facts: ['ET5 官网定位为智能电动中型轿跑，强调超跑基因、科技美学和个性化设计'],
    inferredAudience: ['重视设计、运动感与个性化的城市用户', '日常通勤与周末驾驶兼顾的人', '偏好智能座舱和数字化体验的用户'],
    sourceUrl: 'https://www.nio.cn/et5',
    sourceLabel: '蔚来官网 · ET5',
    sourceDate,
    confidence: 'inferred',
    verificationNote: '这是产品定位到用户场景的匹配假设，不能替代车主访谈或行为事实。'
  }
  ,{
    id: 'model-ec6', category: '车型', title: 'EC6 · 智能电动轿跑 SUV',
    summary: '官网强调个性表达、轿跑美学与舒适座舱。',
    facts: ['溜背设计与双模主动升降尾翼', '主副驾座椅按摩、加热、通风；女王副驾', '后排放倒后最大容积 1,435L', '15.6 英寸 AMOLED 中控屏、19.4 英寸 W-HUD、NOMI Mate 3.0', '双电机、10 种驾驶模式；可充、可换、可升级'],
    inferredAudience: ['偏好轿跑造型，又需要 SUV 储物空间的人', '关注座椅舒适、个性化外观与智能座舱的用户'],
    sourceUrl: 'https://www.nio.cn/ec6', sourceLabel: '蔚来官网 · EC6', sourceDate,
    confidence: 'official', verificationNote: positioningNote
  },
  {
    id: 'model-ec7', category: '车型', title: 'EC7 · 智能电动旗舰轿跑 SUV',
    summary: '官网定位为旗舰轿跑 SUV，强调优雅设计、高性能与后排空间。',
    facts: ['车长 4,968mm、轴距 2,960mm', '双模主动升降尾翼；智能调光全景天幕', '女王副驾、12.8 英寸 AMOLED 中控屏、16 英寸 HUD', '双电机智能四驱，最大功率 480kW、最大扭矩 850N·m', '智能空气悬架与 CDC 动态阻尼控制系统'],
    inferredAudience: ['重视轿跑 SUV 造型、性能和乘坐舒适的人', '需要兼顾驾驶体验与同行乘客空间的用户'],
    sourceUrl: 'https://www.nio.cn/ec7', sourceLabel: '蔚来官网 · EC7', sourceDate,
    confidence: 'official', verificationNote: positioningNote
  },
  {
    id: 'model-et9', category: '车型', title: 'ET9 · 智能电动行政旗舰轿车',
    summary: '以四座行政空间、商务会客和天行智能底盘为核心的行政旗舰。',
    facts: ['行政桥与天空岛构成四座专属空间', '后排飞航头等舱座椅、百变行政桌案、10L 智能冰箱', '天行全主动悬架、线控转向与后轮转向', '全域 900V 高压架构，官网列示车端 600kW 峰值充电功率', 'NIO Link 行政屏、SkyOS 天枢、NOMI Intelligence'],
    inferredAudience: ['明确需要四座行政空间、后排办公与商务会客的用户', '关注底盘舒适、静谧性与旗舰技术体验的人'],
    sourceUrl: 'https://www.nio.cn/et9', sourceLabel: '蔚来官网 · ET9', sourceDate,
    confidence: 'official', verificationNote: `${positioningNote}峰值充电功率不代表日常持续充电功率。`
  },
  {
    id: 'model-es8-five', category: '车型', title: 'ES8 大五座版 · 全场景科技旗舰 SUV',
    summary: '以五座宽适空间、乘储分离和灵活装载为重点，单独记录五座版本参数。',
    facts: ['大五座布局，二排座椅采用 4/2/4 布局', '前后备舱共 1,564L：前备舱 230L、后备舱 1,334L', '后备舱灵动组合隔板、隐藏式暗格与三折叠隐私分舱板', '前排双飞航零重力座椅，二排舒躺座椅', '21.4 英寸天空屏、38 英寸 AR-HUD、27 个扬声器'],
    inferredAudience: ['明确需要五座乘坐，同时看重大件装备装载的人', '有户外兴趣、移动办公或多人旅行行李需求的用户'],
    sourceUrl: 'https://www.nio.cn/es8-five-seater', sourceLabel: '蔚来官网 · ES8 大五座版', sourceDate,
    confidence: 'official', verificationNote: `${positioningNote}本条空间参数只适用于大五座版，不与六/七座版互换。`
  },
  {
    id: 'model-es9', category: '车型', title: 'ES9 · 科技行政旗舰 SUV',
    summary: '将六座空间、行政会客和旗舰底盘结合的科技行政旗舰 SUV。',
    facts: ['提供六座中岛布局与六座通道布局', '前后备舱合计 816L 装载空间', '智能行政中岛、可拼接拓展行政桌案与双 16 英寸专属行政屏', '天行全主动悬架、线控转向和后轮转向', '全域 900V 高压架构、NOMI Intelligence 4.0、NWM 智能辅助驾驶'],
    inferredAudience: ['同时需要六座多人出行与后排行政会客空间的用户', '重视旗舰座舱、商务协作与长途舒适的人'],
    sourceUrl: 'https://www.nio.cn/es9', sourceLabel: '蔚来官网 · ES9', sourceDate,
    confidence: 'official', verificationNote: `${positioningNote}部分功能可能在交付后通过远程方式开启；智能辅助驾驶不能替代驾驶员。`
  },
  {
    id: 'service-packages', category: '服务', title: '蔚来无忧服务 · 三档用车场景',
    summary: '官方按用车频率与场景复杂程度描述三种套餐，适合用于服务咨询前的需求确认。',
    facts: ['轻享版：官方描述为适合用车不多、场景相对简单的用户', '乐享版：官方描述为适合多数用户，满足绝大部分用车场景', '尊享版：官方描述为适合用车里程较多、场景相对复杂的用户', '覆盖保险、维修、保养、事故救援、洗车、代驾、代泊等 20 多个场景'],
    inferredAudience: ['主动询问续保或无忧服务，愿意说明用车频率和需求的车主', '希望比较套餐服务范围、使用频次和成本的人'],
    sourceUrl: 'https://www.nio.cn/nio-service', sourceLabel: '蔚来官网 · 无忧服务', sourceDate,
    confidence: 'official', verificationNote: '上述三档场景是官方描述；具体保费、套餐价格、次数与权益以当期条款为准。不能由车型直接推断套餐适配性。'
  },
  {
    id: 'service-house', category: '服务', title: 'NIO House · 车主生活空间',
    summary: '蔚来用户和朋友们的线下生活空间，承载分享会、主题活动、工作与休闲。',
    facts: ['官网介绍演讲、设计、生活方式等主题活动和体验', '包含 Forums、Lab、Library、NIO Café、Joy Camp、Gallery、Living Room 七类空间', 'Lab 提供可预订的会议室和共享工作空间；Joy Camp 为孩子的乐园'],
    inferredAudience: ['主动关注本地活动、分享会或兴趣社群的用户', '有亲子活动、短时办公或社区交流需求的人'],
    sourceUrl: 'https://www.nio.cn/nio-house', sourceLabel: '蔚来官网 · NIO House', sourceDate,
    confidence: 'official', verificationNote: '适配人群为产品定位推断。活动、开放时间、空间与预约资格需核验具体门店和 NIO App，不承诺免费或随时可用。'
  },
  {
    id: 'service-app', category: '服务', title: 'NIO App · 线上社区与车主服务',
    summary: '连接远程控车、补能、维保、购车和车主社区的线上入口。',
    facts: ['支持官方资讯、分享用车体验、活动报名、结识好友与加入社群', '可了解和报名 NIO House、NIO Space 活动', '充电地图提供充换电布局、路线规划、空闲桩和车主评价', '车主服务包括远程车控、一键维保、事故救援、洗车、代驾、机场泊车和车辆年检'],
    inferredAudience: ['需要交付后功能指引、服务入口教学的新车主', '有明确活动或补能咨询、需要引导到官方入口的用户'],
    sourceUrl: 'https://www.nio.cn/nio-app', sourceLabel: '蔚来官网 · NIO App', sourceDate,
    confidence: 'official', verificationNote: '适配人群为产品定位推断。仅整理公开产品信息；Demo 未接入 NIO App，不能读取真实用户数据或代用户下单。'
  }
];

export function filterKnowledge(entries, {query = '', category = '全部'} = {}) {
  const normalizedQuery = String(query).trim().toLocaleLowerCase('zh-CN');
  return entries.filter(item => {
    if (category !== '全部' && item.category !== category) return false;
    if (!normalizedQuery) return true;
    const searchable = [item.title, item.summary, item.category, item.sourceLabel, ...item.facts, ...item.inferredAudience]
      .join(' ')
      .toLocaleLowerCase('zh-CN');
    return searchable.includes(normalizedQuery);
  });
}
