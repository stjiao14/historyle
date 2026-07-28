// 猜测与答案的逐属性比较，返回每个维度的反馈
// level: 'correct'（绿）/ 'close'（黄）/ 'wrong'（灰）

import { PERIODS } from '../data/figures.js'

export function compareFigures(guess, answer) {
  return {
    name: guess.name,
    dynasty: compareDynasty(guess, answer),
    birth: compareBirth(guess.birth, answer.birth),
    lifespan: compareLifespan(guess, answer),
    domains: compareDomains(guess.domains, answer.domains),
    region: compareRegion(guess, answer),
    ethnicity: compareExact(guess.ethnicity, answer.ethnicity, guess.ethnicity || '—'),
    gender: compareExact(guess.gender, answer.gender, guess.gender),
    emperor: compareExact(
      guess.emperor === answer.emperor ? answer.emperor : guess.emperor,
      answer.emperor,
      guess.emperor ? '帝王' : '非帝王'
    ),
    tags: compareTags(guess.tags, answer.tags),
  }
}

function compareDynasty(guess, answer) {
  let level = 'wrong'
  if (guess.dynasty === answer.dynasty) level = 'correct'
  else {
    // 细分时期相同或相邻（如 东汉↔三国、明↔清）算相近
    const gi = PERIODS.indexOf(guess.era)
    const ai = PERIODS.indexOf(answer.era)
    if (gi !== -1 && ai !== -1 && Math.abs(gi - ai) <= 1) level = 'close'
  }
  return { level, display: guess.dynasty }
}

function compareBirth(guessYear, answerYear) {
  const diff = answerYear - guessYear
  let level = 'wrong'
  if (diff === 0) level = 'correct'
  else if (Math.abs(diff) <= 50) level = 'close'
  return {
    level,
    display: formatYear(guessYear),
    // direction: 'later' = 答案出生更晚，'earlier' = 答案出生更早
    direction: diff > 0 ? 'later' : diff < 0 ? 'earlier' : 'same',
  }
}

export function lifespanOf(figure) {
  return figure.death - figure.birth
}

function compareLifespan(guess, answer) {
  const guessAge = lifespanOf(guess)
  const answerAge = lifespanOf(answer)
  const diff = answerAge - guessAge
  let level = 'wrong'
  if (diff === 0) level = 'correct'
  else if (Math.abs(diff) <= 10) level = 'close'
  return {
    level,
    display: `${guessAge} 岁`,
    // direction: 'longer' = 答案更长寿，'shorter' = 答案更短命
    direction: diff > 0 ? 'longer' : diff < 0 ? 'shorter' : 'same',
  }
}

function compareDomains(guessDomains, answerDomains) {
  const hits = guessDomains.filter((d) => answerDomains.includes(d))
  let level = 'wrong'
  if (hits.length === guessDomains.length && hits.length === answerDomains.length) level = 'correct'
  else if (hits.length > 0) level = 'close'
  return { level, display: guessDomains.join(' · '), hits }
}

// 主题标签：双方都为空不算一致（灰色 —），集合相等非空为绿，有交集为黄
function compareTags(guessTags = [], answerTags = []) {
  const hits = guessTags.filter((t) => answerTags.includes(t))
  let level = 'wrong'
  if (guessTags.length && answerTags.length && hits.length === guessTags.length && hits.length === answerTags.length)
    level = 'correct'
  else if (hits.length > 0) level = 'close'
  return { level, display: guessTags.length ? guessTags.join(' · ') : '—', hits }
}

function compareRegion(guess, answer) {
  let level = 'wrong'
  if (guess.province === answer.province) level = 'correct'
  else if (guess.region === answer.region) level = 'close'
  return { level, display: `${guess.province}（${guess.region}）` }
}

function compareExact(guessVal, answerVal, display) {
  return { level: guessVal === answerVal ? 'correct' : 'wrong', display }
}

export function isWin(guess, answer) {
  return guess.id === answer.id
}

export function formatYear(year) {
  return year < 0 ? `前${-year}` : `${year}`
}
