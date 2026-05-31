<script setup lang="ts">
const props = defineProps<{
  percent: number
  label?: string
}>()

const clamped = computed(() => Math.min(100, Math.max(0, props.percent)))

const color = computed(() => {
  if (clamped.value >= 90) return 'var(--kpi-success)'
  if (clamped.value >= 70) return 'var(--kpi-warning)'
  return 'var(--kpi-danger)'
})

// SVG donut: r=15.915 → circumference ≈ 100
const dash = computed(() => `${clamped.value} ${100 - clamped.value}`)
</script>

<template>
  <div class="sla-gauge">
    <svg viewBox="0 0 42 42" role="img" :aria-label="`SLA: ${clamped}%`">
      <circle class="track" cx="21" cy="21" r="15.915" />
      <circle
        class="fill"
        cx="21" cy="21" r="15.915"
        :stroke="color"
        :stroke-dasharray="dash"
        stroke-dashoffset="25"
      />
    </svg>
    <div class="center">
      <strong :style="{ color }">{{ clamped }}%</strong>
      <span>{{ label ?? 'SLA' }}</span>
    </div>
  </div>
</template>

<style scoped>
.sla-gauge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 110px;
}

svg {
  width: 110px;
  height: 110px;
  transform: rotate(-90deg);
}

.track,
.fill {
  fill: none;
  stroke-width: 5;
}

.track {
  stroke: var(--kpi-soft);
}

.fill {
  transition: stroke-dasharray 600ms ease;
  stroke-linecap: round;
}

.center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

strong {
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
}

span {
  color: var(--kpi-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
</style>
