import React, { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, List, BarChart2, Zap, Settings, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/add-run', label: 'Add Run', icon: PlusCircle },
  { path: '/history', label: 'History', icon: List },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/insights', label: 'Insights', icon: Zap },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-gray-200 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-card border-r border-dark-border p-4 md:sticky md:top-0 md:h-screen">
        <div>
          <h1 className="text-2xl font-bold text-brand-orange mb-1">FitAI</h1>
          <p className="text-sm text-gray-400 mb-8">User: <span className="font-bold text-gray-300">{currentUser}</span></p>
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
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 w-full rounded-lg transition-colors duration-200 hover:bg-red-500/20 text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Bottom Navbar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border flex justify-around p-2 z-50">
         {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1 rounded-md w-16 transition-colors duration-200 ${
                  isActive ? 'text-brand-orange' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
      </nav>

      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
