import React, { useEffect, useState } from "react";

const LoggedInUser = ({ currentUser, onLogout }) => {
  const [userData, setUserData] = useState(currentUser);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");

      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [currentUser]);

  // Format DOB
  const formatDOB = (dobString) => {
    if (!dobString) return "Not provided";

    try {
      const dob = new Date(dobString);

      return dob.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dobString;
    }
  };

  // Format login time
  const formatLoginTime = (timestamp) => {
    if (!timestamp) return "Recently";

    try {
      const loginTime = new Date(timestamp);
      const now = new Date();

      const diffMs = now - loginTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minutes ago`;

      const diffHours = Math.floor(diffMins / 60);

      if (diffHours < 24) return `${diffHours} hours ago`;

      const diffDays = Math.floor(diffHours / 24);

      return `${diffDays} days ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="liu-profile-dropdown mobile-user-popup">
      <div className="user-header">
        <img
          src={
            userData?.image ||
            "https://ui-avatars.com/api/?name=User&background=667eea&color=fff"
          }
          alt="Profile"
          className="dropdown-profile-image"
        />

        <div className="user-info">
          <strong className="user-name">{userData?.name || "User"}</strong>

          <small className="user-email">
            {userData?.email || "user@example.com"}
          </small>

          <div className="user-badge">
            <span className="badge">ID: {userData?.id || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="user-details">
        <div className="detail-item">
          <span className="detail-label">Mobile:</span>

          <span className="detail-value" style={{ textAlign: "right" }}>
            {userData?.mobile || "Not provided"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Date of Birth:</span>

          <span className="detail-value" style={{ textAlign: "right" }}>
            {formatDOB(userData?.dob)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Referral Code:</span>

          <span
            className="detail-value referral-code"
            style={{ textAlign: "right" }}
          >
            {userData?.referal_code || "N/A"}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Logged in:</span>

          <span
            className="detail-value login-time"
            style={{ textAlign: "right" }}
          >
            {formatLoginTime(userData?.loginTime)}
          </span>
        </div>
      </div>

      <div className="dropdown-actions">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default LoggedInUser;
