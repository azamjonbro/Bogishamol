import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
 LayoutDashboard, Package, ShoppingCart, ArrowLeftRight,
 CreditCard, Receipt, BarChart3, Settings, LogOut, Menu, X, Wheat
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navItems = [
 { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
 { to: '/products', icon: Package, label: 'Mahsulotlar' },
 { to: '/pos', icon: ShoppingCart, label: 'POS Savdo' },
 { to: '/transactions', icon: ArrowLeftRight, label: 'Tranzaksiyalar' },
 { to: '/nasiya', icon: CreditCard, label: 'Nasiya' },
 { to: '/expenses', icon: Receipt, label: 'Harajatlar' },
 { to: '/report', icon: BarChart3, label: 'Hisobot' },
 { to: '/settings', icon: Settings, label: 'Sozlamalar' },
];

export default function Layout() {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const [sidebarOpen, setSidebarOpen] = useState(false);

 const handleLogout = () => {
  logout();
  navigate('/login');
 };

 return (
  <div className="min-h-screen flex bg-surface-950">
   {/* Mobile overlay */}
   {sidebarOpen && (
    <div
     className="fixed inset-0 bg-black/50 z-40 lg:hidden"
     onClick={() => setSidebarOpen(false)}
    />
   )}

   {/* Sidebar */}
   <aside
    className={`fixed inset-y-0 left-0 z-50 w-64 glass flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
     sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}
   >
    <div className="p-5 border-b border-surface-700/50">
     <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-sm">
       <Wheat className="w-5 h-5" />
      </div>
      <div>
       <h1 className="text-lg font-bold text-surface-100">
        Bog'ishamol
       </h1>
       <p className="text-xs text-surface-400">Yemxona ERP & POS</p>
      </div>
     </div>
    </div>

    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
     {navItems.map(({ to, icon: Icon, label }) => (
      <NavLink
       key={to}
       to={to}
       end={to === '/'}
       onClick={() => setSidebarOpen(false)}
       className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
         isActive
          ? 'bg-primary-600 text-white font-semibold shadow-sm'
          : 'text-surface-300 hover:text-surface-100 hover:bg-surface-800/60'
        }`
       }
      >
       <Icon className="w-[18px] h-[18px]" />
       {label}
      </NavLink>
     ))}
    </nav>

    <div className="p-3 border-t border-surface-700/50 space-y-2">
     <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-800/40">
      <div className="flex items-center gap-2.5 min-w-0">
       <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-500 font-semibold text-xs shrink-0">
        {(user?.fullName || user?.username || 'A').charAt(0).toUpperCase()}
       </div>
       <div className="min-w-0">
        <p className="text-xs font-semibold text-surface-200 truncate">
         {user?.fullName || user?.username}
        </p>
        <p className="text-[11px] text-surface-500">Admin</p>
       </div>
      </div>
      <ThemeToggle />
     </div>
     <button
      onClick={handleLogout}
      id="logout-button"
      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium text-surface-400 hover:text-danger-500 hover:bg-danger-500/10 transition-all duration-200"
     >
      <LogOut className="w-4 h-4" />
      Chiqish
     </button>
    </div>
   </aside>

   {/* Main content */}
   <main className="flex-1 min-w-0">
    {/* Mobile header */}
    <header className="lg:hidden flex items-center justify-between p-4 glass">
     <button
      onClick={() => setSidebarOpen(true)}
      className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
      id="mobile-menu-button"
     >
      <Menu className="w-5 h-5 text-surface-300" />
     </button>
     <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm">
       <Wheat className="w-4 h-4 text-white" />
      </div>
      <span className="font-semibold text-surface-100 text-sm">Bog'ishamol Yemxona</span>
     </div>
     <ThemeToggle />
    </header>

    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto animate-fade-in">
     <Outlet />
    </div>
   </main>
  </div>
 );
}
