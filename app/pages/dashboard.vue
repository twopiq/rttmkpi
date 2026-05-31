<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

type Overview = {
  total: number; waiting: number; inProgress: number; completed: number
  overdue: number; complaints: number; urgent: number; slaPercent: number; rating: number
}

type DashboardData = {
  overview: Overview
  cards: Array<{ key: string; label: string; value: string | number; tone: 'primary' | 'secondary' | 'accent' | 'deep' | 'soft' }>
  statusDistribution: Array<{ label: string; value: number }>
  ticketJournal: Array<{
    dbId: number; id: string; customer: string; phone: string; location: string
    title: string; assignee: string; priority: string; priorityLabel: string
    status: string; statusLabel: string; date: string
  }>
}

const { data, pending, refresh, error } = useFetch<DashboardData>(apiUrl('/api/kpi/dashboard'), {
  headers: apiAuthHeaders(),
})

const priorityItems = computed(() => {
  const dist = data.value?.statusDistribution || []
  // Priority breakdown from overview
  const o = data.value?.overview
  if (!o) return []
  return [
    { label: 'Shoshilinch', value: o.urgent },
    { label: 'Muddati o\'tgan', value: o.overdue },
    { label: 'Kutilmoqda', value: o.waiting },
    { label: 'Jarayonda', value: o.inProgress },
    { label: 'Bajarildi', value: o.completed },
  ]
})

const statusClass = (status: string) => ({
  completed: 'success', closed: 'success',
  returned: 'warning', rejected: 'danger',
  in_progress: 'process', assigned: 'process',
  overdue: 'danger', new: 'waiting',
}[status] || 'process')

const priorityClass = (p: string) => ({
  urgent: 'p-urgent', high: 'p-high', medium: 'p-medium', low: 'p-low',
}[p] || '')

useHead({ title: 'Dashboard | KPI tizimi' })
</script>

<template>
  <AppShell
    title="Asosiy dashboard"
    subtitle="Real vaqt nazorati va umumiy holat."
    :badge="`Shoshilinch: ${data?.overview.urgent || 0}`"
  >
    <p v-if="error" class="fetch-error" role="alert">
      Xatolik yuz berdi.
      <button type="button" @click="refresh()">Qayta urinish</button>
    </p>

    <!-- Stat cards -->
    <section class="stats-grid">
      <StatCard v-for="card in data?.cards" :key="card.key"
        :label="card.label" :value="card.value" :tone="card.tone" />
    </section>

    <!-- Charts row -->
    <section class="charts-row">
      <DashboardPanel title="Murojaatlar holati" subtitle="Status bo'yicha taqsimot">
        <DonutChart :items="data?.statusDistribution || []" />
      </DashboardPanel>

      <DashboardPanel title="Holat ko'rsatkichlari" subtitle="Joriy davr">
        <BarChart :items="priorityItems" :horizontal="true" color="var(--kpi-chart-1)" />
      </DashboardPanel>

      <DashboardPanel title="SLA bajarish" subtitle="Muddatida bajarilgan %">
        <div class="sla-center">
          <SlaGauge :percent="data?.overview.slaPercent ?? 0" label="SLA" />
          <div class="sla-meta">
            <div class="sla-row">
              <span>Reyting</span>
              <strong>{{ data?.overview.rating ?? 0 }} ★</strong>
            </div>
            <div class="sla-row">
              <span>Shikoyatlar</span>
              <strong>{{ data?.overview.complaints ?? 0 }}</strong>
            </div>
          </div>
        </div>
      </DashboardPanel>
    </section>

    <!-- Recent tickets -->
    <DashboardPanel title="So'nggi murojaatlar" subtitle="Oxirgi 10 ta">
      <p v-if="!data?.ticketJournal?.length && !pending" class="empty-text">
        Murojaatlar yo'q.
      </p>
      <div v-else class="ticket-cards">
        <article v-for="ticket in data?.ticketJournal" :key="ticket.dbId" class="ticket-card">
          <div class="tc-head">
            <span class="tc-id">{{ ticket.id }}</span>
            <span class="status-pill" :class="statusClass(ticket.status)">{{ ticket.statusLabel }}</span>
          </div>
          <p class="tc-title">{{ ticket.title }}</p>
          <div class="tc-foot">
            <span class="tc-customer">{{ ticket.customer }}</span>
            <span class="priority-pill" :class="priorityClass(ticket.priority)">{{ ticket.priorityLabel }}</span>
          </div>
          <div class="tc-meta">
            <span>{{ ticket.assignee }}</span>
            <time>{{ ticket.date?.slice(0, 10) }}</time>
          </div>
        </article>
      </div>
    </DashboardPanel>

    <p v-if="pending" class="loading-text">Yangilanmoqda...</p>
    <button class="refresh-btn" type="button" @click="refresh()">Yangilash</button>
  </AppShell>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr minmax(180px, 260px);
  gap: 14px;
  margin-bottom: 16px;
}

.sla-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 12px 0;
}

.sla-meta { display: grid; gap: 12px; }

.sla-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sla-row span {
  color: var(--kpi-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sla-row strong {
  color: var(--kpi-text);
  font-size: 20px;
  font-weight: 900;
}

/* Ticket cards */
.ticket-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.ticket-card {
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-bg);
  padding: 12px;
  display: grid;
  gap: 8px;
}

.tc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tc-id {
  color: var(--kpi-primary);
  font-size: 11px;
  font-weight: 900;
}

.tc-title {
  margin: 0;
  color: var(--kpi-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tc-customer {
  color: var(--kpi-muted);
  font-size: 11px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tc-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tc-meta span, .tc-meta time {
  color: var(--kpi-muted);
  font-size: 11px;
}

/* Pills */
.status-pill, .priority-pill {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.status-pill.success { background: var(--kpi-success-soft); color: var(--kpi-success); }
.status-pill.warning { background: var(--kpi-warning-soft); color: var(--kpi-warning); }
.status-pill.danger  { background: var(--kpi-danger-soft);  color: var(--kpi-danger); }
.status-pill.process { background: var(--kpi-blue-5);       color: var(--kpi-primary); }
.status-pill.waiting { background: var(--kpi-warning-soft); color: var(--kpi-warning); }

.p-urgent { background: var(--kpi-danger-soft);  color: var(--kpi-danger); }
.p-high   { background: var(--kpi-warning-soft); color: var(--kpi-warning); }
.p-medium { background: var(--kpi-blue-5);       color: var(--kpi-primary); }
.p-low    { background: var(--kpi-soft);         color: var(--kpi-muted); }

.refresh-btn {
  margin-top: 12px;
  min-height: 34px;
  border: 0;
  border-radius: 8px;
  background: var(--kpi-primary);
  color: var(--kpi-inverse);
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  padding: 0 16px;
}

.loading-text { margin: 12px 0 0; color: var(--kpi-muted); font-weight: 800; }

.empty-text {
  margin: 0; color: var(--kpi-muted); font-size: 14px;
  padding: 24px 0; text-align: center;
}

.fetch-error {
  display: flex; align-items: center; gap: 12px;
  margin: 0 0 14px; border: 1px solid var(--kpi-danger);
  border-radius: 8px; background: var(--kpi-danger-soft);
  color: var(--kpi-danger); font-size: 14px; font-weight: 700; padding: 10px 14px;
}

.fetch-error button {
  min-height: 28px; border: 1px solid var(--kpi-danger);
  border-radius: 6px; background: transparent; color: var(--kpi-danger);
  cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; padding: 0 10px;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .charts-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 760px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .charts-row { grid-template-columns: 1fr; }
}

@media (max-width: 400px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
