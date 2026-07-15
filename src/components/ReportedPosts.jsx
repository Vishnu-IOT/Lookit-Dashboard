import React, { useState, useMemo, useEffect, useCallback } from 'react';
import '../styles/ReportedPosts.css';
import axios from 'axios';
import { VscComment, VscEye } from "react-icons/vsc";
import { VscThumbsupFilled } from "react-icons/vsc";
import Loder from './Loder';

const ReportedPosts = () => {
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reason, setReason] = useState('All');
  const [status, setStatus] = useState('All');
  const [dateRange, setDateRange] = useState('Last 7 days');

  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [rangePosts, setRangePosts] = useState({ from: null, to: null });

  const [isLoading, setIsLoading] = useState(false);


  const fetchReports = useCallback(() => {
    setIsLoading(true);
    const params = {
      page: currentPage,
      per_page: reportsPerPage,
    };

    axios
      .get(
        `https://users.mpdatahub.com/api/reports-list-dashoard`, { params }
      )
      .then((response) => {
        setReports(response.data.data || []);
        console.log("API response data:", response.data.data);
        setTotalPages(response.data.last_page);
        setTotalReports(response.data.total);
        setRangePosts({
          from: response.data.from,
          to: response.data.to,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("API fetch error:", error);
        setIsLoading(false);
      });
  }, [currentPage, reportsPerPage]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, currentPage]);

  // Filter reports based on search and filters
  const filteredReports = useMemo(() => {
    console.log("Filtering reports with searchQuery:", searchQuery, "and reason:", reason);
    return reports.filter(report => {
      console.log("Checking report:", report?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSearch =
        report?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report?.post_details?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      console.log("matchesSearch:", matchesSearch);

      const matchesReason = reason === 'All' || report.reason === reason.toUpperCase();

      return matchesSearch && matchesReason;
    });
  }, [searchQuery, reason]);

  // Calculate pagination
  // const totalPages = Math.ceil(totalReports / reportsPerPage);
  // const startIndex = (currentPage - 1) * reportsPerPage;
  // const endIndex = startIndex + reportsPerPage;
  // const filReports = filteredReports.slice(startIndex, endIndex);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= reportsPerPage) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // const getReasonBadgeClass = (reason) => {
  //   switch (reason) {
  //     case 'SPAM':
  //       return 'rep-art-badge-spam';
  //     case 'HATE SPEECH':
  //       return 'rep-art-badge-hate';
  //     case 'VIOLENCE':
  //       return 'rep-art-badge-violence';
  //     default:
  //       return '';
  //   }
  // };

  // const getReasonText = (reason) => {
  //   if (reason === 'HATE SPEECH') return 'HATE\nSPEECH';
  //   return reason;
  // };

  // Function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="rep-art-container">
      {/* Header */}
      {isLoading ? (
        <Loder />
      ) : (
        <>
          <div className="rep-art-header">
            <h1>Reported Posts</h1>
            <p className="rep-art-description">Review reports submitted by users and take necessary moderation actions.</p>
          </div>

          {/* Tabs */}
          <div className="rep-art-tabs">
            <button
              className={`rep-art-tab ${activeTab === 'all' ? 'rep-art-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Reports
            </button>
            {/* <button
          className={`rep-art-tab ${activeTab === 'archived' ? 'rep-art-active' : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          Archived
        </button> */}
          </div>

          {/* Filters */}
          <div className="rep-art-filters">
            <div className="rep-art-search-container">
              <span className="rep-art-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by reporter or post title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rep-art-search-input"
              />
            </div>

            <div className="rep-art-filter-group">
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="rep-art-filter-select">
                <option>All</option>
                <option>Spam</option>
                <option>Hate Speech</option>
                <option>Violence</option>
              </select>
            </div>

            <div className="rep-art-filter-group">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="rep-art-filter-select">
                <option>All</option>
                <option>Pending</option>
                <option>Resolved</option>
              </select>
            </div>

            <div className="rep-art-filter-group">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="rep-art-filter-select">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>

            <button className="rep-art-refresh-btn" onClick={() => { fetchReports() }}>🔄</button>
          </div>

          {/* Table */}
          <div className="rep-art-table-container">
            <table className="rep-art-table">
              <thead>
                <tr>
                  <th className="rep-art-col-reporter">REPORTER</th>
                  <th className="rep-art-col-reason">TITLE</th>
                  <th className="rep-art-col-message">REPORT MESSAGE</th>
                  <th className="rep-art-col-post">POST DETAILS</th>
                  <th className="rep-art-col-engagement">ENGAGEMENT</th>
                  <th className="rep-art-col-date">DATE</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="rep-art-table-row">
                    <td className="rep-art-col-reporter">
                      <div className="rep-art-reporter-info">
                        <div className="rep-art-avatar">
                          <img className="rep-art-avatar-img" src={report?.profile_image || '../assets/avatar.avif'} alt={report?.name} />
                        </div>
                        <div className="rep-art-reporter-name">{report?.name}</div>
                      </div>
                    </td>
                    <td className="rep-art-col-reason">
                      <span className={`rep-art-badge`}>
                        {report?.title || 'N/A'}
                      </span>
                    </td>
                    <td className="rep-art-col-message">
                      <span className="rep-art-message">{report?.message}</span>
                    </td>
                    <td className="rep-art-col-post">
                      <div className="rep-art-post-details">
                        <div className="rep-art-post-image">
                          <img className="rep-art-post-img" src={report?.post_details?.image || report?.post_details?.FullImgPath || '../assets/lookit.png'} alt={report?.post_details?.title} />
                        </div>
                        <div className="rep-art-post-info">
                          <div className="rep-art-post-title">{report?.post_details?.title || 'N/A'}</div>
                          {/* <div className="rep-art-post-tags">
                        {report.post_details.tags.map((tag, idx) => (
                          <span key={idx} className="rep-art-tag">{tag}</span>
                        ))}
                      </div> */}
                        </div>
                      </div>
                    </td>
                    <td className="rep-art-col-engagement">
                      <div className="rep-art-engagement-stats">
                        <div className="rep-art-stat">
                          <span className="rep-art-icon"><VscThumbsupFilled color='#ef9645' /></span>
                          <span className="rep-art-value">{report?.post_details?.like || report?.post_details?.likes_count || 0}</span>
                        </div>
                        <div className="rep-art-stat">
                          <span className="rep-art-icon"><VscComment color='#1877f2' /></span>
                          <span className="rep-art-value">{report?.post_details?.comment || report?.post_details?.comment_count || 0}</span>
                        </div>
                        <div className="rep-art-stat">
                          <span className="rep-art-icon"><VscEye color='#6364ff' /></span>
                          <span className="rep-art-value">{report?.post_details?.views || report?.post_details?.view_count || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="rep-art-col-date">
                      <span className="rep-art-date">{formatDate(report?.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="rep-art-pagination">
            <span className="rep-art-pagination-info">SHOWING {rangePosts.from}-{rangePosts.to} OF {totalReports} RESULTS</span>
            <div className="rep-art-pagination-controls">
              <button
                className="rep-art-pagination-btn rep-art-pagination-prev"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                ←
              </button>
              {getPageNumbers().map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={idx} className="rep-art-dots">...</span>
                ) : (
                  <button
                    key={idx}
                    className={`rep-art-pagination-btn ${currentPage === pageNum ? 'rep-art-pagination-active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              ))}
              <button
                className="rep-art-pagination-btn rep-art-pagination-next"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportedPosts;