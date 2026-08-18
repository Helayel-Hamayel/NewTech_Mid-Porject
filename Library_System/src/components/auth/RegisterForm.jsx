import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register({ onToggle }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
    bio: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  // Prevent selecting today or future dates for Date of Birth
  const todayDate = new Date();
  todayDate.setDate(todayDate.getDate() - 1);
  const maxDate = todayDate.toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Secondary validation check for birth date
    if (formData.dateOfBirth >= new Date().toISOString().split("T")[0]) {
      setError("Date of birth must be in the past.");
      return;
    }

    setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      formData.name,
    )}`;

    const extraData = {
      name: formData.name,
      dateOfBirth: formData.dateOfBirth,
      bio: formData.bio,
      role: "Member",
      joinedDate: today,
      avatar: avatarUrl,
      activeLoansCount: 0,
      isAdmin: false,
      isStaff: false,
      isSuspended: false,
    };

    const result = await register(
      formData.email.trim(),
      formData.password,
      extraData,
    );

    if (result.success) {
      navigate("/catalogue");
    } else {
      setError(result.error || "Failed to create account.");
    }

    setLoading(false);
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <h2>Register User</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div>
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Dania"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Full Email Field */}
        <div>
          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="dania@library.org"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password with Show/Hide Toggle */}
        <div>
          <label htmlFor="password">Password:</label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Date of Birth with Max Date Protection */}
        <div>
          <label htmlFor="dateOfBirth">Date of Birth:</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            max={maxDate}
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            name="bio"
            rows="3"
            placeholder="Loves cataloging and organizing community events..."
            value={formData.bio}
            onChange={handleChange}
          ></textarea>
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>
      </form>

      <section>
        <p>Already a member? Login here!</p>
        <button onClick={onToggle}>Sign in!</button>
      </section>
    </section>
  );
}