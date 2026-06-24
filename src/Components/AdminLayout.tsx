import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav';

export function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
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
      className={`admin-shell flex h-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}
    >
      {/* Left Sidebar */}
      <Sidebar collapsed={isSidebarCollapsed} isDarkMode={isDarkMode} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
        <TopNav
          isSidebarCollapsed={isSidebarCollapsed}
          isDarkMode={isDarkMode}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
          onToggleTheme={() => setIsDarkMode((value) => !value)}
        />
        <main className={`flex-1 overflow-y-auto p-8 lg:p-12 max-w-[1600px] mx-auto w-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
