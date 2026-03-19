import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { RightSidebar } from './RightSidebar';
import { TopNav } from './TopNav';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}
