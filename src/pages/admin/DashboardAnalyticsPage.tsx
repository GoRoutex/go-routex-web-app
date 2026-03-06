export function DashboardAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#F7F9FB] p-8 rounded-3xl min-h-[400px] flex items-center justify-center">
          <p className="text-gray-400 font-medium italic">Detailed analytics coming soon...</p>
        </div>
        <div className="bg-[#F7F9FB] p-8 rounded-3xl min-h-[400px] flex items-center justify-center">
           <p className="text-gray-400 font-medium italic">User behavior patterns...</p>
        </div>
      </div>
    </div>
  )
}
