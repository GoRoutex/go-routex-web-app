export function DashboardFinancePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Finance Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#E3F5FF] p-6 rounded-2xl">
          <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
          <p className="text-2xl font-bold mt-2">$42,900</p>
        </div>
        <div className="bg-[#E5ECF6] p-6 rounded-2xl">
          <p className="text-sm font-medium text-gray-600">Net Profit</p>
          <p className="text-2xl font-bold mt-2">$12,450</p>
        </div>
        <div className="bg-[#E3F5FF] p-6 rounded-2xl">
          <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
          <p className="text-2xl font-bold mt-2">18</p>
        </div>
      </div>
      <div className="bg-[#F7F9FB] p-8 rounded-3xl min-h-[300px] flex items-center justify-center">
         <p className="text-gray-400 font-medium italic">Financial transactions and reports...</p>
      </div>
    </div>
  )
}
