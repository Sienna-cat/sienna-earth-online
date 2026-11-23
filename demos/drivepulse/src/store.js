import {createState} from './engine.js';

const KEY = 'drivepulse-state-v1';
export function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.version === 1 && Array.isArray(saved.owners) && Array.isArray(saved.runs) && Array.isArray(saved.operations) && saved.policy) return saved;
  } catch {}
  return createState();
}
export function saveState(state){localStorage.setItem(KEY,JSON.stringify(state));}
export function resetState(){localStorage.removeItem(KEY);return createState();}
