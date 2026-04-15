import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

type AnyRow = Record<string, string | number | null>

export type MetricCard = {
	key: string
	label: string
	value: string | number
	tone: 'primary' | 'secondary' | 'accent' | 'deep' | 'soft'
}

export type ChartPoint = {
	label: string
	value: number
}

export type TicketJournalItem = {
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
}

export type EmployeeKpiItem = {
	id: number
	name: string
	online: boolean
	completed: number
	failed: number
	rating: number
	share: number
}

export type EmployeeStatusItem = {
	id: number
	name: string
	employeeCode: string
	online: boolean
	activeWorks: number
}

export type KpiDashboardData = {
	updatedAt: string
	month: string
	overview: {
		total: number
		waiting: number
		inProgress: number
		completed: number
		complaints: number
		urgent: number
	}
	cards: MetricCard[]
	statusDistribution: ChartPoint[]
	monthlyCards: MetricCard[]
	employeeResults: ChartPoint[]
	monthlyIndicators: ChartPoint[]
	ticketJournal: TicketJournalItem[]
	employeeKpi: EmployeeKpiItem[]
	employees: EmployeeStatusItem[]
	employeeStatusChart: ChartPoint[]
}

const statusLabels: Record<string, string> = {
	new: 'Kutilmoqda',
	assigned: 'Jarayonda',
	in_progress: 'Jarayonda',
	returned: 'Qaytarilgan',
	completed: 'Bajarildi',
	closed: 'Bajarildi',
	rejected: 'Rad etildi',
}

