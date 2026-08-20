import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth/RegisterForm.css";

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
    <section className="register-card">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="register-title">Register User</h2>

        {error && <p className="register-error">{error}</p>}

        <div className="register-field">
          <label htmlFor="name" className="register-label">
            Full Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="register-input"
            placeholder="Dania"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Full Email Field */}
        <div className="register-field">
          <label htmlFor="email" className="register-label">
            Email Address:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="register-input"
            placeholder="dania@library.org"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password with Show/Hide Toggle */}
        <div className="register-field">
          <label htmlFor="password" className="register-label">
            Password:
          </label>
          <div className="register-password-group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="register-input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <button
              type="button"
              className="register-toggle-pwd-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Date of Birth with Max Date Protection */}
        <div className="register-field">
          <label htmlFor="dateOfBirth" className="register-label">
            Date of Birth:
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            className="register-input"
            max={maxDate}
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="register-field">
          <label htmlFor="bio" className="register-label">
            Bio:
          </label>
          <textarea
            id="bio"
            name="bio"
            className="register-textarea"
            rows="3"
            placeholder="Loves cataloging and organizing community events..."
            value={formData.bio}
            onChange={handleChange}
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            className="register-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>
      </form>

      <section className="register-footer-section">
        <p className="register-footer-text">Already a member? Login here!</p>
        <button
          type="button"
          className="register-switch-btn"
          onClick={onToggle}
        >
          Sign in!
        </button>
      </section>
    </section>
  );
}
