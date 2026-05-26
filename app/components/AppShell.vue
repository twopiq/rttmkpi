<script setup lang="ts">
const props = defineProps<{
	title: string
	subtitle: string
	badge?: string
}>()

const auth = useAuthStore()
const route = useRoute()
const { theme, themeLabel, themeButtonLabel, toggleTheme } = useTheme()

const navItems = [
	{ label: 'Dashboard', to: '/dashboard', icon: 'D' },
	{ label: 'Oylik hisobot', to: '/monthly-report', icon: 'O' },
	{ label: 'KPI', to: '/kpi', icon: 'K' },
	{ label: 'Xodimlar', to: '/employees', icon: 'X' },
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
		<aside class="sidebar">
			<div class="brand">
				<img
					src="https://ttysi.uz/assets/public/images/logo_black.svg"
					alt=""
					class="brand-logo"
				/>
				<div>
					<strong
						>Samaradorlik ko'rsatkichlarini belgilab beruvchi KPI tizimi</strong
					>
					<span>Raqamli ta'lim texnologiyalari markazi</span>
				</div>
			</div>

			<p class="section-title">Bo'limlar</p>

			<nav class="nav-list" aria-label="Asosiy bo'limlar">
				<NuxtLink
					v-for="item in navItems"
					:key="item.to"
					:to="item.to"
					:class="{ active: route.path === item.to }"
				>
					<span>{{ item.icon }}</span>
					{{ item.label }}
				</NuxtLink>
			</nav>
		</aside>

		<main class="main-area">
			<header class="topbar">
				<div>
					<h1>{{ props.title }}</h1>
					<p>{{ props.subtitle }}</p>
				</div>

				<div class="top-actions">
					<span v-if="props.badge" class="badge">{{ props.badge }}</span>
					<time>{{ today }}</time>
					<button
						type="button"
						class="theme-toggle"
						:aria-label="themeButtonLabel"
						:aria-pressed="theme === 'dark'"
						@click="toggleTheme"
					>
						<span aria-hidden="true">{{ theme === 'dark' ? 'T' : 'K' }}</span>
						{{ themeLabel }}
					</button>
					<button type="button" class="logout-button" aria-label="Chiqish" @click="logout">
						Chiqish
					</button>
				</div>
			</header>

			<slot />
		</main>
	</div>
</template>

<style scoped>
:global(*) {
	box-sizing: border-box;
}

:global(body) {
	margin: 0;
	background: var(--kpi-bg);
	color: var(--kpi-text);
	font-family:
		Inter,
		ui-sans-serif,
		system-ui,
		-apple-system,
		BlinkMacSystemFont,
		'Segoe UI',
		sans-serif;
}

.app-shell {
	display: grid;
	grid-template-columns: 246px minmax(0, 1fr);
	min-height: 100vh;
}

.sidebar {
	position: sticky;
	top: 0;
	height: 100vh;
	background: var(--kpi-sidebar);
	color: #cbd5e1;
	padding: 14px 18px;
}

.brand {
	display: grid;
	grid-template-columns: 42px minmax(0, 1fr);
	align-items: center;
	gap: 10px;
	min-height: 56px;
}

.brand-logo {
	width: 38px;
	height: 38px;
	border: 2px solid var(--kpi-blue-5);
	border-radius: 50%;
	background: var(--kpi-surface);
	object-fit: contain;
}

.brand strong {
	display: block;
	color: #ffffff;
	font-size: 14px;
	line-height: 1.18;
}

.brand span {
	display: block;
	margin-top: 3px;
	color: #cbd5e1;
	font-size: 11px;
	line-height: 1.25;
}

.section-title {
	margin: 26px 0 12px;
	color: #cbd5e1;
	font-size: 11px;
	font-weight: 900;
	letter-spacing: 2px;
	text-transform: uppercase;
}

.nav-list {
	display: grid;
	gap: 8px;
}

.nav-list a {
	display: flex;
	align-items: center;
	gap: 10px;
	min-height: 42px;
	border-radius: 8px;
	color: #dbe7f6;
	font-size: 14px;
	font-weight: 800;
	padding: 0 14px;
	text-decoration: none;
}

.nav-list a:hover,
.nav-list a.active {
	background: var(--kpi-primary);
	color: var(--kpi-inverse);
}

.nav-list span {
	display: inline-grid;
	place-items: center;
	width: 20px;
	height: 20px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.12);
	color: #e2e8f0;
	font-size: 11px;
	text-align: center;
}

.main-area {
	min-width: 0;
	padding: 30px 26px 46px;
}

.topbar {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 22px;
}

h1,
p {
	margin: 0;
}

h1 {
	color: var(--kpi-text);
	font-size: 30px;
	line-height: 1.15;
}

.topbar p {
	margin-top: 6px;
	color: var(--kpi-muted);
	font-size: 14px;
}

.top-actions {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	color: var(--kpi-text);
	font-size: 13px;
	font-weight: 800;
}

.badge {
	min-height: 34px;
	border: 1px solid var(--kpi-border);
	border-radius: 8px;
	background: var(--kpi-surface);
	color: var(--kpi-text);
	padding: 9px 12px;
}

.theme-toggle,
.logout-button {
	height: 34px;
	border: 1px solid var(--kpi-border);
	border-radius: 8px;
	background: var(--kpi-surface);
	color: var(--kpi-text);
	cursor: pointer;
	font-size: 13px;
	font-weight: 900;
	padding: 0 12px;
}

.theme-toggle {
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.theme-toggle span {
	display: inline-grid;
	place-items: center;
	width: 20px;
	height: 20px;
	border-radius: 6px;
	background: var(--kpi-soft);
	color: var(--kpi-primary);
	font-size: 11px;
}

.theme-toggle:hover,
.logout-button:hover {
	border-color: var(--kpi-primary);
	background: var(--kpi-soft);
}

.logout-button {
	border-color: transparent;
	background: var(--kpi-primary);
	color: var(--kpi-inverse);
}

.logout-button:hover {
	background: var(--kpi-primary-hover);
	color: var(--kpi-inverse);
}

@media (max-width: 900px) {
	.app-shell {
		grid-template-columns: 1fr;
	}

	.sidebar {
		position: static;
		height: auto;
	}

	.brand {
		max-width: 560px;
	}

	.nav-list {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 560px) {
	.main-area {
		padding: 22px 14px 34px;
	}

	.topbar,
	.top-actions {
		align-items: flex-start;
		flex-direction: column;
	}

	.nav-list {
		grid-template-columns: 1fr;
	}
}
</style>
