import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../components/auth/LoginForm";
import Register from "../components/auth/RegisterForm";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = () => {
    setIsRegistering((prev) => !prev);
  };

  // Quick login helper function
  const handleDemoLogin = async (email) => {
    setDemoLoading(true);
    setDemoError("");

    const result = await login(email, "freeman123");

    if (result?.success) {
      navigate("/catalogue");
    } else {
      setDemoError(result?.error || `Failed to sign in as ${email}`);
    }

    setDemoLoading(false);
  };

  return (
    <div>
      <aside>
        <p>Meridian Library</p>
        <h2>Every Book a door</h2>
        <p>
          Access our catalog of over 12,000 titles. Browse by genre, year, or
          author — and check availability in real time.
        </p>
        <footer>MERIDIAN PUBLIC LIBRARY — EST. 1912</footer>
      </aside>

      <main>
        {isRegistering ? (
          <Register onToggle={handleRegister} />
        ) : (
          <Login onToggle={handleRegister} />
        )}

        {/* DEMO ONE-CLICK LOGIN SECTION */}
        <section
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px dashed #eab308",
            borderRadius: "8px",
            backgroundColor: "#fefce8",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "16px" }}>
            🧪 Quick Demo Access
          </h3>
          <p style={{ margin: "0 0 1rem 0", fontSize: "13px", color: "#666" }}>
            Click a role to sign in instantly for testing:
          </p>

          {demoError && (
            <p style={{ color: "red", fontSize: "13px", marginBottom: "0.5rem" }}>
              {demoError}
            </p>
          )}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleDemoLogin("dania@library.org")}
            >
              Admin (Dania)
            </button>

            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleDemoLogin("omar@library.org")}
            >
              Staff (Omar)
            </button>

            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleDemoLogin("tareq@email.com")}
            >
              Customer (Tareq)
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}