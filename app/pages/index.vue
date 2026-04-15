<script setup lang="ts">
const auth = useAuthStore()

const form = reactive({
	login: '',
	password: '',
	remember: true,
})

const isLoading = computed(() => auth.status === 'loading')

useHead({
	title: 'Tizimga kirish | KPI tizimi',
	meta: [
		{
			name: 'description',
			content: 'KPI monitoring tizimiga kirish',
		},
	],
})

onMounted(async () => {
	auth.hydrateFromStorage()

	if (!auth.initialized) {
		await auth.fetchCurrentUser()
	}

	if (auth.isAuthenticated) {
		await navigateTo('/dashboard')
	}
})

const submitLogin = async () => {
	try {
		await auth.login(form)
		await navigateTo('/dashboard')
	} catch {
		// Error text is rendered from Pinia state.
	}
}
</script>

<template>
	<main class="login-shell">
		<section class="login-panel" aria-label="Tizimga kirish">
			<div class="brand-mark">
				<img
					src="https://ttysi.uz/assets/public/images/logo_black.svg"
					alt=""
					class="brand-logo"
				/>
				<span>KPI</span>
			</div>

			<div class="form-wrap">
				<p class="eyebrow">Toshkent To'qimachilik va yengil sanoat instituti</p>
				<h1>Tizimga kirish</h1>
				<p class="lead">
					Shaxsiy kabinetingiz orqali ko'rsatkichlarni kuzating.
				</p>
				<form class="login-form" @submit.prevent="submitLogin">
					<label>
						<span>Login</span>
						<input
							v-model="form.login"
							autocomplete="username"
							name="login"
							placeholder="Login"
							type="text"
						/>
					</label>

					<label>
						<span>Parol</span>
						<input
							v-model="form.password"
							autocomplete="current-password"
							name="password"
							placeholder="Parol"
							type="password"
						/>
					</label>

					<div class="form-row">
						<label class="remember">
							<input v-model="form.remember" type="checkbox" />
							<span>Eslab qolish</span>
						</label>

						<NuxtLink to="/" class="link">Parolni unutdingizmi?</NuxtLink>
					</div>

					<p v-if="auth.error" class="error-message" role="alert">
						{{ auth.error }}
					</p>

					<button class="submit-button" :disabled="isLoading" type="submit">
						{{ isLoading ? 'Tekshirilmoqda...' : 'Kirish' }}
					</button>
				</form>

				<p class="signup-text">
					Hisobingiz yo'qmi?
					<NuxtLink to="/" class="link">Ro'yxatdan o'tish</NuxtLink>
				</p>
			</div>
		</section>

		<section class="info-panel" aria-label="KPI tizimi haqida">
			<div class="info-content">
				<p class="info-kicker">Monitoring</p>
				<h2>KPI tizimi</h2>
				<p>
					Bugungi kunda oliy ta'lim muassasalarida samaradorlikni oshirish,
					o'qituvchilar faoliyatini nazorat qilish va tahlil qilish uchun
					zamonaviy axborot tizimlariga ehtiyoj ortib bormoqda.
				</p>
				<p>
					Toshkent To'qimachilik va yengil sanoat institutida ichki xizmatlar,
					murojaatlar va bajarilgan ishlar natijasini muntazam baholash
					imkoniyati yaratiladi.
				</p>
			</div>
		</section>
	</main>
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

.login-shell {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(360px, 1fr);
	min-height: 100vh;
	overflow: hidden;
}

.login-panel,
.info-panel {
	position: relative;
	display: flex;
	min-height: 100vh;
	padding: 46px clamp(24px, 6vw, 88px);
}

.login-panel {
	align-items: center;
	background:
		linear-gradient(125deg, rgba(187, 208, 243, 0.5), transparent 34%),
		var(--kpi-surface);
}

.brand-mark {
	position: absolute;
	top: 34px;
	left: clamp(24px, 6vw, 88px);
	display: inline-flex;
	align-items: center;
	gap: 10px;
	color: var(--kpi-blue-2);
	font-size: 14px;
	font-weight: 800;
	letter-spacing: 0;
	text-transform: uppercase;
}

.brand-logo {
	width: 28px;
	height: 28px;
	object-fit: contain;
}

.form-wrap {
	position: relative;
	z-index: 1;
	width: min(100%, 430px);
	margin: 0 auto;
	text-align: center;
}

.eyebrow,
.info-kicker {
	margin: 0 0 10px;
	color: var(--kpi-muted);
	font-size: 13px;
	font-weight: 700;
	letter-spacing: 0;
	text-transform: uppercase;
}

h1,
h2 {
	margin: 0;
	color: var(--kpi-blue-2);
	font-size: 34px;
	line-height: 1.15;
}

.lead {
	margin: 10px auto 24px;
	color: var(--kpi-muted);
	font-size: 15px;
	line-height: 1.6;
}

.quick-actions {
	display: grid;
	grid-template-columns: repeat(5, 44px);
	justify-content: center;
	gap: 14px;
	margin-bottom: 26px;
}

