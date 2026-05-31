<script setup lang="ts">
const props = defineProps<{
  series: Array<{
    label: string
    color: string
    data: Array<{ date: string; value: number }>
  }>
  height?: number
}>()

const H = computed(() => props.height ?? 180)
const W = 600
const PAD = { top: 12, right: 8, bottom: 32, left: 36 }

const allValues = computed(() =>
  props.series.flatMap(s => s.data.map(d => d.value)),
)

const maxVal = computed(() => Math.max(1, ...allValues.value))
const minVal = computed(() => 0)

const toX = (i: number, total: number) => {
  const inner = W - PAD.left - PAD.right
  return PAD.left + (total > 1 ? (i / (total - 1)) * inner : inner / 2)
}

const toY = (v: number) => {
  const inner = H.value - PAD.top - PAD.bottom
  return PAD.top + inner - ((v - minVal.value) / (maxVal.value - minVal.value)) * inner
}

const polyline = (data: Array<{ value: number }>) =>
  data.map((d, i) => `${toX(i, data.length)},${toY(d.value)}`).join(' ')

const area = (data: Array<{ value: number }>) => {
  if (!data.length) return ''
  const pts = data.map((d, i) => `${toX(i, data.length)},${toY(d.value)}`).join(' ')
  const first = `${toX(0, data.length)},${toY(0)}`
  const last  = `${toX(data.length - 1, data.length)},${toY(0)}`
  return `M ${first} L ${pts} L ${last} Z`
}

const tickCount = 4
const yTicks = computed(() => {
  const step = maxVal.value / tickCount
  return Array.from({ length: tickCount + 1 }, (_, i) => Math.round(step * i))
})

// Show every 5th label to avoid crowding
const xLabels = computed(() => {
  const first = props.series[0]?.data ?? []
  return first.map((d, i) => ({
    x: toX(i, first.length),
    label: i % Math.ceil(first.length / 6) === 0 ? d.date.slice(5) : '',
  }))
})
</script>

<template>
  <div class="line-chart-wrap">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="line-chart"
      role="img"
      aria-label="Trend grafik"
      preserveAspectRatio="none"
    >
      <!-- Y grid lines -->
      <g class="grid">
        <line
          v-for="tick in yTicks"
          :key="tick"
          :x1="PAD.left" :y1="toY(tick)"
          :x2="W - PAD.right" :y2="toY(tick)"
        />
      </g>

      <!-- Y axis labels -->
      <g class="axis-y">
        <text
          v-for="tick in yTicks"
          :key="tick"
          :x="PAD.left - 6"
          :y="toY(tick) + 4"
          text-anchor="end"
        >{{ tick }}</text>
      </g>

      <!-- X axis labels -->
      <g class="axis-x">
        <text
          v-for="item in xLabels"
          :key="item.x"
          :x="item.x"
          :y="H - 4"
          text-anchor="middle"
        >{{ item.label }}</text>
      </g>

      <!-- Series -->
      <g v-for="serie in series" :key="serie.label">
        <!-- Area fill -->
        <path
          :d="area(serie.data)"
          :fill="serie.color"
          fill-opacity="0.1"
        />
        <!-- Line -->
        <polyline
          :points="polyline(serie.data)"
          fill="none"
          :stroke="serie.color"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </g>
    </svg>

    <!-- Legend -->
    <div class="legend">
      <span v-for="s in series" :key="s.label" class="legend-item">
        <i :style="{ backgroundColor: s.color }" />
        {{ s.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.line-chart-wrap {
  width: 100%;
}

.line-chart {
  width: 100%;
  height: auto;
  overflow: visible;
}

.grid line {
  stroke: var(--kpi-border);
  stroke-width: 1;
}

.axis-y text,
.axis-x text {
  fill: var(--kpi-muted);
  font-size: 9px;
  font-family: inherit;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 20px;
  margin-top: 10px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--kpi-muted);
  font-size: 12px;
  font-weight: 700;
}

.legend-item i {
  width: 20px;
  height: 3px;
  border-radius: 4px;
}
</style>
