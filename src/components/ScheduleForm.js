import React, { useState, useEffect } from "react";
import "../styles/schedule.css";

const ScheduleForm = ({ editMode = false, editData = null, onClose }) => {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [typeId, setTypeid] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState("DAY-CALENDER"); // New state for types dropdown
  const [topics] = useState("MPeoplesNEWS"); // Topics state with fixed value

  const [errors, setErrors] = useState({
    title: "",
    message: "",
    date: "",
    time: "",
  });

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = "Title is required.";
    }
    if (!message.trim()) {
      newErrors.message = "Message is required.";
    }
    if (!date) {
      newErrors.date = "Please select a date.";
    }
    if (!time) {
      newErrors.time = "Please select a time.";
    }
    if (date && time) {
      const selectedDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      now.setSeconds(0, 0);
      if (selectedDateTime < now) {
        newErrors.time = "Please select a future date and time.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setId("");
    setTitle("");
    setMessage("");
    setDate("");
    setTime("");
    setTypeid("");
    setImageFile(null);
    setPreview(null);
    setType("DAY-CALENDER");

    setErrors({
      title: "",
      message: "",
      date: "",
      time: "",
    });

    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Prefill data when editing
  useEffect(() => {
    if (editMode && editData) {
      setId(editData.id);
      setTitle(editData.title);
      setMessage(editData.message);
      setDate(editData.date);
      setTime(editData.time);
      setTypeid(editData.type_id);
      setPreview(editData.image || null);
      setType(editData.type || "DAY-CALENDER");
    }
  }, [editMode, editData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("id", id);
    formData.append("type_id", typeId);
    formData.append("title", title);
    formData.append("message", message);
    formData.append("type", "general");
    formData.append("detailed_content", "empty");
    formData.append("date", date);
    formData.append("time", `${time}:00`);
    formData.append("Status", 1);
    formData.append("types", type); // Add types dropdown value
    formData.append("topics", topics); // Add topics with value "MPeoplesNEWS"

    if (!editMode) {
      if (imageFile) formData.append("image", imageFile);

      try {
        const res = await fetch(
          "https://users.mpdatahub.com/api/notification/date-time",
          { method: "POST", body: formData },
        );

        const text = await res.text();
        const result = JSON.parse(text);

        if (result.success) {
          showToast("Notification created!", "success");
          resetForm();
          setTimeout(() => {
            onClose && onClose();
          }, 1000);
        } else {
          alert("Failed to create notification.");
        }
      } catch {
        alert("Server error.");
      }
    } else {
      // UPDATE
      if (imageFile) formData.append("image", imageFile);

      try {
        const res = await fetch(
          `https://users.mpdatahub.com/api/update-notification/${editData.id}`,
          { method: "POST", body: formData },
        );

        const text = await res.text();
        const result = JSON.parse(text);

        if (result.success) {
          showToast("Notification updated!", "success");
          onClose && onClose();
        } else {
          alert("Failed to update");
        }
      } catch {
        alert("Server error");
      }
    }
  };

  return (
    <div className="schedule-container">
      {toast.show && (
        <div className={`toast-box ${toast.type}`}>{toast.message}</div>
      )}
      <h1 style={{ textAlign: "left", marginBottom: "20px" }}>
        Schedule Notifications
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            className={errors.title ? "input-error" : ""}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors((prev) => ({
                  ...prev,
                  title: "",
                }));
              }
            }}
          />
          {errors.title && (
            <small className="error-text">
              {errors.title}
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea
            value={message}
            className={errors.message ? "input-error" : ""}
            onChange={(e) => {
              setMessage(e.target.value);

              if (errors.message) {
                setErrors((prev) => ({
                  ...prev,
                  message: "",
                }));
              }
            }}
          />
          {errors.message && (
            <small className="error-text">
              {errors.message}
            </small>
          )}
        </div>

        {/* New Types dropdown */}
        <div className="form-group">
          <label>Types</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="DAY-CALENDER">DAY-CALENDER</option>
            <option value="RASIPAGE">RASIPAGE</option>
            <option value="MARRIAGE-ASPECT">MARRIAGE-ASPECT</option>
            <option value="NUMERLOGY">NUMERLOGY</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            className={errors.date ? "input-error" : ""}
            onChange={(e) => {
              setDate(e.target.value);
              setTime("");

              setErrors((prev) => ({
                ...prev,
                date: "",
                time: "",
              }));
            }}
          />

          {errors.date && (
            <small className="error-text">
              {errors.date}
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            value={time}
            disabled={!date}
            className={errors.time ? "input-error" : ""}
            onChange={(e) => {
              setTime(e.target.value);

              if (errors.time) {
                setErrors((prev) => ({
                  ...prev,
                  time: "",
                }));
              }
            }}
          />

          {errors.time && (
            <small className="error-text">
              {errors.time}
            </small>
          )}
          {!date && (
            <small className="form-help">
              Please select a date first.
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Upload Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>

        <button type="submit" className="btn">
          {editMode ? "Update Notification" : "Create Notification"}
        </button>

        {editMode && (
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        )}
      </form>
    </div>
  );
};

export default ScheduleForm;
