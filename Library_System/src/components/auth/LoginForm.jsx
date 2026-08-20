import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth/LoginForm.css";

export default function Login({ onToggle }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Calls Firestore/Firebase Auth through AuthContext
    const result = await login(email, password);

    if (result.success) {
      navigate("/catalogue");
    } else {
      setError(result.error || "Invalid email or user not found!");
    }
  };

  return (
    <section className="auth-card">
      <h2 className="auth-title">Login</h2>
      <p className="auth-subtitle">
        Welcome back! Please enter your details to continue.
      </p>

      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-field">
          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="auth-field">
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-submit-btn">
          Sign In
        </button>
      </form>

      <section className="auth-footer-section">
        <p className="auth-footer-text">New member? Register here!</p>
        <button type="button" className="auth-toggle-btn" onClick={onToggle}>
          Sign up!
        </button>
      </section>
    </section>
  );
}
