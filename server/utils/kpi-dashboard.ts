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
	total: number
	completed: number
	failed: number
	onTime: number
	returned: number
	rejected: number
	rating: number
	share: number
	slaPercent: number
	kpiScore: number
	grade: string
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
	kpiSummary: {
		score: number
		grade: string
		slaPercent: number
		onTime: number
		lateCompleted: number
		avgResolutionHours: number | null
	}
	kpiFormula: Array<{ key: string, label: string, value: number, max: number }>
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
	scoreChart: ChartPoint[]
	completionTrend: ChartPoint[]
	departmentItems: Array<{ label: string, value: number, completed: number }>
	categoryItems: Array<{ label: string, value: number, completed: number }>
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

const percent = (value: number, total: number) => {
	if (total === 0) {
		return 0
	}

	return Number(((value / total) * 100).toFixed(1))
}

const sharePercent = (value: number, total: number) => {
	if (total === 0) {
		return 0
	}

	return Number(((value / total) * 100).toFixed(1))
}

const grade = (score: number) => {
	if (score >= 90) return 'Juda yaxshi'
	if (score >= 75) return 'Yaxshi'
	if (score >= 60) return 'Qoniqarli'

	return "E'tibor kerak"
}

const scoreParts = (total: number, completed: number, onTime: number, failed: number, complaints: number) => {
	const completedScore = total > 0 ? Math.min(40, (completed / total) * 40) : 0
	const slaScore = completed > 0 ? (onTime / completed) * 30 : 0
	const lateScore = total > 0 ? Math.max(0, (1 - (failed / total)) * 15) : 0
	const qualityScore = total > 0 ? Math.max(0, (1 - (complaints / total)) * 10) : 0
	const activityScore = total > 0 ? Math.min(5, (completed / total) * 5) : 0

	return {
		completed: Number(completedScore.toFixed(1)),
		sla: Number(slaScore.toFixed(1)),
		late: Number(lateScore.toFixed(1)),
		quality: Number(qualityScore.toFixed(1)),
		activity: Number(activityScore.toFixed(1)),
	}
}

const kpiScore = (parts: ReturnType<typeof scoreParts>) =>
	Number(Object.values(parts).reduce((sum, value) => sum + value, 0).toFixed(1))

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

const executorUserWhere = `
      exists (
        select 1
        from model_has_roles executor_role_links
        inner join roles executor_roles on executor_roles.id = executor_role_links.role_id
        where executor_role_links.model_id = users.id
          and executor_roles.name = 'executor'
      )
`

const executorTicketWhere = `
      exists (
        select 1
        from users executor_users
        inner join model_has_roles executor_role_links on executor_role_links.model_id = executor_users.id
        inner join roles executor_roles on executor_roles.id = executor_role_links.role_id
        where executor_users.id = tickets.assigned_executor_id
          and executor_roles.name = 'executor'
      )
`

