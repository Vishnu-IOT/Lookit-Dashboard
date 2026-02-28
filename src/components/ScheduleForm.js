import React, { useState, useEffect } from "react";
import "../styles/schedule.css";

const ScheduleForm = ({ editMode = false, editData = null, onClose }) => {
  const [id, setId] = useState("")
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState("DAY-CALENDER"); // New state for types dropdown
  const [topics] = useState("MPeoplesNEWS"); // Topics state with fixed value

  // Prefill data when editing
  useEffect(() => {
    if (editMode && editData) {
      setId(editData.id)
      setTitle(editData.title);
      setMessage(editData.message);
      setDate(editData.date);
      setTime(editData.time);
      setPreview(editData.image || null);
      setType(editData.type || "DAY-CALENDER"); // Set type from edit data if available
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

    const formData = new FormData();
    formData.append("id", id)
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
          { method: "POST", body: formData }
        );

        const text = await res.text();
        const result = JSON.parse(text);

        if (result.success) {
          alert("Notification created!");
          onClose && onClose();
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
          { method: "POST", body: formData }
        );

        const text = await res.text();
        const result = JSON.parse(text);

        if (result.success) {
          alert("Notification updated!");
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
      <h1 style={{ textAlign: 'left', marginBottom: '20px' }}>Schedule Notifications</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>

        {/* New Types dropdown */}
        <div className="form-group">
          <label>Types</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="DAY-CALENDER">DAY-CALENDER</option>
            <option value="RASIPAGE">RASIPAGE</option>
            <option value="MARRIAGE-ASPECT">MARRIAGE-ASPECT</option>
            <option value="NUMERLOGY">NUMERLOGY</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
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