import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Store,
    CreditCard,
    MapPin,
    FileText,
    Globe,
    Upload,
    ChevronRight,
    Check,
    CheckCircle2,
    Loader2,
    Edit3
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { createRequestMeta, createAuthorizedEnvelopeHeaders, createRequestEnvelopeHeaders } from '../../utils/requestMeta';
import { logout } from '../../utils/auth';
import { API_BASE_URL, MEDIA_UPLOAD_URL, ADMIN_MERCHANT_ACTION_BASE_URL } from '../../utils/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function PartnerRegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);


    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        brandName: '',
        taxCode: '',
        businessRegNum: '',
        representativeName: '',
        representativeEmail: '',
        representativePhone: '',
        address: '',
        ward: '',
        city: '',
        bankName: '',
        accountHolder: '',
        accountNumber: '',
        bankAccountNumber: '',
        bankBranch: '',
        agreed: false,
        description: '',
        legalName: '',
        country: 'Vietnam',
        province: '',
        postalCode: '',
        slug: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        businessLicenseUrl: '',
        logoUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const licenseFileInputRef = useRef<HTMLInputElement>(null);
    const logoFileInputRef = useRef<HTMLInputElement>(null);

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'businessLicenseUrl' | 'logoUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setIsUploading(true);

        try {
            const meta = createRequestMeta();
            const formDataApi = new FormData();
            formDataApi.append('requestId', meta.requestId);
            formDataApi.append('requestDateTime', meta.requestDateTime);
            formDataApi.append('channel', meta.channel);

            formDataApi.append('data', JSON.stringify({
                folder: 'goroutex',
                publicId: `${targetField === 'logoUrl' ? 'logo' : 'license'}_${Date.now()}`
            }));
            formDataApi.append('file', file);

            const token = localStorage.getItem('authToken') || "";
            const response = await fetch(API_BASE_URL + MEDIA_UPLOAD_URL, {
                method: 'POST',
                headers: {
                    ...(token.trim() ? { 'Authorization': `Bearer ${token.trim()}` } : {})
                },
                body: formDataApi
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
            }

            const result = await response.json();
            // Assuming the result contains the URL in 'data.url' or similar based on shared patterns
            const uploadedUrl = result.data?.url || '';
            handleInputChange(targetField, uploadedUrl);
        } catch (err: any) {
            setError(err.message || 'Lỗi tải ảnh.');
        } finally {
            setIsUploading(false);
            if (licenseFileInputRef.current) licenseFileInputRef.current.value = '';
            if (logoFileInputRef.current) logoFileInputRef.current.value = '';
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (step < 4) {
            nextStep();
            return;
        }

        if (!formData.agreed) return;

        setIsSubmitting(true);
        try {
            const meta = createRequestMeta();
            const payload = {
                ...meta,
                data: {
                    displayName: formData.brandName,
                    logoUrl: formData.logoUrl,
                    legalName: formData.legalName || formData.brandName,
                    taxCode: formData.taxCode,
                    businessLicense: formData.businessRegNum,
                    businessLicenseUrl: formData.businessLicenseUrl,
                    description: formData.description,
                    slug: formData.brandName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                    addressInfo: {
                        country: formData.country,
                        address: formData.address,
                        ward: formData.ward,
                        province: formData.province,
                        city: formData.city || formData.province,
                        postalCode: formData.postalCode || '70000',
                    },
                    contact: {
                        contactName: formData.contactName || formData.fullName,
                        contactPhone: formData.contactPhone || formData.phone,
                        contactEmail: formData.contactEmail || formData.email
                    },
                    bankInfo: {
                        bankName: formData.bankName,
                        bankBranch: formData.bankBranch,
                        bankAccountName: formData.accountHolder,
                        bankAccountNumber: formData.accountNumber
                    },
                    ownerInfo: {
                        ownerName: formData.email.split('@')[0],
                        ownerFullName: formData.fullName,
                        ownerPhone: formData.phone,
                        ownerEmail: formData.email
                    }
                }
            };

            const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/applications/submit`, {
                method: 'POST',
                headers: {
                    ...createRequestEnvelopeHeaders(),
                    'Content-Type': 'application/json',
                    ...createAuthorizedEnvelopeHeaders(meta)
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error('Đã có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
            }

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối máy chủ.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Gửi yêu cầu thành công!</h2>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">
                        Cảm ơn bạn đã quan tâm đến chương trình đối tác của Go Routex. Đội ngũ chúng tôi sẽ thẩm định thông tin và liên hệ với bạn trong vòng 24 giờ làm việc.
                    </p>
                    <button
                        onClick={() => navigate('/home')}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-base shadow-xl active:scale-95 transition-all"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">

            {/* ══════════════════  STEPPER  ══════════════════ */}
            <div className="max-w-4xl mx-auto -mt-12 mb-5 relative z-20 px-8 mt-10">
                <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/40">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex-1 flex flex-col items-center relative group">
                            <div className="flex items-center w-full">
                                {/* Line before */}
                                <div className={cn(
                                    "flex-1 h-1 rounded-full mx-2 transition-all duration-700",
                                    s <= step ? "bg-brand-primary" : "bg-slate-100",
                                    s === 1 && "bg-transparent"
                                )} />

                                {/* Circle */}
                                <div className={cn(
                                    "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black transition-all duration-500 border-4",
                                    s < step ? "bg-brand-primary border-brand-primary/20 text-white" :
                                        s === step ? "bg-white border-brand-primary text-brand-primary shadow-xl shadow-brand-primary/20 scale-110" :
                                            "bg-white border-slate-50 text-slate-300"
                                )}>
                                    {s < step ? <Check className="w-6 h-6 stroke-[4]" /> : s}
                                </div>

                                {/* Line after */}
                                <div className={cn(
                                    "flex-1 h-1 rounded-full mx-2 transition-all duration-700",
                                    s < step ? "bg-brand-primary" : "bg-slate-100",
                                    s === 4 && "bg-transparent"
                                )} />
                            </div>
                            <span className={cn(
                                "hidden md:block text-[10px] font-black uppercase tracking-[0.2em] mt-4 transition-colors",
                                s === step ? "text-brand-primary" : "text-slate-400"
                            )}>
                                Step {s}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════  FORM CONTENT  ══════════════════ */}
            <div className="max-w-4xl mx-auto px-8 pb-32">
                <form onSubmit={handleFormSubmit} className="bg-white rounded-[4rem] p-10 md:p-20 shadow-2xl shadow-slate-200/50 border border-white">

                    {/* STEP 1: OWNER ACCOUNT & BRAND IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Owner Account Section */}
                            <div className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                                        <User className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Thông tin chủ nhà xe</h3>
                                </div>

                                <div className="grid md:grid-cols-3 gap-8">
                                    <FormInput
                                        label="Họ và tên"
                                        placeholder="Tên đầy đủ của chủ xe"
                                        value={formData.fullName}
                                        onChange={(v) => handleInputChange('fullName', v)}
                                    />
                                    <FormInput
                                        label="Email"
                                        type="email"
                                        placeholder="owner@example.com"
                                        value={formData.email}
                                        onChange={(v) => handleInputChange('email', v)}
                                    />
                                    <FormInput
                                        label="Số điện thoại"
                                        placeholder="090 XXX XXXX"
                                        value={formData.phone}
                                        onChange={(v) => handleInputChange('phone', v)}
                                    />
                                </div>
                            </div>

                            {/* Brand Identity Section */}
                            <div className="space-y-5 pt-10 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-300">
                                        <Store className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Thanh thương hiệu</h3>
                                </div>

                                <div className="flex flex-col md:flex-row gap-10 items-start">
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            ref={logoFileInputRef}
                                            onChange={(e) => handleFileUpload(e, 'logoUrl')}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div
                                            onClick={() => !isUploading && logoFileInputRef.current?.click()}
                                            className={cn(
                                                "w-32 h-32 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-100 flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:border-brand-primary/40",
                                                formData.logoUrl && "border-solid border-brand-primary/20",
                                                isUploading && "opacity-50 cursor-wait"
                                            )}
                                        >
                                            {formData.logoUrl ? (
                                                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Logo</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute -bottom-2 -right-2 bg-white shadow-xl border border-slate-100 p-2.5 rounded-xl text-brand-primary hover:scale-110 transition-all"
                                            onClick={() => logoFileInputRef.current?.click()}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex-1 w-full space-y-8">
                                        <FormInput
                                            label="Tên nhà xe (Tên hiển thị)"
                                            placeholder="VD: Go Routex Express"
                                            value={formData.brandName}
                                            onChange={(v) => handleInputChange('brandName', v)}
                                        />

                                        <FormInput
                                            label="Tên pháp lý doanh nghiệp"
                                            placeholder="Tên trên giấy phép kinh doanh"
                                            value={formData.legalName}
                                            onChange={(v) => handleInputChange('legalName', v)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Mô tả nhà xe</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Giới thiệu ngắn gọn về nhà xe của bạn..."
                                        rows={4}
                                        className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-2xl px-8 py-5 outline-none focus:bg-white focus:border-brand-primary/30 focus:ring-[10px] focus:ring-brand-primary/5 transition-all font-bold text-base text-slate-900 placeholder:text-slate-300 placeholder:font-medium resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: BUSINESS CREDENTIALS & UPLOAD */}
                    {step === 2 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                        <FileText className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Giấy tờ kinh doanh</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <FormInput
                                        label="Mã số thuế (MST)"
                                        placeholder="Mã số thuế 10 chữ số"
                                        value={formData.taxCode}
                                        onChange={(v) => handleInputChange('taxCode', v)}
                                    />
                                    <FormInput
                                        label="Số giấy phép kinh doanh"
                                        placeholder="Nhập số giấy phép"
                                        value={formData.businessRegNum}
                                        onChange={(v) => handleInputChange('businessRegNum', v)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-8 pt-10 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                        <Upload className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight text-slate-900">Tải lên tài liệu</h3>
                                </div>

                                <div className="flex justify-center">
                                    <input
                                        type="file"
                                        ref={licenseFileInputRef}
                                        onChange={(e) => handleFileUpload(e, 'businessLicenseUrl')}
                                        accept="image/*,.pdf"
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => !isUploading && licenseFileInputRef.current?.click()}
                                        className={cn(
                                            "w-full max-w-lg rounded-[2.5rem] transition-all text-center cursor-pointer group relative overflow-hidden",
                                            formData.businessLicenseUrl
                                                ? "h-80 border-0"
                                                : "p-10 border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-brand-primary/40",
                                            isUploading && "opacity-50 cursor-wait"
                                        )}
                                    >
                                        {isUploading ? (
                                            <div className="py-10">
                                                <Loader2 className="w-10 h-10 text-brand-primary animate-spin mx-auto mb-4" />
                                                <div className="text-sm font-black text-brand-primary animate-pulse">Đang tải lên...</div>
                                            </div>
                                        ) : formData.businessLicenseUrl ? (
                                            <div className="relative h-full w-full group/preview">
                                                <img
                                                    src={formData.businessLicenseUrl}
                                                    alt="Business License"
                                                    className="w-full h-full object-cover rounded-[2.5rem]"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-[2.5rem] backdrop-blur-[2px]">
                                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-lg scale-90 group-hover/preview:scale-100 transition-transform duration-500">
                                                        <Check className="w-6 h-6 text-emerald-500 stroke-[3]" />
                                                    </div>
                                                    <div className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">Click để thay đổi ảnh</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-primary" />
                                                </div>
                                                <div className="text-sm font-black text-slate-900 mb-2">Ảnh giấy phép kinh doanh</div>
                                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Bắt buộc (Định dạng: JPG, PNG, PDF)</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Representative Contact */}
                            <div className="bg-slate-50/50 rounded-[3rem] p-12 space-y-10 border border-white">
                                <div className="flex items-center justify-between font-black">
                                    <h4 className="text-base text-slate-900 tracking-tight">Người đại diện liên hệ</h4>
                                    <button type="button" className="text-brand-primary text-[10px] uppercase tracking-widest hover:underline">Sử dụng thông tin chủ xe</button>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8">
                                    <input
                                        className="bg-transparent border-b-2 border-slate-200 py-3 outline-none focus:border-brand-primary transition-colors font-bold text-base placeholder:text-slate-300"
                                        placeholder="Tên liên hệ"
                                        value={formData.contactName}
                                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                                    />
                                    <input
                                        className="bg-transparent border-b-2 border-slate-200 py-3 outline-none focus:border-brand-primary transition-colors font-bold text-base placeholder:text-slate-300"
                                        placeholder="Email liên hệ"
                                        value={formData.contactEmail}
                                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                    />
                                    <input
                                        className="bg-transparent border-b-2 border-slate-200 py-3 outline-none focus:border-brand-primary transition-colors font-bold text-base placeholder:text-slate-300"
                                        placeholder="SĐT liên hệ"
                                        value={formData.contactPhone}
                                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: ADDRESS DETAILS */}
                    {step === 3 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                                        <MapPin className="w-6 h-6 text-rose-500" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Chi tiết địa chỉ</h3>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <FormInput
                                            label="Địa chỉ (Số nhà, tên đường)"
                                            placeholder="VD: 123 Nguyễn Huệ"
                                            value={formData.address}
                                            onChange={(v) => handleInputChange('address', v)}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <FormInput
                                            label="Phường / Xã"
                                            placeholder="Nhập tên phường/xã"
                                            value={formData.ward}
                                            onChange={(v) => handleInputChange('ward', v)}
                                        />
                                        <FormInput
                                            label="Tỉnh / Thành phố (Province)"
                                            placeholder="Nhập tên tỉnh/thành phố"
                                            value={formData.province}
                                            onChange={(v) => handleInputChange('province', v)}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <FormInput
                                            label="Quốc gia"
                                            placeholder="VD: Việt Nam"
                                            value={formData.country}
                                            onChange={(v) => handleInputChange('country', v)}
                                        />
                                        <FormInput
                                            label="Mã bưu điện"
                                            placeholder="VD: 70000"
                                            value={formData.postalCode}
                                            onChange={(v) => handleInputChange('postalCode', v)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: BANKING INFORMATION */}
                    {step === 4 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                            <CreditCard className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight text-slate-900">Thông tin ngân hàng</h3>
                                    </div>
                                    <span className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border border-slate-100">Payout</span>
                                </div>

                                <div className="space-y-10">
                                    <FormInput
                                        label="Tên ngân hàng"
                                        placeholder="VD: Vietcombank, Techcombank..."
                                        value={formData.bankName}
                                        onChange={(v) => handleInputChange('bankName', v)}
                                    />
                                    <FormInput
                                        label="Tên chủ tài khoản"
                                        placeholder="VIẾT HOA KHÔNG DẤU"
                                        value={formData.accountHolder}
                                        onChange={(v) => handleInputChange('accountHolder', v)}
                                        className="uppercase"
                                    />
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <FormInput
                                            label="Số tài khoản"
                                            placeholder="0001XXXXXX"
                                            value={formData.accountNumber}
                                            onChange={(v) => handleInputChange('accountNumber', v)}
                                        />
                                        <FormInput
                                            label="Chi nhánh"
                                            placeholder="Nhập tên chi nhánh"
                                            value={formData.bankBranch}
                                            onChange={(v) => handleInputChange('bankBranch', v)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Agreement */}
                            <div className="bg-brand-primary/5 rounded-[3rem] p-12 flex gap-8 border border-brand-primary/10">
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                    <Globe className="w-7 h-7 text-brand-primary" />
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight">Cam kết & Xác nhận</h4>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        Tôi cam đoan rằng các thông tin cung cấp trên đây là hoàn toàn đúng sự thật và chính xác. Tôi cho phép Go Routex xác minh thông tin với các cơ quan có thẩm quyền cho mục đích hợp tác.
                                    </p>
                                    <label className="flex items-center gap-4 cursor-pointer group pt-2">
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                                            formData.agreed ? "bg-brand-primary border-brand-primary" : "bg-white border-slate-200 group-hover:border-brand-primary/30"
                                        )}>
                                            <Check className={cn("w-3.5 h-3.5 text-white transition-all", formData.agreed ? "opacity-100 scale-110" : "opacity-0 scale-50")} strokeWidth={4} />
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.agreed}
                                            onChange={(e) => handleInputChange('agreed', e.target.checked)}
                                        />
                                        <span className="text-xs font-black uppercase text-slate-400 group-hover:text-slate-600 transition-colors tracking-wider">Tôi chấp nhận các điều khoản & điều kiện</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-2 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                            >
                                <ArrowLeft className="w-4 h-4" /> Quay lại
                            </button>
                        ) : (
                            <div />
                        )}

                        {error && (
                            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={(step === 4 && (!formData.agreed || isSubmitting))}
                            className={cn(
                                "flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95",
                                step === 4
                                    ? "bg-brand-secondary text-white shadow-brand-secondary/20 hover:bg-brand-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    : "bg-slate-900 text-white hover:bg-brand-primary shadow-slate-200"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    {step === 4 ? 'Gửi yêu cầu đăng ký' : 'Tiếp theo'}
                                    <ChevronRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}

function FormInput({ label, placeholder, value, onChange, type = 'text', className, icon }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    className?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{label}</label>
            <div className="relative group">
                <input
                    required
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full bg-slate-50/50 border-2 border-slate-50 rounded-2xl px-8 py-5 outline-none focus:bg-white focus:border-brand-primary/30 focus:ring-[10px] focus:ring-brand-primary/5 transition-all font-bold text-base text-slate-900 placeholder:text-slate-300 placeholder:font-medium",
                        icon && "pr-14",
                        className
                    )}
                />
                {icon && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
