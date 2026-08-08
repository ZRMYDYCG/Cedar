import { siteConfig, type SiteConfig } from '@/config/site-config'

export type ThemeMode = 'theme-light' | 'theme-dark'
export type LocaleCode = 'en' | 'zh-CN' | 'zh-TW'

export type AppSliceState = {
  theme: ThemeMode
  locale: LocaleCode
  configReady: boolean
  themeConfig: SiteConfig
  scrollProgress: number
  mobileMenuOpen: boolean
  searchModalOpen: boolean
  headerImage: string
}

export const createAppSliceState = (): AppSliceState => ({
  theme: siteConfig.theme.dark_mode ? 'theme-dark' : 'theme-light',
  locale: 'zh-CN',
  configReady: true,
  themeConfig: siteConfig,
  scrollProgress: 0,
  mobileMenuOpen: false,
  searchModalOpen: false,
  // Vue commonStore: empty until a page sets a cover (home stays pure gradient)
  headerImage: ''
})
