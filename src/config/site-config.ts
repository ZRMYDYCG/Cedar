export type MenuItem = {
  name: string
  path: string
  i18n: Record<string, string>
  children?: MenuItem[]
}

export type SiteConfig = {
  site: {
    author: string
    nick: string
    subtitle: string
    logo: string
    avatar: string
    multi_language: boolean
  }
  theme: {
    dark_mode: boolean
    profile_shape: 'circle-avatar' | 'diamond-avatar' | 'rounded-avatar'
    feature: boolean
    header_gradient_css: string
    gradient: {
      color_1: string
      color_2: string
      color_3: string
    }
    background_gradient_style: {
      background: string
      WebkitBackgroundClip: string
      WebkitTextFillColor: string
    }
  }
  socials: {
    github?: string
    twitter?: string
    stackoverflow?: string
  }
  menu: {
    menus: MenuItem[]
  }
}

const gradient =
  'linear-gradient(130deg, #3dba60, #4ade80 41.07%, #7d5a44 76.05%)'

/** Code defaults. Profile texts (author / nick / subtitle) are overridden by CMS Global `site-settings`. */
export const siteConfig: SiteConfig = {
  site: {
    author: 'Cedar',
    nick: 'Cedar',
    subtitle: 'Notes under the cedar',
    logo: '',
    avatar: '/images/avatar.jpg',
    multi_language: true
  },
  theme: {
    dark_mode: true,
    profile_shape: 'circle-avatar',
    feature: true,
    header_gradient_css: gradient,
    gradient: {
      color_1: '#3dba60',
      color_2: '#4ade80',
      color_3: '#7d5a44'
    },
    background_gradient_style: {
      background: gradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }
  },
  socials: {
    github: 'https://github.com',
    twitter: 'https://twitter.com'
  },
  menu: {
    menus: [
      {
        name: 'Home',
        path: '/',
        i18n: { 'zh-CN': '首页', 'zh-TW': '首頁', en: 'Home' },
        children: []
      },
      {
        name: 'Moments',
        path: '/moments',
        i18n: { 'zh-CN': '朋友圈', 'zh-TW': '朋友圈', en: 'Moments' },
        children: []
      },
      {
        name: 'About',
        path: '/about',
        i18n: { 'zh-CN': '关于', 'zh-TW': '關於', en: 'About' },
        children: []
      },
      {
        name: 'Archives',
        path: '/archives',
        i18n: { 'zh-CN': '归档', 'zh-TW': '歸檔', en: 'Archives' },
        children: []
      },
      {
        name: 'Tags',
        path: '/tags',
        i18n: { 'zh-CN': '标签', 'zh-TW': '標籤', en: 'Tags' },
        children: []
      },
      {
        name: 'Categories',
        path: '/category',
        i18n: { 'zh-CN': '分类', 'zh-TW': '分類', en: 'Categories' },
        children: []
      },
      {
        name: 'Links',
        path: '/links',
        i18n: { 'zh-CN': '友链', 'zh-TW': '友鏈', en: 'Friends' },
        children: []
      }
    ]
  }
}
