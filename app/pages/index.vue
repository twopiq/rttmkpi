<script setup lang="ts">
const auth = useAuthStore()
const { isDark, toggleTheme, themeButtonLabel } = useTheme()

const form = reactive({
	login: '',
	password: '',
	remember: true,
})

const showPassword = ref(false)
const isLoading = computed(() => auth.status === 'loading')

useHead({
	title: 'Tizimga kirish | KPI tizimi',
	meta: [{ name: 'description', content: 'KPI monitoring tizimiga kirish' }],
})

onMounted(async () => {
	auth.hydrateFromStorage()
	if (!auth.initialized) await auth.fetchCurrentUser()
	if (auth.isAuthenticated) await navigateTo('/dashboard')
})

const submitLogin = async () => {
	try {
		await auth.login(form)
		await navigateTo('/dashboard')
	} catch {
		// xato Pinia state dan ko'rsatiladi
	}
}
</script>

<template>
	<main class="login-shell">

		<!-- ── Left: form panel ── -->
		<section class="form-panel" aria-label="Tizimga kirish">

			<div class="panel-top">
				<div class="brand">
					<img src="/favicon.svg" alt="RTTM KPI" aria-hidden="true" class="brand-logo" />
					RTTM KPI
				</div>

				<button
					type="button"
					class="theme-btn"
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
					{{ isDark ? 'Kun' : 'Tun' }}
				</button>
			</div>

			<div class="form-wrap">
				<p class="eyebrow">Toshkent To'qimachilik va yengil sanoat instituti</p>
				<h1>Tizimga kirish</h1>
				<p class="lead">Shaxsiy kabinetingiz orqali KPI ko'rsatkichlarni kuzating.</p>

				<form class="login-form" @submit.prevent="submitLogin" novalidate>
					<label class="field">
						<span>Login</span>
						<input
							v-model="form.login"
							autocomplete="username"
							name="login"
							placeholder="Login yoki email"
							type="text"
							:disabled="isLoading"
						/>
					</label>

					<label class="field">
						<span>Parol</span>
						<div class="password-wrap">
							<input
								v-model="form.password"
								autocomplete="current-password"
								name="password"
								placeholder="Parol"
								:type="showPassword ? 'text' : 'password'"
								:disabled="isLoading"
							/>
							<button
								type="button"
								class="eye-btn"
								:aria-label="showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'"
								:aria-pressed="showPassword"
								@click="showPassword = !showPassword"
							>
								<svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
									<circle cx="12" cy="12" r="3"/>
								</svg>
								<svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/>
									<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/>
									<line x1="2" y1="2" x2="22" y2="22"/>
								</svg>
							</button>
						</div>
					</label>

					<div class="form-row">
						<label class="remember">
							<input v-model="form.remember" type="checkbox" />
							<span>Eslab qolish</span>
						</label>
					</div>

					<p v-if="auth.error" class="error-msg" role="alert">{{ auth.error }}</p>

					<button class="submit-btn" :disabled="isLoading" type="submit">
						<span v-if="isLoading" class="spinner" aria-hidden="true" />
						{{ isLoading ? 'Tekshirilmoqda...' : 'Kirish' }}
					</button>
				</form>
			</div>

		</section>

		<!-- ── Right: info panel ── -->
		<section class="info-panel" aria-hidden="true">
			<div class="info-content">
				<p class="info-kicker">IT KPI Monitoring</p>
				<h2>RTTM<br>Dashboard</h2>
				<p>Xodimlar samaradorligi, murojaatlar holati va SLA ko'rsatkichlarini real vaqtda kuzating.</p>
				<div class="info-stats">
					<div class="stat">
						<strong>Real vaqt</strong>
						<span>Ma'lumotlar</span>
					</div>
					<div class="stat">
						<strong>SLA</strong>
						<span>Nazorat</span>
					</div>
					<div class="stat">
						<strong>KPI</strong>
						<span>Tahlil</span>
					</div>
				</div>
			</div>
		</section>

	</main>
</template>

<style scoped>
.login-shell {
	display: grid;
	grid-template-columns: minmax(360px, 520px) 1fr;
	min-height: 100vh;
}

/* ── Form panel ──────────────────────────── */
.form-panel {
	display: flex;
	flex-direction: column;
	background: var(--kpi-surface);
	border-right: 1px solid var(--kpi-border);
	padding: 0 clamp(24px, 6vw, 60px);
}

.panel-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 64px;
	flex-shrink: 0;
}

.brand {
	display: flex;
	align-items: center;
	gap: 8px;
	color: var(--kpi-text);
	font-size: 13px;
	font-weight: 900;
	letter-spacing: 0.5px;
	text-transform: uppercase;
}

.brand-logo {
	width: 28px;
	height: 28px;
	border-radius: 6px;
}

.theme-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 32px;
	border: 1px solid var(--kpi-border);
	border-radius: 8px;
	background: var(--kpi-soft);
	color: var(--kpi-muted);
	cursor: pointer;
	font: inherit;
	font-size: 12px;
	font-weight: 800;
	padding: 0 10px;
}

