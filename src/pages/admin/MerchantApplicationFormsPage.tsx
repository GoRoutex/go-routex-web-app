import { useState, useEffect, useCallback } from "react";
import {
    Search, X, Building, User, MapPin, CreditCard,
    Download, Loader2, AlertCircle
} from "lucide-react";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";
import { MERCHANT_APPLICATION_SERVICE_BASE_URL, ADMIN_MERCHANT_ACTION_BASE_URL } from "../../utils/api";
import { extractArrayValue } from "../../utils/responseExtractors";

export default function MerchantApplicationFormsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [currentStatus, setCurrentStatus] = useState<string | null>("SUBMITTED");
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [commission, setCommission] = useState(15);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchApplications = useCallback(async (status: string | null = "SUBMITTED") => {
        setLoading(true);
        setError(null);
        try {
            const statusParam = status ? `&status=${status}` : "";
            const response = await fetch(`${MERCHANT_APPLICATION_SERVICE_BASE_URL}/fetch?pageNumber=1&pageSize=10${statusParam}`, {
                headers: createAuthorizedEnvelopeHeaders()
            });
            const body = await response.json();
            const data = extractArrayValue(body, ["data", "content"]);
            setApplications(data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleStatusChange = (status: string | null) => {
        setCurrentStatus(status);
        fetchApplications(status);
    };

    const fetchApplicationDetail = async (id: string) => {
        setDetailLoading(true);
        try {
            const response = await fetch(`${MERCHANT_APPLICATION_SERVICE_BASE_URL}/detail?applicationFormId=${id}`, {
                headers: createAuthorizedEnvelopeHeaders()
            });
            const body = await response.json();
            const detail = body?.data || body;
            setSelectedApp(detail);
        } catch (err: any) {
            console.error("Failed to fetch detail:", err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            const adminEmail = localStorage.getItem("userEmail") || localStorage.getItem("email") || "admin@goroutex.com";
            const endpoint = status === 'APPROVED' ? '/admin/applications/accept' : '/admin/applications/reject';

            const payloadData = status === 'APPROVED' ? {
                applicationFormId: id,
                commission: String(commission),
                approvedBy: adminEmail
            } : {
                applicationFormId: id,
                rejectedBy: adminEmail,
                rejectionReason: 'Rejected by Admin'
            };

            const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...createAuthorizedEnvelopeHeaders()
                },
                body: JSON.stringify({
                    ...createRequestMeta(),
                    data: payloadData
                })
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody?.message || 'Failed to update application status');
            }

            setSelectedApp(null);
            fetchApplications(currentStatus);
        } catch (err: any) {
            alert(err.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications("SUBMITTED");
    }, [fetchApplications]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Partnership Applications</h2>
                    <p className="text-sm text-slate-400 font-bold mt-1">Review and approve new merchant requests.</p>
                </div>
                <div className="flex border rounded-xl overflow-hidden font-black text-[10px] uppercase tracking-widest">
                    <button
                        onClick={() => handleStatusChange("SUBMITTED")}
                        className={`px-4 py-2 transition-all ${currentStatus === "SUBMITTED" ? "bg-black text-white" : "bg-white text-slate-400 hover:text-slate-900"}`}
                    >
                        Submitted
                    </button>
                    <button
                        onClick={() => handleStatusChange("APPROVED")}
                        className={`px-4 py-2 border-l transition-all ${currentStatus === "APPROVED" ? "bg-black text-white" : "bg-white text-slate-400 hover:text-slate-900"}`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => handleStatusChange("REJECTED")}
                        className={`px-4 py-2 border-l transition-all ${currentStatus === "REJECTED" ? "bg-black text-white" : "bg-white text-slate-400 hover:text-slate-900"}`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full pl-11 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-brand-primary/20 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant / Brand</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner / Email</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Applications...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <AlertCircle className="w-8 h-8 text-rose-200" />
                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{error}</p>
                                        <button
                                            onClick={() => fetchApplications()}
                                            className="mt-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : applications.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No applications found</p>
                                </td>
                            </tr>
                        ) : (
                            applications.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm overflow-hidden border border-slate-100 transition-colors ${!(app.logoUrl || app.logourl || app.logo_url) ? "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600" : "bg-transparent"}`}>
                                                {(app.logoUrl || app.logourl || app.logo_url) ? (
                                                    <img src={app.logoUrl || app.logourl || app.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{app.displayName ? app.displayName[0] : "M"}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{app.displayName || "Unknown Merchant"}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{app.formCode || "---"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-900">{app.contactName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{app.contactEmail}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-slate-500">{new Date(app.submittedAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${app.status === 'SUBMITTED' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => fetchApplicationDetail(app.id)}
                                            disabled={detailLoading}
                                            className="bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
                                        >
                                            {detailLoading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Review"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Detail - Foodio Style */}
            {selectedApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 lg:p-16 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-[1100px] max-h-full rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] relative animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
                        {/* Header Section */}
                        <div className="p-10 flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black overflow-hidden border-2 border-white transition-all ${!(selectedApp.logoUrl || selectedApp.logourl || selectedApp.logo_url) ? "bg-[#FF4500] text-white shadow-lg shadow-orange-500/20" : "bg-transparent"}`}>
                                    {(selectedApp.logoUrl || selectedApp.logourl || selectedApp.logo_url) ? (
                                        <img src={selectedApp.logoUrl || selectedApp.logourl || selectedApp.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                    ) : selectedApp.displayName ? selectedApp.displayName[0] : "1"}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-950 tracking-tight">{selectedApp.displayName}</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Application Form: {selectedApp.formCode}</p>
                                </div>
                            </div>
                            <div className="px-5 py-2 rounded-2xl border border-orange-100 bg-orange-50 text-[11px] font-black text-orange-600 tracking-widest uppercase self-start">
                                {selectedApp.status}
                            </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                {/* Merchant Details */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                        <Building size={16} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Merchant Details</h4>
                                    </div>
                                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 grid grid-cols-2 gap-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Legal Name</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedApp.legalName || "---"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Tax Code</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedApp.taxCode || "---"}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Business License Number</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedApp.businessLicense || "---"}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Description</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedApp.description || "No description provided."}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                        <User size={16} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Contact Information</h4>
                                    </div>
                                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Full Name</p>
                                                <p className="text-sm font-semibold text-slate-900">{selectedApp.contact?.contactName || selectedApp.contactName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Phone</p>
                                                <p className="text-sm font-semibold text-slate-900">{selectedApp.contact?.contactPhone || selectedApp.contactPhone}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Email</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedApp.contact?.contactEmail || selectedApp.contactEmail || "---"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                        <MapPin size={16} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Location</h4>
                                    </div>
                                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 space-y-6">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                                                {selectedApp.address?.address || selectedApp.addressLine1}
                                                <br />
                                                {selectedApp.address?.ward || selectedApp.ward}, {selectedApp.address?.province || selectedApp.province}, {selectedApp.address?.country || selectedApp.country}
                                            </p>
                                        </div>
                                        <div className="pt-6 border-t border-slate-100/50 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Postal Code</p>
                                                <p className="text-sm font-black text-slate-900">{selectedApp.address?.postalCode || selectedApp.postalCode || "---"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Form Code</p>
                                                <p className="text-sm font-black text-slate-900">{selectedApp.formCode || selectedApp.id?.split('-').pop()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                        <Download size={16} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Documents</h4>
                                    </div>
                                    <div className="flex gap-4">
                                        {selectedApp.businessLicenseUrl ? (
                                            <div className="flex-1 aspect-video bg-slate-100 rounded-[1.5rem] border border-slate-200 overflow-hidden group cursor-pointer relative shadow-sm">
                                                <img src={selectedApp.businessLicenseUrl} alt="License" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest backdrop-blur-[2px]">
                                                    View Full Image
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 aspect-[4/3] bg-slate-100 rounded-[1.5rem] border border-slate-200 overflow-hidden flex items-center justify-center text-slate-300 italic text-[10px] font-black uppercase tracking-widest">
                                                No Image Provided
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Payout Information */}
                                <div className="col-span-full space-y-5">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                        <CreditCard size={16} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Payout Information</h4>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Bank Name', value: selectedApp.bankInfo?.bankName || selectedApp.bankName },
                                            { label: 'Account Holder', value: (selectedApp.bankInfo?.bankAccountName || selectedApp.bankAccountName)?.toUpperCase() },
                                            { label: 'Account Number', value: selectedApp.bankInfo?.bankAccountNumber || selectedApp.bankAccountNumber },
                                            { label: 'Branch', value: selectedApp.bankInfo?.bankBranch || selectedApp.bankBranch }
                                        ].map((p, i) => (
                                            <div key={i} className="bg-slate-50/50 p-4 rounded-3xl border border-slate-50">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{p.label}</p>
                                                <p className="text-sm font-semibold text-slate-900 truncate">{p.value || "---"}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Owner Information */}
                                <div className="col-span-full space-y-5">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                        <User size={16} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Owner Account Information</h4>
                                    </div>
                                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Username (System)</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedApp.ownerInfo?.ownerName || "---"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Owner Full Name</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedApp.ownerInfo?.ownerFullName || "---"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Owner Phone</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedApp.ownerInfo?.ownerPhone || "---"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Owner Email</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedApp.ownerInfo?.ownerEmail || "---"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 bg-slate-50/30 border-t border-slate-100 rounded-b-[3rem] flex items-center justify-between">
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="px-8 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-sm text-slate-950 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Close Detail
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="bg-white border border-slate-200 rounded-2xl p-2 px-4 flex flex-col items-center">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Commission (%)</span>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={commission}
                                            onChange={(e) => setCommission(Number(e.target.value))}
                                            className="text-sm font-black text-slate-950 w-10 bg-transparent border-none p-0 focus:ring-0 text-center"
                                        />
                                        <span className="text-[10px] font-bold text-slate-400 font-mono">%</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleReview(selectedApp.id, 'REJECTED')}
                                    disabled={actionLoading}
                                    className="px-10 py-3.5 bg-white border border-rose-200 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-50 transition-all shadow-sm disabled:opacity-50"
                                >
                                    {actionLoading ? "..." : "Reject"}
                                </button>
                                <button
                                    onClick={() => handleReview(selectedApp.id, 'APPROVED')}
                                    disabled={actionLoading}
                                    className="px-12 py-3.5 bg-black text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Approve Partner"}
                                </button>
                            </div>
                        </div>

                        {/* Close X */}
                        <button
                            onClick={() => setSelectedApp(null)}
                            className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors border border-slate-100"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