export const fetchKpiDashboardData = (): KpiDashboardData | null => {
	const sqlitePath = resolveSqlitePath()

	if (!sqlitePath || !existsSync(sqlitePath)) {
		return null
	}

	const db = new DatabaseSync(sqlitePath, {
		readOnly: true,
	})

	try {
		const total = scalar(db, `select count(*) as value from tickets where ${executorTicketWhere}`)
		const waiting = scalar(
			db,
			`select count(*) as value from tickets where ${executorTicketWhere} and status in ('new', 'assigned')`,
		)
		const inProgress = scalar(
			db,
			`select count(*) as value from tickets where ${executorTicketWhere} and status in ('in_progress', 'returned')`,
		)
		const completed = scalar(
			db,
			`select count(*) as value from tickets where ${executorTicketWhere} and (status in ('completed', 'closed') or completed_at is not null)`,
		)
		const onTime = scalar(
			db,
			`select count(*) as value from tickets where ${executorTicketWhere} and completed_at is not null and (deadline_at is null or datetime(completed_at) <= datetime(deadline_at))`,
		)
		const complaints = scalar(
			db,
			`select count(distinct ticket_status_histories.ticket_id) as value
			from ticket_status_histories
			inner join tickets on tickets.id = ticket_status_histories.ticket_id
			where ${executorTicketWhere}
				and ticket_status_histories.to_status in ('returned', 'rejected')`,
		)
		const urgent = scalar(
			db,
			`select count(*) as value from tickets where ${executorTicketWhere} and priority = 'urgent'`,
		)
		const failed = scalar(
			db,
			`select count(*) as value from tickets where ${executorTicketWhere} and deadline_at is not null and datetime(deadline_at) < datetime('now') and status not in ('completed', 'closed', 'rejected')`,
		)
		const rating = averageRating(completed, onTime)
		const lateCompleted = Math.max(0, completed - onTime)
		const globalParts = scoreParts(total, completed, onTime, failed, complaints)
		const globalScore = kpiScore(globalParts)

		const statusRows = db
			.prepare(
				`
      select status as label, count(*) as value
      from tickets
      where ${executorTicketWhere}
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
        sum(case when tickets.status = 'returned' then 1 else 0 end) as returned,
        sum(case when tickets.status = 'rejected' then 1 else 0 end) as rejected,
        sum(case when tickets.status in ('new', 'assigned', 'in_progress', 'returned') then 1 else 0 end) as active_works
      from users
      left join tickets on tickets.assigned_executor_id = users.id
      where ${executorUserWhere}
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
      where ${executorTicketWhere}
      order by tickets.created_at desc, tickets.id desc
      limit 10
    `,
			)
			.all() as AnyRow[]

		const monthlyRows = db
			.prepare(
				`
      select strftime('%d.%m', completed_at) as label, count(*) as value
      from tickets
      where ${executorTicketWhere} and completed_at is not null
      group by strftime('%Y-%m-%d', completed_at)
      order by strftime('%Y-%m-%d', completed_at) asc
      limit 31
    `,
			)
			.all() as AnyRow[]

		const departmentRows = db
			.prepare(
				`
      select coalesce(departments.name, 'Belgilanmagan') as label, count(tickets.id) as total,
        sum(case when tickets.status in ('completed', 'closed') or tickets.completed_at is not null then 1 else 0 end) as completed
      from tickets
      left join departments on departments.id = tickets.assigned_department_id
      where ${executorTicketWhere}
      group by departments.id, departments.name
      order by total desc
      limit 8
    `,
			)
			.all() as AnyRow[]

		const categoryRows = db
			.prepare(
				`
      select coalesce(categories.name, 'Belgilanmagan') as label, count(tickets.id) as total,
        sum(case when tickets.status in ('completed', 'closed') or tickets.completed_at is not null then 1 else 0 end) as completed
      from tickets
      left join categories on categories.id = tickets.category_id
      where ${executorTicketWhere}
      group by categories.id, categories.name
      order by total desc
      limit 8
    `,
			)
			.all() as AnyRow[]

		const employeeKpi = employeeRows.map((row, index) => {
			const totalCount = Number(row.total || 0)
			const completedCount = Number(row.completed || 0)
			const onTimeCount = Number(row.on_time || 0)
			const failedCount = Number(row.failed || 0)
			const returnedCount = Number(row.returned || 0)
			const rejectedCount = Number(row.rejected || 0)
			const parts = scoreParts(totalCount, completedCount, onTimeCount, failedCount, returnedCount + rejectedCount)
			const score = kpiScore(parts)

			return {
				id: Number(row.id || index + 1),
				name: String(row.name || 'Xodim'),
				online: String(row.availability_status || 'active') === 'active',
				total: totalCount,
				completed: completedCount,
				failed: failedCount,
				onTime: onTimeCount,
				returned: returnedCount,
				rejected: rejectedCount,
				rating: averageRating(completedCount, onTimeCount),
				share: sharePercent(completedCount, completed),
				slaPercent: percent(onTimeCount, completedCount),
				kpiScore: score,
				grade: grade(score),
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
			kpiSummary: {
				score: globalScore,
				grade: grade(globalScore),
				slaPercent: percent(onTime, completed),
				onTime,
				lateCompleted,
				avgResolutionHours: null,
			},
			kpiFormula: [
				{ key: 'completed', label: 'Bajarilgan ishlar', value: globalParts.completed, max: 40 },
				{ key: 'sla', label: 'SLA muddatida', value: globalParts.sla, max: 30 },
				{ key: 'late', label: 'Kechikish kamligi', value: globalParts.late, max: 15 },
				{ key: 'quality', label: 'Qaytarish/rad kamligi', value: globalParts.quality, max: 10 },
				{ key: 'activity', label: 'Faollik', value: globalParts.activity, max: 5 },
			],
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
					key: 'score',
					label: 'KPI ball',
					value: globalScore,
					tone: 'accent',
				},
				{
					key: 'sla',
					label: 'SLA',
					value: `${percent(onTime, completed)}%`,
					tone: 'primary',
				},
				{
					key: 'complaints',
					label: 'Qaytarish/rad',
					value: complaints,
					tone: 'deep',
				},
			],
			employeeResults: employeeKpi
				.map(employee => ({ label: employee.name, value: employee.completed }))
				.sort((a, b) => b.value - a.value)
				.slice(0, 10),
			monthlyIndicators,
			scoreChart: employeeKpi
				.map(employee => ({ label: employee.name, value: Math.round(employee.kpiScore) }))
				.sort((a, b) => b.value - a.value)
				.slice(0, 10),
			departmentItems: departmentRows.map(row => ({
				label: cleanText(row.label || 'Belgilanmagan'),
				value: Number(row.total || 0),
				completed: Number(row.completed || 0),
			})),
			categoryItems: categoryRows.map(row => ({
				label: cleanText(row.label || 'Belgilanmagan'),
				value: Number(row.total || 0),
				completed: Number(row.completed || 0),
			})),
			completionTrend: monthlyRows.map(row => ({
				label: String(row.label || '-'),
				value: Number(row.value || 0),
			})),
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
