import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreatorList.css";
import axios from "axios";

const STATUS_FILTERS = [
  { label: "All", value: "All" },
  { label: "Active", value: "approved" },
  { label: "Pending", value: "pending" },
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
    navigate(`/creator-details/${creator.id}`);
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
                <span className={`cl-badge ${statusClass[creator.status]} `}>
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
                <span key={`ellipsis - ${idx} `} className="cl-page-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`cl - page - num ${currentPage === page ? "cl-page-num--active" : ""} `}
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
