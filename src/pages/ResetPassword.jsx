import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleReset() {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Redirecting...");

      // 🔥 Redirect back to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error(err);
      setMessage("Could not send reset email.");
    }
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h2>Reset Password</h2>

        <p className="reset-subtitle">
          Enter your email address and we'll send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="reset-btn" onClick={handleReset}>
          Send Reset Link
        </button>

        {message && (
          <p className="reset-message">{message}</p>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
