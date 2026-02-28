import React, { useState, useEffect } from 'react';
import '../styles/Updates.css';
import { Bell, Send } from 'lucide-react';

const Updates = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationType, setNotificationType] = useState('single');
  const [currentUserId, setCurrentUserId] = useState('');
  const [videoSizeError, setVideoSizeError] = useState('');

  // Predefined category options
  const categoryOptions = [
    { value: 'NEWS', label: 'News' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'LIFESTYLE', label: 'Lifestyle' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'FOOD', label: 'Food' },
    { value: 'FASHION', label: 'Fashion' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'SCIENCE', label: 'Science' },
    { value: 'ARTS', label: 'Arts' },
    { value: 'POLITICS', label: 'Politics' },
  ];

  // Media type options
  const typeOptions = [
    { value: 'IMAGE', label: 'Image' },
    { value: 'VIDEO', label: 'Video' }
  ];

  // Form states
  const [formData, setFormData] = useState({
    category: '',
    type: 'IMAGE',
    title: '',
    image: '',
    video: '',
    isActive: 'yes',
    user_id: ''
  });

  // Notification form states
  const [notificationForm, setNotificationForm] = useState({
    user_id: '',
    title: '',
    message: 'Check out this new content! Tap to view now. 🔥',
    image: '',
    type: 'POSTERS',
    type_id: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');

  // Fetch categories and user ID on component mount
  useEffect(() => {
    fetchCategories();
    getUserFromLocalStorage();
  }, []);

  // Get user data from localStorage
  const getUserFromLocalStorage = () => {
    try {
      const userDataString = localStorage.getItem('mp_user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData && userData.id) {
          setCurrentUserId(userData.id.toString());
          setFormData(prev => ({
            ...prev,
            user_id: userData.id.toString()
          }));
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

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://users.mpdatahub.com/api/update-post-index');
      const data = await response.json();
      // console.log(data.data);

      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle notification form changes
  const handleNotificationInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationForm({
      ...notificationForm,
      [name]: value
    });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({
        ...formData,
        image: file.name
      });
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 30 * 1024 * 1024; // 30MB in bytes

    if (file) {
      // Check file size
      if (file.size > maxSize) {
        setVideoSizeError('File size exceeds 30MB limit. Please choose a smaller file.');
        // Clear the input
        e.target.value = '';
        setVideoFile(null);
        setVideoPreview('');
        return;
      }

      // Clear any previous error
      setVideoSizeError('');

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      setVideoFile(file);
      setFormData({ ...formData, video: file.name });
    }
  };

  // Open notification modal for a specific post
  const openNotificationModal = (post, type = 'single') => {
    setSelectedPost(post);
    setNotificationType(type);

    // Set form data based on the post
    setNotificationForm({
      user_id: type === 'single' ? (post.user_id || currentUserId).toString() : '',
      title: post.title || post.category || 'New Update',
      message: type === 'single'
        ? 'Check out this new content! Tap to view now. 🔥'
        : 'Check out this amazing content! Tap to explore now. 🚀',
      image: post.image || '',
      type: 'POSTERS',
      type_id: post.id.toString()
    });

    setShowNotificationModal(true);
  };

  // Close notification modal
  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedPost(null);
    setNotificationType('single');
    setNotificationForm({
      user_id: '',
      title: '',
      message: 'Check out this new content! Tap to view now. 🔥',
      image: '',
      type: 'POSTERS',
      type_id: ''
    });
    setNotificationLoading(false);
  };

  // Send notification
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

    // Prepare payload based on notification type
    const notificationPayload = notificationType === 'single'
      ? {
        user_id: notificationForm.user_id,
        title: notificationForm.title,
        message: notificationForm.message,
        image: notificationForm.image,
        type: notificationForm.type,
        type_id: notificationForm.type_id
      }
      : {
        title: notificationForm.title,
        message: notificationForm.message,
        image: notificationForm.image,
        type: notificationForm.type,
        type_id: notificationForm.type_id
      };
    try {
      const apiUrl = notificationType === 'single'
        ? 'https://tnreaders.in/api/notification/sendSingleNotification'
        : 'https://tnreaders.in/api/notification/bulk-send';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPayload)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${notificationType === 'single' ? 'Single' : 'Bulk'} notification sent successfully!`);
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

  // Handle form submission (Add/Update)
  // Handle form submission (Add/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if user ID is available
    if (!currentUserId) {
      alert('User information not found. Please login again.');
      getUserFromLocalStorage();
      return;
    }

    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const formPayload = new FormData();
    formPayload.append('category', formData.category);
    formPayload.append('type', formData.type);
    formPayload.append('title', formData.title);
    formPayload.append('isActive', formData.isActive);
    formPayload.append('user_id', currentUserId);

    // Handle image - either new file or existing URL
    if (formData.type === 'IMAGE' || formData.type === 'VIDEO') {
      if (imageFile) {
        // New image file selected
        formPayload.append('image', imageFile);
      } else if (formData.image && typeof formData.image === 'string') {
        // Keep existing image URL - send it as a field
        // Extract just the filename/path from the full URL if needed
        const imagePath = formData.image.replace('https://users.mpdatahub.com/api/', '');
        formPayload.append('existing_image', imagePath);
      }
    }

    // Handle video - only for VIDEO type
    if (formData.type === 'VIDEO') {
      if (videoFile) {
        // New video file selected
        formPayload.append('video_url', videoFile);
      } else if (formData.video && typeof formData.video === 'string') {
        // Keep existing video URL
        const videoPath = formData.video.replace('https://users.mpdatahub.com/api/', '');
        formPayload.append('existing_video', videoPath);
      }
    }

    try {
      let response;
      let apiUrl;
      let method;

      if (editingId) {
        apiUrl = `https://users.mpdatahub.com/api/post-update/${editingId}`;
        method = 'POST';
      } else {
        apiUrl = 'https://users.mpdatahub.com/api/post-store-video';
        method = 'POST';
      }

      response = await fetch(apiUrl, {
        method: method,
        body: formPayload
      });

      const responseData = await response.json();

      if (response.ok) {
        alert(editingId ? 'Post updated successfully!' : 'Post added successfully!');
        // Reset form and refresh list
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

  // Edit category
  // Edit category
  const handleEdit = (category) => {
    setEditingId(category.id);

    console.log(category);
    console.log(currentUserId);

    // Construct full image URL if it's a relative path
    const imageUrl = category.image
      ? (category.image.startsWith('http') ? category.image : `https://users.mpdatahub.com/api/${category.image}`)
      : '';

    const videoUrl = category.video_url || category.video
      ? (category.video_url?.startsWith('http') ? category.video_url : `https://users.mpdatahub.com/api/${category.video_url || category.video}`)
      : '';

    setFormData({
      category: category.category || '',
      type: category.type || 'IMAGE',
      title: category.title || category.category_name || category.name || '',
      image: imageUrl, // Store the full URL or path
      video: videoUrl, // Store the full URL or path
      isActive: category.isActive || 'yes',
      user_id: currentUserId
    });

    // Set previews if images/videos exist
    if (imageUrl) {
      setImagePreview(imageUrl);
    } else {
      setImagePreview('');
    }

    // console.log(imageUrl);


    if (videoUrl) {
      setVideoPreview(videoUrl);
    } else {
      setVideoPreview('');
    }

    // Clear any selected files
    setImageFile(null);
    setVideoFile(null);
    setVideoSizeError('');

    // Scroll to form
    const formElement = document.querySelector('.category-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`https://users.mpdatahub.com/api/post-delete/${id}`, {
        method: 'POST'
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

  // Reset form
  const resetForm = () => {
    setFormData({
      category: '',
      type: 'IMAGE',
      title: '',
      image: '',
      video: '',
      isActive: 'yes',
      user_id: currentUserId
    });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview('');
    setVideoPreview('');
    setEditingId(null);
    setVideoSizeError('');
  };

  if (loading) return (
    <div className="initial-loading">
      Loading data...
    </div>
  );
  return (
    <div className="article-categories-container">
      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {notificationType === 'single' ? 'Send Single Notification' : 'Send Bulk Notification'}
              </h2>
              <button
                className="modal-close-btn"
                onClick={closeNotificationModal}
              >
                &times;
              </button>
            </div>

            <form onSubmit={sendNotification} className="notification-form">
              {notificationType === 'single' && (
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

              <div className="notification-info">
                <p className="info-text">
                  <strong>Note:</strong> This notification will be sent to {
                    notificationType === 'single'
                      ? 'a specific user'
                      : 'ALL users'
                  }
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className={`btn ${notificationType === 'single' ? 'btn-primary' : 'btn-bulk'}`}
                  disabled={notificationLoading}
                >
                  {notificationLoading
                    ? (notificationType === 'single' ? 'Sending...' : 'Sending to All...')
                    : (notificationType === 'single' ? 'Send Notification' : 'Send to All Users')}
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
        {/* Add/Edit Form */}
        <section className="category-form-container">
          <h2>{editingId ? 'Edit Update Post' : 'Add New Updates Post'}</h2>
          <div className="user-info">
          </div>
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
                {categoryOptions.map(option => (
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
                {typeOptions.map(option => (
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

            {/* Image Upload - Always visible for both media types */}
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
                      setFormData({ ...formData, image: '' });
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

            {/* Video Upload - Only visible when Video media type is selected */}
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

                {/* Add size error message */}
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
                        setVideoSizeError(''); // Clear error when removing
                        setFormData({ ...formData, video: '' });
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
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Post' : 'Add Post'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Posts List */}
        <section className="categories-list-container">
          <div className="list-header">
            <h2>All Posts ({categories.length})</h2>
            <button
              className="btn btn-refresh"
              onClick={fetchCategories}
              disabled={loading}
            >
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
                    <div className="card-title-row">
                      <h3>{category.title || category.category_name || category.name || 'Unnamed Post'}</h3>
                      <span className="category-badge">{category.category}</span>
                      <span className="media-type-badge">{category.type}</span>
                    </div>
                    <div className="notification-icons">
                      <div className={`status-badge ${category.isActive === 'yes' ? 'active' : 'inactive'}`}>
                        {category.isActive === 'yes' ? 'Active' : 'Inactive'}
                      </div>
                      <div className='notification-icons'>
                        <button
                          className="notification-bell-btn single"
                          onClick={() => openNotificationModal(category, 'single')}
                          title="Send Single Notification"
                        >
                          <Bell size={18} />
                        </button>
                        <button
                          className="notification-bell-btn bulk"
                          onClick={() => openNotificationModal(category, 'bulk')}
                          title="Send Bulk Notification to All Users"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {category.image && (
                    <div className="card-image">
                      <img
                        src={`${category.image}`}
                        alt={category.title || category.category_name || 'Post'}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {category.video_url && category.type === 'VIDEO' && (
                    <div className="card-video-indicator">
                      <video
                        controls
                        preload="metadata"
                        width="100%"
                        style={{ borderRadius: '10px' }}
                      >
                        <source src={category.video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}


                  <div className="card-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Total Posts: {categories.length}</p>
        {editingId && <p className="editing-notice">Editing Mode Active</p>}
        <p className="user-id-info">User ID: {currentUserId || 'Not loaded'}</p>
      </footer>
    </div>
  );
};

export default Updates;