import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { members } from "../../data/Members"; // Your members array

export default function Login({ handleRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();

    const foundUser = members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );

    if (foundUser) {
      login(foundUser); 
      navigate("/catalogue"); 
    } else {
      setError("Invalid email or user not found!");
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
        <button type="button" onClick={handleRegister}>
          Sign up!
        </button>
      </section>
    </section>
  );
}