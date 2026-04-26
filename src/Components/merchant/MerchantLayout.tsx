import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { MerchantSidebar } from './MerchantSidebar'
import { RightSidebar } from '../RightSidebar';
import { TopNav } from '../TopNav';
import { ADMIN_MERCHANT_ACTION_BASE_URL } from '../../utils/api';
import { createAuthorizedEnvelopeHeaders } from '../../utils/requestMeta';

export function MerchantLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('merchant-theme')
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.dataset.merchantTheme = isDarkMode ? 'dark' : 'light'
    localStorage.setItem('merchant-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const [merchantInfo, setMerchantInfo] = useState<{ displayName: string; logoUrl: string } | null>(null)

  // Helper function để giải mã token lấy merchantId
  const getMerchantIdFromToken = () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.merchantId || payload.sub; // Ưu tiên merchantId trong claims
    } catch (e) {
      console.error("Lỗi giải mã token:", e);
      return null;
    }
  };

  useEffect(() => {
    const fetchMerchantProfile = async () => {
      const merchantId = getMerchantIdFromToken();
      if (!merchantId) {
        console.warn("Không tìm thấy merchantId trong token");
        return;
      }

      try {
        // Gọi API lấy thông tin profile kèm merchantId query param
        const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/profile?merchantId=${merchantId}`, {
          headers: createAuthorizedEnvelopeHeaders()
        });
        const result = await response.json();
        if (result.data) {
          setMerchantInfo({
            displayName: result.data.displayName || result.data.name || 'Merchant Hub',
            logoUrl: result.data.logoUrl || ''
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin đối tác:", err);
      }
    };

    fetchMerchantProfile();
  }, []);

  return (
    <div
      data-merchant-theme={isDarkMode ? 'dark' : 'light'}
      className={`merchant-shell flex h-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}
    >
      {/* Left Sidebar */}
      <MerchantSidebar 
        collapsed={isSidebarCollapsed} 
        isDarkMode={isDarkMode} 
        merchantName={merchantInfo?.displayName}
        merchantLogo={merchantInfo?.logoUrl}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
        <TopNav
          isSidebarCollapsed={isSidebarCollapsed}
          isRightSidebarVisible={isRightSidebarVisible}
          isDarkMode={isDarkMode}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
          onToggleRightSidebar={() => setIsRightSidebarVisible((value) => !value)}
          onToggleTheme={() => setIsDarkMode((value) => !value)}
        />
        <main className={`flex-1 overflow-y-auto p-6 lg:p-10 max-w-[1600px] mx-auto w-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
          <Outlet />
        </main>
      </div>

      {/* Right Sidebar */}
      <RightSidebar visible={isRightSidebarVisible} isDarkMode={isDarkMode} />
    </div>
  )
}
