<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

type KpiData = {
  employeeKpi: Array<{
    id: number
    name: string
    online: boolean
    completed: number
    failed: number
    rating: number
    share: number
  }>
}

const { data } = await useFetch<KpiData>(apiUrl('/api/kpi/dashboard'), {
  headers: apiAuthHeaders(),
})

const topEmployees = computed(() => (data.value?.employeeKpi || []).slice(0, 10))
const ratingChart = computed(() => topEmployees.value.map((employee) => ({
  label: employee.name,
  value: Math.round(employee.rating * 10),
})))

useHead({
  title: 'Xodimlar KPI | KPI tizimi',
})
</script>

<template>
  <AppShell
    title="Xodimlar KPI va samaradorlik"
    subtitle="Bajarilgan ishlar, o'rtacha reyting va ulush tahlili."
    badge="Faol reyting jadvali"
  >
    <section class="kpi-grid">
      <DashboardPanel title="Top xodimlar" subtitle="Bajarilgan ishlar bo'yicha">
        <BarChart :items="topEmployees.map((employee) => ({ label: employee.name, value: employee.completed }))" />
      </DashboardPanel>

      <DashboardPanel title="Reyting taqsimoti" subtitle="Top xodim o'rtacha reytingi">
        <BarChart :items="ratingChart" color="#1949A2" />
      </DashboardPanel>
    </section>

    <DashboardPanel title="KPI jadvali">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>O'rin</th>
              <th>Mutaxassis</th>
              <th>Online</th>
              <th>Bajarilgan</th>
              <th>Faol ish</th>
              <th>Reyting</th>
              <th>Ulush</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(employee, index) in data?.employeeKpi" :key="employee.id">
              <td class="rank">{{ index + 1 }}</td>
              <td><strong>{{ employee.name }}</strong></td>
              <td><span class="online-pill">{{ employee.online ? 'online' : 'offline' }}</span></td>
              <td>{{ employee.completed }}</td>
              <td>{{ employee.failed }}</td>
              <td>{{ employee.rating.toFixed(1) }}</td>
              <td>
                <div class="share">
                  <span :style="{ width: `${employee.share}%` }" />
                  <strong>{{ employee.share }}%</strong>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  </AppShell>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
  gap: 16px;
  margin-bottom: 18px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 920px;
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

.rank {
  color: var(--kpi-blue-2);
  font-weight: 900;
}

.online-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 8px;
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-2);
  font-size: 11px;
  font-weight: 900;
  padding: 0 10px;
}

.share {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) 54px;
  align-items: center;
  gap: 10px;
}

.share span {
  display: block;
  height: 8px;
  border-radius: 8px;
  background: var(--kpi-blue-1);
}

.share::before {
  content: "";
  grid-column: 1;
  grid-row: 1;
  height: 8px;
  border-radius: 8px;
  background: var(--kpi-blue-5);
}

.share span {
  grid-column: 1;
  grid-row: 1;
}

.share strong {
  color: var(--kpi-muted);
  font-size: 12px;
}

@media (max-width: 1000px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
