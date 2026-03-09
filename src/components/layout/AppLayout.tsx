import { useState } from "react";
import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { BarChart3, Users, Image, Building2, Flag, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { label: 'TABLEAU DE BORD', icon: BarChart3, path: '/dashboard' },
  { label: 'UTILISATEURS', icon: Users, path: '/users' },
  { label: 'PUBLICATIONS', icon: Image, path: '/posts' },
  { label: 'ENTREPRISES', icon: Building2, path: '/companies' },
  { label: 'SIGNALEMENTS', icon: Flag, path: '/reports', badge: 8 },
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md transition-colors relative ${
                active
                  ? 'bg-[hsl(216_100%_59%/0.08)] text-rx-blue border-l-2 border-rx-blue'
                  : 'text-rx-text-secondary hover:bg-[hsl(0_0%_100%/0.04)] hover:text-foreground border-l-2 border-transparent'
              }`}
            >
              <item.icon size={18} />
              {(sidebarOpen || mobileSidebarOpen) && (
                <span className="font-display-semibold text-[13px] uppercase tracking-wide">{item.label}</span>
              )}
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-rx-danger text-foreground text-[10px] font-ui font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-rx-danger-muted hover:text-rx-danger transition-colors font-ui text-sm w-full">
          <LogOut size={16} />
          {(sidebarOpen || mobileSidebarOpen) && <span>Se déconnecter</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileSidebarOpen(!mobileSidebarOpen); }}
            className="text-rx-text-secondary hover:text-foreground transition-colors lg:hidden">
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-rx-text-secondary hover:text-foreground transition-colors hidden lg:block">
            <Menu size={20} />
          </button>
          <span className="font-logo text-foreground text-[22px] tracking-wide">RACYNKX</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-ui text-sm text-rx-text-secondary hidden sm:inline">{admin.name}</span>
          <button onClick={handleLogout} className="font-ui text-sm text-rx-danger-muted hover:text-rx-danger transition-colors">
            Se déconnecter
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col border-r border-border bg-background shrink-0 transition-all duration-200 ${
          sidebarOpen ? 'w-60' : 'w-16'
        }`}>
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <>
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="fixed left-0 top-14 bottom-0 w-60 bg-background border-r border-border z-50 lg:hidden">
              <SidebarContent />
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
