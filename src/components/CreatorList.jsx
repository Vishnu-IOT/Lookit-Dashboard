import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreatorList.css";
import axios from "axios";

const creatorsData = [
  {
    id: 1,
    channelName: "Tech World",
    username: "techworld",
    ownerName: "John Smith",
    status: "Active",
    verified: true,
    description: "Technology news and tutorials for modern developers.",
    interests: ["News", "Articles", "Videos"],
    postCounts: { articles: 10, posts: 25, news: 12, posters: 5 },
    logo: "TW",
    logoColor: "#3b82f6",
  },
  {
    id: 2,
    channelName: "Kishu Studios",
    username: "kishu",
    ownerName: "Kishu Raj",
    status: "Pending",
    verified: false,
    description: "Creative content studio specializing in 3D art and design.",
    interests: ["3D", "Technology", "Videos"],
    postCounts: { articles: 4, posts: 18, news: 3, posters: 11 },
    logo: "KS",
    logoColor: "#f59e0b",
  },
  {
    id: 3,
    channelName: "Daily Digest",
    username: "dailydigest",
    ownerName: "Priya Nair",
    status: "Active",
    verified: true,
    description: "Your daily dose of curated news and articles.",
    interests: ["News", "Articles"],
    postCounts: { articles: 32, posts: 10, news: 45, posters: 2 },
    logo: "DD",
    logoColor: "#10b981",
  },
  {
    id: 4,
    channelName: "SportZone",
    username: "sportzoneofficial",
    ownerName: "Arjun Mehta",
    status: "Suspended",
    verified: false,
    description: "Live sports updates, match analysis, and player stats.",
    interests: ["News", "Videos"],
    postCounts: { articles: 5, posts: 60, news: 30, posters: 8 },
    logo: "SZ",
    logoColor: "#6366f1",
  },
  {
    id: 5,
    channelName: "Culinary Arts",
    username: "culinaryarts",
    ownerName: "Meena Subramanian",
    status: "Rejected",
    verified: false,
    description: "Recipes, food reviews, and culinary adventures.",
    interests: ["Articles", "Videos"],
    postCounts: { articles: 20, posts: 15, news: 2, posters: 6 },
    logo: "CA",
    logoColor: "#ef4444",
  },
  {
    id: 6,
    channelName: "Finance Hub",
    username: "financehub",
    ownerName: "Ravi Kumar",
    status: "Active",
    verified: true,
    description: "Personal finance tips, market analysis, and investment guides.",
    interests: ["News", "Articles"],
    postCounts: { articles: 55, posts: 22, news: 18, posters: 3 },
    logo: "FH",
    logoColor: "#0ea5e9",
  },
  {
    id: 7,
    channelName: "Pixel Craft",
    username: "pixelcraft",
    ownerName: "Ananya Sharma",
    status: "Pending",
    verified: false,
    description: "Digital art tutorials, design tips, and creative showcases.",
    interests: ["3D", "Videos", "Technology"],
    postCounts: { articles: 8, posts: 40, news: 1, posters: 22 },
    logo: "PC",
    logoColor: "#a855f7",
  },
  {
    id: 8,
    channelName: "Health First",
    username: "healthfirst",
    ownerName: "Dr. Suresh Pillai",
    status: "Active",
    verified: true,
    description: "Evidence-based health tips, wellness routines, and medical news.",
    interests: ["News", "Articles"],
    postCounts: { articles: 40, posts: 12, news: 28, posters: 4 },
    logo: "HF",
    logoColor: "#14b8a6",
  },
];

const STATUS_FILTERS = [
  { label: "All", value: "All" },
  { label: "Pending", value: "pending" },
  { label: "Active", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

const ITEMS_PER_PAGE = 6;

const statusClass = {
  approved: "badge--active",
  pending: "badge--pending",
  rejected: "badge--rejected",
  suspended: "badge--suspended",
};

export default function CreatorList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [creatorList, setCreatorList] = useState([]);

  useEffect(() => {
    axios
      .get("https://users.mpdatahub.com/api/channel-list")
      .then((res) => {
        setCreatorList(Array.isArray(res?.data?.data) ? res.data.data : []);
      })
      .catch((err) => {
        console.error(err);
        setCreatorList([]);
      });
  }, []);

  const filtered =
    activeFilter === "All"
      ? creatorList
      : creatorList.filter((c) => c.status === activeFilter);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleView = (creator) => {
    navigate(`/creator-details/${creator.id}`, { state: creator });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      )
        pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="cl-page">
      <div className="cl-header">
        <div>
          <h1 className="cl-title">Creator List</h1>
          <p className="cl-subtitle">
            {filtered.length} creator{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div className="cl-filters">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            className={`cl-filter-btn ${activeFilter === f.value ? "cl-filter-btn--active" : ""}`}
            onClick={() => handleFilter(f.value)}
          >
            {f.label}
            <span className="cl-filter-count">
              {f.value === "All"
                ? creatorList.length
                : creatorList.filter((c) => c.status === f.value).length}
            </span>
          </button>
        ))}
      </div>

      {paginated.length === 0 ? (
        <div className="cl-empty">
          <p>No creators found for "{activeFilter}"</p>
        </div>
      ) : (
        <div className="cl-grid">
          {paginated.map((creator) => (
            <div className="cl-card" key={creator.id}>
              <div className="cl-card__top">
                <div
                  className="cl-logo"
                  style={{ backgroundColor: creator.logoColor || "#B18FCF" }}
                >
                  {creator.logo || creator.channel_name?.slice(0, 2).toUpperCase()}
                </div>
                <span className={`cl-badge ${statusClass[creator.status]}`}>
                  {creator.status}
                </span>
              </div>

              <div className="cl-card__info">
                <h3 className="cl-card__name">{creator.channel_name}</h3>
                <p className="cl-card__username">@{creator.name}</p>
              </div>

              <div className="cl-card__categories">
                {(creator?.category || "")
                  .split(",")
                  .filter(Boolean)
                  .slice(0, 3).map((tag) => (
                    <span className="cl-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
              </div>

              <button
                className="cl-view-btn"
                onClick={() => handleView(creator)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="cl-pagination">
          <button
            className="cl-page-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="cl-page-numbers">
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="cl-page-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`cl-page-num ${currentPage === page ? "cl-page-num--active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            className="cl-page-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
