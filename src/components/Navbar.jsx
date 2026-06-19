import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setIsAdmin(false);
        return;
      }

      setUser(u);

      // 🔥 MATCHES YOUR DASHBOARD
      const token = await u.getIdTokenResult();
      setIsAdmin(token.claims.admin === true);
    });

    return () => unsub();
  }, []);

  function handleLogout() {
    signOut(auth);
    navigate("/login");
  }

  return (
    <nav className="navbar">

      <div className="navbar-logo">
        <Link to="/">JUSTICE</Link>
      </div>

      <div className="navbar-links">

        <Link to="/">Home</Link>

        {!user && (
          <Link to="/login">Login</Link>
        )}

        {user && isAdmin && (
          <Link to="/dashboard">Dashboard</Link>
        )}

        {user && (
          <button
            className="navbar-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

      </div>

    </nav>
  );
}

export default Navbar;
