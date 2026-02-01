import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CirclePlus, History, TrendingUp, Sparkles, Settings } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/add-run', label: 'Run', icon: CirclePlus },
  { path: '/history', label: 'History', icon: History },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/insights', label: 'Insights', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useUser();

  return (
    <>
      <style>
      </style>
      <div className="min-h-screen text-gray-200 flex flex-col lg:flex-row">
        {/* Mobile/Tablet Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-dark-card border-b border-dark-border px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold julee-regular gradient-text">Runa</h1>
          <UserButton afterSignOutUrl="/#/login" />
        </header>

        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-dark-card border-r border-dark-border p-4 lg:sticky lg:top-0 lg:h-screen">
          <div>
            <h1 className="text-2xl font-bold mb-1 julee-regular gradient-text">Runa</h1>
            <p className="text-sm text-gray-400 mb-8">User: <span className="font-bold text-gray-300">{user?.firstName || user?.username || 'User'}</span></p>
          </div>
          <nav className="flex flex-col space-y-2 flex-grow">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-brand-orange text-white' : 'hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-3 p-3">
            <UserButton afterSignOutUrl="/#/login" />
            <span className="text-sm text-gray-400">Account</span>
          </div>
        </aside>

        {/* Bottom Navbar for Mobile & Tablet */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border flex justify-around p-1.5 z-50">
           {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center p-1 rounded-md w-12 sm:w-14 md:w-16 transition-colors duration-200 ${
                    isActive ? 'text-brand-orange' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 sm:w-5 sm:h-5 mb-0.5" />
                <span className="text-[10px] sm:text-xs">{item.label}</span>
              </NavLink>
            ))}
        </nav>

        <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
