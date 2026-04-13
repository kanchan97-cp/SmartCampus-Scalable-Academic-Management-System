import {
  Bell,
  BookOpen,
  ChartNoAxesCombined,
  GraduationCap,
  LogOut,
  Moon,
  PanelLeft,
  Sun,
  Users,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navByRole = {
  admin: [
    { id: "overview", label: "Overview", icon: ChartNoAxesCombined },
    { id: "users", label: "Users", icon: Users },
    { id: "courses", label: "Courses", icon: BookOpen },
  ],
  faculty: [
    { id: "overview", label: "Overview", icon: ChartNoAxesCombined },
    { id: "attendance", label: "Attendance", icon: Users },
    { id: "assignments", label: "Assignments", icon: BookOpen },
  ],
  student: [
    { id: "overview", label: "Overview", icon: ChartNoAxesCombined },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "performance", label: "Performance", icon: GraduationCap },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
};

export function AppShell({
  children,
  activeView,
  onNavigate,
}: {
  children: ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const nav = user ? navByRole[user.role] : [];

  return (
    <div className="shell">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="brand">
          <div className="brand-mark">SC</div>
          <div>
            <strong>SmartCampus</strong>
            <span>Academic OS</span>
          </div>
        </div>

        <nav className="side-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activeView === item.id ? "active" : ""}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="ghost-button" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>
          <button className="ghost-button danger" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button" onClick={() => setCollapsed((value) => !value)}>
            <PanelLeft size={19} />
          </button>
          <div>
            <p className="kicker">Welcome back</p>
            <h1>{user?.name}</h1>
          </div>
          <div className="profile-chip">
            <span>{user?.role}</span>
            <strong>{user?.email}</strong>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
