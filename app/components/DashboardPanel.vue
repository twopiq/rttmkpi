<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <section class="panel">
    <header>
      <h2>{{ title }}</h2>
      <p v-if="subtitle">{{ subtitle }}</p>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.panel {
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-surface);
  box-shadow: var(--kpi-shadow);
  padding: 18px;
}

header {
  margin-bottom: 14px;
}

h2,
p {
  margin: 0;
}

h2 {
  color: var(--kpi-blue-2);
  font-size: 18px;
  line-height: 1.25;
}

p {
  margin-top: 5px;
  color: var(--kpi-muted);
  font-size: 13px;
}
</style>
