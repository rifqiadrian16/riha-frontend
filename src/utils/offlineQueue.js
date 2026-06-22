// src/utils/offlineQueue.js
const KEY = "riha_pending_queue";

export function savePendingQueue(payload) {
  const list = JSON.parse(localStorage.getItem(KEY) || "[]");
  list.push({ ...payload, _localId: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getPendingQueue() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function removePendingQueue(localId) {
  const list = getPendingQueue().filter((item) => item._localId !== localId);
  localStorage.setItem(KEY, JSON.stringify(list));
}