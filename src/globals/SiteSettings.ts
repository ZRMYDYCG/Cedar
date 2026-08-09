import type { GlobalConfig } from 'payload'

/** Site-facing profile copy edited in Admin (falls back to site-config.ts). */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: {
    singular: '站点资料',
    plural: '站点资料'
  },
  admin: {
    description: '控制前台显示名、昵称与个性签名；头像与主题仍由代码配置。'
  },
  access: {
    read: () => true
  },
  fields: [
    {
      name: 'author',
      type: 'text',
      label: '显示名',
      admin: {
        description: '侧边栏、Logo、页脚等处的主名称'
      }
    },
    {
      name: 'nick',
      type: 'text',
      label: '昵称',
      admin: {
        description: '人生小记封面、Logo 副标题等'
      }
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: '个性签名',
      admin: {
        description: '侧边栏简介、人生小记签名等'
      }
    }
  ]
}
