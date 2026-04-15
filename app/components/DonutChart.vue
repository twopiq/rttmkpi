<script setup lang="ts">
const props = defineProps<{
  items: Array<{ label: string; value: number }>
}>()

const colors = ['#053591', '#1949A2', '#577DC0', '#063899', '#BBD0F3']
const total = computed(() => Math.max(1, props.items.reduce((sum, item) => sum + item.value, 0)))

const segments = computed(() => {
  let offset = 25

  return props.items.map((item, index) => {
    const length = (item.value / total.value) * 100
    const segment = {
      label: item.label,
      value: item.value,
      color: colors[index % colors.length],
      dasharray: `${length} ${100 - length}`,
      dashoffset: -offset,
    }

    offset += length

    return segment
  })
})
</script>

<template>
  <div class="donut-wrap">
    <svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Murojaatlar holati">
      <circle class="base" cx="21" cy="21" r="15.915" />
      <circle
        v-for="segment in segments"
        :key="segment.label"
        class="segment"
        cx="21"
        cy="21"
        r="15.915"
        :stroke="segment.color"
        :stroke-dasharray="segment.dasharray"
        :stroke-dashoffset="segment.dashoffset"
      />
    </svg>

    <div class="legend">
      <span v-for="segment in segments" :key="segment.label">
        <i :style="{ backgroundColor: segment.color }" />
        {{ segment.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.donut-wrap {
  display: grid;
  place-items: center;
  min-height: 260px;
}

.donut {
  width: 172px;
  height: 172px;
  transform: rotate(-90deg);
}

.base,
.segment {
  fill: none;
  stroke-width: 7;
}

.base {
  stroke: var(--kpi-blue-5);
}

.segment {
  transition: stroke-dasharray 200ms ease;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 18px;
  margin-top: 12px;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--kpi-muted);
  font-size: 12px;
  font-weight: 800;
}

.legend i {
  width: 18px;
  height: 7px;
  border-radius: 8px;
}
</style>
