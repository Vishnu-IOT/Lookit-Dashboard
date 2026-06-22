import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
        style={{ backgroundColor: item.thumb || "#4f8ef7" }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 8,
            objectFit: "cover",
          }}
          src={item.web_thumbnail || item.image || "/assets/no-img.jpeg"}
          alt={item.title}
        />
        {/* <span className="cd-thumb-icon">▶</span> */}
      </div>
      {/* <p className='cpl-active'>{item.isActive}</p> */}
      <div className="cd-content-info">
        <p className="cd-content-title">{item.title}</p>
        <div className="cd-content-stats">
          <span>
            <IoIosEye size={"25px"} color="#1DA1F2" /> {item.view_count}
            <span style={{ fontWeight: 600, color: "#000" }}>Views</span>
          </span>
          <span>
            <FaHeart size={"20px"} style={{ color: "#f44747" }} />{" "}
            {item.likes_count}
            <span style={{ fontWeight: 600, color: "#000" }}>Likes</span>
          </span>
          <span>
            <FaShare size={"20px"} style={{ color: "#0505e9" }} />{" "}
            {item.share_count}
            <span style={{ fontWeight: 600, color: "#000" }}>Shares</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ContentSection({ title, items, icon }) {
  return (
    <div className="cd-section">
      <div className="cd-section-header">
        <span className="cd-section-icon">{icon}</span>
        <h2 className="cd-section-title">{title}</h2>
        <span className="cd-section-count">{items.length} items</span>
      </div>
      {items.length === 0 ? (
        <p
          style={{
            color: "black",
            fontWeight: 500,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          No {title} found!
        </p>
      ) : (
        <div className="cd-section-grid">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "reject" },
];

export default function CreatorPostList() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const title = location?.state.title;

  const [creatorPostsCount, setCreatorPostsCount] = useState();
  const [creatorPosts, setCreatorPosts] = useState([]);
  const [postFilter, setPostFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const ITEMS_PER_PAGE = 15;
  const filterData = creatorPosts.filter((post) => {
    if (title === "Posts") return post.type === "article";
    if (title === "Updates") return post.type === "updates";

    return true;
  });

  useEffect(() => {
    setLoading(true);
    // if (!channelId) return;
    axios
      .get(
        `https://users.mpdatahub.com/api/post-Status-dashboard?status=${postFilter}&page=${currentPage}&perpage=${ITEMS_PER_PAGE}&user_id=${userId}`,
      )
      .then((res) => {
        setCreatorPostsCount(res?.data);
        setCreatorPosts(Array.isArray(res?.data?.data) ? res?.data?.data : []);
        // setTrendingPosts(
        //   Array.isArray(res?.data?.trending_posts)
        //     ? res?.data?.trending_posts
        //     : []
        // );
        title === "Posts"
          ? setTotalPages(
              Math.ceil((res?.data?.post_total || 0) / ITEMS_PER_PAGE),
            )
          : setTotalPages(
              Math.ceil((res?.data?.updates_total || 0) / ITEMS_PER_PAGE),
            );
        // setTotalPages(Math.ceil((res?.data?.total || 0) / ITEMS_PER_PAGE));
      })
      .catch((err) => {
        console.error(err);
        setCreatorPosts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, currentPage, postFilter]);

  // const totalPosts =
  //   title === "Posts"
  //     ? creatorPostsCount.post_total || 0
  //     : creatorPostsCount.updates_total;

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToFirst = () => {
    setCurrentPage((prev) => Math.max(1));
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToLast = () => {
    setCurrentPage((prev) => Math.min(totalPages));
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    pages.push(1, 2);
    pages.push("...");
    const start = Math.max(3, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 3) {
      pages.push("...");
    }
    pages.push(totalPages - 1, totalPages);
    return [...new Set(pages)];
  };

  if (!creatorPosts) {
    return (
      <div className="cd-error">
        <p>No creator data found.</p>
        <button onClick={() => navigate(-1)} className="cd-back-btn">
          ← Go Back
        </button>
      </div>
    );
  }

  if (loading) {
    return <Loder />;
  }

  return (
    <div className="cd-page">
      {/* Back Nav */}
      <button className="cd-breadcrumb" onClick={() => navigate(-1)}>
        ← Back to Creator
      </button>

      {/* Stats Row */}
      {/* <div className="cd-stats-row">
        {Object.entries(creatorPosts.postCounts || {}).map(([key, val]) => (
          <div className="cd-stat-card" key={key}>
            <span className="cd-stat-val">{val}</span>
            <span className="cd-stat-key">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
          </div>
        ))}
      </div> */}

      <div className="cl-filters">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            className={`cl-filter-btn ${postFilter === f.value ? "cl-filter-btn--active" : ""}`}
            onClick={() => setPostFilter(f.value)}
          >
            {f.label}
            {/* <span className="cl-filter-count">
              {f.value === 'All'
                ? creatorPostsCount.total
                : creatorPostsCount.filter((c) => c.status === f.value)}
            </span> */}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <ContentSection title={title} items={filterData} icon="📝" />
      {/* <ContentSection title="Articles" items={articlesData} icon="📄" /> */}
      {/* <ContentSection title="News" items={newsData} icon="📰" /> */}

      {totalPages > 1 && (
        <>
          <div className="cd-pagination">
            <button
              onClick={goToFirst}
              disabled={currentPage === 1}
              className="cd-page-btn"
            >
              First
            </button>

            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="cd-page-btn"
            >
              ← Previous
            </button>

            <div className="cd-page-numbers">
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`}>...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? "cd-page-number cd-page-number--active"
                        : "cd-page-number"
                    }
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="cd-page-btn"
            >
              Next →
            </button>
            <button
              onClick={goToLast}
              disabled={currentPage === totalPages}
              className="cd-page-btn"
            >
              Last
            </button>
          </div>

          {/* <div className="results-info">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalPosts)} of {totalPosts}{" "}
            {title}
          </div> */}
        </>
      )}
    </div>
  );
}
