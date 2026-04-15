<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

type EmployeeData = {
  employees: Array<{
    id: number
    name: string
    employeeCode: string
    online: boolean
    activeWorks: number
  }>
  employeeStatusChart: Array<{ label: string; value: number }>
}

const { data } = await useFetch<EmployeeData>('/api/kpi/dashboard')

const onlineCount = computed(() => data.value?.employees.filter((employee) => employee.online).length || 0)
const offlineCount = computed(() => (data.value?.employees.length || 0) - onlineCount.value)

useHead({
  title: "Xodimlar bo'limi | KPI tizimi",
})
</script>

<template>
  <AppShell
    title="Xodimlar bo'limi"
    subtitle="Onlayn holat, faol ishlar va individual ko'rinishlar."
    :badge="`Xodimlar: ${data?.employees.length || 0}`"
  >
    <section class="stats-grid">
      <StatCard label="Onlayn" :value="onlineCount" tone="accent" />
      <StatCard label="Offline" :value="offlineCount" tone="deep" />
    </section>

    <section class="employees-grid">
      <DashboardPanel title="Faol ishlar kesimi" subtitle="Har bir xodimdagi jarayondagi ishlar">
        <BarChart :items="data?.employeeStatusChart || []" color="#577DC0" />
      </DashboardPanel>

      <DashboardPanel title="Xodimlar holati">
        <div class="employee-list">
          <article v-for="employee in data?.employees" :key="employee.id" class="employee-card">
            <div>
              <strong>
                <i :class="{ offline: !employee.online }" />
                {{ employee.name }}
              </strong>
              <span>{{ employee.employeeCode }}</span>
            </div>
            <div class="actions">
              <button type="button">ON/OFF</button>
              <button type="button" class="dark">Ishlar</button>
            </div>
          </article>
        </div>
      </DashboardPanel>
    </section>
  </AppShell>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.employees-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(390px, 0.75fr);
  gap: 16px;
}

.employee-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-height: 540px;
  overflow: auto;
  padding-right: 4px;
}

.employee-card {
  display: grid;
  gap: 12px;
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-surface);
  padding: 14px;
}

strong {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--kpi-blue-2);
  font-size: 14px;
}

i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--kpi-blue-1);
}

i.offline {
  background: var(--kpi-blue-5);
}

span {
  display: block;
  margin-top: 6px;
  color: var(--kpi-muted);
  font-size: 12px;
  font-weight: 800;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  min-height: 34px;
  border: 0;
  border-radius: 8px;
  background: var(--kpi-blue-3);
  color: var(--kpi-surface);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  padding: 0 12px;
}

button.dark {
  background: var(--kpi-blue-1);
}

@media (max-width: 1100px) {
  .employees-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .stats-grid,
  .employee-list {
    grid-template-columns: 1fr;
  }
}
</style>
