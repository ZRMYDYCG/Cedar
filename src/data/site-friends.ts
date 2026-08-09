import type { FriendLink } from '@/data/site-taxonomy'

/** Stable avatar from site domain (works without hosting images ourselves). */
function siteAvatar(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
}

/**
 * Seed friend links shown on /links.
 * Labels map to i18n keys under settings.* (without the settings. prefix in data).
 */
export const siteFriends: FriendLink[] = [
  {
    nick: '阮一峰的网络日志',
    link: 'https://www.ruanyifeng.com/blog/',
    avatar: siteAvatar('ruanyifeng.com'),
    description: '科技爱好者周刊与前端、编程随笔，长期坚持更新。',
    label: 'links-badge-tech'
  },
  {
    nick: '酷壳 CoolShell',
    link: 'https://coolshell.cn/',
    avatar: siteAvatar('coolshell.cn'),
    description: '陈皓的技术思考：架构、编程与程序员成长经典文。',
    label: 'links-badge-tech'
  },
  {
    nick: '张鑫旭-鑫空间-鑫生活',
    link: 'https://www.zhangxinxu.com/',
    avatar: siteAvatar('zhangxinxu.com'),
    description: '国内 CSS / 前端细节实战写得最深的个人站之一。',
    label: 'links-badge-tech'
  },
  {
    nick: '云风的 BLOG',
    link: 'https://blog.codingnow.com/',
    avatar: siteAvatar('blog.codingnow.com'),
    description: '游戏与系统底层实践，写作克制、信息密度高。',
    label: 'links-badge-tech'
  },
  {
    nick: '卡瓦邦噶！',
    link: 'https://www.kawabangga.com/',
    avatar: siteAvatar('kawabangga.com'),
    description: 'laixintao：Python、网络与工程实践，读起来很痛快。',
    label: 'links-badge-tech'
  },
  {
    nick: 'piglei',
    link: 'https://www.piglei.com/',
    avatar: siteAvatar('piglei.com'),
    description: 'Python 工匠：工程实践与软件设计思考。',
    label: 'links-badge-tech'
  },
  {
    nick: '唐巧的博客',
    link: 'https://blog.devtang.com/',
    avatar: siteAvatar('blog.devtang.com'),
    description: 'iOS / 技术管理与职业成长，长期沉淀。',
    label: 'links-badge-tech'
  },
  {
    nick: 'Lutaonan / Randy',
    link: 'https://lutaonan.com/',
    avatar: siteAvatar('lutaonan.com'),
    description: '独立开发与产品思考，文字干净有观点。',
    label: 'links-badge-tech'
  },
  {
    nick: 'Tw93',
    link: 'https://tw93.fun/',
    avatar: siteAvatar('tw93.fun'),
    description: '开源与效率工具实践，前端/跨端相关分享多。',
    label: 'links-badge-tech'
  },
  {
    nick: '透明创业实验',
    link: 'https://blog.t9t.io/',
    avatar: siteAvatar('blog.t9t.io'),
    description: 'timqian：创业、开源与独立博客生态观察。',
    label: 'links-badge-tech'
  },
  {
    nick: 'Manjusaka',
    link: 'https://www.manjusaka.blog/',
    avatar: siteAvatar('manjusaka.blog'),
    description: '写代码的香港记者：Python、基础设施与技术随笔。',
    label: 'links-badge-tech'
  },
  {
    nick: 'DIYgod',
    link: 'https://diygod.cc/',
    avatar: siteAvatar('diygod.cc'),
    description: 'RSSHub 作者：开源、生活与独立精神。',
    label: 'links-badge-tech'
  },
  {
    nick: 'Anthony Fu',
    link: 'https://antfu.me/',
    avatar: siteAvatar('antfu.me'),
    description: 'Vue / Vite 生态核心贡献者，工程与开源实践。',
    label: 'links-badge-tech'
  },
  {
    nick: '罗磊的独立博客',
    link: 'https://luolei.org/',
    avatar: siteAvatar('luolei.org'),
    description: '旅行、摄影与生活记录，阅读体验很好。',
    label: 'links-badge-personal'
  },
  {
    nick: 'Elizen',
    link: 'https://elizen.me/',
    avatar: siteAvatar('elizen.me'),
    description: '阅读、写作与日常，安静的个人空间。',
    label: 'links-badge-personal'
  },
  {
    nick: '土木坛子',
    link: 'https://tumutanzi.com/',
    avatar: siteAvatar('tumutanzi.com'),
    description: '读书、思考与人文随笔，节奏缓慢而扎实。',
    label: 'links-badge-personal'
  }
]
