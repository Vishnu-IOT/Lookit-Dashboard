import React, { useState, useEffect, useRef } from 'react';
import { AlarmClock, Bell } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import '../styles/Updates.css';
import { IoCameraReverse, IoPersonCircleOutline } from 'react-icons/io5';
import { FiCheckCircle } from "react-icons/fi";
import { PiBowlFood, PiXCircleLight } from "react-icons/pi";
import { HiOutlineNewspaper, HiOutlineFilm, HiOutlineCpuChip, HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineSparkles } from "react-icons/hi2";
import { MdSportsVolleyball, MdTravelExplore } from "react-icons/md";
import { RiHealthBookLine } from "react-icons/ri";
import { GiMaterialsScience, GiTravelDress } from "react-icons/gi";
import { FaLandmarkDome } from "react-icons/fa6";


const categoryOptions = [
  { value: 'NEWS', label: 'News', icon: <HiOutlineNewspaper /> },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: <HiOutlineFilm /> },
  { value: 'SPORTS', label: 'Sports', icon: <MdSportsVolleyball /> },
  { value: 'TECHNOLOGY', label: 'Technology', icon: <HiOutlineCpuChip /> },
  { value: 'LIFESTYLE', label: 'Lifestyle', icon: <IoCameraReverse /> },
  { value: 'EDUCATION', label: 'Education', icon: <HiOutlineAcademicCap /> },
  { value: 'HEALTH', label: 'Health', icon: <RiHealthBookLine /> },
  { value: 'TRAVEL', label: 'Travel', icon: <MdTravelExplore /> },
  { value: 'FOOD', label: 'Food', icon: <PiBowlFood /> },
  { value: 'FASHION', label: 'Fashion', icon: <GiTravelDress /> },
  { value: 'BUSINESS', label: 'Business', icon: <HiOutlineBriefcase /> },
  { value: 'SCIENCE', label: 'Science', icon: <GiMaterialsScience /> },
  { value: 'ARTS', label: 'Arts', icon: <HiOutlineSparkles /> },
  { value: 'POLITICS', label: 'Politics', icon: <FaLandmarkDome /> },
];

const typeOptions = [
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
];

const defaultFormData = {
  category: '',
  type: 'IMAGE',
  title: '',
  image: '',
  video: '',
  isActive: 'yes',
  user_id: '',
};

const defaultNotificationForm = {
  user_id: '',
  title: '',
  message: 'Check out this new content! Tap to view now. 🔥',
  image: '',
  type: 'POSTERS',
  type_id: '',
  topic: 'MPeoplesNEWS',
  scheduled_time: ''
};

