<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

type Ticket = {
  dbId: number; id: string; customer: string; phone: string; location: string
  title: string; assignee: string; department: string; category: string
  priority: string; priorityLabel: string
  status: string; statusLabel: string; date: string; deadline: string | null; isOverdue: boolean
}

type TicketsData = {
  items: Ticket[]; total: number; per_page: number; current_page: number; last_page: number
  departments: Array<{ id: number; name: string }>
}

const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')

const config = useRuntimeConfig()
const surveyBase = computed(() => {
  if (import.meta.client) return String(window.__KPI_API_BASE_URL__ || config.public.apiBaseUrl || '').replace(/\/$/, '')
  return String(config.public.apiBaseUrl || '').replace(/\/$/, '')
})

const ticketUrl = (dbId: number) => `${surveyBase.value}/admin/dispatch/${dbId}`

// Filters
const statusFilter     = ref('')
const priorityFilter   = ref('')
const departmentFilter = ref('')
const searchQuery      = ref('')
const dateFrom         = ref('')
const dateTo           = ref('')
const page             = ref(1)

const queryParams = computed(() => {
  const p: Record<string, string> = { page: String(page.value) }
  if (statusFilter.value)     p.status        = statusFilter.value
  if (priorityFilter.value)   p.priority      = priorityFilter.value
  if (departmentFilter.value) p.department_id = departmentFilter.value
  if (searchQuery.value)      p.search        = searchQuery.value
  if (dateFrom.value)         p.from          = dateFrom.value
  if (dateTo.value)           p.to            = dateTo.value
  return p
})

const fetchUrl = computed(() => {
  const qs = new URLSearchParams(queryParams.value).toString()
  return apiUrl(`/api/kpi/tickets?${qs}`)
})

const { data, pending, error, refresh } = useFetch<TicketsData>(fetchUrl, {
  headers: apiAuthHeaders(),
})

const resetFilters = () => {
  statusFilter.value = ''; priorityFilter.value = ''; departmentFilter.value = ''
  searchQuery.value = ''; dateFrom.value = ''; dateTo.value = ''; page.value = 1
}

const applyFilters = () => { page.value = 1 }

const statusClass = (status: string) => ({
  completed: 'success', closed: 'success',
  returned: 'warning', rejected: 'danger',
  in_progress: 'process', assigned: 'process',
  overdue: 'danger', new: 'waiting',
}[status] || 'process')

const priorityClass = (p: string) => ({
  urgent: 'p-urgent', high: 'p-high', medium: 'p-medium', low: 'p-low',
}[p] || '')

useHead({ title: 'Murojaatlar | KPI tizimi' })
</script>

<template>
  <AppShell
    title="Murojaatlar"
    subtitle="Barcha murojaatlar ro'yxati, filtrlash va qidirish."
    :badge="`Jami: ${data?.total ?? 0}`"
  >
    <p v-if="error" class="fetch-error" role="alert">
      Xatolik yuz berdi.
      <button type="button" @click="refresh()">Qayta urinish</button>
    </p>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="ID, mijoz yoki sarlavha..."
        class="search-input"
        @keyup.enter="applyFilters"
      />

      <select v-model="statusFilter" @change="applyFilters">
        <option value="">Barcha statuslar</option>
        <option value="new">Yangi</option>
        <option value="assigned">Taqsimlandi</option>
        <option value="in_progress">Jarayonda</option>
        <option value="returned">Qaytarildi</option>
        <option value="overdue">Kechikkan</option>
        <option value="completed">Bajarildi</option>
        <option value="closed">Yopildi</option>
        <option value="rejected">Rad etildi</option>
      </select>

      <select v-model="priorityFilter" @change="applyFilters">
        <option value="">Barcha prioritetlar</option>
        <option value="urgent">Shoshilinch</option>
        <option value="high">Yuqori</option>
        <option value="medium">O'rta</option>
        <option value="low">Past</option>
      </select>

      <select v-model="departmentFilter" @change="applyFilters">
        <option value="">Barcha bo'limlar</option>
        <option v-for="d in data?.departments" :key="d.id" :value="String(d.id)">
          {{ d.name }}
        </option>
      </select>

      <input v-model="dateFrom" type="date" @change="applyFilters" />
      <input v-model="dateTo" type="date" @change="applyFilters" />

      <button type="button" class="btn-reset" @click="resetFilters">Tozalash</button>
    </div>

    <!-- Table -->
    <DashboardPanel :title="`Murojaatlar${statusFilter ? ' — ' + statusFilter : ''}`">
      <p v-if="!data?.items?.length && !pending" class="empty-text">Murojaatlar topilmadi.</p>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mijoz</th>
              <th>Sarlavha</th>
              <th>Mas'ul</th>
              <th>Bo'lim</th>
              <th>Prioritet</th>
              <th>Status</th>
              <th>Sana</th>
              <th v-if="isAdmin">Amal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in data?.items" :key="ticket.dbId" :class="{ 'row-overdue': ticket.isOverdue }">
              <td><strong class="ticket-id">{{ ticket.id }}</strong></td>
              <td>
                <strong>{{ ticket.customer }}</strong>
                <span>{{ ticket.phone }}</span>
                <small>{{ ticket.location }}</small>
              </td>
              <td>
                <span class="ticket-title">{{ ticket.title }}</span>
              </td>
              <td>
                <span class="assignee-pill">{{ ticket.assignee }}</span>
              </td>
              <td><span class="dept-text">{{ ticket.department }}</span></td>
              <td>
                <span class="priority-pill" :class="priorityClass(ticket.priority)">
                  {{ ticket.priorityLabel }}
                </span>
              </td>
              <td>
                <span class="status-pill" :class="statusClass(ticket.status)">
                  {{ ticket.statusLabel }}
                </span>
              </td>
              <td>
                <time>{{ ticket.date?.slice(0, 10) }}</time>
                <small v-if="ticket.deadline" :class="{ 'overdue-text': ticket.isOverdue }">
                  ⏰ {{ ticket.deadline?.slice(0, 10) }}
                </small>
              </td>
              <td v-if="isAdmin">
                <a
                  :href="ticketUrl(ticket.dbId)"
                  target="_blank"
                  rel="noopener"
                  class="action-link"
                  aria-label="Surovnomada ochish"
                >→</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="(data?.last_page ?? 1) > 1" class="pagination">
        <button type="button" :disabled="page <= 1" @click="page--">‹</button>
        <span>{{ page }} / {{ data?.last_page }}</span>
        <button type="button" :disabled="page >= (data?.last_page ?? 1)" @click="page++">›</button>
      </div>
    </DashboardPanel>

    <p v-if="pending" class="loading-text">Yuklanmoqda...</p>
  </AppShell>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  align-items: center;
}

