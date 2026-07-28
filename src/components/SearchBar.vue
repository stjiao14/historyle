<template>
  <div class="search-bar">
    <input
      ref="inputEl"
      v-model="query"
      type="text"
      placeholder="输入人物姓名，例如：李白"
      :disabled="disabled"
      @input="open = true"
      @focus="open = true"
      @keydown.enter.prevent="pickFirst"
      @keydown.esc="open = false"
      @blur="onBlur"
    />
    <ul v-if="open && filtered.length" class="dropdown">
      <li
        v-for="f in filtered"
        :key="f.id"
        @mousedown.prevent="select(f)"
      >
        <span class="cand-name">{{ f.name }}</span>
        <span class="cand-meta">{{ f.dynasty }} · {{ f.domains.join('、') }}</span>
      </li>
    </ul>
    <div v-else-if="open && query" class="dropdown empty">没有匹配的人物</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  candidates: { type: Array, required: true }, // 未猜过的人物
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])

const query = ref('')
const open = ref(false)
const inputEl = ref(null)

const filtered = computed(() => {
  const q = query.value.trim()
  if (!q) return props.candidates.slice(0, 8)
  return props.candidates.filter((f) => f.name.includes(q)).slice(0, 8)
})

function select(figure) {
  emit('select', figure)
  query.value = ''
  open.value = false
  inputEl.value?.focus()
}

function pickFirst() {
  if (filtered.value.length) select(filtered.value[0])
}

function onBlur() {
  // 延迟关闭，让 mousedown 先触发
  setTimeout(() => (open.value = false), 120)
}
</script>
