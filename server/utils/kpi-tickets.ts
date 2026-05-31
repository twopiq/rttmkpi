import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

type AnyRow = Record<string, string | number | null>

const statusLabels: Record<string, string> = {
  new: 'Yangi', assigned: 'Taqsimlandi', in_progress: 'Jarayonda',
  returned: 'Qaytarildi', overdue: 'Kechikkan',
  completed: 'Bajarildi', closed: 'Yopildi', rejected: 'Rad etildi',
}

const priorityLabels: Record<string, string> = {
  urgent: 'Shoshilinch', high: 'Yuqori', medium: "O'rta",
  low: 'Past', unassigned: 'Belgilanmagan',
}

const resolveSqlitePath = () => {
  const config = useRuntimeConfig()
  const p = String(config.surveySqlitePath || '').trim()
  return p ? resolve(process.cwd(), p) : null
}

export type KpiTicketsParams = {
  page?: number
  status?: string
  priority?: string
  departmentId?: string
  search?: string
  from?: string
  to?: string
}

export const fetchKpiTicketsFromSqlite = (params: KpiTicketsParams = {}) => {
  const sqlitePath = resolveSqlitePath()
  if (!sqlitePath || !existsSync(sqlitePath)) return null

  const db = new DatabaseSync(sqlitePath, { readOnly: true })

  try {
    const perPage = 50
    const page = Math.max(1, params.page ?? 1)
    const offset = (page - 1) * perPage

    const conditions: string[] = []
    const binds: (string | number)[] = []

    if (params.status) {
      conditions.push('tickets.status = ?')
      binds.push(params.status)
    }

    if (params.priority) {
      conditions.push('tickets.priority = ?')
      binds.push(params.priority)
    }

    if (params.departmentId) {
      conditions.push('tickets.assigned_department_id = ?')
      binds.push(params.departmentId)
    }

    if (params.search) {
      conditions.push('(tickets.reference LIKE ? OR tickets.requester_name LIKE ? OR tickets.title LIKE ?)')
      const s = `%${params.search}%`
      binds.push(s, s, s)
    }

    if (params.from) {
      conditions.push('date(tickets.created_at) >= ?')
      binds.push(params.from)
    }

    if (params.to) {
      conditions.push('date(tickets.created_at) <= ?')
      binds.push(params.to)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const totalRow = db.prepare(
      `SELECT count(*) as c FROM tickets ${where}`,
    ).get(...binds) as AnyRow | undefined

    const total = Number(totalRow?.c ?? 0)

    const rows = db.prepare(`
      SELECT
        tickets.id,
        tickets.reference,
        tickets.requester_name,
        tickets.requester_phone,
        tickets.requester_department,
        tickets.title,
        tickets.priority,
        tickets.status,
        tickets.created_at,
        tickets.deadline_at,
        tickets.completed_at,
        tickets.closed_at,
        tickets.rejected_at,
        executors.name  AS assignee_name,
        departments.name AS dept_name,
        categories.name  AS cat_name
      FROM tickets
      LEFT JOIN users        AS executors   ON executors.id   = tickets.assigned_executor_id
      LEFT JOIN departments               ON departments.id = tickets.assigned_department_id
      LEFT JOIN categories               ON categories.id  = tickets.category_id
      ${where}
      ORDER BY tickets.created_at DESC, tickets.id DESC
      LIMIT ? OFFSET ?
    `).all(...binds, perPage, offset) as AnyRow[]

    const depts = db.prepare(
      `SELECT id, name FROM departments WHERE is_active = 1 ORDER BY name`,
    ).all() as AnyRow[]

    const items = rows.map((row) => {
      const status = String(row.status || '')
      const priority = String(row.priority || '')
      const deadline = row.deadline_at ? String(row.deadline_at) : null
      const done = ['completed', 'closed', 'rejected'].includes(status)
      const isOverdue = !!deadline && new Date(deadline) < new Date() && !done

      return {
        dbId: Number(row.id),
        id: String(row.reference || `#${row.id}`),
        customer: String(row.requester_name || "Noma'lum mijoz"),
        phone: String(row.requester_phone || '-'),
        location: String(row.requester_department || '-'),
        title: String(row.title || 'Murojaat'),
        assignee: String(row.assignee_name || 'Biriktirilmagan'),
        department: String(row.dept_name || '-'),
        category: String(row.cat_name || '-'),
        priority,
        priorityLabel: priorityLabels[priority] || priority,
        status,
        statusLabel: statusLabels[status] || status,
        date: String(row.created_at || ''),
        deadline,
        isOverdue,
      }
    })

    return {
      items,
      total,
      per_page: perPage,
      current_page: page,
      last_page: Math.max(1, Math.ceil(total / perPage)),
      departments: depts.map(d => ({ id: Number(d.id), name: String(d.name) })),
    }
  } finally {
    db.close()
  }
}
