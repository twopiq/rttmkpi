<script setup lang="ts">
const props = defineProps<{
	title: string
	subtitle?: string
	badge?: string
}>()

const auth = useAuthStore()
const route = useRoute()
const { isDark, toggleTheme, themeButtonLabel } = useTheme()

const navItems = [
	{ label: 'Dashboard',     to: '/dashboard' },
	{ label: 'Murojaatlar',  to: '/murojaatlar' },
	{ label: 'Xodimlar',     to: '/employees' },
	{ label: 'Tahlil',       to: '/tahlil' },
	{ label: 'Hisobot',      to: '/monthly-report' },
]

const today = computed(() =>
	new Date().toLocaleString('uz-UZ', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}),
)

const logout = async () => {
	await auth.logout()
	await navigateTo('/')
}
</script>

<template>
	<div class="app-shell">

		<header class="topnav">
			<div class="topnav-start">
				<div class="brand">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
					</svg>
					<span>RTTM KPI</span>
				</div>

				<nav class="nav-list" aria-label="Asosiy bo'limlar">
					<NuxtLink
						v-for="item in navItems"
						:key="item.to"
						:to="item.to"
						:class="{ active: route.path === item.to }"
					>{{ item.label }}</NuxtLink>
				</nav>
			</div>

			<div class="topnav-end">
				<time class="clock">{{ today }}</time>

				<button
					class="icon-btn"
					type="button"
					:aria-label="themeButtonLabel"
					@click="toggleTheme"
				>
					<svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="12" cy="12" r="5"/>
						<line x1="12" y1="1" x2="12" y2="3"/>
						<line x1="12" y1="21" x2="12" y2="23"/>
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
						<line x1="1" y1="12" x2="3" y2="12"/>
						<line x1="21" y1="12" x2="23" y2="12"/>
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
					</svg>
					<svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
					</svg>
				</button>

				<div class="user-info">
					<span class="user-dot" />
					<span class="user-name">{{ auth.displayName }}</span>
				</div>

				<button class="logout-btn" type="button" @click="logout">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
						<polyline points="16 17 21 12 16 7"/>
						<line x1="21" y1="12" x2="9" y2="12"/>
					</svg>
					Chiqish
				</button>
			</div>
		</header>

		<div class="page-head">
			<div class="page-head-inner">
				<div>
					<h1>{{ props.title }}</h1>
					<p v-if="props.subtitle">{{ props.subtitle }}</p>
				</div>
				<span v-if="props.badge" class="page-badge">{{ props.badge }}</span>
			</div>
		</div>

		<main class="content">
			<slot />
		</main>

	</div>
</template>

<style scoped>
.app-shell {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

/* ── Top Nav ─────────────────────── */
.topnav {
	position: sticky;
	top: 0;
	z-index: 200;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	height: 56px;
	background: var(--kpi-topnav);
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	padding: 0 20px;
}

.topnav-start,
.topnav-end {
	display: flex;
	align-items: center;
}

.topnav-start { gap: 0; }
.topnav-end   { gap: 8px; flex-shrink: 0; }

.brand {
	display: flex;
	align-items: center;
	gap: 9px;
	margin-right: 20px;
	color: #fff;
	font-size: 13px;
	font-weight: 900;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	white-space: nowrap;
}

.brand svg {
	width: 20px;
	height: 20px;
	stroke: var(--kpi-primary);
	flex-shrink: 0;
}

.nav-list { display: flex; }

.nav-list a {
	display: flex;
	align-items: center;
	height: 56px;
	padding: 0 14px;
	border-bottom: 2px solid transparent;
	color: rgba(255, 255, 255, 0.5);
	font-size: 13px;
	font-weight: 700;
	text-decoration: none;
	white-space: nowrap;
}

.nav-list a:hover {
	color: rgba(255, 255, 255, 0.85);
	border-bottom-color: rgba(255, 255, 255, 0.25);
}

.nav-list a.active {
	color: #fff;
	border-bottom-color: var(--kpi-primary);
}

.clock {
	color: rgba(255, 255, 255, 0.35);
	font-size: 12px;
	font-weight: 600;
	padding: 0 4px;
	white-space: nowrap;
}

.icon-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 34px;
	height: 34px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.06);
	color: rgba(255, 255, 255, 0.65);
	cursor: pointer;
	padding: 0;
}

.icon-btn svg { width: 15px; height: 15px; }

.icon-btn:hover {
	background: rgba(255, 255, 255, 0.12);
	color: #fff;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 7px;
	height: 34px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);
	padding: 0 10px;
}

.user-dot {
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: var(--kpi-success);
	flex-shrink: 0;
}

.user-name {
	color: rgba(255, 255, 255, 0.78);
	font-size: 12px;
	font-weight: 700;
	max-width: 150px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.logout-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 34px;
	border: 1px solid rgba(248, 113, 113, 0.3);
	border-radius: 8px;
	background: rgba(248, 113, 113, 0.08);
	color: #f87171;
	cursor: pointer;
	font: inherit;
	font-size: 12px;
	font-weight: 800;
	padding: 0 12px;
	white-space: nowrap;
}

.logout-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

.logout-btn:hover {
	background: rgba(248, 113, 113, 0.18);
	border-color: rgba(248, 113, 113, 0.5);
}

/* ── Page header ─────────────────── */
.page-head {
	background: var(--kpi-surface);
	border-bottom: 1px solid var(--kpi-border);
}

.page-head-inner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	max-width: 1600px;
	margin: 0 auto;
	padding: 16px 24px;
}

.page-head-inner h1 {
	margin: 0;
	color: var(--kpi-text);
	font-size: 20px;
	font-weight: 800;
	line-height: 1.2;
}

.page-head-inner p {
	margin: 4px 0 0;
	color: var(--kpi-muted);
	font-size: 13px;
}

.page-badge {
	flex-shrink: 0;
	display: inline-flex;
	align-items: center;
	height: 28px;
	border: 1px solid var(--kpi-border);
	border-radius: 8px;
	background: var(--kpi-soft);
	color: var(--kpi-primary);
	font-size: 12px;
	font-weight: 800;
	padding: 0 11px;
	white-space: nowrap;
}

/* ── Content ─────────────────────── */
.content {
	flex: 1;
	max-width: 1600px;
	width: 100%;
	margin: 0 auto;
	padding: 22px 24px 48px;
}

/* ── Responsive ──────────────────── */
@media (max-width: 960px) {
	.clock { display: none; }
	.nav-list a { padding: 0 10px; font-size: 12px; }
}

@media (max-width: 720px) {
	.brand span { display: none; }
	.user-name { display: none; }
}

@media (max-width: 560px) {
	.topnav { padding: 0 12px; }
	.content { padding: 14px 12px 36px; }
	.page-head-inner { padding: 12px; }
}
</style>
