<script setup lang="ts">
const props = defineProps<{
  items: Array<{ label: string; value: number }>
  color?: string
  horizontal?: boolean
}>()

const maxValue = computed(() => Math.max(1, ...(props.items.length ? props.items.map(i => i.value) : [0])))
</script>

<template>
  <!-- Horizontal bar chart -->
  <div v-if="horizontal" class="hbar-chart">
    <div
      v-for="item in items"
      :key="item.label"
      class="hbar-item"
      :title="`${item.label}: ${item.value}`"
    >
      <span class="hbar-label">{{ item.label }}</span>
      <div class="hbar-track">
        <span
          class="hbar-fill"
          :style="{
            width: `${Math.max(2, (item.value / maxValue) * 100)}%`,
            backgroundColor: color || 'var(--kpi-chart-2)',
          }"
        />
      </div>
      <span class="hbar-value">{{ item.value }}</span>
    </div>
  </div>

  <!-- Vertical bar chart (default) -->
  <div v-else class="bar-chart">
    <div
      v-for="item in items"
      :key="item.label"
      class="bar-item"
      :title="`${item.label}: ${item.value}`"
    >
      <div class="bar-track">
        <span
          :style="{
            height: `${Math.max(6, (item.value / maxValue) * 100)}%`,
            backgroundColor: color || 'var(--kpi-chart-2)',
          }"
        />
      </div>
      <p>{{ item.label }}</p>
    </div>
  </div>
</template>

<style scoped>
/* ── Vertical ─────────────── */
.bar-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(54px, 1fr));
  align-items: end;
  min-height: 220px;
  gap: 18px;
  border-bottom: 1px solid var(--kpi-border);
  background-image: linear-gradient(var(--kpi-soft) 1px, transparent 1px);
  background-size: 100% 36px;
  padding: 8px 8px 0;
}

.bar-item {
  display: grid;
  align-items: end;
  min-width: 0;
  height: 220px;
}

.bar-track {
  display: flex;
  align-items: end;
  justify-content: center;
  height: 168px;
}

.bar-track span {
  display: block;
  width: min(100%, 64px);
  min-height: 6px;
  border-radius: 8px 8px 0 0;
}

.bar-item p {
  overflow: hidden;
  min-height: 42px;
  margin: 8px 0 0;
  color: var(--kpi-muted);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  text-overflow: ellipsis;
}

/* ── Horizontal ───────────── */
.hbar-chart {
  display: grid;
  gap: 10px;
  padding: 4px 0;
}

.hbar-item {
  display: grid;
  grid-template-columns: minmax(80px, 160px) 1fr 40px;
  align-items: center;
  gap: 10px;
}

.hbar-label {
  overflow: hidden;
  color: var(--kpi-text);
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hbar-track {
  height: 10px;
  border-radius: 8px;
  background: var(--kpi-soft);
  overflow: hidden;
}

.hbar-fill {
  display: block;
  height: 100%;
  border-radius: 8px;
  min-width: 4px;
  transition: width 400ms ease;
}

.hbar-value {
  color: var(--kpi-muted);
  font-size: 12px;
  font-weight: 800;
  text-align: right;
}
</style>
