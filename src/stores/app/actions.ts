import type { StateCreator } from 'zustand'
import type { AppSliceState, LocaleCode, ThemeMode } from './slice'

export type AppActions = {
  setTheme: (theme: ThemeMode) => void
  toggleTheme: (status?: boolean) => void
  setLocale: (locale: LocaleCode) => void
  setConfigReady: (ready: boolean) => void
  setScrollProgress: (progress: number) => void
  toggleMobileMenu: (open?: boolean) => void
  setSearchModalOpen: (open: boolean) => void
  setHeaderImage: (url: string) => void
  resetHeaderImage: () => void
}

export type AppStore = AppSliceState & AppActions

const applyThemeToBody = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return
  document.body.classList.remove('theme-light', 'theme-dark')
  document.body.classList.add(theme)
  document.cookie = `theme=${theme};path=/;max-age=31536000`
}

export const createAppActions: StateCreator<
  AppStore,
  [],
  [],
  AppActions
> = set => ({
  setTheme: theme => {
    applyThemeToBody(theme)
    set({ theme })
  },
  toggleTheme: status =>
    set(state => {
      const theme: ThemeMode =
        typeof status === 'boolean'
          ? status
            ? 'theme-dark'
            : 'theme-light'
          : state.theme === 'theme-dark'
            ? 'theme-light'
            : 'theme-dark'
      applyThemeToBody(theme)
      return { theme }
    }),
  setLocale: locale => {
    if (typeof document !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
    }
    set({ locale })
  },
  setConfigReady: ready => set({ configReady: ready }),
  setScrollProgress: progress => set({ scrollProgress: progress }),
  toggleMobileMenu: open =>
    set(state => ({
      mobileMenuOpen: typeof open === 'boolean' ? open : !state.mobileMenuOpen
    })),
  setSearchModalOpen: open => set({ searchModalOpen: open }),
  setHeaderImage: url => set({ headerImage: url || '' }),
  resetHeaderImage: () => set({ headerImage: '' })
})
