import { useState } from "react";
import Login from "../components/introduction/Login";
import Register from "../components/introduction/Register";

export default function Introduction() {
  const [isRegistering, setIsRegistering] = useState(false);
  const handleRegister = () => {
      setIsRegistering((prev) => !prev);
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
      </main>
    </div>
  );
}


