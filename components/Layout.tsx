import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, CirclePlus, History, TrendingUp, Sparkles, Settings } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
import GlobalChat from '@/components/GlobalChat';

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

const GlobalChatButton: React.FC = () => {
  const [unread, setUnread] = React.useState<{ user: boolean; dev: boolean } | false>(() => {
    const stored = localStorage.getItem("chat_unread_state");
    return stored ? JSON.parse(stored) : false;
  });

  React.useEffect(() => {
    const onUnread = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setUnread(detail);
      localStorage.setItem("chat_unread_state", JSON.stringify(detail));
    };
    window.addEventListener("chat-unread", onUnread);
    return () => window.removeEventListener("chat-unread", onUnread);
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("toggle-global-chat"));
  };

  return (
    <button
      onClick={handleClick}
      className="relative text-gray-400 hover:text-brand-orange transition-colors"
      aria-label="Toggle global chat"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.477 2 2 6.253 2 11.5c0 2.304.87 4.41 2.306 6.038L3.05 21.15a.75.75 0 0 0 .943.943l3.773-1.22A10.12 10.12 0 0 0 12 21c5.523 0 10-4.253 10-9.5S17.523 2 12 2Z" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="8.5" cy="11.5" r="1" fill="currentColor"/>
        <circle cx="12" cy="11.5" r="1" fill="currentColor"/>
        <circle cx="15.5" cy="11.5" r="1" fill="currentColor"/>
      </svg>
      {unread && unread.dev && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 ring-1 ring-dark-card" />
      )}
      {unread && unread.user && (
        <span className={`absolute -top-0.5 w-2 h-2 rounded-full bg-brand-orange ring-1 ring-dark-card ${unread.dev ? "-right-1.5" : "-right-0.5"}`} />
      )}
    </button>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useUser();

  return (
    <>
      <style>
        {`
          .cl-internal-cieags {
            display: none !important;
          }
          .cl-avatarBox::before,
          .cl-avatarBox::after {
            display: none !important;
          }
        `}
      </style>
      <div className="min-h-screen text-gray-200 flex flex-col lg:flex-row">
        {/* Mobile/Tablet Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-transparent backdrop-blur-xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold julee-regular gradient-text">Runa</h1>
          <div className="flex items-center gap-3">
            <GlobalChatButton />
            <UserButton afterSignOutUrl="/#/login" />
          </div>
        </header>

        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-dark-card border-r border-dark-border p-4 lg:sticky lg:top-0 lg:h-screen">
          <div>
            <h1 className="text-2xl font-bold mb-1 julee-regular gradient-text">Runa</h1>
            <p className="text-sm text-gray-400 mb-8">User: <span className="font-bold text-gray-300">{user?.firstName || user?.username || 'User'}</span></p>
          </div>
          <nav className="flex flex-col space-y-2 flex-grow relative">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="desktop-active-tab"
                        className="absolute inset-0 bg-brand-orange rounded-lg"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35
                        }}
                      />
                    )}
                    <item.icon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-3 p-3">
            <UserButton 
              afterSignOutUrl="/#/login"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-dark-card border-dark-border",
                }
              }}
            />
            <span className="text-sm text-gray-400">Account</span>
            <GlobalChatButton />
          </div>
        </aside>

        {/* Bottom Navbar for Mobile & Tablet */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-transparent backdrop-blur-xl flex justify-around p-1.5 z-50">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1 rounded-md w-12 sm:w-14 md:w-16 transition-colors duration-200 ${isActive ? 'text-brand-orange' : 'text-gray-400 hover:text-white'
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
      <GlobalChat />
    </>
  );
};

export default Layout;
