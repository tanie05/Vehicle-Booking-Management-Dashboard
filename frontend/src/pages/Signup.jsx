import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import styles from "./Signup.module.css";

export default function Signup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "customer", phone: "", city: "",
  });
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const update = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPhoneError("");
    if (form.phone.length !== 10 || !/^\d{10}$/.test(form.phone)) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }
    try {
      const res = await signup(form);
      saveAuth(res.data.data.token, res.data.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Sign Up</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Name</label>
          <input className={styles.input} placeholder="Your name" value={form.name}
            onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input className={styles.input} placeholder="you@example.com" value={form.email}
            onChange={(e) => update("email", e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input className={styles.input} type="password" placeholder="Min 8 chars, uppercase, lowercase, number"
            value={form.password} onChange={(e) => update("password", e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Phone</label>
          <input className={styles.input} placeholder="9876543210" value={form.phone}
            onChange={(e) => update("phone", e.target.value)} />
          {phoneError && <p className={styles.error} style={{ margin: "4px 0 0" }}>{phoneError}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>I want to sign up as</label>
          <select className={styles.input} value={form.role}
            onChange={(e) => update("role", e.target.value)}>
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>City</label>
          <input className={styles.input} placeholder="e.g. Bengaluru, Gurugram, Delhi" value={form.city}
            onChange={(e) => update("city", e.target.value)} />
        </div>
        <button type="submit" className={styles.submitBtn}>
          Sign Up
        </button>
      </form>
      <p className={styles.footer}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
