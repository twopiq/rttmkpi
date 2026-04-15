<script setup lang="ts">
const props = defineProps<{
	title: string
	subtitle: string
	badge?: string
}>()

const auth = useAuthStore()
const route = useRoute()

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
					<button type="button" aria-label="Chiqish" @click="logout">↪</button>
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
	background: var(--kpi-blue-2);
	color: var(--kpi-blue-5);
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
	color: var(--kpi-surface);
	font-size: 14px;
	line-height: 1.18;
}

.brand span {
	display: block;
	margin-top: 3px;
	color: var(--kpi-blue-5);
	font-size: 11px;
	line-height: 1.25;
}

.section-title {
	margin: 26px 0 12px;
	color: var(--kpi-blue-5);
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
	color: var(--kpi-blue-5);
	font-size: 14px;
	font-weight: 800;
	padding: 0 14px;
	text-decoration: none;
}

.nav-list a:hover,
.nav-list a.active {
	background: var(--kpi-blue-3);
	color: var(--kpi-surface);
}

.nav-list span {
	display: inline-grid;
	place-items: center;
	width: 20px;
	height: 20px;
	border-radius: 6px;
	background: rgba(187, 208, 243, 0.18);
	color: var(--kpi-blue-5);
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
	color: var(--kpi-blue-2);
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
	gap: 12px;
	color: var(--kpi-blue-2);
	font-size: 13px;
	font-weight: 800;
}

.badge {
	min-height: 34px;
	border: 1px solid var(--kpi-border);
	border-radius: 8px;
	background: var(--kpi-surface);
	color: var(--kpi-blue-3);
	padding: 9px 12px;
}

.top-actions button {
	width: 34px;
	height: 34px;
	border: 0;
	border-radius: 8px;
	background: var(--kpi-blue-5);
	color: var(--kpi-blue-2);
	cursor: pointer;
	font-size: 18px;
	font-weight: 900;
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
