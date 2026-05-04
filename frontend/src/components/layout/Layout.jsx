import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, LogOut, CheckSquare, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-surface-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-surface-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <CheckSquare size={16} className="text-white" />
            </div>
            <span className="font-display font-700 text-lg text-ink">TeamTask</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-muted hover:bg-surface-50 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-brand-600' : 'text-ink-subtle group-hover:text-ink-muted'} />
                  {label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-brand-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-surface-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-brand-700">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-ink-subtle truncate">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-ink-subtle hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
