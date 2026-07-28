<template>
  <div class="guess-row">
    <div class="tile tile-name">{{ result.name }}</div>
    <div class="tile" :class="result.dynasty.level">{{ result.dynasty.display }}</div>
    <div class="tile" :class="result.birth.level">
      <span>{{ result.birth.display }}</span>
      <span v-if="result.birth.direction !== 'same'" class="dir">
        {{ result.birth.direction === 'later' ? '↓ 更晚' : '↑ 更早' }}
      </span>
    </div>
    <div class="tile" :class="result.lifespan.level">
      <span>{{ result.lifespan.display }}</span>
      <span v-if="result.lifespan.direction !== 'same'" class="dir">
        {{ result.lifespan.direction === 'longer' ? '↑ 更长寿' : '↓ 更短命' }}
      </span>
    </div>
    <div class="tile" :class="result.domains.level">{{ result.domains.display }}</div>
    <div class="tile" :class="result.region.level">{{ result.region.display }}</div>
    <div class="tile" :class="result.ethnicity.level">{{ result.ethnicity.display }}</div>
    <div class="tile" :class="result.gender.level">{{ result.gender.display }}</div>
    <div class="tile" :class="result.emperor.level">{{ result.emperor.display }}</div>
    <div class="tile" :class="result.tags.level">{{ result.tags.display }}</div>
  </div>
</template>

<script setup>
defineProps({
  result: { type: Object, required: true },
})
</script>
