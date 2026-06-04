import { useState } from "react";
import "../styles/PollForm.css";
import axios from "axios";

const MAX_QUESTION_LENGTH = 200;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

export default function PollForm({ onPollCreated }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    if (errors.question) setErrors((prev) => ({ ...prev, question: null }));
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
    if (errors[`option_${index}`]) {
      setErrors((prev) => ({ ...prev, [`option_${index}`]: null }));
    }
  };

  const addOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > MIN_OPTIONS) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!question.trim()) newErrors.question = "Poll question is required.";
    options.forEach((opt, i) => {
      if (!opt.trim()) newErrors[`option_${i}`] = "Option cannot be empty.";
    });
    const uniqueOpts = new Set(options.map((o) => o.trim().toLowerCase()));
    if (uniqueOpts.size !== options.filter((o) => o.trim()).length) {
      newErrors.duplicate = "All options must be unique.";
    }
    if (!startDate) newErrors.startDate = "Start date is required.";
    if (!endDate) newErrors.endDate = "End date is required.";
    if (startDate && endDate && endDate < startDate)
      newErrors.endDate = "End date must be after start date.";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const newPoll = {
      id: Date.now(),
      question: question.trim(),
      options: options.map((opt) => ({ text: opt.trim(), votes: 0 })),
      createdAt: new Date().toISOString(),
      status: "active",
      creator: { name: "You", avatar: "Y" },
      startDate,
      endDate,
    };
    const newbody = {
      question: question.trim(),
      options: options,
      start_date: startDate,
      end_date: endDate,
    };

    try {
      await axios.post(
        'https://users.mpdatahub.com/api/poll-create',
        newbody
      );
      if (onPollCreated) onPollCreated(newPoll);
      setQuestion("");
      setOptions(["", ""]);
      setErrors({});
      setSubmitted(true);
      setStartDate("");
      setEndDate("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const questionRemainder = MAX_QUESTION_LENGTH - question.length;
  const isNearLimit = questionRemainder <= 30;

  return (
    <div className="poll-form-wrapper">
      <div className="poll-form-card">
        {/* Header */}
        <div className="poll-form-header">
          {/* <div className="poll-form-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M8 12h8M8 8h5M8 16h3" />
            </svg>
          </div> */}
          <div>
            <h2 className="poll-form-title">Create a Poll</h2>
            {/* <p className="poll-form-subtitle">Engage your audience with a question</p> */}
          </div>
        </div>

        <div className="poll-form-divider" />

        {/* Success Banner */}
        {submitted && (
          <div className="poll-form-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Poll created successfully!
          </div>
        )}

        {/* Question Field */}
        <div className="poll-form-field">
          <label className="poll-form-label" htmlFor="poll-question">
            Poll Question
            <span className="poll-form-required">*</span>
          </label>
          <div className={`poll-form-textarea-wrap ${errors.question ? "poll-form-input--error" : question.trim() ? "poll-form-input--valid" : ""}`}>
            <textarea
              id="poll-question"
              className="poll-form-textarea"
              placeholder="Ask your audience something..."
              value={question}
              onChange={handleQuestionChange}
              maxLength={MAX_QUESTION_LENGTH}
              rows={3}
            />
          </div>
          <div className="poll-form-field-footer">
            {errors.question ? (
              <span className="poll-form-error-text">{errors.question}</span>
            ) : (
              <span />
            )}
            <span className={`poll-form-char-count ${isNearLimit ? "poll-form-char-count--warn" : ""}`}>
              {questionRemainder} Words
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="poll-form-field">
          <label className="poll-form-label">
            Poll Options
            <span className="poll-form-required">*</span>
            <span className="poll-form-label-hint">{options.length} / {MAX_OPTIONS}</span>
          </label>

          {errors.duplicate && (
            <div className="poll-form-error-inline">{errors.duplicate}</div>
          )}

          <div className="poll-form-options-list">
            {options.map((opt, index) => (
              <div key={index} className="poll-form-option-row">
                <span className="poll-form-option-number">{index + 1}</span>
                <div className={`poll-form-option-input-wrap ${errors[`option_${index}`] ? "poll-form-input--error" : opt.trim() ? "poll-form-input--valid" : ""}`}>
                  <input
                    type="text"
                    className="poll-form-option-input"
                    placeholder={`Option ${index + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    maxLength={100}
                  />
                </div>
                {options.length > MIN_OPTIONS && (
                  <button
                    className="poll-form-btn-remove"
                    onClick={() => removeOption(index)}
                    title="Remove option"
                    aria-label={`Remove option ${index + 1}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
                {errors[`option_${index}`] && (
                  <span className="poll-form-error-dot" title={errors[`option_${index}`]}>!</span>
                )}
              </div>
            ))}
          </div>

          {options.length < MAX_OPTIONS && (
            <button className="poll-form-btn-add" onClick={addOption}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Option
            </button>
          )}
        </div>

        <div className="poll-form-divider" />

        {/* Date Range */}
        <div className="poll-form-field">
          <label className="poll-form-label">
            Poll Duration <span className="poll-form-required">*</span>
          </label>
          <div className="poll-form-date-row">
            <div className="poll-form-date-group">
              <span className="poll-form-date-label">Start Date</span>
              <div className={`poll-form-date-input-wrap ${errors.startDate ? "poll-form-input--error" : startDate ? "poll-form-input--valid" : ""}`}>
                <input
                  type="date"
                  className="poll-form-date-input"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setErrors((prev) => ({ ...prev, startDate: null }));
                  }}
                />
              </div>
              {errors.startDate && <span className="poll-form-error-text">{errors.startDate}</span>}
            </div>
            <div className="poll-form-date-group">
              <span className="poll-form-date-label">End Date</span>
              <div className={`poll-form-date-input-wrap ${errors.endDate ? "poll-form-input--error" : endDate ? "poll-form-input--valid" : ""}`}>
                <input
                  type="date"
                  className="poll-form-date-input"
                  value={endDate}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setErrors((prev) => ({ ...prev, endDate: null }));
                  }}
                />
              </div>
              {errors.endDate && <span className="poll-form-error-text">{errors.endDate}</span>}
            </div>
          </div>
        </div>

        <div className="poll-form-divider" />

        {/* Footer */}
        <div className="poll-form-footer">
          <p className="poll-form-footer-note">
            Minimum {MIN_OPTIONS} options required · Maximum {MAX_OPTIONS} options
          </p>
          <button className="poll-form-btn-submit" onClick={handleSubmit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 2 11 13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
}
