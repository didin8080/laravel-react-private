import React, { useState } from "react";
import { API_BASE } from "../utils/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setErr(null);

    try {
      const res = await fetch(API_BASE + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("didin_token", data.token);
        window.location.href = "/dashboard";
      } else {
        setErr(data.message || data.errors || "Login failed. Please try again.");
      }
    } catch (error) {
      setErr("Network error. Please check your connection.");
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
      {/* Main Login Card */}
      <div
        className="card shadow-xl border-0 rounded-4"
        style={{
          width: "420px",
          maxWidth: "92vw",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-5">
          <h2 className="text-center fw-bold mb-5 text-dark">Welcome Back</h2>

          <form onSubmit={submit}>
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

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 fw-bold rounded-3 shadow mt-3"
              style={{ padding: "14px", background: "linear-gradient(to right, #5e60ce, #764ba2)" }}
            >
              Sign In
            </button>
          </form>

          {/* Error Message */}
          {err && (
            <div className="alert alert-danger mt-4 text-center fw-medium" role="alert">
              {err}
            </div>
          )}

          {/* Register Link */}
          <div className="text-center mt-4">
            <span className="text-muted">Don't have an account? </span>
            <a href="/register" className="text-primary fw-bold text-decoration-none">
              Sign up here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}