import { useState, useEffect } from "react";
import { Store, Plus, Search, Filter, MoreHorizontal, ShieldCheck, Mail, Phone, MapPin, ExternalLink, Download, Loader2, Edit3, X, Save } from "lucide-react";
import { MERCHANT_SERVICE_BASE_URL } from "../../utils/api";
import { createAuthorizedEnvelopeHeaders } from "../../utils/requestMeta";
import { extractArrayValue } from "../../utils/responseExtractors";

export default function AdminMerchantManagementPage() {
    const [merchants, setMerchants] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalPartners: '0',
        totalRevenueShare: '0 VND',
        avgRating: '0',
        numberOfPendingApps: '0'
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editMerchant, setEditMerchant] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        taxCode: '',
        phone: '',
        email: '',
        address: '',
        representativeName: '',
        commissionRate: 0,
        status: 'ACTIVE'
    });

    const fetchMerchants = async () => {
        try {
            setLoading(true);
            const headers = createAuthorizedEnvelopeHeaders();
            const response = await fetch(`${MERCHANT_SERVICE_BASE_URL}/fetch?pageNumber=1&pageSize=10`, {
                method: 'GET',
                headers: headers as HeadersInit
            });

            if (!response.ok) throw new Error("Failed to fetch merchants");

            const body = await response.json();
            const data = extractArrayValue(body, ["content", "data", "merchants", "items"]);

            const dataSection = body?.data || body;
            setStats({
                totalPartners: String(dataSection?.totalPartners ?? '0'),
                totalRevenueShare: `${Number(dataSection?.totalRevenueShare ?? 0).toLocaleString()} VND`,
                avgRating: String(dataSection?.avgRating ?? '0'),
                numberOfPendingApps: String(dataSection?.numberOfPendingApps ?? '0')
            });

            const mappedData = data.map((m: any) => ({
                id: m.id || m.merchantId || "N/A",
                merchantId: m.merchantId || m.id,
                name: m.name || m.merchantName || "Unknown",
                email: m.email || "N/A",
                phone: m.phone || "N/A",
                address: m.address || "N/A",
                taxCode: m.taxCode || "",
                representativeName: m.representativeName || "",
                commissionRate: m.commissionRate || 0,
                status: m.status || 'ACTIVE',
                displayStatus: m.status === 'ACTIVE' || m.status === 'VERIFIED' ? 'Verified' : m.status || 'Pending',
                type: m.type || "Buses",
                fleetSize: m.fleetSize || 0,
                performance: m.performance || Math.floor(Math.random() * 20) + 80
            }));

            setMerchants(mappedData);
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchants();
    }, []);

    const handleEditClick = (m: any) => {
        setEditMerchant(m);
        setFormData({
            name: m.name,
            taxCode: m.taxCode,
            phone: m.phone,
            email: m.email,
            address: m.address,
            representativeName: m.representativeName,
            commissionRate: m.commissionRate,
            status: m.status
        });
    };

    const handleUpdateMerchant = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const response = await fetch(`${MERCHANT_SERVICE_BASE_URL}/update`, {
                method: 'POST',
                headers: {
                    ...createAuthorizedEnvelopeHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requestId: crypto.randomUUID(),
                    requestDateTime: new Date().toISOString(),
                    channel: "OFF",
                    data: {
                        merchantId: editMerchant.merchantId,
                        updatedBy: "Admin", // Should be from auth context in real app
                        ...formData
                    }
                })
            });

            if (!response.ok) throw new Error("Update failed");
            
            setEditMerchant(null);
            fetchMerchants(); // Refresh list
        } catch (err: any) {
            alert("Error updating merchant: " + err.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-[1.75rem] font-black tracking-tight text-slate-900">
                        Ecosystem Partners
                    </h2>
                    <p className="text-[13px] text-slate-500 font-medium max-w-xl leading-relaxed">
                        Monitor, manage, and audit partner performance within the GoRoutex network.
                        Ensuring high-quality connectivity across all merchants.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
                        <Download size={16} />
                        Export Data
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[12px] font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">
                        <Plus size={16} />
                        Invite Partner
                    </button>
                </div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Partners', value: stats.totalPartners, sub: 'Active footprint' },
                    { label: 'Total Revenue Share', value: stats.totalRevenueShare, sub: 'Month-to-date' },
                    { label: 'Avg. Rating', value: stats.avgRating, sub: 'Across network' },
                    { label: 'Pending Apps', value: stats.numberOfPendingApps, sub: 'Awaiting review' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-slate-300 transition-all">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.label}</span>
                        <div className="flex items-end justify-between mt-3">
                            <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">{stat.value}</h3>

                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-3">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Filter Toolbar */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search merchants, locations, or IDs..."
                        className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-[13px] font-medium focus:ring-0 outline-none placeholder:text-slate-400"
                    />
                </div>
                <div className="h-6 w-px bg-slate-100" />
                <button className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                    <Filter size={16} />
                    Filters
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Synchronizing with network...</p>
                </div>
            ) : error ? (
                <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] text-center">
                    <p className="text-rose-600 font-bold mb-2">Synchronization Failed</p>
                    <p className="text-rose-400 text-xs">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-xs font-black text-rose-600 uppercase tracking-widest hover:underline"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : (
                /* Partners Table */
                <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Merchant Entity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact & Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Fleet Scale</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Performance</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Audit Status</th>
                                    <th className="px-8 py-5 border-b border-slate-100"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {merchants.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <p className="text-slate-400 text-sm font-medium">No partners found in the network.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    merchants.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 bg-white shadow-sm transition-transform group-hover:scale-105">
                                                        <Store size={20} strokeWidth={1.5} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[14px] font-black text-slate-900">{m.name}</span>
                                                            {m.status === 'Verified' && <ShieldCheck size={14} className="text-slate-900" />}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
                                                            <MapPin size={12} />
                                                            <span className="text-[11px] font-medium truncate max-w-[200px]">{m.address}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                                                        <Mail size={12} className="text-slate-400" />
                                                        {m.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        <span className="px-1.5 py-0.5 border border-slate-200 rounded">{m.type}</span>
                                                        <span className="flex items-center gap-1"><Phone size={10} /> {m.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-black text-slate-900">{m.fleetSize} Units</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{m.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                                                        <div
                                                            className="h-full bg-slate-900 rounded-full"
                                                            style={{ width: `${m.performance}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[12px] font-black text-slate-900">{m.performance}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ring-1 ${m.status === 'Verified' ? 'ring-slate-900 text-slate-900 bg-slate-900/5' :
                                                    m.status === 'Pending' ? 'ring-slate-200 text-slate-500 bg-slate-50' : 'ring-rose-200 text-rose-600 bg-rose-50'
                                                    }`}>
                                                    {m.displayStatus}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEditClick(m)}
                                                        className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Edit Merchant"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="View Portal">
                                                        <ExternalLink size={18} />
                                                    </button>
                                                    <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="More Options">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Minimal Pagination */}
                    <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            Showing <span className="text-slate-900">1-{merchants.length}</span> of 128 partners
                        </span>
                        <div className="flex items-center gap-4">
                            <button className="text-[11px] font-black text-slate-300 cursor-not-allowed uppercase tracking-widest">Previous</button>
                            <button className="text-[11px] font-black text-slate-900 hover:text-slate-600 uppercase tracking-widest transition-colors">Next Page</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Merchant Modal */}
            {editMerchant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Update Merchant Entity</h3>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {editMerchant.merchantId}</p>
                            </div>
                            <button 
                                onClick={() => setEditMerchant(null)}
                                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateMerchant} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant Name</label>
                                    <input 
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Code</label>
                                    <input 
                                        type="text"
                                        value={formData.taxCode}
                                        onChange={(e) => setFormData({...formData, taxCode: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input 
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input 
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                                    <input 
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Representative Name</label>
                                    <input 
                                        type="text"
                                        value={formData.representativeName}
                                        onChange={(e) => setFormData({...formData, representativeName: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commission Rate (%)</label>
                                    <input 
                                        type="number"
                                        value={formData.commissionRate}
                                        onChange={(e) => setFormData({...formData, commissionRate: Number(e.target.value)})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="ACTIVE">Active & Verified</option>
                                        <option value="PENDING">Pending Review</option>
                                        <option value="DISABLED">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-end gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setEditMerchant(null)}
                                    className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={updating}
                                    className="px-10 py-3.5 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {updating ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


