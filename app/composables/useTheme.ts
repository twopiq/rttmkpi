type ThemeName = 'light' | 'dark'

const storageKey = 'rttm-kpi-theme'

const getStoredOrDefaultTheme = (): ThemeName => {
	if (!import.meta.client) return 'dark'
	const stored = window.localStorage.getItem(storageKey)
	if (stored === 'dark' || stored === 'light') return stored
	return 'dark'
}

const applyTheme = (theme: ThemeName) => {
	if (!import.meta.client) return
	document.documentElement.dataset.theme = theme
	document.documentElement.style.colorScheme = theme
	window.localStorage.setItem(storageKey, theme)
}

export const useTheme = () => {
	const theme = useState<ThemeName>('app-theme', () => 'dark')

	const setTheme = (next: ThemeName) => {
		theme.value = next
		applyTheme(next)
	}

	const toggleTheme = () => setTheme(theme.value === 'dark' ? 'light' : 'dark')

	onMounted(() => setTheme(getStoredOrDefaultTheme()))

	const isDark = computed(() => theme.value === 'dark')
	const themeLabel = computed(() => isDark.value ? 'Tun' : 'Kun')
	const themeButtonLabel = computed(() =>
		isDark.value ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish",
	)

	return { theme, isDark, themeLabel, themeButtonLabel, setTheme, toggleTheme }
}
