import { useEffect, useState, useCallback, useRef } from "react";
import "../styles/PollList.css";
import axios from "axios";
import PollEditOverlay from "./PollEditOverlay";
import Loder from "./Loder";

// ==================== NOTIFICATION MODAL COMPONENT ====================
const NotificationModal = ({
  showNotificationModal,
  notificationData,
  setNotificationData,
  handleCloseNotificationModal,
  handleSendNotification,
  isSendingNotification,
  isScheduled = false,
}) => {
  const typeInputRef = useRef(null);
  const titleInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const dateTimeInputRef = useRef(null);
  const [dateTimeError, setDateTimeError] = useState("");

  const LocalDateTime = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  useEffect(() => {
    if (showNotificationModal) {
      const timer = setTimeout(() => {
        if (typeInputRef.current) {
          typeInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showNotificationModal]);

  const handleInputChange = useCallback(
    (field) => (e) => {
      setNotificationData((prev) => ({
        ...prev,
        [field]:
          field === "type"
            ? e.target.value.toUpperCase()
            : field === "image"
              ? e.target.value
              : e.target.value,
      }));
    },
    [setNotificationData],
  );

  const handleSelectChange = useCallback(
    (e) => {
      setNotificationData((prev) => ({
        ...prev,
        topic: e.target.value,
      }));
    },
    [setNotificationData],
  );

  const handleDateTimeChange = useCallback(
    (e) => {
      const selected = new Date(e.target.value);

      const now = new Date();
      now.setSeconds(0, 0);

      if (selected.getTime() < now.getTime()) {
        setDateTimeError("Please select a future date and time.");
      } else {
        setDateTimeError("");
      }
      setNotificationData((prev) => ({
        ...prev,
        scheduled_time: e.target.value,
      }));
    },
    [setNotificationData],
  );

  if (!showNotificationModal) return null;

  return (
    <div className="modal-overlay" onClick={handleCloseNotificationModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isScheduled
              ? "Schedule Push Notification"
              : "Send Push Notification"}
          </h2>
          <button
            className="modal-close-btn"
            onClick={handleCloseNotificationModal}
            type="button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="modal-content1">
          <div className="form-group">
            <label className="form-label">Type</label>
            <input
              ref={typeInputRef}
              className="form-input"
              value={notificationData.type}
              onChange={handleInputChange("type")}
              type="text"
              style={{ textTransform: "uppercase" }}
              disabled
            />
            <small className="form-help">
              Content type (POLL, VIDEO, etc.)
            </small>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              ref={titleInputRef}
              className="form-input"
              value={notificationData.title}
              onChange={handleInputChange("title")}
              type="text"
              disabled
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              ref={messageInputRef}
              className="form-textarea"
              value={notificationData.message}
              onChange={handleInputChange("message")}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              ref={imageInputRef}
              className="form-input"
              value={notificationData.image || ""}
              onChange={handleInputChange("image")}
              type="text"
              placeholder="Enter image URL or path"
            />
            {notificationData.image && (
              <div className="image-preview">
                <img
                  src={notificationData.image}
                  alt="Notification Preview"
                  className="preview-image-small"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {isScheduled && (
            <div className="form-group">
              <label className="form-label">Schedule Date & Time</label>
              <input
                ref={dateTimeInputRef}
                className="form-input"
                type="datetime-local"
                value={notificationData.scheduled_time || ""}
                onChange={handleDateTimeChange}
                min={LocalDateTime()}
                required={isScheduled}
              />
              <small className="form-help">
                Select future date and time for notification
              </small>
              {notificationData.scheduled_time && (
                <div className="schedule-preview">
                  <p>
                    Selected:{" "}
                    {new Date(notificationData.scheduled_time).toLocaleString()}
                  </p>
                </div>
              )}
              {dateTimeError && (
                <small className="form-error">
                  {dateTimeError}
                </small>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Topic</label>
            <select
              className="form-select"
              value={notificationData.topic}
              onChange={handleSelectChange}
            >
              <option value="MPeoplesNEWS">MPeoplesNEWS</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button
            className="modal-cancel-btn"
            onClick={handleCloseNotificationModal}
            disabled={isSendingNotification}
            type="button"
          >
            Cancel
          </button>
          <button
            className="modal-send-btn"
            onClick={handleSendNotification}
            disabled={
              isSendingNotification ||
              (isScheduled && !notificationData.scheduled_time) ||
              !!dateTimeError
            }
            type="button"
          >
            {isSendingNotification ? (
              <>
                <span
                  className="processing-spinner"
                  role="status"
                  aria-hidden="true"
                ></span>
                {isScheduled ? "Scheduling..." : "Sending..."}
              </>
            ) : isScheduled ? (
              "Schedule Notification"
            ) : (
              "Send Notification"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== UTILITY FUNCTIONS ====================
function formatDate(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getTotalVotes(options) {
  return options.reduce((sum, o) => sum + o.vote_count, 0);
}

function getPercent(votes, total) {
  if (total === 0) return 0;
  return Math.round((votes / total) * 100);
}

// ==================== POLL CARD COMPONENT ====================
function PollCard({ poll, onVote, onEdit, onDelete, onNotify, onSchedule }) {
  const total = getTotalVotes(poll.options);
  const hasVoted = poll.userVoted !== null && poll.userVoted !== undefined;
  const isExpired = poll.status === 0;

  return (
    <div className="poll-list-card">
      {/* Card Header */}
      <div className="poll-list-card-header">
        <div className="poll-list-header-right">
          <span className={`poll-list-badge poll-list-badge--${poll.status === 1 ? 'active' : 'expired'}`}>
            {poll.status === 1 ? (
              <><span className="poll-list-badge-dot" />Active</>
            ) : "Expired"}
          </span>
          <div className="poll-list-actions">
            <button
              className="poll-list-action-btn poll-list-action-btn--edit"
              onClick={() => onEdit(poll.id)}
              title="Edit poll"
              aria-label="Edit poll"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              className="poll-list-action-btn poll-list-action-btn--delete"
              onClick={() => onDelete(poll.id)}
              title="Delete poll"
              aria-label="Delete poll"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
            <button
              className="poll-list-action-btn poll-list-action-btn--notify"
              onClick={() => onNotify(poll)}
              title="Send Notification"
              aria-label="Send Notification"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                <path d="M9 21a3 3 0 0 0 6 0" />
              </svg>
            </button>
            <button
              className="poll-list-action-btn poll-list-action-btn--schedule"
              onClick={() => onSchedule(poll)}
              title="Schedule Notification"
              aria-label="Schedule Notification"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Question */}
      <p className="poll-list-question">{poll.question}</p>

      {/* Options */}
      <div className="poll-list-options">
        {poll.options.map((option, i) => {
          const pct = getPercent(option.vote_count, total);
          const isWinner = hasVoted && option.vote_count === Math.max(...poll.options.map((o) => o.vote_count));
          const isVoted = poll.vote_count === i;

          return (
            <div
              key={i}
              className={`poll-list-option ${isVoted ? "poll-list-option--voted" : ""} ${!hasVoted && !isExpired ? "poll-list-option--clickable" : ""}`}
              role={!hasVoted && !isExpired ? "button" : undefined}
              tabIndex={!hasVoted && !isExpired ? 0 : undefined}
              aria-label={!hasVoted && !isExpired ? `Vote for ${option.text}` : undefined}
            >
              <div className="poll-list-option-top">
                <div className="poll-list-option-left">
                  {isVoted && (
                    <span className="poll-list-voted-check">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                  <span className="poll-list-option-text">{option.option_text}</span>
                  {isWinner && hasVoted && (
                    <span className="poll-list-winner-tag">Leading</span>
                  )}
                </div>

                <span className="poll-list-option-pct">{pct}%</span>

              </div>

              {hasVoted && (
                <div className="poll-list-bar-track">
                  <div
                    className={`poll-list-bar-fill ${isWinner ? "poll-list-bar-fill--winner" : ""}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              {hasVoted && (
                <span className="poll-list-option-votes">
                  {option.vote_count.toLocaleString()} votes
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="poll-list-card-footer">
        <span className="poll-list-total-votes">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {total.toLocaleString()} total votes
        </span>

        {!hasVoted && !isExpired && (
          <span className="poll-list-vote-hint">Click an option to vote</span>
        )}
        {isExpired && (
          <span className="poll-list-expired-note">Voting closed</span>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN POLL LIST COMPONENT ====================
export default function PollList({ newPolls = [] }) {
  const [polls, setPolls] = useState([]);
  const [editingPoll, setEditingPoll] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [totalPosts, setTotalPosts] = useState(0);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const [isLoading, setIsLoading] = useState(true);

  // ==================== NOTIFICATION STATES ====================
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedPollForNotification, setSelectedPollForNotification] =
    useState(null);
  const [isScheduledNotification, setIsScheduledNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: "POLL-QUESTION",
    title: "",
    message: "",
    image: "",
    topic: "MPeoplesNEWS",
    detailed_content: "",
    scheduled_time: "",
  });
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [userId, setUserId] = useState("");

  // ==================== PAGINATION FUNCTIONS ====================
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToFirst = () => {
    setCurrentPage(1);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToLast = () => {
    setCurrentPage(totalPages);
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

  // ==================== NOTIFICATION FUNCTIONS ====================
  const handleCloseNotificationModal = useCallback(() => {
    setShowNotificationModal(false);
    setSelectedPollForNotification(null);
    setIsScheduledNotification(false);
    setNotificationData({
      type: "POLL-QUESTION",
      title: "",
      message: "",
      image: "",
      topic: "MPeoplesNEWS",
      detailed_content: "",
      scheduled_time: "",
    });
    setIsSendingNotification(false);
  }, []);

  const handleSendNotification = useCallback(async () => {
    if (!selectedPollForNotification) return;

    if (isScheduledNotification && !notificationData.scheduled_time) {
      alert("Please select a schedule date and time");
      return;
    }

    setIsSendingNotification(true);

    let scheduledDate = "";
    let scheduledTime = "";

    console.log("Selected Poll:", selectedPollForNotification);
    console.log("Notification Data:", notificationData);

    try {
      const basePayload = {
        type: notificationData.type || "POLL-QUESTION",
        type_id: notificationData.type_id || selectedPollForNotification.id.toString(),
        post_id: selectedPollForNotification.id.toString(),
        title: notificationData.title,
        message: notificationData.message,
        image: notificationData.image || "",
        topics: "MPeoplesNEWS",
        detailed_content: notificationData.detailed_content || "",
      };

      console.log("Base Payload:", basePayload);

      let response;

      if (isScheduledNotification) {
        const scheduledDateTime = new Date(notificationData.scheduled_time);
        scheduledDate = scheduledDateTime.toISOString().split("T")[0];
        scheduledTime = scheduledDateTime
          .toTimeString()
          .split(" ")[0]
          .substring(0, 5);

        response = await axios.post(
          "https://users.mpdatahub.com/api/notification/date-time",
          {
            ...basePayload,
            date: scheduledDate,
            time: scheduledTime,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );
      } else {
        response = await axios.post(
          "https://users.mpdatahub.com/api/bulk-send",
          basePayload,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );
      }

      if (response.data.success) {
        showToast(
          isScheduledNotification
            ? `Notification scheduled successfully for ${scheduledDate} at ${scheduledTime}!`
            : "Notification sent successfully!",
          "success"
        );
        handleCloseNotificationModal();
      } else {
        alert(
          response.data.message ||
          `Failed to ${isScheduledNotification ? "schedule" : "send"} notification`,
        );
      }
    } catch (err) {
      console.error("Notification error:", err);

      if (err.response?.status === 405) {
        alert(
          "The scheduling API endpoint exists but may need to be configured correctly on the server. Please check with your backend team.",
        );
      } else {
        alert(`Error: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setIsSendingNotification(false);
    }
  }, [
    selectedPollForNotification,
    notificationData,
    isScheduledNotification,
    handleCloseNotificationModal,
  ]);

  const handleOpenNotificationModal = useCallback(
    (poll, isScheduled = false) => {
      console.log(poll);

      setSelectedPollForNotification(poll);
      setIsScheduledNotification(isScheduled);
      setNotificationData({
        type: "POLL-QUESTION",
        type_id: poll.id.toString(),
        title: poll.question || "",
        message: 'Check out this new Poll! Tap to view now. 🔥' || '',
        image: "",
        topic: "MPeoplesNEWS",
        detailed_content: "",
        scheduled_time: "",
      });
      setShowNotificationModal(true);
    },
    [],
  );

  // ==================== POLL FUNCTIONS ====================
  const handleVote = (pollId, optionIndex) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        const updatedOptions = poll.options.map((opt, i) =>
          i === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return { ...poll, options: updatedOptions, userVoted: optionIndex };
      })
    );
  };

  const handleEdit = (pollId) => {
    const poll = polls.find((p) => p.id === pollId);
    if (poll) setEditingPoll(poll);
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Delete this poll? This action cannot be undone.')) return;
    try {
      const res = await axios.get(
        `https://users.mpdatahub.com/api/poll/delete/${pollId}`
      );
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      showToast("Poll deleted successfully!", "success");
    } catch (err) {
      console.error("Poll update error", err);
      showToast("Failed to delete poll.", "error");
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`https://users.mpdatahub.com/api/polls?page=${currentPage}&per_page=${ITEMS_PER_PAGE}`)
      .then((res) => {
        setPolls(res.data?.data);
        setTotalPages(res.data?.last_page);
        setTotalPosts(res.data?.total);
        console.log(res.data?.data);
      })
      .catch((err) => console.error('Question Poll error', err))
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage]);

  // Get logged in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserId(userData.id || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="poll-list-wrapper">
      {toast.show && (
        <div className={`toast-box ${toast.type}`}>{toast.message}</div>
      )}
      {isLoading ? (
        <Loder />
      ) : (
        <>
          <NotificationModal
            showNotificationModal={showNotificationModal}
            notificationData={notificationData}
            setNotificationData={setNotificationData}
            handleCloseNotificationModal={handleCloseNotificationModal}
            handleSendNotification={handleSendNotification}
            isSendingNotification={isSendingNotification}
            isScheduled={isScheduledNotification}
          />

          {/* Page Header */}
          <div className="poll-list-page-header">
            <div>
              <h1 className="poll-list-page-title">Poll Management</h1>
              <p className="poll-list-page-subtitle">
                {polls.length} poll{polls.length !== 1 ? "s" : ""} · {polls.filter((p) => p.status === 1).length} active
              </p>
            </div>
            <div className="poll-list-header-stats">
              <div className="poll-list-stat">
                <span className="poll-list-stat-value">
                  {polls.reduce((sum, p) => sum + getTotalVotes(p.options), 0).toLocaleString()}
                </span>
                <span className="poll-list-stat-label">Total Votes</span>
              </div>
              <div className="poll-list-stat-divider" />
              <div className="poll-list-stat">
                <span className="poll-list-stat-value">{polls.filter((p) => p.status === 1).length}</span>
                <span className="poll-list-stat-label">Active Polls</span>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {polls.length === 0 ? (
            <div className="poll-list-empty">
              <div className="poll-list-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M8 12h8M8 8h5M8 16h3" />
                </svg>
              </div>
              <h3 className="poll-list-empty-title">No polls yet</h3>
              <p className="poll-list-empty-desc">Create your first poll to start collecting responses from your audience.</p>
            </div>
          ) : (
            <div className="poll-list-grid">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onVote={handleVote}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onNotify={(poll) => handleOpenNotificationModal(poll, false)}
                  onSchedule={(poll) => handleOpenNotificationModal(poll, true)}
                />
              ))}
            </div>
          )}

          {editingPoll && (
            <PollEditOverlay
              poll={editingPoll}
              onClose={() => setEditingPoll(null)}
              onSave={(updated) => {
                setPolls((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                setEditingPoll(null);
              }}
            />
          )}

          {totalPages > 1 && (
            <>
              <div className="cd-pagination" style={{ marginBottom: '20px' }}>
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
            </>
          )}
        </>
      )}
    </div>
  );
}