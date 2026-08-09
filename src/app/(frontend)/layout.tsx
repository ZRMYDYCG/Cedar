import AppShell from '@/components/app-shell/app-shell'
import { getResolvedSiteConfig } from '@/data/cms/site-settings'
import QueryProvider from '@/providers/query-provider'
import '@/styles/theme.css'
import '@/styles/tw.css'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import type { ReactNode } from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getResolvedSiteConfig()
  const name = config.site.author || 'Cedar'
  return {
    title: name,
    description: config.site.subtitle || `${name} — personal site`
  }
}

export default async function FrontendLayout({
  children
}: {
  children: ReactNode
}) {
  const [locale, messages, siteConfigFromCms] = await Promise.all([
    getLocale(),
    getMessages(),
    getResolvedSiteConfig()
  ])

  return (
    <html lang={locale} className="theme-dark" suppressHydrationWarning>
      <body className="theme-dark" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]+)/);var t=m&&m[1];if(t!=='theme-dark'&&t!=='theme-light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'theme-dark':'theme-light'}var r=document.documentElement;r.classList.remove('theme-light','theme-dark');r.classList.add(t);document.body.classList.remove('theme-light','theme-dark');document.body.classList.add(t)}catch(e){}})();`
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AppShell siteConfigFromCms={siteConfigFromCms}>{children}</AppShell>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
