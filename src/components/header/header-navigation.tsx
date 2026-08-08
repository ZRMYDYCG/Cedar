'use client'

import Dropdown from '@/components/dropdown/dropdown'
import DropdownItem from '@/components/dropdown/dropdown-item'
import DropdownMenu from '@/components/dropdown/dropdown-menu'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'next/navigation'

function isExternal(path: string) {
  return /^https?:\/\//.test(path)
}

export default function HeaderNavigation() {
  const router = useRouter()
  const locale = useAppStore(s => s.locale)
  const menus = useAppStore(s => s.themeConfig.menu.menus)

  const pushPage = (path: string) => {
    if (!path) return
    if (isExternal(path)) {
      window.location.href = path
      return
    }
    router.push(path)
  }

  return (
    <nav className="hidden flex-1 items-center lg:flex">
      <ul className="flex list-none flex-row items-center px-6 text-white">
        {menus.map(route => (
          <li
            key={route.path}
            className="relative flex h-full cursor-pointer flex-col items-center justify-center px-2 py-2 text-center text-xs font-medium not-italic"
          >
            {!route.children?.length ? (
              <button
                type="button"
                className="nav-link relative block cursor-pointer rounded-md px-1.5 py-0.5 text-sm uppercase"
                data-menu={route.name}
                onClick={() => pushPage(route.path)}
              >
                <span className="relative z-50">
                  {route.i18n[locale] || route.name}
                </span>
              </button>
            ) : (
              <Dropdown className="nav-link relative block rounded-md px-1.5 py-0.5 text-sm uppercase">
                <span className="relative z-50">
                  {route.i18n[locale] || route.name}
                </span>
                <DropdownMenu>
                  {route.children.map(sub => (
                    <DropdownItem
                      key={sub.path}
                      name={sub.path}
                      onSelect={pushPage}
                    >
                      {sub.i18n[locale] || sub.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