const monthLabel = () => {
	const now = new Date()

	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const resolveSqlitePath = () => {
	const config = useRuntimeConfig()
	const configuredPath = String(config.surveySqlitePath || '').trim()

	if (!configuredPath) {
		return null
	}

	return resolve(process.cwd(), configuredPath)
}

const scalar = (
	db: DatabaseSync,
	sql: string,
	...params: Array<string | number>
) => {
	const row = db.prepare(sql).get(...params) as AnyRow | undefined

	return Number(row?.value ?? row?.total ?? row?.count ?? 0)
}

const byStatus = (db: DatabaseSync, statuses: string[]) => {
	const placeholders = statuses.map(() => '?').join(',')

	return scalar(
		db,
		`select count(*) as value from tickets where status in (${placeholders})`,
		...statuses,
	)
}

const averageRating = (completed: number, onTime: number) => {
	if (completed === 0) {
		return 0
	}

	return Number(((onTime / completed) * 5).toFixed(1))
}

const sharePercent = (value: number, total: number) => {
	if (total === 0) {
		return 0
	}

	return Number(((value / total) * 100).toFixed(1))
}

const mapStatus = (status: string) => statusLabels[status] || status

const fallbackEmployeeCode = (id: number) =>
	`ID: ${String(id * 917263).slice(0, 7)}`

const cleanText = (value: string | number | null | undefined) =>
	String(value || '')
		.replaceAll('â', "'")
		.replaceAll('â', "'")
		.replaceAll('â', '-')
		.replaceAll('â', '-')
		.replaceAll('вЂ', "'")
		.replaceAll('вЂ™', "'")

export const fetchKpiDashboardData = (): KpiDashboardData | null => {
	const sqlitePath = resolveSqlitePath()

	if (!sqlitePath || !existsSync(sqlitePath)) {
		return null
	}

	const db = new DatabaseSync(sqlitePath, {
		readOnly: true,
	})

	try {
		const total = scalar(db, 'select count(*) as value from tickets')
		const waiting = byStatus(db, ['new', 'assigned'])
		const inProgress = byStatus(db, ['in_progress', 'returned'])
		const completed = scalar(
			db,
			"select count(*) as value from tickets where status in ('completed', 'closed') or completed_at is not null",
		)
		const onTime = scalar(
			db,
			'select count(*) as value from tickets where completed_at is not null and (deadline_at is null or datetime(completed_at) <= datetime(deadline_at))',
		)
		const complaints = scalar(
			db,
			"select count(distinct ticket_id) as value from ticket_status_histories where to_status in ('returned', 'rejected')",
		)
		const urgent = scalar(
			db,
			"select count(*) as value from tickets where priority = 'urgent'",
		)
		const failed = scalar(
			db,
			"select count(*) as value from tickets where deadline_at is not null and datetime(deadline_at) < datetime('now') and status not in ('completed', 'closed', 'rejected')",
		)
		const rating = averageRating(completed, onTime)

		const statusRows = db
			.prepare(
				`
      select status as label, count(*) as value
      from tickets
      group by status
      order by value desc
    `,
			)
			.all() as AnyRow[]

		const employeeRows = db
			.prepare(
				`
      select
        users.id,
        users.name,
        users.availability_status,
        count(tickets.id) as total,
        sum(case when tickets.status in ('completed', 'closed') or tickets.completed_at is not null then 1 else 0 end) as completed,
        sum(case when tickets.deadline_at is not null and datetime(tickets.deadline_at) < datetime('now') and tickets.status not in ('completed', 'closed', 'rejected') then 1 else 0 end) as failed,
        sum(case when tickets.completed_at is not null and (tickets.deadline_at is null or datetime(tickets.completed_at) <= datetime(tickets.deadline_at)) then 1 else 0 end) as on_time,
        sum(case when tickets.status in ('new', 'assigned', 'in_progress', 'returned') then 1 else 0 end) as active_works
      from users
      inner join model_has_roles on model_has_roles.model_id = users.id
      inner join roles on roles.id = model_has_roles.role_id
      left join tickets on tickets.assigned_executor_id = users.id
      where roles.name in ('executor', 'operator', 'manager', 'admin')
      group by users.id, users.name, users.availability_status
      order by completed desc, total desc, users.name asc
    `,
			)
			.all() as AnyRow[]

		const ticketRows = db
			.prepare(
				`
      select
        tickets.id,
        tickets.reference,
        tickets.requester_name,
        tickets.requester_phone,
        tickets.requester_department,
        tickets.title,
        tickets.description,
        tickets.status,
        tickets.created_at,
        users.name as assignee
      from tickets
      left join users on users.id = tickets.assigned_executor_id
      order by tickets.created_at desc, tickets.id desc
      limit 10
    `,
			)
			.all() as AnyRow[]

		const employeeKpi = employeeRows.map((row, index) => {
			const completedCount = Number(row.completed || 0)
			const onTimeCount = Number(row.on_time || 0)

			return {
				id: Number(row.id || index + 1),
				name: String(row.name || 'Xodim'),
				online: String(row.availability_status || 'active') === 'active',
				completed: completedCount,
				failed: Number(row.failed || 0),
				rating: averageRating(completedCount, onTimeCount),
				share: sharePercent(completedCount, completed),
			}
		})

		const employees = employeeRows.map((row, index) => ({
			id: Number(row.id || index + 1),
			name: String(row.name || 'Xodim'),
			employeeCode: fallbackEmployeeCode(Number(row.id || index + 1)),
			online: String(row.availability_status || 'active') === 'active',
			activeWorks: Number(row.active_works || 0),
		}))

		const monthlyIndicators = [
			{ label: 'Yakunlangan', value: completed },
			{ label: 'Qaytarilgan', value: complaints },
			{ label: 'Reyting x10', value: Math.round(rating * 10) },
		]

		return {
			updatedAt: new Date().toISOString(),
			month: monthLabel(),
			overview: {
				total,
				waiting,
				inProgress,
				completed,
				complaints,
				urgent,
			},
			cards: [
				{
					key: 'total',
					label: 'Barcha murojaatlar',
					value: total,
					tone: 'primary',
				},
				{ key: 'waiting', label: 'Kutilmoqda', value: waiting, tone: 'soft' },
				{
					key: 'in_progress',
					label: 'Jarayonda',
					value: inProgress,
					tone: 'secondary',
				},
				{
					key: 'completed',
					label: 'Bajarildi',
					value: completed,
					tone: 'accent',
				},
				{
					key: 'complaints',
					label: 'Qaytarilgan',
					value: complaints,
					tone: 'deep',
				},
			],
			statusDistribution: statusRows.map(row => ({
				label: mapStatus(String(row.label || 'unknown')),
				value: Number(row.value || 0),
			})),
			monthlyCards: [
				{
					key: 'completed',
					label: 'Yakunlangan ishlar',
					value: completed,
					tone: 'accent',
				},
				{
					key: 'rating',
					label: "O'rtacha reyting",
					value: rating.toFixed(1),
					tone: 'primary',
				},
				{
					key: 'complaints',
					label: 'Shikoyatlar',
					value: complaints,
					tone: 'deep',
				},
			],
			employeeResults: employeeKpi
				.map(employee => ({ label: employee.name, value: employee.completed }))
				.sort((a, b) => b.value - a.value)
				.slice(0, 10),
			monthlyIndicators,
			ticketJournal: ticketRows.map(row => ({
				id: String(row.reference || `#${row.id}`),
				customer: cleanText(row.requester_name || "Noma'lum mijoz"),
				phone: cleanText(row.requester_phone || '-'),
				location: cleanText(row.requester_department || '-'),
				title: cleanText(row.title || 'Murojaat'),
				description: cleanText(row.description || ''),
				assignee: cleanText(row.assignee || 'Biriktirilmagan'),
				status: String(row.status || ''),
				statusLabel: mapStatus(String(row.status || '')),
				date: String(row.created_at || ''),
			})),
			employeeKpi,
			employees,
			employeeStatusChart: employees.map(employee => ({
				label: employee.name,
				value: employee.activeWorks,
			})),
		}
	} finally {
		db.close()
	}
}
