import React from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import "../styles/AuthStyles.css";
const Dashboard = () => {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName");
  const credits = localStorage.getItem("credits") || 0; // Will update later from API

  return (
    <div className="dashboard-container">
      <div className="credit-display">Credits: {credits}</div>
      <h2 className="welcome-text">Welcome, {userName}</h2>

      <div className="tab-wrapper">
        <div className="tab" onClick={() => navigate("/upload")}>
          📤 Upload Notes
        </div>
        <div className="tab" onClick={() => navigate("/validate")}>
          ✅ Validate Notes
        </div>
        <div className="tab" onClick={() => navigate("/view")}>
          📚 View Notes
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
