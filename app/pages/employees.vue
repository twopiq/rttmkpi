<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

type Employee = {
  id: number; name: string; jobTitle: string | null; employeeCode: string
  online: boolean; availability: string; activeWorks: number
}

type EmployeeKpi = {
  id: number; name: string; jobTitle: string | null; online: boolean
  completed: number; failed: number; rating: number; share: number; activeWorks: number
}

type EmployeeData = {
  employees: Employee[]
  employeeKpi: EmployeeKpi[]
  employeeStatusChart: Array<{ label: string; value: number }>
  employeeResults: Array<{ label: string; value: number }>
}

const { data, error, refresh } = useFetch<EmployeeData>(apiUrl('/api/kpi/dashboard'), {
  headers: apiAuthHeaders(),
})

const activeCount   = computed(() => data.value?.employees.filter(e => e.online).length ?? 0)
const offlineCount  = computed(() => (data.value?.employees.length ?? 0) - activeCount.value)
const totalEmployees = computed(() => data.value?.employees.length ?? 0)

useHead({ title: 'Xodimlar | KPI tizimi' })
</script>

<template>
  <AppShell
    title="Xodimlar KPI"
    subtitle="Ishlash samaradorligi, reyting va yuklanma tahlili."
    :badge="`Jami: ${totalEmployees}`"
  >
    <p v-if="error" class="fetch-error" role="alert">
      Xatolik yuz berdi.
      <button type="button" @click="refresh()">Qayta urinish</button>
    </p>

    <!-- Stat cards -->
    <section class="stats-row">
      <StatCard label="Jami xodimlar" :value="totalEmployees"  tone="primary" />
      <StatCard label="Faol"          :value="activeCount"     tone="accent" />
      <StatCard label="Faol emas"     :value="offlineCount"    tone="deep" />
    </section>

    <!-- Charts -->
    <section class="charts-row">
      <DashboardPanel title="Bajarilgan ishlar" subtitle="Top xodimlar bo'yicha">
        <BarChart
          :items="data?.employeeResults || []"
          :horizontal="true"
          color="var(--kpi-chart-2)"
        />
      </DashboardPanel>
      <DashboardPanel title="Faol ishlar yuklanmasi" subtitle="Har bir xodimdagi jarayondagi ishlar">
        <BarChart
          :items="data?.employeeStatusChart || []"
          :horizontal="true"
          color="var(--kpi-chart-1)"
        />
      </DashboardPanel>
    </section>

    <!-- KPI Table -->
    <DashboardPanel title="KPI jadvali" subtitle="Batafsil ko'rsatkichlar">
      <p v-if="!data?.employeeKpi?.length" class="empty-text">Ma'lumotlar yo'q.</p>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Xodim</th>
              <th>Holat</th>
              <th>Bajarilgan</th>
              <th>Kechikkan</th>
              <th>Faol ishlar</th>
              <th>Reyting</th>
              <th>Ulush</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(emp, i) in data?.employeeKpi" :key="emp.id">
              <td class="rank">{{ i + 1 }}</td>
              <td>
                <strong>{{ emp.name }}</strong>
                <span v-if="emp.jobTitle">{{ emp.jobTitle }}</span>
              </td>
              <td>
                <span class="status-pill" :class="emp.online ? 'online' : 'offline'">
                  {{ emp.online ? 'Faol' : 'Faol emas' }}
                </span>
              </td>
              <td class="num">{{ emp.completed }}</td>
              <td class="num warn">{{ emp.failed }}</td>
              <td class="num">{{ emp.activeWorks }}</td>
              <td>
                <span class="rating">{{ emp.rating.toFixed(1) }} <i>★</i></span>
              </td>
              <td>
                <div class="share-bar">
                  <div class="share-track">
                    <span :style="{ width: `${Math.min(emp.share, 100)}%` }" />
                  </div>
                  <strong>{{ emp.share }}%</strong>
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
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

th, td {
  border-bottom: 1px solid var(--kpi-border);
  padding: 12px 10px;
  text-align: left;
  vertical-align: middle;
}

th {
  background: var(--kpi-soft);
  color: var(--kpi-text);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

td strong { display: block; color: var(--kpi-text); font-size: 13px; }
td span { display: block; margin-top: 2px; color: var(--kpi-muted); font-size: 11px; }

.rank { color: var(--kpi-text); font-weight: 900; font-size: 14px; }
.num { font-weight: 800; }
.warn { color: var(--kpi-danger); }

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  border-radius: 6px;
  padding: 0 9px;
  font-size: 11px;
  font-weight: 900;
}

.status-pill.online  { background: var(--kpi-success-soft); color: var(--kpi-success); }
.status-pill.offline { background: var(--kpi-soft);         color: var(--kpi-muted); }

.rating { color: var(--kpi-warning); font-size: 14px; font-weight: 900; }
.rating i { font-style: normal; }

.share-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 110px;
}

.share-track {
  flex: 1;
  height: 8px;
  border-radius: 8px;
  background: var(--kpi-soft);
  overflow: hidden;
  position: relative;
}

.share-track span {
  position: absolute;
  left: 0; top: 0;
  height: 100%;
  border-radius: 8px;
  background: var(--kpi-accent);
  min-width: 2px;
}

.share-bar strong {
  flex-shrink: 0;
  color: var(--kpi-muted);
  font-size: 11px;
  min-width: 36px;
  text-align: right;
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
  .charts-row { grid-template-columns: 1fr; }
}

@media (max-width: 520px) {
  .stats-row { grid-template-columns: 1fr; }
}
</style>
