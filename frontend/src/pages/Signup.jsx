import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "customer", phone: "", city: "",
  });
  const [error, setError] = useState("");
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const update = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await signup(form);
      saveAuth(res.data.data.token, res.data.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2 style={{ margin: "0 0 20px" }}>Sign Up</h2>
      {error && (
        <p style={{ color: "#ef4444", fontSize: 14, margin: "0 0 12px" }}>{error}</p>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} placeholder="Your name" value={form.name}
            onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} placeholder="you@example.com" value={form.email}
            onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" placeholder="Min 8 chars, uppercase, lowercase, number"
            value={form.password} onChange={(e) => update("password", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} placeholder="9876543210" value={form.phone}
            onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>I want to sign up as</label>
          <select style={inputStyle} value={form.role}
            onChange={(e) => update("role", e.target.value)}>
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>City</label>
          <input style={inputStyle} placeholder="e.g. Bengaluru, Gurugram, Delhi" value={form.city}
            onChange={(e) => update("city", e.target.value)} />
        </div>
        <button type="submit" style={{
          padding: "10px", borderRadius: 6, border: "none",
          background: "#3b82f6", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 4,
        }}>
          Sign Up
        </button>
      </form>
      <p style={{ fontSize: 14, marginTop: 16, textAlign: "center" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
