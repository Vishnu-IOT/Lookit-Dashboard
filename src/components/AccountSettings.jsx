import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/AccountSettings.css";
import axios from "axios";
import StatusToggle from "./StatusToggle";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

export default function AccountSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const creator = location.state;

  const [interests, setInterests] = useState(creator?.interests || []);
  const [selectedStatus, setSelectedStatus] = useState(creator?.channel?.status);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newInterest, setNewInterest] = useState("");

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  if (!creator) {
    return (
      <div className="as-error">
        <p>No creator data found.</p>
        <button onClick={() => navigate(-1)} className="as-back-btn">
          ← Go Back
        </button>
      </div>
    );
  }

  const handleRemoveInterest = (tag) => {
    setInterests((prev) => prev.filter((t) => t !== tag));
  };

  const handleAddInterest = (e) => {
    if (e.key === "Enter" && newInterest.trim()) {
      const trimmed = newInterest.trim();
      if (!interests.includes(trimmed)) {
        setInterests((prev) => [...prev, trimmed]);
      }
      setNewInterest("");
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        "https://users.mpdatahub.com/api/channel-update-status",
        {
          id: creator.channel.id,
          user_id: creator.user.id,
          status: selectedStatus,
        }
      );
      console.log(response.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert("Status updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const postCounts = creator.postCounts || {
    articles: 0,
    posts: 0,
    news: 0,
    posters: 0,
  };

  const statIcons = {
    articles: "📄",
    posts: "📝",
    news: "📰",
    posters: "🖼",
  };

  const handleStatusUpdateSubmit = async (category, status) => {
    try {
      const formData = new FormData();

      formData.append('category_id', category.id);
      formData.append('name', category.name);
      formData.append('status', status);

      const url = `https://users.mpdatahub.com/api/update-channel`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showToast('Main Category Status updated successfully!', 'success');
      } else {
        const errData = await response.json();
        showToast(
          errData.message || 'Failed to update status. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating main category:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  return (
    <div className="as-page">
      {toast.show && (
        <div className={`toast-box ${toast.type}`}>{toast.message}</div>
      )}
      {/* Breadcrumb */}
      <button className="as-breadcrumb" onClick={() => navigate(-1)}>
        ← Creator Details
      </button>

      <h1 className="as-page-title">Account Settings</h1>

      <div className="as-layout">
        {/* LEFT COLUMN */}
        {/* <div className="as-col-left"> */}
        {/* Profile Section */}
        <div className="as-card">
          <h3 className="as-card-title">Profile</h3>
          <div className="as-profile">
            <div
              className="as-avatar"
              style={{
                backgroundColor: creator.logoColor || "#4f8ef7",
              }}
            >
              {creator?.user?.profile_image ?
                <img
                  style={{ objectFit: 'fill', width: '100%', height: '100%', borderRadius: 8 }}
                  src={creator?.user?.profile_image}
                  alt={creator?.channel?.channel_name}
                />
                : creator?.channel?.channel_name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="as-profile-info">
              <p className="as-channel-name">{creator?.channel?.channel_name}</p>
              <p className="as-owner-name">{creator?.channel?.name}</p>
              <p className="as-username">@{creator?.channel?.name}</p>
            </div>
          </div>
        </div>

        {/* </div> */}

        {/* RIGHT COLUMN */}
        {/* <div className="as-col-right"> */}
        {/* Content Interests */}
        <div className="as-card">
          <h3 className="as-card-title">Content Interests</h3>
          <p className="as-card-hint">
            Press Enter to add a new interest tag
          </p>

          <div className="as-tags-container">
            {(creator?.channel?.category || "")
              .split(",")
              .filter(Boolean)
              .map((tag) => (
                <span className="as-tag" key={tag}>
                  {tag}
                  <button
                    className="as-tag-remove"
                    onClick={() => handleRemoveInterest(tag)}
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}

            <input
              className="as-tag-input"
              type="text"
              placeholder="Add interest..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={handleAddInterest}
            />
          </div>
        </div>


        {/* Post Counts */}
        <div className="as-card">
          <h3 className="as-card-title">Content Summary</h3>
          <div className="as-stats-grid">
            {Object.entries(postCounts).map(([key, val]) => (
              <div className="as-stat-item" key={key}>
                <span className="as-stat-icon">{statIcons[key] || "📊"}</span>
                <div className="as-stat-text">
                  <span className="as-stat-val">{val}</span>
                  <span className="as-stat-label">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </div>
                <StatusToggle
                  defaultActive={
                    val === 'allow' ? true : false
                  }
                  onChange={(isActive) => {
                    handleStatusUpdateSubmit(
                      val,
                      isActive ? 'allow' : 'disable'
                    );
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Account Status */}
        <div className="as-card">
          <h3 className="as-card-title">Account Status</h3>
          <p className="as-card-hint">
            Update the account status for this creator
          </p>

          <div className="as-status-control">
            <label className="as-label" htmlFor="status-select">
              Status
            </label>
            <div className="as-select-wrapper">
              <select
                id="status-select"
                className="as-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="as-select-arrow">▾</span>
            </div>

            <div className="as-status-preview">
              <span
                className={`as-status-dot as-status-dot--${selectedStatus.toLowerCase()}`}
              ></span>
              <span className="as-status-label">{selectedStatus}</span>
            </div>
          </div>

          <div className="as-save-row">
            <button className="as-save-btn" onClick={handleSave}>
              Save Changes
            </button>

            {saveSuccess && (
              <div className="as-success-msg">
                <span>✓</span> Changes saved successfully
              </div>
            )}
          </div>
        </div>
        {/* </div> */}
      </div>
    </div>
  );
}
