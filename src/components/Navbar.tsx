import { BookOpen, Camera, GitCompare, Grid, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'viewer' | 'compare' | 'inspector' | 'theory';
  setActiveTab: (tab: 'viewer' | 'compare' | 'inspector' | 'theory') => void;
  onReset: () => void;
}

export function Navbar({ activeTab, setActiveTab, onReset }: NavbarProps) {
  const tabs = [
    {
      id: 'viewer' as const,
      label: '1. Phòng Thí Nghiệm Biên',
      icon: Camera,
    },
    {
      id: 'compare' as const,
      label: '2. So Sánh 4 Toán Tử',
      icon: GitCompare,
    },
    {
      id: 'inspector' as const,
      label: '3. Kính Hiển Vi Ma Trận',
      icon: Grid,
    },
    {
      id: 'theory' as const,
      label: '4. Lý Thuyết & Báo Cáo',
      icon: BookOpen,
    },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300">
          {/* Left Title & Branding */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/15 to-indigo-500/15 text-sky-800 border border-sky-300/50 shadow-2xs">
                  Đề Tài 22 • Xử Lý Ảnh Số
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Realtime Vision</span>
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 bg-clip-text text-transparent">
                Phát Hiện Biên Đạo Hàm Bậc Nhất
              </h1>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/60 p-1.5 rounded-2xl border border-white/60 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 rounded-xl" />
                  )}
                  <Icon className="relative z-10 w-3.5 h-3.5" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onReset}
              className="text-xs px-3.5 py-1.5 rounded-xl border border-sky-200/80 bg-white/80 hover:bg-sky-50 text-sky-800 transition-all font-semibold shadow-xs hover:shadow-sm active:scale-95"
              title="Đặt lại cài đặt mặc định"
            >
              Mặc định
            </button>
          </div>
        </div>

        {/* Mobile Tab Scrollbar */}
        <div className="flex lg:hidden overflow-x-auto mt-2 py-1 space-x-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sky-500/25'
                    : 'glass-panel-subtle text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