const UpdatePostList = () => {
  // ── List state ─────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  // ── Edit form state ────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [videoSizeError, setVideoSizeError] = useState('');

  // ── Notification modal state ───────────────────────────────────────────
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationType, setNotificationType] = useState('schedule');
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationForm, setNotificationForm] = useState(defaultNotificationForm);

  const dateTimeInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    getUserFromLocalStorage();
  }, []);

  // ── User ───────────────────────────────────────────────────────────────
  const getUserFromLocalStorage = () => {
    try {
      const userDataString = localStorage.getItem('mp_user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData && userData.id) {
          setCurrentUserId(userData.id.toString());
        } else {
          console.warn('User ID not found in localStorage data');
          alert('User information not found. Please login again.');
        }
      } else {
        console.warn('No user data found in localStorage');
        alert('Please login to continue.');
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      alert('Error loading user information. Please login again.');
    }
  };

  // ── Fetch list ─────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://users.mpdatahub.com/api/update-post-index');
      const data = await response.json();
      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // ── Image compression ──────────────────────────────────────────────────
  const compressImage = async (file) => {
    if (!file) return null;
    try {
      const options = { maxSizeMB: 1, useWebWorker: true };
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Image compression error:', error);
      return file;
    }
  };

  // ── Edit form handlers ─────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: file.name }));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 30 * 1024 * 1024;
    if (file) {
      if (file.size > maxSize) {
        setVideoSizeError('File size exceeds 30MB limit. Please choose a smaller file.');
        e.target.value = '';
        setVideoFile(null);
        setVideoPreview('');
        return;
      }
      setVideoSizeError('');
      setVideoPreview(URL.createObjectURL(file));
      setVideoFile(file);
      setFormData((prev) => ({ ...prev, video: file.name }));
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);

    console.log(category);
    console.log(currentUserId);

    const imageUrl = category.image
      ? category.image.startsWith('http')
        ? category.image
        : `https://users.mpdatahub.com/api/${category.image}`
      : '';

    const videoUrl = category.video_url || category.video
      ? category.video_url?.startsWith('http')
        ? category.video_url
        : `https://users.mpdatahub.com/api/${category.video_url || category.video}`
      : '';

    setFormData({
      category: category.category || '',
      type: category.type || 'IMAGE',
      title: category.title || category.category_name || category.name || '',
      image: imageUrl,
      video: videoUrl,
      isActive: category.isActive || 'yes',
      user_id: currentUserId,
    });

    setImagePreview(imageUrl || '');
    setVideoPreview(videoUrl || '');
    setImageFile(null);
    setVideoFile(null);
    setVideoSizeError('');
  };

  const resetForm = () => {
    setFormData({ ...defaultFormData, user_id: currentUserId });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview('');
    setVideoPreview('');
    setEditingId(null);
    setVideoSizeError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!currentUserId) {
      alert('User information not found. Please login again.');
      getUserFromLocalStorage();
      setLoading(false);
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      setLoading(false);
      return;
    }
    if (!formData.title.trim()) {
      alert('Please enter a title');
      setLoading(false);
      return;
    }

    const formPayload = new FormData();
    formPayload.append('category', formData.category);
    formPayload.append('type', formData.type);
    formPayload.append('title', formData.title);
    formPayload.append('isActive', formData.isActive);
    formPayload.append('user_id', currentUserId);

    if (imageFile) {
      formPayload.append('image', imageFile);
    } else if (formData.image && typeof formData.image === 'string') {
      const imagePath = formData.image.replace('https://users.mpdatahub.com/api/', '');
      formPayload.append('existing_image', imagePath);
    }

    if (formData.type === 'VIDEO') {
      if (videoFile) {
        formPayload.append('video_url', videoFile);
      } else if (formData.video && typeof formData.video === 'string') {
        const videoPath = formData.video.replace('https://users.mpdatahub.com/api/', '');
        formPayload.append('existing_video', videoPath);
      }
    }

    try {
      const apiUrl = `https://users.mpdatahub.com/api/post-update/${editingId}`;
      const response = await fetch(apiUrl, { method: 'POST', body: formPayload });
      const responseData = await response.json();

      if (response.ok) {
        alert('Post updated successfully!');
        resetForm();
        fetchCategories();
      } else {
        console.error('Save failed:', responseData);
        alert('Save failed: ' + (responseData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await fetch(`https://users.mpdatahub.com/api/post-delete/${id}`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('Post deleted successfully!');
        fetchCategories();
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert('Delete failed: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post: ' + error.message);
    }
  };

  // ── Notification handlers ──────────────────────────────────────────────
  const handleNotificationInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationForm((prev) => ({ ...prev, [name]: value }));
  };

  const openNotificationModal = (post, type = 'schedule') => {
    setNotificationType(type);
    setNotificationForm({
      user_id: type === 'schedule' ? (post.user_id || currentUserId).toString() : '',
      title: post.title || post.category || 'New Update',
      message:
        type === 'schedule'
          ? 'Check out this new content! Tap to view now. 🔥'
          : 'Check out this amazing content! Tap to explore now. 🚀',
      image: post.image || '',
      type: 'POSTERS',
      type_id: post.id.toString(),
    });
    setShowNotificationModal(true);
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setNotificationType('schedule');
    setNotificationForm(defaultNotificationForm);
    setNotificationLoading(false);
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    if (!notificationForm.title.trim()) {
      alert('Please enter a title for the notification');
      return;
    }
    if (!notificationForm.message.trim()) {
      alert('Please enter a message for the notification');
      return;
    }

    setNotificationLoading(true);

    let scheduledDate = '';
    let scheduledTime = '';

    const notificationPayload =
      notificationType === 'schedule'
        ? {
          user_id: notificationForm.user_id,
          post_id: notificationForm.type_id,
          title: notificationForm.title,
          message: notificationForm.message,
          image: notificationForm.image,
          type: notificationForm.type,
          type_id: notificationForm.type_id,
          topic: 'MPeoplesNEWS',
        }
        : {
          title: notificationForm.title,
          message: notificationForm.message,
          image: notificationForm.image,
          type: notificationForm.type,
          type_id: notificationForm.type_id,
        };

    try {
      const scheduledDateTime = new Date(notificationForm.scheduled_time);
      console.log(notificationPayload);

      // Format date as YYYY-MM-DD
      scheduledDate = scheduledDateTime.toISOString().split('T')[0];

      // Format time as HH:MM (24-hour format)
      scheduledTime = scheduledDateTime
        .toTimeString()
        .split(' ')[0]
        .substring(0, 5);
      console.log(scheduledDate, scheduledTime);

      const apiUrl =
        notificationType === 'schedule'
          ? 'https://users.mpdatahub.com/api/notification/date-time'
          : 'https://users.mpdatahub.com/api/notification/bulk-send';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...notificationPayload,
          ...(notificationType === 'schedule' && {
            date: scheduledDate,
            time: scheduledTime,
          }),
        }),
      });

      if (response.ok) {
        alert(`${notificationType === 'schedule' ? 'Scheduled' : 'Bulk'} notification sent successfully!`);
        closeNotificationModal();
      } else {
        const errorData = await response.json();
        console.error('Notification failed:', errorData);
        alert(`Failed to send ${notificationType} notification: ` + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert(`Failed to send ${notificationType} notification: ` + error.message);
    } finally {
      setNotificationLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading && categories.length === 0) {
    return <div className="initial-loading">Loading data...</div>;
  }

  // ── Initials ─────────────────────────────────────────────────────────────
  const initials = (name) => {
    return name
      .trim()
      .split(' ')
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getCategoryIcon = (category) => {
    const categoryItem = categoryOptions.find(
      (item) => item.value === category
    );

    return categoryItem?.icon || <HiOutlineNewspaper />;
  };

  return (
    <div className="article-categories-container">
      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {notificationType === 'schedule' ? 'Schedule Notification' : 'Send Bulk Notification'}
              </h2>
              <button className="modal-close-btn" onClick={closeNotificationModal}>
                &times;
              </button>
            </div>

            <form onSubmit={sendNotification} className="notification-form">
              {notificationType === 'schedule' && (
                <div className="form-group">
                  <label htmlFor="user_id">User ID *</label>
                  <input
                    type="text"
                    id="user_id"
                    name="user_id"
                    value={notificationForm.user_id}
                    onChange={handleNotificationInputChange}
                    required
                    readOnly={!!notificationForm.user_id}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={notificationForm.title}
                  onChange={handleNotificationInputChange}
                  placeholder="Notification title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={notificationForm.message}
                  onChange={handleNotificationInputChange}
                  placeholder="Notification message"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={notificationForm.image}
                  onChange={handleNotificationInputChange}
                  placeholder="Image URL for notification"
                />
                {notificationForm.image && (
                  <div className="image-preview-small">
                    <img src={notificationForm.image} alt="Notification preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="type">Type *</label>
                <select
                  id="type"
                  name="type"
                  value={notificationForm.type}
                  onChange={handleNotificationInputChange}
                  required
                >
                  <option value="POSTERS">POSTERS</option>
                  <option value="ARTICLE">ARTICLE</option>
                  <option value="SHORTS">SHORTS</option>
                  <option value="VIDEOS">VIDEOS</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type_id">Type ID *</label>
                <input
                  type="text"
                  id="type_id"
                  name="type_id"
                  value={notificationForm.type_id}
                  onChange={handleNotificationInputChange}
                  required
                  readOnly
                />
              </div>

              {notificationType === 'schedule' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Schedule Date & Time</label>
                    <input
                      ref={dateTimeInputRef}
                      className="form-input"
                      type="datetime-local"
                      name="scheduled_time"
                      value={notificationForm.scheduled_time || ''}
                      onChange={handleNotificationInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                      required={notificationType === 'schedule'}
                    />
                    <small className="form-help">
                      Select future date and time for notification
                    </small>
                    {notificationForm.scheduled_time && (
                      <div className="schedule-preview">
                        <p>
                          Selected:{' '}
                          {new Date(notificationForm.scheduled_time).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Topic</label>
                    <select
                      className="form-select"
                      name="topic"
                      value={notificationForm.topic}
                      onChange={handleNotificationInputChange}
                    >
                      <option value="MPeoplesNEWS">MPeoplesNEWS</option>
                      {/* <option value="MPeoplesAstrology">MPeoplesAstrology</option>
                            <option value="MPeoplesPosts">MPeoplesPosts</option>
                            <option value="MPeoplesrasipalan">MPeoplesrasipalan</option>
                            <option value="MPeoplesLookit">MPeoplesLookit</option>
                            <option value="MPeoplesUPDATES">MPeoplesUPDATES</option>
                            <option value="MPeoplesTRENDING">MPeoplesTRENDING</option>
                            <option value="MakkalCalendar">MakkalCalendar</option> */}
                    </select>
                  </div>
                </>
              )}

              <div className="notification-info">
                <p className="info-text">
                  <strong>Note:</strong> This notification will be {' '}
                  {notificationType === 'schedule' ? 'Scheduled' : 'sent to ALL users'}
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className={`btn ${notificationType === 'schedule' ? 'btn-primary' : 'btn-bulk'}`}
                  disabled={notificationLoading}
                >
                  {notificationLoading
                    ? notificationType === 'schedule' ? 'Sending...' : 'Sending to All...'
                    : notificationType === 'schedule' ? 'Schedule Notification' : 'Send to All Users'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeNotificationModal}
                  disabled={notificationLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="main-content">
        {/* Inline Edit Form — replaces list when editing */}
        {editingId ? (
          <section className="category-form-container cfc-left">
            <h2>Edit Update Post</h2>
            <div className="user-info" />

            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Media Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Thumbnail Image *</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setFormData((prev) => ({ ...prev, image: '' }));
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
                {!imagePreview && formData.image && (
                  <div className="current-image">
                    <p>Current Image: {formData.image}</p>
                  </div>
                )}
              </div>

              {formData.type === 'VIDEO' && (
                <div className="form-group">
                  <label htmlFor="video">Video File *</label>
                  <small style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                    Maximum size: 30MB
                  </small>
                  <input
                    type="file"
                    id="video"
                    name="video"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="file-input"
                  />
                  {videoSizeError && (
                    <div className="error-message" style={{ color: 'red', marginTop: '5px' }}>
                      {videoSizeError}
                    </div>
                  )}
                  {videoPreview && (
                    <div className="video-preview">
                      <video controls width="100%">
                        <source src={videoPreview} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <button
                        type="button"
                        className="remove-video-btn"
                        onClick={() => {
                          setVideoPreview('');
                          setVideoFile(null);
                          setVideoSizeError('');
                          setFormData((prev) => ({ ...prev, video: '' }));
                        }}
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
                  {!videoPreview && formData.video && (
                    <div className="current-video">
                      <p>Current Video: {formData.video}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="isActive">Status</label>
                <select
                  id="isActive"
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleInputChange}
                >
                  <option value="yes">Active</option>
                  <option value="no">Inactive</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Post'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              </div>
            </form>
          </section>
        ) : (

          /* Posts List */
          <section className="categories-list-container">
            <div className="list-header">
              <h2>All Posts ({categories.length})</h2>
              <button className="btn btn-refresh" onClick={fetchCategories} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>

            {loading && categories.length === 0 ? (
              <div className="loading-spinner">Loading posts...</div>
            ) : categories.length === 0 ? (
              <div className="empty-state">
                <p>No posts found. Add your first post!</p>
              </div>
            ) : (
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category.id} className="category-card">
                    <div className="card-header">
                      <div className='uf-card'>
                        <span className="uf-user-initial">
                          {category.category_name ? (
                            // initials(category.category_name)
                            getCategoryIcon(category.category_name)

                          ) : (
                            <IoPersonCircleOutline />
                          )}
                        </span>
                        <div className="card-title-row">
                          <h3>{category.category_name || category.title || category.name || 'Unnamed Post'}</h3>
                          <span className="category-badge">{category.category}</span>
                          <span className="media-type-badge">{category.type}</span>
                        </div>
                      </div>
                      <div className="notification-icons">
                        <div className={`status-badges ${category.isActive === 'yes' ? 'active' : 'inactive'}`}>
                          {category.isActive === 'yes' ? <FiCheckCircle /> : <PiXCircleLight />}
                        </div>
                        <div className="notification-icons">
                          <button
                            className="notification-bell-btn single"
                            onClick={() => openNotificationModal(category, 'bulk')}
                            title="Send Bulk Notification to All Users"
                          >
                            <Bell size={18} />
                          </button>
                          <button
                            className="notification-bell-btn bulk"
                            onClick={() => openNotificationModal(category, 'schedule')}
                            title="Schedule Notification"
                          >
                            <AlarmClock size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {category.image && (
                      <div className="card-image">
                        <img
                          src={`${category.image}`}
                          alt={category.title || category.category_name || 'Post'}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {category.video_url && category.type === 'VIDEO' && (
                      <div className="card-video-indicator">
                        <video controls preload="metadata" width="100%" style={{ borderRadius: '10px' }}>
                          <source src={category.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    <div className="card-actions">
                      <button className="btn btn-edit" onClick={() => handleEdit(category)}>
                        Edit
                      </button>
                      <button className="btn btn-delete" onClick={() => handleDelete(category.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <footer className="app-footer">
              <p>Total Posts: {categories.length}</p>
              {editingId && <p className="editing-notice">Editing Mode Active</p>}
              <p className="user-id-info">User ID: {currentUserId || 'Not loaded'}</p>
            </footer>
          </section>
        )}
      </main>
    </div>
  );
};

export default UpdatePostList;