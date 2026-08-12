import { useState } from "react";

export default function Register({onToggle}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    bio: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`;

    const newUserPayload = {
      ...formData,
      role: "Member", // Default role
      joinedDate: today,
      avatar: avatarUrl,
      activeLoansCount: 0,
      isAdmin: false,
      isStaff: false,
    };

    console.log("Submitting User Data:", newUserPayload);
  };

  return (
    <section>
            <form onSubmit={handleSubmit}>
        <h2>Register User</h2>

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

        <div>
          <label htmlFor="email">Email:</label>
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

        <div>
          <label htmlFor="dateOfBirth">Date of Birth:</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
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
          <button type="submit">Create Account</button>
        </div>
      </form>

      <section>
            <p>Already a member? Login here!</p>
            <button onClick={onToggle}>Sign in!</button>
      </section>
    </section>
  );
}