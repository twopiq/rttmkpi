<script setup lang="ts">
const props = defineProps<{
  items: Array<{ label: string; value: number }>
  color?: string
}>()

const maxValue = computed(() => Math.max(1, ...props.items.map((item) => item.value)))
</script>

<template>
  <div class="bar-chart">
    <div
      v-for="item in props.items"
      :key="item.label"
      class="bar-item"
      :title="`${item.label}: ${item.value}`"
    >
      <div class="bar-track">
        <span
          :style="{
            height: `${Math.max(6, (item.value / maxValue) * 100)}%`,
            backgroundColor: props.color || '#577DC0',
          }"
        />
      </div>
      <p>{{ item.label }}</p>
    </div>
  </div>
</template>

<style scoped>
.bar-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(54px, 1fr));
  align-items: end;
  min-height: 220px;
  gap: 18px;
  border-bottom: 1px solid var(--kpi-border);
  background-image: linear-gradient(var(--kpi-blue-5) 1px, transparent 1px);
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

p {
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
</style>
