<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

type DashboardData = Awaited<ReturnType<typeof $fetch>> & {
  cards: Array<{ key: string; label: string; value: string | number; tone: 'primary' | 'secondary' | 'accent' | 'deep' | 'soft' }>
  statusDistribution: Array<{ label: string; value: number }>
  ticketJournal: Array<{
    id: string
    customer: string
    phone: string
    location: string
    title: string
    description: string
    assignee: string
    status: string
    statusLabel: string
    date: string
  }>
  overview: { urgent: number }
}

const { data, pending, refresh } = await useFetch<DashboardData>(apiUrl('/api/kpi/dashboard'), {
  credentials: 'include',
})

const statusClass = (status: string) => ({
  completed: 'success',
  closed: 'success',
  returned: 'warning',
  rejected: 'danger',
  in_progress: 'process',
  assigned: 'process',
  new: 'waiting',
}[status] || 'process')

useHead({
  title: 'Asosiy dashboard | KPI tizimi',
})
</script>

<template>
  <AppShell
    title="Asosiy dashboard"
    subtitle="Murojaat, tezkor holatlar va real vaqt nazorati."
    :badge="`Faol favqulodda ishlar: ${data?.overview.urgent || 0}`"
  >
    <section class="stats-grid">
      <StatCard
        v-for="card in data?.cards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :tone="card.tone"
      />
    </section>

    <section class="dashboard-grid">
      <DashboardPanel title="Murojaatlar holati" subtitle="Joriy statistik taqsimot">
        <DonutChart :items="data?.statusDistribution || []" />
      </DashboardPanel>

      <DashboardPanel title="Filtrlash">
        <div class="filter-actions">
          <button type="button">Hammasi</button>
          <button type="button" class="filter-waiting">Kutilmoqda</button>
          <button type="button" class="filter-process">Jarayonda</button>
          <button type="button" class="filter-done">Bajarildi</button>
        </div>
        <div class="date-row">
          <input type="date">
          <input type="date">
          <button type="button">Filtrlash</button>
        </div>
      </DashboardPanel>
    </section>

    <DashboardPanel title="Murojaatlar jurnali">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mijoz</th>
              <th>Muammo / tavsif</th>
              <th>Mas'ul xodim</th>
              <th>Status</th>
              <th>Sana</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in data?.ticketJournal" :key="ticket.id">
              <td><strong class="ticket-id">{{ ticket.id }}</strong></td>
              <td>
                <strong>{{ ticket.customer }}</strong>
                <span>{{ ticket.phone }}</span>
                <small>{{ ticket.location }}</small>
              </td>
              <td>
                <strong>{{ ticket.title }}</strong>
                <span>{{ ticket.description }}</span>
              </td>
              <td>
                <select :value="ticket.assignee" aria-label="Mas'ul xodim">
                  <option>{{ ticket.assignee }}</option>
                </select>
                <span class="employee-pill">{{ ticket.assignee }}</span>
              </td>
              <td>
                <span class="status-pill" :class="statusClass(ticket.status)">
                  {{ ticket.statusLabel }}
                </span>
              </td>
              <td>{{ ticket.date || '-' }}</td>
              <td>
                <button type="button" class="action-btn">↗</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardPanel>

    <p v-if="pending" class="loading-text">Ma'lumotlar yangilanmoqda...</p>
    <button class="refresh-btn" type="button" @click="refresh()">Yangilash</button>
  </AppShell>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(340px, 1fr);
  gap: 16px;
  margin-top: 18px;
}

.filter-actions,
.date-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.date-row {
  margin-top: 18px;
}

button,
input,
select {
  min-height: 34px;
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-surface);
  color: var(--kpi-blue-2);
  font: inherit;
  font-weight: 800;
  padding: 0 12px;
}

button {
  border: 0;
  background: var(--kpi-blue-3);
  color: var(--kpi-surface);
  cursor: pointer;
}

.filter-waiting {
  background: var(--kpi-blue-1);
}

.filter-process {
  background: var(--kpi-blue-3);
}

.filter-done {
  background: var(--kpi-blue-4);
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

th,
td {
  border-bottom: 1px solid var(--kpi-border);
  padding: 14px 10px;
  text-align: left;
  vertical-align: top;
}

th {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-2);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

td {
  color: var(--kpi-blue-2);
  font-size: 13px;
}

td span,
td small {
  display: block;
  margin-top: 4px;
  color: var(--kpi-muted);
}

.ticket-id {
  color: var(--kpi-blue-3);
}

.employee-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 900;
}

.employee-pill {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-2);
}

.status-pill.success {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-4);
}

.status-pill.warning {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-1);
}

.status-pill.danger {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-3);
}

.status-pill.process {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-2);
}

.status-pill.waiting {
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-1);
}

.action-btn {
  width: 34px;
  min-height: 34px;
  background: var(--kpi-blue-5);
  color: var(--kpi-blue-3);
}

.refresh-btn {
  margin-top: 14px;
}

.loading-text {
  margin: 14px 0 0;
  color: var(--kpi-muted);
  font-weight: 800;
}

@media (max-width: 1180px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
