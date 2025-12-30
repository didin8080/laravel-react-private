import React, { useState } from "react";
import { API_BASE } from "../utils/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch(API_BASE + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("didin_token", data.token);
        window.location.href = "/dashboard";
      } else {
        setMsg(data.message || data.errors || "Registration failed. Please try again.");
      }
    } catch (error) {
      setMsg("Network error. Please check your connection.");
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 vw-100 position-fixed top-0 start-0"
      style={{
        background: "linear-gradient(135deg, #5e60ce 0%, #764ba2 100%)",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Register Card */}
      <div
        className="card shadow-xl border-0 rounded-4"
        style={{
          width: "460px",
          maxWidth: "92vw",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-5">
          <h2 className="text-center fw-bold mb-5 text-dark">Create Account</h2>

          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">Full Name</label>
              <input
                type="text"
                className="form-control form-control-lg rounded-3 border-0 shadow-sm"
                style={{ backgroundColor: "#f8f9fa" }}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">Email Address</label>
              <input
                type="email"
                className="form-control form-control-lg rounded-3 border-0 shadow-sm"
                style={{ backgroundColor: "#f8f9fa" }}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">Password</label>
              <input
                type="password"
                className="form-control form-control-lg rounded-3 border-0 shadow-sm"
                style={{ backgroundColor: "#f8f9fa" }}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">Confirm Password</label>
              <input
                type="password"
                className="form-control form-control-lg rounded-3 border-0 shadow-sm"
                style={{ backgroundColor: "#f8f9fa" }}
                placeholder="••••••••"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success btn-lg w-100 fw-bold rounded-3 shadow mt-3"
              style={{
                padding: "14px",
                background: "linear-gradient(to right, #28a745, #20c997)",
                border: "none",
              }}
            >
              Create Account
            </button>
          </form>

          {/* Error / Success Message */}
          {msg && (
            <div className="alert alert-danger mt-4 text-center fw-medium" role="alert">
              {typeof msg === "string" ? msg : JSON.stringify(msg)}
            </div>
          )}

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <a href="/login" className="text-primary fw-bold text-decoration-none">
              Sign in here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}