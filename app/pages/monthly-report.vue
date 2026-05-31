<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

type MonthlyData = {
  month: string
  monthlyCards: Array<{ key: string; label: string; value: string | number; tone: 'primary' | 'secondary' | 'accent' | 'deep' | 'soft' }>
  employeeResults: Array<{ label: string; value: number }>
  monthlyIndicators: Array<{ label: string; value: number }>
  employeeKpi: Array<{ id: number; name: string; completed: number; rating: number }>
}

const monthOptions = computed(() => {
  const opts = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return opts
})

const selectedMonth = ref(
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
)

const fetchUrl = computed(() => apiUrl(`/api/kpi/dashboard?month=${selectedMonth.value}`))

const { data, error, refresh, pending } = useFetch<MonthlyData>(fetchUrl, {
  headers: apiAuthHeaders(),
})

useHead({ title: 'Hisobot | KPI tizimi' })
</script>

<template>
  <AppShell
    title="Oylik hisobot"
    subtitle="Tanlangan oy bo'yicha natijalar va reyting."
    :badge="`Oy: ${selectedMonth}`"
  >
    <p v-if="error" class="fetch-error" role="alert">
      Xatolik yuz berdi.
      <button type="button" @click="refresh()">Qayta urinish</button>
    </p>

    <div class="month-form">
      <select v-model="selectedMonth" aria-label="Oy tanlash">
        <option v-for="m in monthOptions" :key="m" :value="m">{{ m }}</option>
      </select>
      <button type="button" :disabled="pending" @click="refresh()">
        {{ pending ? 'Yuklanmoqda...' : "Ko'rish" }}
      </button>
    </div>

    <section class="stats-grid">
      <StatCard
        v-for="card in data?.monthlyCards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :tone="card.tone"
      />
    </section>

    <section class="charts-row">
      <DashboardPanel title="Xodimlar natijalari" subtitle="Bajarilgan ishlar bo'yicha">
        <BarChart :items="data?.employeeResults || []" :horizontal="true" />
      </DashboardPanel>
      <DashboardPanel title="Oylik ko'rsatkichlar" subtitle="Asosiy indikatorlar">
        <BarChart :items="data?.monthlyIndicators || []" color="var(--kpi-chart-1)" />
      </DashboardPanel>
    </section>

    <DashboardPanel title="Xodimlar kesimi">
      <p v-if="!data?.employeeKpi?.length" class="empty-text">Ma'lumotlar yo'q.</p>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mutaxassis</th>
              <th>Bajarilgan</th>
              <th>O'rtacha reyting</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in data?.employeeKpi" :key="emp.id">
              <td><strong>{{ emp.name }}</strong></td>
              <td>{{ emp.completed }}</td>
              <td>{{ emp.rating.toFixed(1) }} ★</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  </AppShell>
</template>

<style scoped>
.month-form {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  align-items: center;
}

select, button {
  min-height: 36px;
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-surface);
  color: var(--kpi-text);
  font: inherit;
  font-weight: 800;
  padding: 0 14px;
}

button {
  border: 0;
  background: var(--kpi-primary);
  color: #fff;
  cursor: pointer;
}

button:hover:not(:disabled) { background: var(--kpi-primary-hover); }
button:disabled { opacity: 0.6; cursor: wait; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.table-wrap { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }

th, td {
  border-bottom: 1px solid var(--kpi-border);
  padding: 12px 10px;
  text-align: left;
}

th {
  background: var(--kpi-soft);
  color: var(--kpi-text);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.empty-text { margin: 0; color: var(--kpi-muted); font-size: 14px; padding: 24px 0; text-align: center; }

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

@media (max-width: 860px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .charts-row { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
