import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await authFetch("/dashboard");
      if (res.status === 401) {
        localStorage.removeItem("didin_token");
        window.location.href = "/login";
        return;
      }
      const j = await res.json();
      if (!res.ok) setErr(j);
      else setData(j);
    })();
  }, []);

  const logout = () => {
    localStorage.removeItem("didin_token");
    window.location.href = "/login";
  };

  const user = data?.user || {};
  const stats = data?.stats || {};

  return (
    <>
      {/* === INTERNAL CSS (inside component) === */}
      <style jsx>{`
        .dashboard-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          padding: 3rem 2rem 2rem;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .header-content h1 {
          font-size: 3.5483rem;
          font-weight: 800;
          margin: 0;
        }

        .header-content p {
          font-size: 1.4rem;
          opacity: 0.9;
          margin: 0.5rem 0 0;
        }

        .logout-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          font-size: 1.2rem;
          font-weight: bold;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(231, 76, 60, 0.4);
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: #c0392b;
          transform: translateY(-3px);
        }

        .dashboard-main {
          flex: 1;
          padding: 0 2rem 3rem;
        }

        .dashboard-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2.5rem;
          height: 100%;
        }

        .user-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 3rem;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .avatar {
          width: 140px;
          height: 140px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          margin: 0 auto 2rem;
          justify-content: center;
          font-size: 5rem;
          font-weight: 300;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .user-card h3 {
          font-size: 2rem;
          margin: 0 0 1rem;
        }

        #root {
            width: 100%;
        }

        .user-card p {
          font-size: 1.3rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .badge {
          background: white;
          color: #764ba2;
          padding: 0.8rem 2rem;
          border-radius: 50px;
          font-weight: bold;
          font-size: 1rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .content-area {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-10px);
        }

        .stat-card h4 {
          font-size: 1.5rem;
          opacity: 0.9;
          margin-bottom: 1rem;
        }

        .stat-card h1 {
          font-size: 5rem;
          font-weight: 800;
          margin: 0;
        }

        .json-card {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .json-header {
          background: rgba(0, 0, 0, 0.6);
          padding: 1.5rem 2rem;
          font-size: 1.5rem;
          font-weight: bold;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .json-card pre {
          flex: 1;
          margin: 0;
          padding: 2rem;
          color: #4ade80;
          font-size: 15px;
          line-height: 1.8;
          overflow: auto;
          font-family: 'Fira Code', Consolas, monospace;
        }

        .dashboard-footer {
          text-align: center;
          padding: 2rem;
          opacity: 0.7;
          font-size: 0.9rem;
        }

        @media (max-width: 992px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .header-content h1 {
            font-size: 2.8rem;
          }
          .stat-card h1 {
            font-size: 4rem;
          }
        }
      `}</style>

      {/* === JSX === */}
      <div className="dashboard-wrapper">
        <header className="dashboard-header">
          <div className="header-content">
            <div>
              <h1>Welcome back, {user.name || "User"}!</h1>
              <p>Here's your complete account overview</p>
            </div>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="dashboard-grid">
            {/* User Card */}
            <div className="user-card">
              <div className="avatar">
                {user.name?.[0]?.toUpperCase() || "A"}
              </div>
              <h3>{user.name || "Admin"}</h3>
              <p>{user.email}</p>
              <span className="badge">Active User</span>
            </div>

            {/* Right Side */}
            <div className="content-area">
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Projects</h4>
                  <h1>{stats.projects || 0}</h1>
                </div>
                <div className="stat-card">
                  <h4>Notifications</h4>
                  <h1>{stats.notifications || 0}</h1>
                </div>
              </div>

                <div className="json-card">
                  <div className="json-header">Raw Dashboard Data (for developers)</div>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
          </div>
        </main>

        <footer className="dashboard-footer">
          <small>Secured with JWT Authentication • Protected Route</small>
        </footer>
      </div>
    </>
  );
}