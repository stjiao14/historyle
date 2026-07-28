// 每日一题：用日期做种子，所有玩家当天拿到同一答案
// 自由模式：纯随机

import { FIGURES, FIGURES_CORE } from '../data/figures.js'

function hashString(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function todayKey() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function dailyAnswer(dateKey = todayKey()) {
  // 每日题从知名人物子库抽，避免抽到过于冷僻的人
  const rng = mulberry32(hashString(`historyle:${dateKey}`))
  return FIGURES_CORE[Math.floor(rng() * FIGURES_CORE.length)]
}

export function randomAnswer(excludeId = null) {
  const pool = excludeId == null ? FIGURES : FIGURES.filter((f) => f.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── 每日模式战绩持久化 ──────────────────────────────────

const STORAGE_KEY = 'historyle:daily'

export function loadDailyState(dateKey = todayKey()) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const state = JSON.parse(raw)
    return state.date === dateKey ? state : null
  } catch {
    return null
  }
}

export function saveDailyState(guessIds, won, dateKey = todayKey()) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: dateKey, guessIds, won }))
}
