<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

type MonthlyData = {
  month: string
  monthlyCards: Array<{ key: string; label: string; value: string | number; tone: 'primary' | 'secondary' | 'accent' | 'deep' | 'soft' }>
  employeeResults: Array<{ label: string; value: number }>
  monthlyIndicators: Array<{ label: string; value: number }>
  employeeKpi: Array<{ id: number; name: string; completed: number; rating: number }>
}

const { data } = await useFetch<MonthlyData>('/api/kpi/dashboard')

useHead({
  title: 'Oylik hisobot | KPI tizimi',
})
</script>

<template>
  <AppShell
    title="Oylik hisobot"
    subtitle="Tanlangan oy bo'yicha natijalar, reyting va shikoyatlar."
    :badge="`Tanlangan oy: ${data?.month || '-'}`"
  >
    <div class="month-form">
      <select :value="data?.month" aria-label="Oy tanlash">
        <option>{{ data?.month }}</option>
      </select>
      <button type="button">Ko'rish</button>
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

    <section class="report-grid">
      <DashboardPanel title="Xodimlar natijasi" subtitle="2026-04 oyicha bajarilgan ishlar">
        <BarChart :items="data?.employeeResults || []" />
      </DashboardPanel>

      <DashboardPanel title="Oylik ko'rsatkichlar" subtitle="Asosiy indikatorlar taqqoslamasi">
        <BarChart :items="data?.monthlyIndicators || []" color="#1949A2" />
      </DashboardPanel>
    </section>

    <DashboardPanel title="Xodimlar kesimi">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mutaxassis</th>
              <th>Bajarilgan</th>
              <th>O'rtacha reyting</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in data?.employeeKpi" :key="employee.id">
              <td><strong>{{ employee.name }}</strong></td>
              <td>{{ employee.completed }}</td>
              <td>{{ employee.rating.toFixed(1) }}</td>
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
}

select,
button {
  min-height: 36px;
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-surface);
  color: var(--kpi-blue-2);
  font: inherit;
  font-weight: 800;
  padding: 0 14px;
}

button {
  border: 0;
  background: var(--kpi-blue-3);
  color: var(--kpi-surface);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.report-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.75fr);
  gap: 16px;
  margin: 18px 0;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid var(--kpi-border);
  padding: 14px 10px;
  text-align: left;
}

th {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-2);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

@media (max-width: 1000px) {
  .stats-grid,
  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>
