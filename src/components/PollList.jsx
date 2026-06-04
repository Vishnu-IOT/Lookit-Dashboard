import { useEffect, useState } from "react";
import "../styles/PollList.css";
import axios from "axios";
import PollEditOverlay from "./PollEditOverlay";

const INITIAL_POLLS = [
  {
    id: 1,
    question: "What type of content would you like to see more of on this channel?",
    options: [
      { text: "Tutorials & How-To Guides", votes: 1420 },
      { text: "Live Q&A Sessions", votes: 876 },
      { text: "Behind-the-Scenes Vlogs", votes: 543 },
      { text: "Product Reviews", votes: 312 },
    ],
    createdAt: "2025-05-28T10:30:00Z",
    status: "active",
    creator: { name: "Alex Rivera", avatar: "A" },
    userVoted: null,
  },
  {
    id: 2,
    question: "How satisfied are you with our recent platform updates?",
    options: [
      { text: "Very Satisfied", votes: 2100 },
      { text: "Somewhat Satisfied", votes: 1350 },
      { text: "Neutral", votes: 620 },
      { text: "Dissatisfied", votes: 188 },
    ],
    createdAt: "2025-05-22T08:00:00Z",
    status: "expired",
    creator: { name: "Jordan Kim", avatar: "J" },
    userVoted: 0,
  },
  {
    id: 3,
    question: "Which new feature should we ship next?",
    options: [
      { text: "Dark Mode", votes: 3200 },
      { text: "Offline Support", votes: 1890 },
      { text: "AI Suggestions", votes: 2750 },
    ],
    createdAt: "2025-06-01T14:15:00Z",
    status: "active",
    creator: { name: "Morgan Lee", avatar: "M" },
    userVoted: null,
  },
];

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

function PollCard({ poll, onVote, onEdit, onDelete }) {
  const total = getTotalVotes(poll.options);
  const hasVoted = poll.userVoted !== null && poll.userVoted !== undefined;
  const isExpired = poll.status === 0;

  return (
    <div className="poll-list-card">
      {/* Card Header */}
      <div className="poll-list-card-header">
        {/* <div className="poll-list-creator">
          <div className="poll-list-avatar">{poll.creator.avatar}</div>
          <div className="poll-list-creator-info">
            <span className="poll-list-creator-name">{poll.creator.name}</span>
            <span className="poll-list-date">{formatDate(poll.createdAt)}</span>
          </div>
        </div> */}
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
          console.log(pct, isWinner)

          return (
            <div
              key={i}
              className={`poll-list-option ${isVoted ? "poll-list-option--voted" : ""} ${!hasVoted && !isExpired ? "poll-list-option--clickable" : ""}`}
              // onClick={() => !hasVoted && !isExpired && onVote(poll.id, i)}
              role={!hasVoted && !isExpired ? "button" : undefined}
              tabIndex={!hasVoted && !isExpired ? 0 : undefined}
              // onKeyDown={(e) => e.key === "Enter" && !hasVoted && !isExpired && onVote(poll.id, i)}
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

export default function PollList({ newPolls = [] }) {
  const [polls, setPolls] = useState([]);
  const [editingPoll, setEditingPoll] = useState(null);

  useEffect(() => {
    axios
      .get('https://users.mpdatahub.com/api/polls')
      .then((res) => {
        setPolls(res.data?.data);
        console.log(res.data?.data);
      })
      .catch((err) => console.error('Question Poll error', err));
  }, []);

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

  const handleDelete = (pollId) => {
    if (window.confirm("Delete this poll? This action cannot be undone.")) {
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
    }
  };

  return (
    <div className="poll-list-wrapper">
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
    </div>
  );
}
