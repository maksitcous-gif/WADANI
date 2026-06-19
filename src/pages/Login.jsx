import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      // Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Fetch Firestore user record
      const snap = await getDoc(doc(db, "users", uid));

      if (!snap.exists()) {
        setError("User record not found in Firestore.");
        return;
      }

      const data = snap.data();

      // Save role + permissions locally
      localStorage.setItem("role", data.role);
      localStorage.setItem("permissions", JSON.stringify(data.permissions));

      // Navigate to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);

      if (err.code === "auth/wrong-password") {
        setError("Wrong password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "permission-denied") {
        setError(
          "This account cannot read its profile right now. Please check Firestore permissions."
        );
      } else {
        setError("Login failed. Please try again.");
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <p className="login-subtitle">Welcome back. Sign in to access the admin dashboard.</p>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        {error && <div className="login-error">{error}</div>}

        <button
          className="forgot-btn"
          onClick={() => navigate("/reset-password")}
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
}

export default Login;
