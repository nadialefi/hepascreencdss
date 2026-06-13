'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  History, 
  LogOut, 
  Menu,
  X,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [fullName, setFullName] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('full_name') || 'Pengguna';
    
    if (!token) {
      router.push('/login');
    } else {
      setRole(userRole);
      setFullName(userName);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('full_name');
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'medis'] },
    { name: 'Pemeriksaan (Screening)', href: '/dashboard/screening', icon: Stethoscope, roles: ['medis'] },
    { name: 'Riwayat', href: '/dashboard/history', icon: History, roles: ['medis'] },
    { name: 'Manajemen Pengguna', href: '/dashboard/users', icon: Users, roles: ['admin'] },
  ];

  if (!role) return null; // Avoid hydration mismatch or flashing content

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col print:hidden`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Activity className="w-6 h-6 text-medical-600 mr-2" />
          <span className="text-lg font-bold text-slate-800">HepaScreen</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.filter(item => item.roles.includes(role)).map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-medical-50 text-medical-700' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 w-5 h-5 ${isActive ? 'text-medical-600' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:bg-white">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 print:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 ml-2 lg:ml-0 capitalize">
              {pathname.split('/').pop() || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-medical-100 text-medical-700 flex items-center justify-center font-bold text-sm uppercase">
              {fullName ? fullName.charAt(0) : (role === 'admin' ? 'A' : 'M')}
            </div>
            <div className="ml-3 hidden sm:flex flex-col">
              <span className="text-sm font-bold text-slate-700">
                {fullName}
              </span>
              <span className="text-xs font-medium text-slate-500 capitalize leading-none mt-0.5">
                {role === 'admin' ? 'Administrator' : 'Tenaga Medis'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto print:max-w-none print:m-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
