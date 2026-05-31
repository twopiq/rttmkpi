<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

type AnalyticsData = {
  trend: Array<{ date: string; created: number; completed: number }>
  byDepartment: Array<{ label: string; value: number }>
  byCategory: Array<{ label: string; value: number }>
  byChannel: Array<{ label: string; value: number }>
  byPriority: Array<{ label: string; value: number }>
  byWeekday: Array<{ label: string; value: number }>
}

const { data, error, refresh, pending } = useFetch<AnalyticsData>(apiUrl('/api/kpi/analytics'), {
  headers: apiAuthHeaders(),
})

const trendSeries = computed(() => [
  {
    label: 'Yaratildi',
    color: 'var(--kpi-chart-1)',
    data: (data.value?.trend || []).map(d => ({ date: d.date, value: d.created })),
  },
  {
    label: 'Yakunlandi',
    color: 'var(--kpi-chart-2)',
    data: (data.value?.trend || []).map(d => ({ date: d.date, value: d.completed })),
  },
])

useHead({ title: 'Tahlil | KPI tizimi' })
</script>

<template>
  <AppShell
    title="Tahlil"
    subtitle="Trendlar, bo'lim va kategoriya bo'yicha statistika."
  >
    <p v-if="error" class="fetch-error" role="alert">
      Tahlil ma'lumotlarini yuklashda xatolik.
      <button type="button" @click="refresh()">Qayta urinish</button>
    </p>

    <!-- Trend chart -->
    <DashboardPanel title="So'nggi 30 kun trendi" subtitle="Yaratilgan vs Yakunlangan murojaatlar">
      <div v-if="pending" class="loading-text">Yuklanmoqda...</div>
      <LineChart v-else :series="trendSeries" :height="200" />
    </DashboardPanel>

    <!-- Department + Category -->
    <section class="two-col">
      <DashboardPanel title="Bo'lim bo'yicha" subtitle="Eng ko'p murojaat yuborgan bo'limlar">
        <BarChart
          :items="data?.byDepartment || []"
          :horizontal="true"
          color="var(--kpi-chart-3)"
        />
      </DashboardPanel>
      <DashboardPanel title="Kategoriya bo'yicha" subtitle="Murojaat turlari">
        <BarChart
          :items="data?.byCategory || []"
          :horizontal="true"
          color="var(--kpi-chart-4)"
        />
      </DashboardPanel>
    </section>

    <!-- Channel + Priority + Weekday -->
    <section class="three-col">
      <DashboardPanel title="Kanal bo'yicha" subtitle="Murojaat kelish yo'li">
        <BarChart
          :items="data?.byChannel || []"
          :horizontal="true"
          color="var(--kpi-chart-2)"
        />
      </DashboardPanel>
      <DashboardPanel title="Prioritet bo'yicha" subtitle="Muhimlik darajasi">
        <BarChart
          :items="data?.byPriority || []"
          :horizontal="true"
          color="var(--kpi-chart-5)"
        />
      </DashboardPanel>
      <DashboardPanel title="Hafta kuni bo'yicha" subtitle="Qaysi kuni ko'proq murojaat">
        <BarChart
          :items="data?.byWeekday || []"
          :horizontal="true"
          color="var(--kpi-chart-1)"
        />
      </DashboardPanel>
    </section>
  </AppShell>
</template>

<style scoped>
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 14px 0;
}

.three-col {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.loading-text { color: var(--kpi-muted); font-size: 14px; padding: 40px 0; text-align: center; }

.fetch-error {
  display: flex; align-items: center; gap: 12px; margin: 0 0 14px;
  border: 1px solid var(--kpi-danger); border-radius: 8px;
  background: var(--kpi-danger-soft); color: var(--kpi-danger);
  font-size: 14px; font-weight: 700; padding: 10px 14px;
}

.fetch-error button {
  min-height: 28px; border: 1px solid var(--kpi-danger); border-radius: 6px;
  background: transparent; color: var(--kpi-danger); cursor: pointer;
  font: inherit; font-size: 12px; font-weight: 800; padding: 0 10px;
}

@media (max-width: 960px) {
  .three-col { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 640px) {
  .two-col, .three-col { grid-template-columns: 1fr; }
}
</style>
