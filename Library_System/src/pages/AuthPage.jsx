import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../components/auth/LoginForm";
import Register from "../components/auth/RegisterForm";
import "../styles/pages/AuthPage.css";

const DEMO_PASSWORD = "freeman123";
const DEMO_ACCOUNTS = [
  { label: "Admin (Dania)", email: "dania@library.org" },
  { label: "Staff (Omar)", email: "omar@library.org" },
  { label: "Customer (Tareq)", email: "tareq@email.com" },
];

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (email) => {
    setDemoLoading(true);
    setDemoError("");

    const result = await login(email, DEMO_PASSWORD);
    if (result?.success) {
      navigate("/catalogue");
    } else {
      setDemoError(result?.error || `Failed to sign in as ${email}`);
    }

    setDemoLoading(false);
  };

  return (
    <div className="auth-page-container">
      <aside className="auth-hero-aside">
        <p className="auth-brand">Meridian Library</p>
        <h1 className="auth-tagline">Every book a door.</h1>
        <p className="auth-description">
          Browse the catalogue, manage loans, and explore over 12,000 titles.
        </p>
        <p className="auth-footer">Meridian Public Library - Est. 1912</p>
      </aside>

      <main className="auth-main-content">
        {isRegistering ? (
          <Register onToggle={() => setIsRegistering(false)} />
        ) : (
          <Login onToggle={() => setIsRegistering(true)} />
        )}

        <section className="demo-access-card">
          <h3 className="demo-access-title">Quick Demo Access</h3>
          <p className="demo-access-subtitle">
            Sign in instantly with a sample library role.
          </p>
          {demoError && <p className="demo-error-text">{demoError}</p>}
          <div className="demo-buttons-group">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="btn-demo"
                disabled={demoLoading}
                onClick={() => handleDemoLogin(account.email)}
              >
                {account.label}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
