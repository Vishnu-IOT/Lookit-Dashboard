import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/AccountSettings.css";
import axios from "axios";
import StatusToggle from "./StatusToggle";
import Loder from "./Loder";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

export default function AccountSettings() {
  const { ascreator } = useParams();
  const navigate = useNavigate();
  // const location = useLocation();
  // const creator = location.state;

  const [interests, setInterests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveContentSuccess, setSaveContentSuccess] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [creator, setCreatorData] = useState();
  const [loading, setLoading] = useState(false);
  const [contentAccess, setContentAccess] = useState({
    content_articles: "no",
    content_news: "no",
    content_poster: "no",
    content_poll: "no",
    content_video: "no",
  });

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    setLoading(true);
    // if (!channelId) return;
    axios
      .get(`https://users.mpdatahub.com/api/channel-post?id=${ascreator}`)
      .then((res) => {
        setCreatorData(res.data);
        setInterests((res.data?.channel?.category || '').split(',').map(item => item.trim()).filter(Boolean) || []);
        setSelectedStatus(res.data?.channel?.status);
        setContentAccess({
          content_articles: res.data?.channel?.content_articles || "no",
          content_news: res.data?.channel?.content_news || "no",
          content_poster: res.data?.channel?.content_poster || "no",
          content_poll: res.data?.channel?.content_poll || "no",
          content_video: res.data?.channel?.content_video || "no",
        });
      })

      .catch((err) => {
        console.error(err);
        setCreatorData(null);
      }).finally(() => {
        setLoading(false);
      });
  }, [ascreator]);

  if (!creator && !loading) {
    return (
      <div className="cd-error">
        <p>No creator data found.</p>
        <button onClick={() => navigate(-1)} className="cd-back-btn">
          ← Go Back
        </button>
      </div>
    );
  }
  else if (loading) {
    return <Loder />;
  }

  const handleRemoveInterest = (tag) => {
    console.log(tag)
    setInterests((prev) => prev.filter((t) => t !== tag));
  };

  const handleAddInterest = (e) => {
    // if (e.key === "Enter" && newInterest.trim()) {
    if (newInterest.trim()) {
      const trimmed = newInterest.trim();
      console.log(interests, trimmed);
      if (!interests.includes(trimmed)) {
        setInterests((prev) => [...prev, trimmed]);
      }
      else {
        alert('Content Interest Already Exists!');
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

  const handleCategorySave = async () => {
    try {

      const newCategory = interests.join(',');

      const response = await axios.post(
        "https://users.mpdatahub.com/api/update-channel",
        {
          id: creator.channel.id,
          category: newCategory,
        }
      );
      console.log(response.data);
      setSaveContentSuccess(true);
      setTimeout(() => setSaveContentSuccess(false), 3000);
      alert("Content Interest updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const updateContentAccess = (field, currentvalue) => {
    setContentAccess((prev) => ({
      ...prev,
      [field]: currentvalue
    }));
  };

  const handleContentAccess = async (field, currentvalue) => {
    try {
      console.log(contentAccess);
      const payload = {
        id: creator.channel.id,
        content_articles: contentAccess.content_articles,
        content_poster: contentAccess.content_poster,
        content_poll: contentAccess.content_poll,
        content_news: contentAccess.content_news,
        content_video: contentAccess.content_video,
      };

      payload[field] = currentvalue;

      const response = await axios.post(
        "https://users.mpdatahub.com/api/update-Content-Settings",
        payload
      );
      console.log(response.data);
      // setSaveContentSuccess(true);
      // setTimeout(() => setSaveContentSuccess(false), 3000);
      alert("Content Access updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update Content Access");
    }
  };

  const postStatus = [
    {
      label: "Articles",
      field: "content_articles",
      // status: creator?.channel?.content_articles,
      icon: "📄",
    },
    {
      label: "News",
      field: "content_news",
      // status: creator?.channel?.content_news,
      icon: "📰",
    },
    {
      label: "Posters",
      field: "content_poster",
      // status: creator?.channel?.content_poster,
      icon: "🖼",
    },
    {
      label: "Poll",
      field: "content_poll",
      // status: creator?.channel?.content_poll,
      icon: "📝",
    },
    {
      label: "Video",
      field: "content_video",
      // status: creator?.channel?.content_video,
      icon: "🎥",
    },
  ];

  const categories = [
    "NEWS",
    "Article",
    "Update",
    "Local News",
    "Political",
    "Cinema",
    "Tech",
  ];

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
                  src={creator?.channel?.profile_image}
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

          {/* <input
            className="as-tag-input"
            name="interest"
            type="text"
            placeholder="Add interest..."
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={handleAddInterest}
          /> */}

          <div className="as-dpdn-btn">
            <select
              className="as-tag-select"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button className="as-add-btn" onClick={handleAddInterest}>
              Add
            </button>
          </div>

          <div className="as-tags-container">
            {interests.map((tag) => (
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
          </div>

          <div className="as-save-row">
            <button className="as-save-btn" onClick={handleCategorySave}>
              Save Content
            </button>

            {saveContentSuccess && (
              <div className="as-success-msg">
                <span>✓</span> Changes saved successfully
              </div>
            )}
          </div>
        </div>


        {/* Post Counts */}
        <div className="as-card">
          <h3 className="as-card-title">Content Summary</h3>
          <div className="as-stats-grid">
            {postStatus.map((item) => (
              <div className="as-stat-item" key={item.label}>
                <span className="as-stat-icon">{item.icon || "📊"}</span>
                <div className="as-stat-text">
                  {/* <span className="as-stat-val">{val}</span> */}
                  <span className="as-stat-label">
                    {item.label.toUpperCase()}
                  </span>
                </div>
                <StatusToggle
                  defaultActive={
                    creator?.channel?.[item?.field] === 'yes' ? true : false
                  }
                  onChange={(isActive) => {
                    updateContentAccess(item.field, isActive ? 'yes' : 'no');
                    handleContentAccess(
                      item.field,
                      isActive ? 'yes' : 'no'
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
              Save Status
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
