import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { RightSidebar } from './RightSidebar';
import { TopNav } from './TopNav';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-white text-[#1C1C1C]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 border-x border-gray-100">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}
