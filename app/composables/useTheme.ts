type ThemeName = 'light' | 'dark'

const storageKey = 'rttm-kpi-theme'

const getSystemTheme = (): ThemeName => {
	if (!import.meta.client) {
		return 'light'
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const readStoredTheme = (): ThemeName => {
	if (!import.meta.client) {
		return 'light'
	}

	const storedTheme = window.localStorage.getItem(storageKey)

	return storedTheme === 'dark' || storedTheme === 'light'
		? storedTheme
		: getSystemTheme()
}

const applyTheme = (theme: ThemeName) => {
	if (!import.meta.client) {
		return
	}

	document.documentElement.dataset.theme = theme
	document.documentElement.style.colorScheme = theme
	window.localStorage.setItem(storageKey, theme)
}

export const useTheme = () => {
	const theme = useState<ThemeName>('app-theme', () => 'light')

	const setTheme = (nextTheme: ThemeName) => {
		theme.value = nextTheme
		applyTheme(nextTheme)
	}

	const toggleTheme = () => {
		setTheme(theme.value === 'dark' ? 'light' : 'dark')
	}

	onMounted(() => {
		setTheme(readStoredTheme())
	})

	const themeLabel = computed(() => (theme.value === 'dark' ? 'Tun' : 'Kun'))
	const themeButtonLabel = computed(() =>
		theme.value === 'dark'
			? "Kunduzgi mavzuga o'tish"
			: "Tungi mavzuga o'tish",
	)

	return {
		theme,
		themeLabel,
		themeButtonLabel,
		setTheme,
		toggleTheme,
	}
}
