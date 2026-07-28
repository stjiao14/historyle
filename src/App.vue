<template>
  <div class="page">
    <header class="header">
      <h1>史 谜</h1>
      <p class="subtitle">猜出今天的中国历史人物 · 题库 {{ figures.length }} 人</p>
      <nav class="mode-tabs">
        <button :class="{ active: mode === 'daily' }" @click="switchMode('daily')">每日一题</button>
        <button :class="{ active: mode === 'free' }" @click="switchMode('free')">自由练习</button>
      </nav>
    </header>

    <main>
      <p v-if="mode === 'daily'" class="mode-hint">📅 {{ today }} · 所有人今天猜的是同一位人物</p>

      <SearchBar :candidates="candidates" :disabled="won" @select="onGuess" />

      <div class="toolbar">
        <span class="guess-count">已猜 {{ guesses.length }} 次</span>
        <button v-if="!won && guesses.length > 0" class="give-up" @click="giveUp">认输揭晓</button>
        <button v-if="mode === 'free' && (won || guesses.length > 0)" class="new-game" @click="startFree">
          再来一局
        </button>
      </div>

      <div v-if="!won" class="hints">
        <div v-for="(h, i) in hintStates" :key="i" class="hint" :class="{ locked: h.locked }">
          <span class="hint-tag">提示{{ '一二三'[i] }}</span>
          <span v-if="h.locked">再猜错 {{ h.remaining }} 次解锁</span>
          <span v-else>{{ h.text }}</span>
        </div>
      </div>

      <div v-if="guesses.length" class="table-wrap">
        <div class="guess-row guess-header">
          <div v-for="h in headers" :key="h" class="tile header-cell">{{ h }}</div>
        </div>
        <GuessRow v-for="(r, i) in guesses" :key="i" :result="r" />
      </div>

      <section v-if="revealed" class="answer-card" :class="{ win: won }">
        <h2>{{ won ? '🎉 猜对了！' : '答案是' }}</h2>
        <p class="answer-name">{{ answer.name }}</p>
        <p class="answer-meta">
          {{ answer.dynasty }} · {{ formatYear(answer.birth) }}–{{ formatYear(answer.death) }}（享年约
          {{ answer.death - answer.birth }} 岁） ·
          {{ answer.domains.join('、') }} · {{ answer.province }} · {{ answer.ethnicity
          }}{{ answer.emperor ? ' · 帝王' : '' }}
        </p>
        <p v-if="answer.tags?.length" class="answer-tags">🏷️ {{ answer.tags.join(' · ') }}</p>
        <p class="answer-intro">{{ answer.intro }}</p>
        <div class="share-row">
          <button class="share-btn" @click="copyShare">{{ copied ? '✅ 已复制' : '📋 复制战绩' }}</button>
        </div>
        <p v-if="mode === 'daily' && won" class="tomorrow">明天再来挑战新的人物！</p>
      </section>

      <section class="legend">
        <h3>颜色说明</h3>
        <ul>
          <li><span class="dot correct"></span>完全一致</li>
          <li>
            <span class="dot close"></span>相近：相同或相邻时期 / 同一大区域 / 出生相差 50 年内 / 享年相差 10 岁内 / 领域有重合 / 标签有重合
          </li>
          <li><span class="dot wrong"></span>不一致</li>
          <li>出生年的「↑ 更早 / ↓ 更晚」、享年的「↓ 更短命 / ↑ 更长寿」表示答案的时间方向</li>
        </ul>
      </section>
    </main>

    <footer class="footer">灵感来自 <a href="https://github.com/QuantAskk/pokemonle" target="_blank" rel="noopener">pokemonle</a></footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import SearchBar from './components/SearchBar.vue'
import GuessRow from './components/GuessRow.vue'
import { FIGURES } from './data/figures.js'
import { compareFigures, isWin, formatYear } from './game/compare.js'
import { dailyAnswer, randomAnswer, todayKey, loadDailyState, saveDailyState } from './game/daily.js'

const headers = ['人物', '朝代', '出生年', '享年', '领域', '籍贯', '民族', '性别', '身份', '标签']

const figures = FIGURES
const mode = ref('daily')
const today = todayKey()

const answer = ref(null)
const guesses = ref([]) // compareFigures 的结果，最新的在前面
const guessedIds = ref(new Set())
const won = ref(false)
const revealed = ref(false) // 赢或认输后展示答案卡

const candidates = computed(() => figures.filter((f) => !guessedIds.value.has(f.id)))

// ── 提示系统：猜错 3 / 6 / 9 次依次解锁 ──────────────────
const HINT_THRESHOLDS = [3, 6, 9]
const COMPOUND_SURNAMES = ['司马', '诸葛', '欧阳', '长孙', '上官', '夏侯', '皇甫', '令狐', '慕容', '宇文']

function hintTexts(a) {
  const surname =
    COMPOUND_SURNAMES.find((s) => a.name.startsWith(s)) || a.name[0]
  return [
    `此人生活于「${a.era}」时期`,
    a.intro,
    `此人姓「${surname}」`,
  ]
}

const hintStates = computed(() => {
  const wrong = guesses.value.length
  const texts = hintTexts(answer.value)
  return HINT_THRESHOLDS.map((threshold, i) => ({
    locked: wrong < threshold,
    remaining: threshold - wrong,
    text: texts[i],
  }))
})

// ── 分享：Wordle 式色块 ────────────────────────────────
const copied = ref(false)

const shareText = computed(() => {
  const emoji = { correct: '🟩', close: '🟨', wrong: '⬜' }
  const rows = [...guesses.value].reverse().map((r) =>
    [r.dynasty, r.birth, r.lifespan, r.domains, r.region, r.ethnicity, r.gender, r.emperor, r.tags].map((t) => emoji[t.level]).join('')
  )
  const title =
    mode.value === 'daily'
      ? `史谜 · 每日一题 ${today}`
      : '史谜 · 自由练习'
  const resultLine = won.value ? `${guesses.value.length} 次猜中` : '未能猜出'
  return `${title}\n${resultLine}\n${rows.join('\n')}`
})

async function copyShare() {
  try {
    await navigator.clipboard.writeText(shareText.value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = shareText.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function startDaily() {
  answer.value = dailyAnswer(today)
  guesses.value = []
  guessedIds.value = new Set()
  won.value = false
  revealed.value = false
  // 恢复今天的进度
  const saved = loadDailyState(today)
  if (saved) {
    for (const id of saved.guessIds) applyGuess(figures.find((f) => f.id === id), false)
    if (saved.won) {
      won.value = true
      revealed.value = true
    }
  }
}

function startFree() {
  answer.value = randomAnswer()
  guesses.value = []
  guessedIds.value = new Set()
  won.value = false
  revealed.value = false
}

function switchMode(m) {
  if (mode.value === m) return
  mode.value = m
  m === 'daily' ? startDaily() : startFree()
}

function applyGuess(figure, persist = true) {
  if (!figure || guessedIds.value.has(figure.id)) return
  guessedIds.value.add(figure.id)
  const result = compareFigures(figure, answer.value)
  guesses.value.unshift(result)
  if (isWin(figure, answer.value)) {
    won.value = true
    revealed.value = true
  }
  if (persist && mode.value === 'daily') {
    saveDailyState([...guessedIds.value], won.value, today)
  }
}

function onGuess(figure) {
  applyGuess(figure)
}

function giveUp() {
  revealed.value = true
  if (mode.value === 'daily') saveDailyState([...guessedIds.value], false, today)
}

startDaily()
</script>
