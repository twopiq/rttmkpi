import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

type CountRow = {
  label?: string
  status?: string
  priority?: string
  value?: number
  total?: number
  c?: number
}

type KpiSummary = {
  source: 'survey-sqlite'
  updatedAt: string
  stats: Array<{
    key: string
    label: string
    value: string | number
    description: string
  }>
  employeeResults: Array<{
    label: string
    value: number
  }>
  indicators: Array<{
    label: string
    value: number
    hex: string
  }>
}

const statusLabels: Record<string, string> = {
  new: 'Yangi',
  assigned: 'Taqsimlangan',
  in_progress: 'Jarayonda',
  returned: 'Qaytarilgan',
  completed: 'Bajarilgan',
  closed: 'Yopilgan',
  rejected: 'Rad etilgan',
}

const statusColors: Record<string, string> = {
  new: '#577DC0',
  assigned: '#1949A2',
  in_progress: '#053591',
  returned: '#063899',
  completed: '#1949A2',
  closed: '#577DC0',
  rejected: '#063899',
}

const resolveSqlitePath = () => {
  const config = useRuntimeConfig()
  const configuredPath = String(config.surveySqlitePath || '').trim()

  if (!configuredPath) {
    return null
  }

  return resolve(process.cwd(), configuredPath)
}

const scalar = (db: DatabaseSync, sql: string) => {
  const row = db.prepare(sql).get() as CountRow | undefined

  return Number(row?.value ?? row?.total ?? row?.c ?? 0)
}

const rating = (completedCount: number, onTimeCount: number) => {
  if (completedCount === 0) {
    return '0.0'
  }

  return ((onTimeCount / completedCount) * 5).toFixed(1)
}

export const fetchSurveySqliteKpiSummary = (): KpiSummary | null => {
  const sqlitePath = resolveSqlitePath()

  if (!sqlitePath || !existsSync(sqlitePath)) {
    return null
  }

  const db = new DatabaseSync(sqlitePath, {
    readOnly: true,
  })

  try {
    const totalTickets = scalar(db, 'select count(*) as value from tickets')
    const completedTickets = scalar(
      db,
      "select count(*) as value from tickets where status in ('completed', 'closed') or completed_at is not null",
    )
    const activeTickets = scalar(
      db,
      "select count(*) as value from tickets where status in ('new', 'assigned', 'in_progress', 'returned')",
    )
    const returnedTickets = scalar(
      db,
      "select count(*) as value from tickets where status = 'returned'",
    )
    const overdueTickets = scalar(
      db,
      "select count(*) as value from tickets where deadline_at is not null and datetime(deadline_at) < datetime('now') and status not in ('completed', 'closed', 'rejected')",
    )
    const onTimeTickets = scalar(
      db,
      "select count(*) as value from tickets where completed_at is not null and (deadline_at is null or datetime(completed_at) <= datetime(deadline_at))",
    )
    const complaintTickets = scalar(
      db,
      "select count(distinct ticket_id) as value from ticket_status_histories where to_status in ('returned', 'rejected')",
    )

    const employeeResults = db.prepare(`
      select coalesce(users.name, 'Biriktirilmagan') as label, count(tickets.id) as value
      from tickets
      left join users on users.id = tickets.assigned_executor_id
      group by tickets.assigned_executor_id, users.name
      order by value desc, label asc
      limit 8
    `).all() as CountRow[]

    const statusRows = db.prepare(`
      select status, count(*) as value
      from tickets
      group by status
      order by value desc, status asc
    `).all() as CountRow[]

    const priorityRows = db.prepare(`
      select priority, count(*) as value
      from tickets
      group by priority
      order by value desc, priority asc
    `).all() as CountRow[]

    return {
      source: 'survey-sqlite',
      updatedAt: new Date().toISOString(),
      stats: [
        {
          key: 'total',
          label: 'Jami murojaatlar',
          value: totalTickets,
          description: "So'rovnoma tizimidagi barcha murojaatlar soni.",
        },
        {
          key: 'active',
          label: 'Jarayondagi murojaatlar',
          value: activeTickets,
          description: 'Yangi, taqsimlangan, jarayonda yoki qaytarilgan murojaatlar.',
        },
        {
          key: 'completed',
          label: 'Bajarilgan murojaatlar',
          value: completedTickets,
          description: 'Bajarilgan yoki yopilgan murojaatlar.',
        },
        {
          key: 'rating',
          label: "O'rtacha reyting",
          value: rating(completedTickets, onTimeTickets),
          description: 'Muddatida bajarilgan murojaatlar asosida 5 ballik baho.',
        },
        {
          key: 'overdue',
          label: 'Muddati kechikkan',
          value: overdueTickets,
          description: "SLA muddati o'tgan ochiq murojaatlar.",
        },
        {
          key: 'complaints',
          label: 'Qaytarilgan yoki rad etilgan',
          value: complaintTickets || returnedTickets,
          description: 'Tarixida qaytarish yoki rad etish holati bor murojaatlar.',
        },
      ],
      employeeResults: employeeResults.map((row) => ({
        label: String(row.label || 'Biriktirilmagan'),
        value: Number(row.value || 0),
      })),
      indicators: [
        ...statusRows.map((row) => {
          const status = String(row.status || 'unknown')

          return {
            label: statusLabels[status] || status,
            value: Number(row.value || 0),
            hex: statusColors[status] || '#1949A2',
          }
        }),
        ...priorityRows.map((row) => ({
          label: `Prioritet: ${String(row.priority || 'Belgilanmagan')}`,
          value: Number(row.value || 0),
          hex: '#577DC0',
        })),
      ],
    }
  } finally {
    db.close()
  }
}
