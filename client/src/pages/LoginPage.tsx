import { FormEvent, useState } from "react";
import { ArrowRight, Moon, ShieldCheck, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const demoUsers = [
  { label: "Admin", email: "admin@smartcampus.local" },
  { label: "Faculty", email: "faculty@smartcampus.local" },
  { label: "Student", email: "student@smartcampus.local" },
];

export function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("admin@smartcampus.local");
  const [password, setPassword] = useState("Password@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <button className="theme-float" onClick={toggleTheme}>
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        {theme === "light" ? "Dark" : "Light"}
      </button>

      <div className="login-hero">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="login-copy">
          <div className="brand large">
            <div className="brand-mark">SC</div>
            <div>
              <strong>SmartCampus</strong>
              <span>Unified academic control center</span>
            </div>
          </div>
          <h1>One calm dashboard for the whole campus.</h1>
          <p>
            Manage users, courses, enrollment, attendance, assignments and
            grades with role-aware access and a clean academic workflow.
          </p>
          <div className="feature-strip">
            <span>JWT Auth</span>
            <span>RBAC</span>
            <span>NeonDB</span>
          </div>
        </div>
      </div>

      <form className="login-card" onSubmit={submit}>
        <div className="login-card-head">
          <ShieldCheck size={28} />
          <div>
            <p className="kicker">Secure access</p>
            <h2>Log in</h2>
          </div>
        </div>

        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <div className="form-error">{error}</div> : null}

        <button className="primary-button" disabled={loading}>
          {loading ? "Signing in..." : "Enter dashboard"}
          <ArrowRight size={18} />
        </button>

        <div className="demo-users">
          <span>Quick login</span>
          <div>
            {demoUsers.map((user) => (
              <button
                type="button"
                key={user.email}
                onClick={() => {
                  setEmail(user.email);
                  setPassword("Password@123");
                }}
              >
                {user.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