input, select {
  min-height: 36px;
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-surface);
  color: var(--kpi-text);
  font: inherit;
  font-size: 13px;
  padding: 0 12px;
  outline: none;
}

input:focus, select:focus {
  border-color: var(--kpi-primary);
  box-shadow: 0 0 0 3px var(--kpi-focus);
}

.search-input { min-width: 220px; }

.btn-reset {
  min-height: 36px;
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-soft);
  color: var(--kpi-muted);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  padding: 0 14px;
}

.btn-reset:hover { color: var(--kpi-text); }

.table-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

th, td {
  border-bottom: 1px solid var(--kpi-border);
  padding: 11px 10px;
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

td { color: var(--kpi-text); font-size: 13px; }

td strong { display: block; }
td span, td small { display: block; margin-top: 2px; color: var(--kpi-muted); font-size: 11px; }

.ticket-id { color: var(--kpi-primary); font-size: 12px; }

.ticket-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
}

.dept-text { color: var(--kpi-muted); font-size: 12px; }

.assignee-pill, .status-pill, .priority-pill {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
}

.assignee-pill { background: var(--kpi-accent-soft); color: var(--kpi-accent); }

.status-pill.success { background: var(--kpi-success-soft); color: var(--kpi-success); }
.status-pill.warning { background: var(--kpi-warning-soft); color: var(--kpi-warning); }
.status-pill.danger  { background: var(--kpi-danger-soft);  color: var(--kpi-danger); }
.status-pill.process { background: var(--kpi-blue-5);       color: var(--kpi-primary); }
.status-pill.waiting { background: var(--kpi-warning-soft); color: var(--kpi-warning); }

.p-urgent { background: var(--kpi-danger-soft);  color: var(--kpi-danger); }
.p-high   { background: var(--kpi-warning-soft); color: var(--kpi-warning); }
.p-medium { background: var(--kpi-blue-5);       color: var(--kpi-primary); }
.p-low    { background: var(--kpi-soft);         color: var(--kpi-muted); }

.row-overdue td { background: rgba(248, 113, 113, 0.04); }

.overdue-text { color: var(--kpi-danger) !important; }

.action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-soft);
  color: var(--kpi-primary);
  font-weight: 900;
  text-decoration: none;
}

.action-link:hover {
  background: var(--kpi-primary);
  color: var(--kpi-inverse);
  border-color: var(--kpi-primary);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.pagination button {
  min-height: 34px;
  min-width: 34px;
  border: 1px solid var(--kpi-border);
  border-radius: 8px;
  background: var(--kpi-surface);
  color: var(--kpi-text);
  cursor: pointer;
  font: inherit;
  font-size: 16px;
  font-weight: 900;
  padding: 0;
}

.pagination button:disabled { opacity: 0.4; cursor: default; }
.pagination button:not(:disabled):hover { background: var(--kpi-primary); color: var(--kpi-inverse); border-color: var(--kpi-primary); }

.pagination span { color: var(--kpi-muted); font-size: 13px; font-weight: 700; }

.empty-text { margin: 0; color: var(--kpi-muted); font-size: 14px; padding: 24px 0; text-align: center; }
.loading-text { margin: 12px 0 0; color: var(--kpi-muted); font-weight: 800; }

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
</style>