.quick-actions button {
	width: 44px;
	height: 44px;
	border: 1px solid var(--kpi-border);
	border-radius: 8px;
	background: var(--kpi-surface);
	color: var(--kpi-blue-2);
	cursor: pointer;
	font-weight: 800;
	letter-spacing: 0;
	text-transform: uppercase;
	transition:
		border-color 160ms ease,
		transform 160ms ease;
}

.quick-actions button:hover {
	border-color: var(--kpi-blue-3);
	transform: translateY(-1px);
}

.login-form {
	display: grid;
	gap: 14px;
	text-align: left;
}

.login-form label {
	display: grid;
	gap: 7px;
	color: var(--kpi-blue-3);
	font-size: 13px;
	font-weight: 700;
}

.login-form input[type='text'],
.login-form input[type='password'] {
	width: 100%;
	height: 48px;
	border: 1px solid var(--kpi-border);
	border-radius: 8px;
	background: var(--kpi-bg);
	color: var(--kpi-blue-2);
	font: inherit;
	outline: none;
	padding: 0 16px;
	transition:
		border-color 160ms ease,
		box-shadow 160ms ease,
		background 160ms ease;
}

.login-form input:focus {
	border-color: var(--kpi-blue-3);
	background: var(--kpi-surface);
	box-shadow: 0 0 0 4px rgba(25, 73, 162, 0.14);
}

.form-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin: 2px 0 4px;
}

.remember {
	display: inline-flex !important;
	grid-template-columns: auto auto;
	align-items: center;
	gap: 8px !important;
	white-space: nowrap;
}

.remember input {
	width: 16px;
	height: 16px;
	accent-color: var(--kpi-blue-3);
}

.link {
	color: var(--kpi-blue-3);
	font-size: 14px;
	font-weight: 700;
	text-decoration: none;
}

.link:hover {
	text-decoration: underline;
}

.error-message {
	margin: 0;
	border: 1px solid var(--kpi-blue-5);
	border-radius: 8px;
	background: var(--kpi-blue-5);
	color: var(--kpi-blue-4);
	font-size: 14px;
	line-height: 1.45;
	padding: 10px 12px;
	text-align: center;
}

.submit-button {
	width: 100%;
	min-height: 50px;
	border: 0;
	border-radius: 8px;
	background: var(--kpi-blue-3);
	color: var(--kpi-surface);
	cursor: pointer;
	font: inherit;
	font-weight: 800;
	letter-spacing: 0;
	text-transform: uppercase;
	transition:
		background 160ms ease,
		transform 160ms ease;
}

.submit-button:hover {
	background: var(--kpi-blue-2);
	transform: translateY(-1px);
}

.submit-button:disabled {
	cursor: wait;
	opacity: 0.78;
	transform: none;
}

.signup-text {
	margin: 18px 0 0;
	color: var(--kpi-muted);
	font-size: 14px;
}

.info-panel {
	align-items: center;
	background:
		linear-gradient(90deg, rgba(187, 208, 243, 0.14), transparent 26%),
		var(--kpi-blue-2);
	color: rgba(255, 255, 255, 0.9);
}

.info-panel::before {
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
	background-size: 32px 32px;
	content: '';
	mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.92));
}

.info-content {
	position: relative;
	z-index: 1;
	width: min(100%, 450px);
	margin: 0 auto;
}

.info-content h2 {
	color: var(--kpi-surface);
	font-size: 40px;
}

.info-content p {
	margin: 18px 0 0;
	font-size: 17px;
	line-height: 1.72;
}

.info-kicker {
	color: var(--kpi-blue-5);
}

.outline-link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 190px;
	min-height: 48px;
	margin-top: 28px;
	border: 1px solid rgba(255, 255, 255, 0.42);
	border-radius: 8px;
	color: var(--kpi-surface);
	font-size: 14px;
	font-weight: 800;
	letter-spacing: 0;
	text-decoration: none;
	text-transform: uppercase;
	transition:
		background 160ms ease,
		border-color 160ms ease;
}

.outline-link:hover {
	border-color: var(--kpi-surface);
	background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 860px) {
	.login-shell {
		grid-template-columns: 1fr;
	}

	.login-panel,
	.info-panel {
		min-height: auto;
	}

	.login-panel {
		min-height: 100vh;
		padding-top: 96px;
		padding-bottom: 58px;
	}

	.info-panel {
		padding-top: 54px;
		padding-bottom: 58px;
	}
}

@media (max-width: 520px) {
	.login-panel,
	.info-panel {
		padding-right: 18px;
		padding-left: 18px;
	}

	.brand-mark {
		left: 18px;
	}

	h1,
	h2,
	.info-content h2 {
		font-size: 30px;
	}

	.quick-actions {
		grid-template-columns: repeat(5, minmax(34px, 40px));
		gap: 8px;
	}

	.quick-actions button {
		width: 40px;
		height: 40px;
	}

	.form-row {
		align-items: flex-start;
		flex-direction: column;
	}
}
</style>
