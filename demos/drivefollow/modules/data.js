import { NIO_KNOWLEDGE, NIO_VEHICLES } from './nio-knowledge.js';

export const DEMO_DATE = '2026-11-19';
export const SCHEMA_VERSION = 2;
export const VEHICLES = { ...NIO_VEHICLES };
export const KNOWLEDGE = [...NIO_KNOWLEDGE];

export const SLOTS = [
  { id: 'slot-1', date: '2026-11-21', time: '10:00–10:45', model: 'nio-es6' },
  { id: 'slot-2', date: '2026-11-21', time: '11:00–11:45', model: 'nio-es6' },
  { id: 'slot-3', date: '2026-11-21', time: '14:00–14:45', model: 'nio-es6' },
  { id: 'slot-4', date: '2026-11-22', time: '10:00–10:45', model: 'nio-es6' },
  { id: 'slot-5', date: '2026-11-21', time: '10:00–10:45', model: 'nio-et5' },
  { id: 'slot-6', date: '2026-11-21', time: '14:00–14:45', model: 'nio-et5' },
  { id: 'slot-7', date: '2026-11-22', time: '11:00–11:45', model: 'nio-et5' },
  { id: 'slot-8', date: '2026-11-22', time: '15:00–15:45', model: 'nio-es6' },
  { id: 'slot-nio-es6-1', date: '2026-11-21', time: '10:00–10:45', model: 'nio-es6' },
  { id: 'slot-nio-es6-2', date: '2026-11-22', time: '14:00–14:45', model: 'nio-es6' },
  { id: 'slot-nio-et5-1', date: '2026-11-21', time: '11:00–11:45', model: 'nio-et5' },
  { id: 'slot-nio-et5t-1', date: '2026-11-22', time: '10:00–10:45', model: 'nio-et5t' },
  { id: 'slot-nio-et7-1', date: '2026-11-22', time: '11:00–11:45', model: 'nio-et7' },
  { id: 'slot-nio-es8-1', date: '2026-11-21', time: '14:00–14:45', model: 'nio-es8' },
  { id: 'slot-nio-es8-five-1', date: '2026-11-22', time: '10:00–10:45', model: 'nio-es8-five-seater' },
  { id: 'slot-nio-es9-1', date: '2026-11-22', time: '15:00–15:45', model: 'nio-es9' },
];

const customer = (id, name, model, budget, needs, source, lastContact, text, extra = {}) => ({
  id, name, model, budget, needs, source, lastContact, consent: true, complaint: false,
  requestedDrive: false, status: 'following', history: [{ date: lastContact, text }], ...extra,
});

export function createInitialState() {
  return {
    version: SCHEMA_VERSION,
    customers: [
      customer('c-001', '陈先生', 'nio-es6', '25–30 万', ['家庭用车', '后排空间'], '官网留资', '2026-11-18', '二孩家庭，关注后排空间与儿童座椅接口。主动询问周末是否可以试驾，具体时间待确认。', { requestedDrive: true }),
      customer('c-002', '林女士', 'nio-et5', '18–22 万', ['城市通勤', '泊车体验'], '到店咨询', '2026-11-17', '每日通勤约 30 公里，希望亲自体验泊车与车机。希望顾问本周再联系。', { requestedDrive: true }),
      customer('c-003', '周先生', 'nio-es6', '25–30 万', ['行李装载', '周末出游'], '朋友转介绍', '2026-11-14', '一家三口经常自驾，希望带露营装备到店体验后备厢。上次沟通约定本周安排试驾。', { requestedDrive: true }),
      customer('c-004', '许女士', 'nio-et5', '', ['首辆车', '驾驶体验'], '线上咨询', '2026-11-18', '首次购车，预算和购车时间尚未确定，希望了解试驾需要准备什么。'),
      customer('c-005', '赵先生', 'nio-es6', '30 万以内', ['座椅舒适', '家庭用车'], '商场活动', '2026-11-16', '对座椅舒适度感兴趣，需要与家人商量到店时间。'),
      customer('c-006', '吴女士', 'nio-et5', '20 万以内', ['日常通勤', '车机交互'], '官网留资', '2026-11-17', '正在比较不同车型，主要关注车机交互，暂未提出试驾需求。'),
      customer('c-007', '刘先生', 'nio-es6', '25–30 万', ['家庭用车'], '线上咨询', '2026-11-18', '客户明确表示近期不再购车，并要求停止营销联系。', { consent: false, status: 'paused' }),
      customer('c-008', '唐女士', 'nio-et5', '18–22 万', ['城市通勤'], '到店咨询', '2026-11-18', '对之前沟通中的活动解释有异议，门店尚未解决。先处理客户诉求。', { complaint: true, status: 'service' }),
      customer('c-009', '沈先生', 'nio-es6', '25–30 万', ['家庭用车'], '朋友转介绍', '2026-11-18', '已确认 11 月 21 日 14:00 到店试驾。', { status: 'booked', requestedDrive: true }),
      customer('c-010', '何女士', 'nio-et5', '18–22 万', ['城市通勤'], '官网留资', '2026-11-18', '已确认 11 月 21 日 14:00 到店试驾。', { status: 'booked', requestedDrive: true }),
      customer('c-011', '方先生', 'nio-es6', '25–28 万', ['后排空间'], '商场活动', '2026-11-17', '关注后排乘坐空间，留资后希望先了解产品资料。'),
      customer('c-012', '苏女士', 'nio-et5', '', [], '官网留资', '2026-11-19', '刚收到官网咨询，尚未沟通具体预算、用途与到店意愿。', { status: 'new' }),
    ],
    bookings: [
      { id: 'booking-seed-1', leadId: 'c-009', slotId: 'slot-3', status: 'confirmed', createdAt: '2026-11-18T08:00:00Z', seeded: true },
      { id: 'booking-seed-2', leadId: 'c-010', slotId: 'slot-6', status: 'confirmed', createdAt: '2026-11-18T08:00:00Z', seeded: true },
    ],
    tasks: [], runs: [], plans: {}, feedback: [], evaluations: [],
  };
}
