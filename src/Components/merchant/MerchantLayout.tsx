import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { MerchantSidebar } from './MerchantSidebar'
import { RightSidebar } from '../RightSidebar';
import { TopNav } from '../TopNav';

export function MerchantLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('merchant-theme')
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.dataset.merchantTheme = isDarkMode ? 'dark' : 'light'
    localStorage.setItem('merchant-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  return (
    <div
      data-merchant-theme={isDarkMode ? 'dark' : 'light'}
      className={`merchant-shell flex h-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}
    >
      {/* Left Sidebar */}
      <MerchantSidebar collapsed={isSidebarCollapsed} isDarkMode={isDarkMode} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
        <TopNav
          isSidebarCollapsed={isSidebarCollapsed}
          isRightSidebarVisible={isRightSidebarVisible}
          isDarkMode={isDarkMode}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
          onToggleRightSidebar={() => setIsRightSidebarVisible((value) => !value)}
          onToggleTheme={() => setIsDarkMode((value) => !value)}
        />
        <main className={`flex-1 overflow-y-auto p-8 lg:p-12 max-w-[1600px] mx-auto w-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
          <Outlet />
        </main>
      </div>

      {/* Right Sidebar */}
      <RightSidebar visible={isRightSidebarVisible} isDarkMode={isDarkMode} />
    </div>
  )
}
