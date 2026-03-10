import { useState } from "react";
import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { BarChart3, Users, Image, Building2, Flag, LogOut, Menu, ChevronLeft } from "lucide-react";

const navItems = [
  { label: 'Tableau de bord', icon: BarChart3, path: '/dashboard' },
  { label: 'Utilisateurs', icon: Users, path: '/users' },
  { label: 'Publications', icon: Image, path: '/posts' },
  { label: 'Entreprises', icon: Building2, path: '/companies' },
  { label: 'Signalements', icon: Flag, path: '/reports', badge: 8 },
];

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem('racynkx_admin') || '{"name":"Admin"}');

  const handleLogout = () => {
    localStorage.removeItem('racynkx_admin');
    navigate('/login');
  };

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className="flex flex-col h-full">
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative group ${
                active
                  ? 'bg-[hsl(216_100%_59%/0.1)] text-rx-blue'
                  : 'text-rx-text-secondary hover:bg-[hsl(0_0%_100%/0.04)] hover:text-foreground'
              }`}
            >
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-rx-blue rounded-r-full" />}
              <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
              {!collapsed && (
                <span className="font-ui font-medium text-[13px] tracking-wide truncate">{item.label}</span>
              )}
              {item.badge && item.badge > 0 && (
                <span className={`${collapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'} bg-rx-danger text-foreground text-[10px] font-ui font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <button onClick={handleLogout}
          className={`flex items-center gap-2.5 text-rx-danger-muted hover:text-rx-danger transition-colors font-ui text-[13px] w-full px-3 py-2 rounded-lg hover:bg-[hsl(0_72%_57%/0.06)] ${collapsed ? 'justify-center' : ''}`}>
          <LogOut size={16} strokeWidth={1.8} />
          {!collapsed && <span>Se déconnecter</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-border bg-background shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="text-rx-text-secondary hover:text-foreground transition-colors lg:hidden">
            <Menu size={20} strokeWidth={1.8} />
          </button>
          <span className="font-logo text-foreground text-[22px] tracking-wide">RACYNKX</span>
          <div className="hidden lg:block w-px h-5 bg-border mx-1" />
          <span className="hidden lg:inline font-ui text-xs text-rx-text-muted tracking-wide">Administration</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="font-ui text-[13px] text-rx-text-secondary hidden sm:inline">{admin.name}</span>
          <button onClick={handleLogout} className="font-ui text-[13px] text-rx-danger-muted hover:text-rx-danger transition-colors">
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col border-r border-border bg-background shrink-0 transition-all duration-200 relative ${
          sidebarOpen ? 'w-56' : 'w-[60px]'
        }`}>
          <SidebarContent collapsed={!sidebarOpen} />
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-6 w-6 h-6 bg-rx-elevated border border-border rounded-full flex items-center justify-center text-rx-text-muted hover:text-foreground transition-colors z-10">
            <ChevronLeft size={14} className={`transition-transform duration-200 ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <>
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 lg:hidden animate-fade-in" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="fixed left-0 top-14 bottom-0 w-56 bg-background border-r border-border z-50 lg:hidden">
              <SidebarContent collapsed={false} />
            </aside>
          </>
        )}

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
