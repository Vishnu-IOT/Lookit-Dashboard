import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/CreatorDetails.css";
import axios from "axios";
import { IoIosEye } from "react-icons/io";
import { FaHeart } from "react-icons/fa6";

const postsData = [
  {
    id: 1,
    title: "The Future of Artificial Intelligence",
    views: "18.4K",
    likes: "2.1K",
    thumb: "#3b82f6",
  },
  {
    id: 2,
    title: "Top 10 VS Code Extensions for Developers",
    views: "9.7K",
    likes: "1.4K",
    thumb: "#6366f1",
  },
  {
    id: 3,
    title: "Understanding React Server Components",
    views: "12.2K",
    likes: "980",
    thumb: "#0ea5e9",
  },
];

const articlesData = [
  {
    id: 1,
    title: "How Quantum Computing Will Change Security",
    views: "6.5K",
    likes: "830",
    thumb: "#10b981",
  },
  {
    id: 2,
    title: "A Deep Dive into CSS Container Queries",
    views: "4.1K",
    likes: "610",
    thumb: "#14b8a6",
  },
  {
    id: 3,
    title: "Building Scalable Microservices with Node",
    views: "7.9K",
    likes: "1.2K",
    thumb: "#22c55e",
  },
];

const newsData = [
  {
    id: 1,
    title: "OpenAI Releases New Reasoning Model",
    views: "22.1K",
    likes: "3.4K",
    thumb: "#f59e0b",
  },
  {
    id: 2,
    title: "Meta Announces AR Glasses for Developers",
    views: "15.6K",
    likes: "2.7K",
    thumb: "#ef4444",
  },
  {
    id: 3,
    title: "Apple WWDC 2025: Key Takeaways",
    views: "31.0K",
    likes: "5.1K",
    thumb: "#a855f7",
  },
];

function ContentCard({ item }) {
  return (
    <div className="cd-content-card">
      <div
        className="cd-content-thumb"
        style={{ backgroundColor: item.thumb }}
      >
        <img
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
            objectFit: 'cover',
          }}
          src={item.web_thumbnail}
          alt={item.title}
        />
        {/* <span className="cd-thumb-icon">▶</span> */}
      </div>
      <div className="cd-content-info">
        <p className="cd-content-title">{item.title}</p>
        <div className="cd-content-stats">
          <span><IoIosEye size={'25px'} color="#1DA1F2" /> {item.view_count}</span>
          <span><FaHeart size={'20px'} style={{ color: "#f44747" }} /> {item.likes_count}</span>
        </div>
      </div>
    </div>
  );
}

function ContentSection({ title, items, icon, userId }) {
  const navigate = useNavigate();
  return (
    <div className="cd-section">
      <div className="cd-section-header">
        <span className="cd-section-icon">{icon}</span>
        <h2 className="cd-section-title">{title}</h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          marginLeft: 'auto'
        }}>
          <span className="cd-section-count">{items.length} items</span>
          <button className="cd-view-all-btn" onClick={() =>
            navigate(`/creator-post-list/${userId}`)
          }>View All →</button>
        </div>
      </div>
      <div className="cd-section-grid">
        {items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

const statusClass = {
  approved: "cd-status--active",
  pending: "cd-status--pending",
  rejected: "cd-status--rejected",
  suspended: "cd-status--suspended",
};

export default function CreatorDetails() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [creatorChannel, setCreatorChannel] = useState();
  const [trendingPosts, setTrendingPosts] = useState([]);

  useEffect(() => {
    // if (!channelId) return;
    axios
      .get(`https://users.mpdatahub.com/api/channel-post?id=${channelId}`)
      .then((res) => {
        setCreatorChannel(res.data);
        setTrendingPosts(Array.isArray(res?.data?.trending_posts) ? res?.data?.trending_posts : []);
      })
      .catch((err) => {
        console.error(err);
        setCreatorChannel([]);
      });
  }, [channelId]);

  if (!creatorChannel) {
    return (
      <div className="cd-error">
        <p>No creator data found.</p>
        <button onClick={() => navigate(-1)} className="cd-back-btn">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="cd-page">
      {/* Back Nav */}
      <button className="cd-breadcrumb" onClick={() => navigate(-1)}>
        ← Creator List
      </button>

      {/* Header Card */}
      <div className="cd-header-card">
        <div className="cd-header-left">
          <div
            className="cd-avatar"
            style={{ backgroundColor: creatorChannel.logoColor || "#4f8ef7" }}
          >
            {creatorChannel?.user?.profile_image ?
              <img
                style={{ objectFit: 'fill', width: '100%', height: '100%', borderRadius: 8 }}
                src={creatorChannel?.channel?.profile_image}
                alt={creatorChannel?.channel?.channel_name}
              />
              : creatorChannel?.channel?.channel_name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="cd-header-info">
            <div className="cd-name-row">
              <h1 className="cd-channel-name">{creatorChannel?.channel?.channel_name}</h1>
              {creatorChannel?.channel?.status === 'approved' && (
                <span className="cd-verified" title="Verified">
                  ✓
                </span>
              )}
              <span className={`cd-status-badge ${statusClass[creatorChannel?.channel?.status]}`}>
                {creatorChannel?.channel?.status}
              </span>
            </div>
            <p className="cd-username">@{creatorChannel?.channel?.name}</p>
            <p className="cd-owner">Owner: {creatorChannel?.channel?.name}</p>
          </div>
        </div>

        <button
          className="cd-settings-btn"
          onClick={() =>
            navigate(`/content-settings/${creatorChannel?.channel?.id}/settings`, { state: creatorChannel })
          }
        >
          ⚙ Account Settings
        </button>
      </div>

      {/* Description */}
      <div className="cd-desc-card">
        <h3 className="cd-desc-label">Channel Description</h3>
        <p className="cd-desc-text">{creatorChannel?.channel?.bio}</p>
      </div>

      {/* Stats Row */}
      {/* <div className="cd-stats-row">
        {Object.entries(creatorChannel.postCounts || {}).map(([key, val]) => (
          <div className="cd-stat-card" key={key}>
            <span className="cd-stat-val">{val}</span>
            <span className="cd-stat-key">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
          </div>
        ))}
      </div> */}

      {/* Content Sections */}
      <ContentSection title="Posts" items={trendingPosts} icon="📝" userId={creatorChannel?.user?.id} />
      {/* <ContentSection title="Articles" items={articlesData} icon="📄" /> */}
      {/* <ContentSection title="News" items={newsData} icon="📰" /> */}
    </div>
  );
}
