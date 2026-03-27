import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { RightSidebar } from './RightSidebar';
import { TopNav } from './TopNav';

export function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('admin-theme')
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.dataset.adminTheme = isDarkMode ? 'dark' : 'light'
    localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  return (
    <div
      data-admin-theme={isDarkMode ? 'dark' : 'light'}
      className={`admin-shell flex min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}
    >
      {/* Left Sidebar */}
      <Sidebar collapsed={isSidebarCollapsed} isDarkMode={isDarkMode} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
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