.theme-btn svg { width: 14px; height: 14px; }

.theme-btn:hover {
	border-color: var(--kpi-primary);
	color: var(--kpi-primary);
}

.form-wrap {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 40px 0 60px;
}

.eyebrow {
	margin: 0 0 10px;
	color: var(--kpi-primary);
	font-size: 11px;
	font-weight: 800;
	letter-spacing: 1.5px;
	text-transform: uppercase;
}

h1 {
	margin: 0;
	color: var(--kpi-text);
	font-size: 30px;
	font-weight: 900;
	line-height: 1.15;
}

.lead {
	margin: 10px 0 28px;
	color: var(--kpi-muted);
	font-size: 14px;
	line-height: 1.6;
}

.login-form {
	display: grid;
	gap: 16px;
}

.field {
	display: grid;
	gap: 7px;
	color: var(--kpi-text);
	font-size: 13px;
	font-weight: 700;
}

.field input[type='text'],
.field input[type='password'] {
	width: 100%;
	height: 46px;
	border: 1px solid var(--kpi-border);
	border-radius: 8px;
	background: var(--kpi-bg);
	color: var(--kpi-text);
	font: inherit;
	font-size: 14px;
	outline: none;
	padding: 0 16px;
}

.field input:focus {
	border-color: var(--kpi-primary);
	box-shadow: 0 0 0 3px var(--kpi-focus);
}

.field input::placeholder { color: var(--kpi-muted); opacity: 0.7; }
.field input:disabled { opacity: 0.6; cursor: not-allowed; }

.password-wrap {
	position: relative;
}

.password-wrap input {
	padding-right: 44px;
}

.eye-btn {
	position: absolute;
	right: 0;
	top: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 46px;
	border: 0;
	background: transparent;
	color: var(--kpi-muted);
	cursor: pointer;
	padding: 0;
}

.eye-btn svg { width: 17px; height: 17px; }
.eye-btn:hover { color: var(--kpi-primary); }

.form-row {
	display: flex;
	align-items: center;
	gap: 12px;
	margin: -4px 0 -4px;
}

.remember {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	color: var(--kpi-muted);
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
}

.remember input {
	width: 16px;
	height: 16px;
	accent-color: var(--kpi-primary);
}

.error-msg {
	margin: 0;
	border: 1px solid var(--kpi-danger);
	border-radius: 8px;
	background: var(--kpi-danger-soft);
	color: var(--kpi-danger);
	font-size: 13px;
	line-height: 1.5;
	padding: 10px 14px;
}

.submit-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	width: 100%;
	min-height: 48px;
	border: 0;
	border-radius: 8px;
	background: var(--kpi-primary);
	color: #fff;
	cursor: pointer;
	font: inherit;
	font-size: 14px;
	font-weight: 900;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	margin-top: 4px;
}

.submit-btn:hover:not(:disabled) { background: var(--kpi-primary-hover); }
.submit-btn:disabled { cursor: wait; opacity: 0.7; }

.spinner {
	width: 16px;
	height: 16px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Info panel ──────────────────────────── */
.info-panel {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	background:
		radial-gradient(ellipse at 30% 40%, rgba(79, 142, 247, 0.18) 0%, transparent 60%),
		radial-gradient(ellipse at 70% 70%, rgba(45, 212, 191, 0.12) 0%, transparent 50%),
		var(--kpi-topnav);
	overflow: hidden;
	padding: 40px;
}

.info-panel::before {
	content: '';
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
	background-size: 40px 40px;
}

.info-content {
	position: relative;
	max-width: 420px;
}

.info-kicker {
	margin: 0 0 12px;
	color: var(--kpi-primary);
	font-size: 11px;
	font-weight: 800;
	letter-spacing: 2px;
	text-transform: uppercase;
}

.info-content h2 {
	margin: 0 0 20px;
	color: #fff;
	font-size: 48px;
	font-weight: 900;
	line-height: 1.05;
}

.info-content > p {
	margin: 0 0 32px;
	color: rgba(255, 255, 255, 0.55);
	font-size: 16px;
	line-height: 1.7;
}

.info-stats {
	display: flex;
	gap: 32px;
}

.stat strong {
	display: block;
	color: #fff;
	font-size: 18px;
	font-weight: 900;
}

.stat span {
	display: block;
	margin-top: 3px;
	color: rgba(255, 255, 255, 0.45);
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.5px;
	text-transform: uppercase;
}

/* ── Responsive ──────────────────────────── */
@media (max-width: 860px) {
	.login-shell { grid-template-columns: 1fr; }
	.info-panel { display: none; }
	.form-panel {
		border-right: 0;
		padding: 0 24px;
	}
}

@media (max-width: 480px) {
	.form-panel { padding: 0 16px; }
	h1 { font-size: 26px; }
}
</style>
