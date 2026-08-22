import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../components/auth/LoginForm";
import Register from "../components/auth/RegisterForm";
import "../styles/pages/AuthPage.css";
import authBackgroundOne from "../assets/authPage_Background/1.jpg";
import authBackgroundTwo from "../assets/authPage_Background/2.jpg";
import authBackgroundThree from "../assets/authPage_Background/3.jpg";

const DEMO_PASSWORD = "freeman123";
const DEMO_ACCOUNTS = [
  { label: "Admin (Dania)", email: "dania@library.org" },
  { label: "Staff (Omar)", email: "omar@library.org" },
  { label: "Customer (Tareq)", email: "tareq@email.com" },
];
const AUTH_BACKGROUNDS = [
  authBackgroundOne,
  authBackgroundTwo,
  authBackgroundThree,
];

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      setBackgroundIndex(
        (currentIndex) => (currentIndex + 1) % AUTH_BACKGROUNDS.length,
      );
    }, 8000); // hold the images for 8 seconds before rotating to next one

    return () => window.clearInterval(rotationTimer);
  }, []);

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
        {AUTH_BACKGROUNDS.map((background, index) => (
          <img
            key={background}
            className={`auth-hero-background ${
              index === backgroundIndex ? "active" : ""
            }`}
            src={background}
            alt=""
            aria-hidden="true"
          />
        ))}
        <div className="auth-hero-overlay" aria-hidden="true" />
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
