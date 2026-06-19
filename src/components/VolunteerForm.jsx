import { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./VolunteerForm.css";

function VolunteerForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    role: "",
    phone: ""
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Required fields
    if (!form.name || !form.email || !form.city || !form.role || !form.phone) {
      setError("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(form.email)) {
      setError("Invalid email format");
      return;
    }

    // Phone validation (basic)
    if (form.phone.length < 6) {
      setError("Phone number is too short");
      return;
    }

    try {
      await addDoc(collection(db, "volunteers"), {
        name: form.name,
        email: form.email,
        city: form.city,
        role: form.role,
        phone: form.phone,
        createdAt: serverTimestamp()
      });

      setSuccess("Thank you for registering!");
      setForm({ name: "", email: "", city: "", role: "", phone: "" });

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }
  }

  return (
    <section className="volunteer-section">
      <div className="volunteer-container">
        <h2 className="volunteer-title">Become a Volunteer</h2>
        <p className="volunteer-text">Join our community and help make a difference.</p>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <form onSubmit={handleSubmit} className="volunteer-form">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <input
            type="text"
            placeholder="Volunteer Role (e.g., Teacher, Helper)"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <button className="volunteer-btn" type="submit">Register</button>
        </form>
      </div>
    </section>
  );
}

export default VolunteerForm;
