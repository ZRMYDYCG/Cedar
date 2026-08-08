'use client'

import Dropdown from '@/components/dropdown/dropdown'
import DropdownItem from '@/components/dropdown/dropdown-item'
import DropdownMenu from '@/components/dropdown/dropdown-menu'
import SvgIcon from '@/components/svg-icon/svg-icon'
import ThemeToggle from '@/components/theme-toggle/theme-toggle'
import { useAppStore, type LocaleCode } from '@/stores/app'

type HeaderControlsProps = {
  scrollProgress?: number
}

export default function HeaderControls({
  scrollProgress = 0
}: HeaderControlsProps) {
  const locale = useAppStore(s => s.locale)
  const setLocale = useAppStore(s => s.setLocale)
  const multiLanguage = useAppStore(s => s.themeConfig.site.multi_language)
  const setSearchModalOpen = useAppStore(s => s.setSearchModalOpen)
  const toggleMobileMenu = useAppStore(s => s.toggleMobileMenu)

  const localeLabel =
    locale === 'zh-CN' ? '简体' : locale === 'zh-TW' ? '繁體' : 'En'

  return (
    <div
      className="header-controls top-0 right-0 ml-auto flex flex-row items-center text-white"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          setSearchModalOpen(true)
        }
      }}
    >
      <div
        className={`left-control ${scrollProgress > 0 ? 'moved-right' : ''}`}
      >
        <span
          className="icon-control text-invert flex items-center"
          data-dia="search"
          onClick={() => setSearchModalOpen(true)}
        >
          <SvgIcon
            iconClass="search"
            fill="currentColor"
            stroke="none"
            width="1.2rem"
            height="1.2rem"
          />
        </span>

        {multiLanguage ? (
          <Dropdown>
            <span
              className="icon-control text-invert flex items-center"
              data-dia="language"
            >
              <SvgIcon
                iconClass="translate"
                fill="currentColor"
                stroke="none"
                width="1.2rem"
                height="1.2rem"
              />
              <span>{localeLabel}</span>
            </span>
            <DropdownMenu>
              <DropdownItem
                name="en"
                active={locale === 'en'}
                onSelect={name => setLocale(name as LocaleCode)}
              >
                English
              </DropdownItem>
              <DropdownItem
                name="zh-CN"
                active={locale === 'zh-CN'}
                onSelect={name => setLocale(name as LocaleCode)}
              >
                简体
              </DropdownItem>
              <DropdownItem
                name="zh-TW"
                active={locale === 'zh-TW'}
                onSelect={name => setLocale(name as LocaleCode)}
              >
                繁體
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : null}
      </div>

      <div className="right-control">
        <div
          className={`progress-ball ${
            scrollProgress > 0 ? 'activated-ball' : 'reset-ball'
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span>
            <SvgIcon
              iconClass="back-to-top"
              stroke="var(--text-invert)"
              width="1.1rem"
              height="1.1rem"
            />
          </span>
          {scrollProgress}
        </div>

        <span
          className="ob-drop-shadow hidden lg:flex"
          data-dia="light-switch"
          data-no-hover-effect
        >
          <ThemeToggle />
        </span>

        <span
          className="icon-control flex items-center lg:hidden"
          data-dia="menu"
          onClick={() => toggleMobileMenu()}
        >
          <SvgIcon
            iconClass="hamburger"
            fill="currentColor"
            stroke="none"
            width="1.2rem"
            height="1.2rem"
          />
        </span>
      </div>
    </div>
  )
}
