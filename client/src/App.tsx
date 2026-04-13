import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { FacultyDashboard } from "./pages/faculty/FacultyDashboard";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { AppShell } from "./components/AppShell";

function AuthenticatedApp() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("overview");

  if (!user) return <LoginPage />;

  const renderDashboard = () => {
    if (user.role === "admin") return <AdminDashboard activeView={activeView} />;
    if (user.role === "faculty") return <FacultyDashboard activeView={activeView} />;
    return <StudentDashboard activeView={activeView} />;
  };

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      {renderDashboard()}
    </AppShell>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
