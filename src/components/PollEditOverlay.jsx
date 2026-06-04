import { useState } from "react";
import axios from "axios";
import "../styles/PollEditOverlay.css";

const MAX_OPTIONS = 10;
const MIN_OPTIONS = 2;

export default function PollEditOverlay({ poll, onClose, onSave }) {
    const [question, setQuestion] = useState(poll.question);
    const [options, setOptions] = useState(poll.options.map((o) => o.option_text));
    const [startDate, setStartDate] = useState(poll.start_date?.slice(0, 10) || "");
    const [endDate, setEndDate] = useState(poll.end_date?.slice(0, 10) || "");
    const [status, setStatus] = useState(poll.status); // 1 = active, 0 = expired
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const validate = () => {
        const errs = {};
        if (!question.trim()) errs.question = "Question is required.";
        options.forEach((opt, i) => {
            if (!opt.trim()) errs[`opt_${i}`] = "Option cannot be empty.";
        });
        const filled = options.filter((o) => o.trim());
        const uniq = new Set(filled.map((o) => o.trim().toLowerCase()));
        if (uniq.size !== filled.length) errs.duplicate = "All options must be unique.";
        if (!startDate) errs.startDate = "Start date is required.";
        if (!endDate) errs.endDate = "End date is required.";
        else if (startDate && endDate < startDate) errs.endDate = "Must be after start date.";
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSaving(true);
        try {
            const payload = {
                id: poll.id,
                question: question.trim(),
                options: options.map((o) => o.trim()),
                start_date: startDate,
                end_date: endDate,
                status,
            };
            console.log(payload);
            const res = await axios.post(
                `https://users.mpdatahub.com/api/poll-update`,
                payload
            );
            onSave({ ...poll, ...payload, ...res.data?.data });
        } catch (err) {
            console.error("Poll update error", err);
        } finally {
            setSaving(false);
        }
    };

    const updateOption = (i, val) => {
        const updated = [...options];
        updated[i] = val;
        setOptions(updated);
        setErrors((prev) => ({ ...prev, [`opt_${i}`]: null, duplicate: null }));
    };

    const addOption = () => {
        if (options.length < MAX_OPTIONS) setOptions([...options, ""]);
    };

    const removeOption = (i) => {
        if (options.length > MIN_OPTIONS)
            setOptions(options.filter((_, idx) => idx !== i));
    };

    return (
        <div className="peo-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="peo-modal" role="dialog" aria-modal="true" aria-label="Edit poll">

                {/* Header */}
                <div className="peo-header">
                    <span className="peo-title">Edit poll</span>
                    <button className="peo-close" onClick={onClose} aria-label="Close">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="peo-body">
                    {/* Question */}
                    <div className={`peo-field ${errors.question ? "peo-field--error" : ""}`}>
                        <div className="peo-label">
                            Question <span className="peo-req">*</span>
                            <span className="peo-hint">{200 - question.length} left</span>
                        </div>
                        <textarea
                            className="peo-textarea"
                            rows={3}
                            maxLength={200}
                            value={question}
                            onChange={(e) => { setQuestion(e.target.value); setErrors((p) => ({ ...p, question: null })); }}
                            placeholder="Ask your audience something…"
                        />
                        {errors.question && <span className="peo-error-text">{errors.question}</span>}
                    </div>

                    {/* Options */}
                    <div className="peo-field">
                        <div className="peo-label">
                            Options <span className="peo-req">*</span>
                            <span className="peo-hint">{options.length} / {MAX_OPTIONS}</span>
                        </div>
                        {errors.duplicate && <div className="peo-error-inline">{errors.duplicate}</div>}
                        <div className="peo-options-list">
                            {options.map((opt, i) => (
                                <div key={i} className="peo-opt-row">
                                    <span className="peo-opt-num">{i + 1}</span>
                                    <input
                                        type="text"
                                        className={`peo-opt-input ${errors[`opt_${i}`] ? "peo-input--error" : opt.trim() ? "peo-input--valid" : ""}`}
                                        value={opt}
                                        maxLength={100}
                                        placeholder={`Option ${i + 1}`}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                    />
                                    {options.length > MIN_OPTIONS && (
                                        <button className="peo-btn-remove" onClick={() => removeOption(i)} aria-label={`Remove option ${i + 1}`}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < MAX_OPTIONS && (
                            <button className="peo-btn-add" onClick={addOption}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add option
                            </button>
                        )}
                    </div>

                    <div className="peo-divider" />

                    {/* Dates */}
                    <div className="peo-field">
                        <div className="peo-label">Poll duration <span className="peo-req">*</span></div>
                        <div className="peo-date-row">
                            <div className="peo-date-group">
                                <span className="peo-date-label">Start date</span>
                                <input
                                    type="date"
                                    className={`peo-date-input ${errors.startDate ? "peo-input--error" : startDate ? "peo-input--valid" : ""}`}
                                    value={startDate}
                                    min={today}
                                    onChange={(e) => { setStartDate(e.target.value); setErrors((p) => ({ ...p, startDate: null })); }}
                                />
                                {errors.startDate && <span className="peo-error-text">{errors.startDate}</span>}
                            </div>
                            <div className="peo-date-group">
                                <span className="peo-date-label">End date</span>
                                <input
                                    type="date"
                                    className={`peo-date-input ${errors.endDate ? "peo-input--error" : endDate ? "peo-input--valid" : ""}`}
                                    value={endDate}
                                    min={startDate || today}
                                    onChange={(e) => { setEndDate(e.target.value); setErrors((p) => ({ ...p, endDate: null })); }}
                                />
                                {errors.endDate && <span className="peo-error-text">{errors.endDate}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="peo-field">
                        <div className="peo-label">Status</div>
                        <div className="peo-status-row">
                            <button
                                className={`peo-status-chip ${status === 1 ? "peo-status-chip--active" : ""}`}
                                onClick={() => setStatus(1)}
                            >Active</button>
                            <button
                                className={`peo-status-chip ${status === 0 ? "peo-status-chip--expired" : ""}`}
                                onClick={() => setStatus(0)}
                            >Expired</button>
                        </div>
                    </div>
                </div>

                <div className="peo-divider" />

                {/* Footer */}
                <div className="peo-footer">
                    <button className="peo-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="peo-btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>

            </div>
        </div>
    );
}