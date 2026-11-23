import { createInitialState, SCHEMA_VERSION } from './data.js';
import { buildPlan } from './domain.js';
export const STORAGE_KEY = 'drivefollow-demo-v1';
const LEGACY_BACKUP_KEY = `${STORAGE_KEY}-backup-before-v2`;
const legacyModels = { s7: 'nio-es6', e5: 'nio-et5' };

function replaceLegacyNames(value) {
  if (typeof value === 'string') return value.replace(/远航\s*S7/gi, '蔚来 ES6').replace(/远航\s*E5/gi, '蔚来 ET5').replaceAll('远航体验中心', '门店');
  if (Array.isArray(value)) return value.map(replaceLegacyNames);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceLegacyNames(item)]));
  return value;
}

function migrateState(saved) {
  const state = replaceLegacyNames(saved);
  state.version = SCHEMA_VERSION;
  for (const lead of state.customers) {
    lead.model = legacyModels[lead.model] || lead.model;
    const oldPlan = state.plans[lead.id];
    if (!oldPlan) continue;
    const plan = buildPlan(lead);
    state.plans[lead.id] = {
      ...plan,
      id: oldPlan.id || plan.id,
      createdAt: oldPlan.createdAt || plan.createdAt,
      ...(!plan.blocked && typeof oldPlan.editedDraft === 'string' ? { editedDraft: oldPlan.editedDraft } : {}),
      warnings: [...plan.warnings, '车型资料已更新为官方来源，请重新核查保留的草稿。'],
    };
  }
  return state;
}

export function readState(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const raw = target.getItem(STORAGE_KEY);
    const saved = JSON.parse(raw);
    if (![1, SCHEMA_VERSION].includes(saved?.version) || !['customers', 'tasks', 'bookings', 'runs', 'feedback', 'evaluations'].every(key => Array.isArray(saved[key])) || !saved.plans || typeof saved.plans !== 'object' || Array.isArray(saved.plans)) return createInitialState();
    if (saved.version === SCHEMA_VERSION) return saved;
    const migrated = migrateState(saved);
    try {
      if (!target.getItem(LEGACY_BACKUP_KEY)) target.setItem(LEGACY_BACKUP_KEY, raw);
      target.setItem(STORAGE_KEY, JSON.stringify(migrated));
    } catch { /* Keep the migrated records usable even when browser storage is full. */ }
    return migrated;
  } catch { /* Unavailable or invalid storage uses a fresh demo. */ }
  return createInitialState();
}
export function persistState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
