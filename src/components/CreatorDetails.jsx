import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/CreatorDetails.css";
import axios from "axios";
import { IoIosEye } from "react-icons/io";
import { FaHeart, FaShare } from "react-icons/fa6";
import Loder from "./Loder";

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
          src={item.web_thumbnail || item.image}
          alt={item.title}
        />
        {/* <span className="cd-thumb-icon">▶</span> */}
      </div>
      <div className="cd-content-info">
        <p className="cd-content-title">{item.title}</p>
        <div className="cd-content-stats">
          <span><IoIosEye size={'25px'} color="#1DA1F2" /> {item.view_count ?? item.views} <span style={{ fontWeight: 600, color: "#000" }}>Views</span></span>
          <span><FaHeart size={'20px'} style={{ color: "#f44747" }} /> {item.likes_count ?? item.like} <span style={{ fontWeight: 600, color: "#000" }}>Likes</span></span>
          <span>
            <FaShare size={"20px"} style={{ color: "#0505e9" }} />{" "}
            {item.share_count ?? item.share} <span style={{ fontWeight: 600, color: "#000" }}>Shares</span>
          </span>
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
          <button className="cd-view-all-btn" onClick={() => {
            navigate(`/creator-post-list/${userId}`, { state: { title } });
          }
          }>View All →</button>
        </div>
      </div>
      {items.length === 0 ? (<p style={{ color: 'black', fontWeight: 500, textAlign: 'center', fontSize: 14 }}>No {title} found!</p>) :
        <div className="cd-section-grid">
          {(
            items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))
          )}
        </div>
      }
    </div >
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
  const [trendingUpdates, setTrendingUpdates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // if (!channelId) return;
    axios
      .get(`https://users.mpdatahub.com/api/channel-post?id=${channelId}`)
      .then((res) => {
        setCreatorChannel(res.data);
        setTrendingPosts(Array.isArray(res?.data?.trending_posts) ? res?.data?.trending_posts : []);
        setTrendingUpdates(Array.isArray(res?.data?.latest_articles) ? res?.data?.latest_articles : []);
      })
      .catch((err) => {
        console.error(err);
        setCreatorChannel([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [channelId]);

  if (!creatorChannel && !loading) {
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

  return (
    <div className="cd-page">
      {/* Back Nav */}
      <button className="cd-breadcrumb" onClick={() => navigate(-1)}>
        ← Creator List
      </button>

      {/* Header Card */}
      <div className="cd-header-card">
        <div className="cd-header-top">
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
        <div className="cd-header-bottom">
          <h3 className="cd-desc-label">Channel Bio</h3>
          <p className="cd-desc-text">{creatorChannel?.channel?.bio}</p>
        </div>
      </div>

      {/* Description */}
      {/* <div className="cd-desc-card">
        <h3 className="cd-desc-label">Channel Description</h3>
        <p className="cd-desc-text">{creatorChannel?.channel?.bio}</p>
      </div> */}



      {/* Stats Row */}
      <div className="cd-stats-row">
        {/* {Object.entries(creatorChannel.postCounts || {}).map(([key, val]) => ( */}
        <div className="cd-stat-card" >
          <span className="cd-stat-val">Posts</span>
          <span className="cd-stat-key">
            {creatorChannel.total_posts}
          </span>
        </div>

        <div className="cd-stat-card" >
          <span className="cd-stat-val">Updates</span>
          <span className="cd-stat-key">
            {creatorChannel.total_updates}
          </span>
        </div>
        {/* ))} */}
      </div>

      {/* Content Sections */}
      <ContentSection title="Posts" items={trendingPosts} icon="📝" userId={creatorChannel?.user?.id} />
      <ContentSection title="Updates" items={trendingUpdates} icon="📄" userId={creatorChannel?.user?.id} />
      {/* <ContentSection title="News" items={newsData} icon="📰" /> */}
    </div>
  );
}
