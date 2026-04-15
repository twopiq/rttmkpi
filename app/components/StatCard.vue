<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string | number
  tone?: 'primary' | 'secondary' | 'accent' | 'deep' | 'soft'
}>()

const icon = computed(() => ({
  primary: 'P',
  secondary: 'S',
  accent: 'A',
  deep: 'D',
  soft: 'L',
}[props.tone || 'primary']))
</script>

<template>
  <article class="stat-card" :class="`tone-${props.tone || 'primary'}`">
    <span class="icon">{{ icon }}</span>
    <strong>{{ props.value }}</strong>
    <p>{{ props.label }}</p>
  </article>
</template>

<style scoped>
.stat-card {
  min-height: 118px;
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-surface);
  box-shadow: var(--kpi-shadow);
  padding: 20px;
}

.icon {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 900;
}

strong {
  display: block;
  margin-top: 16px;
  color: var(--kpi-blue-2);
  font-size: 31px;
  line-height: 1;
}

p {
  margin: 8px 0 0;
  color: var(--kpi-muted);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.tone-primary .icon {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-2);
}

.tone-secondary .icon,
.tone-accent .icon {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-3);
}

.tone-deep .icon,
.tone-soft .icon {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-1);
}
</style>
