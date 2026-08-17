import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
    <section>
      <h2>Login</h2>
      <p>Welcome back! Please enter your details to continue.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form className="form-grid" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>

      <section>
        <p>New member? Register here!</p>
        <button type="button" onClick={onToggle}>
          Sign up!
        </button>
      </section>
    </section>
  );
}