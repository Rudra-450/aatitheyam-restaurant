import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import {
  LayoutDashboard,
  Utensils,
  FolderTree,
  Store,
  QrCode,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  Sparkles,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { owner, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/foods', label: 'Food Items', icon: Utensils },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/restaurant', label: 'Restaurant Profile', icon: Store },
    { to: '/admin/qr', label: 'QR Code Studio', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#141620] border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-base">
            A
          </div>
          <span className="font-serif font-bold text-white text-base">Aatitheyam Cafe & Bhojnalaya</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#12141c] border-r border-white/5 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-serif font-bold text-xl shadow-lg shadow-amber-500/20">
              A
            </div>
            <div>
              <h2 className="font-serif font-bold text-white text-sm tracking-tight leading-tight">
                Aatitheyam
              </h2>
              <span className="text-[10px] text-amber-400 font-medium tracking-widest uppercase">
                Cafe & Bhojnalaya
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Public Menu Quick Link */}
        <div className="p-4 mx-4 mb-3 rounded-2xl bg-[#191b24] border border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer View</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-3">
            Preview the public read-only menu in real-time.
          </p>
          <a
            href="/menu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <span>Open Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold uppercase shrink-0">
              {owner?.username?.charAt(0) || 'O'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{owner?.username}</p>
              <p className="text-[10px] text-gray-400 truncate">{owner?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0d12] overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
