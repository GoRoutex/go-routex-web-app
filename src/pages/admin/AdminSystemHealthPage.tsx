import { Activity, CheckCircle2, CircleAlert, Database, Server, ShieldCheck, Wifi } from 'lucide-react'

const services = [
  { name: 'API đặt vé', status: 'Ổn định', uptime: '99.98%', latency: '42 ms', icon: Server, tone: 'text-emerald-600 bg-emerald-50' },
  { name: 'Cổng thanh toán', status: 'Ổn định', uptime: '99.95%', latency: '68 ms', icon: ShieldCheck, tone: 'text-blue-600 bg-blue-50' },
  { name: 'Bộ máy tuyến', status: 'Suy giảm', uptime: '98.70%', latency: '124 ms', icon: Activity, tone: 'text-amber-600 bg-amber-50' },
  { name: 'Cụm cơ sở dữ liệu', status: 'Ổn định', uptime: '99.99%', latency: '19 ms', icon: Database, tone: 'text-violet-600 bg-violet-50' },
]

const incidents = [
  {
    title: 'Làm mới chậm ở bảng điều khiển tải tuyến',
    severity: 'Trung bình',
    owner: 'Nhóm nền tảng',
    time: '12 phút trước',
  },
  {
    title: 'Đồng bộ nền phục hồi sau nhiều lần thử lại',
    severity: 'Thấp',
    owner: 'Nhóm vận hành',
    time: '2 giờ trước',
  },
]

export function AdminSystemHealthPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Tình trạng hệ thống</h2>
          <span className="text-[12px] text-gray-400 font-medium">Theo dõi thời gian hoạt động, độ trễ dịch vụ và sự cố</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-[12px] font-bold uppercase tracking-wider">
          <CheckCircle2 size={14} />
          Tất cả hệ thống lõi đang hoạt động
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <div key={service.name} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className={`w-11 h-11 rounded-2xl ${service.tone} flex items-center justify-center mb-4`}>
                <Icon size={18} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900">{service.name}</h3>
                  <p className="text-[12px] text-gray-400 mt-1 uppercase tracking-wider">{service.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Độ trễ</p>
                  <p className="text-[14px] font-bold text-gray-900">{service.latency}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-[12px]">
                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Thời gian hoạt động</p>
                  <p className="text-gray-900 font-bold mt-1">{service.uptime}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Trạng thái</p>
                  <p className="text-gray-900 font-bold mt-1">{service.status}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Sự cố gần đây</h3>
              <p className="text-[12px] text-gray-400 font-medium">Theo dõi các vấn đề đang mở và người phụ trách</p>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
              <Wifi size={14} />
              Trạng thái cập nhật trực tiếp
            </div>
          </div>

          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.title} className="rounded-2xl bg-gray-50 border border-gray-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <CircleAlert size={18} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900">{incident.title}</h4>
                    <p className="text-[12px] text-gray-400 mt-1">
                      Phụ trách: {incident.owner} • {incident.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white text-[11px] font-bold text-gray-700 border border-gray-200 uppercase tracking-wider">
                    {incident.severity}
                  </span>
                  <button className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[12px] font-bold hover:bg-black transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h3 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider mb-4">Ghi chú vận hành</h3>
          <ul className="space-y-4">
            {[
              'Bản sao cơ sở dữ liệu đang ổn định và đồng bộ.',
              'Số lần thử lại thanh toán đang trong ngưỡng cho phép.',
              'Bộ máy tuyến cần được rà soát thêm vào giờ thấp điểm.',
            ].map((note) => (
              <li key={note} className="flex gap-3 text-[13px] text-gray-600 leading-relaxed">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
