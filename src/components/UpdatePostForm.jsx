import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import '../styles/Updates.css';

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

const UpdatePostForm = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [videoSizeError, setVideoSizeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    getUserFromLocalStorage();
  }, []);

  const getUserFromLocalStorage = () => {
    try {
      const userDataString = localStorage.getItem('mp_user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData && userData.id) {
          const id = userData.id.toString();
          setCurrentUserId(id);
          setFormData((prev) => ({ ...prev, user_id: id }));
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
    }
    if (formData.type === 'VIDEO' && videoFile) {
      formPayload.append('video_url', videoFile);
    }

    try {
      const response = await fetch('https://users.mpdatahub.com/api/post-store-video', {
        method: 'POST',
        body: formPayload,
      });
      const responseData = await response.json();

      if (response.ok) {
        alert('Post added successfully!');
        resetForm();
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

  const resetForm = () => {
    setFormData({ ...defaultFormData, user_id: currentUserId });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview('');
    setVideoPreview('');
    setVideoSizeError('');
  };

  return (
    <section className="category-form-container">
      <h2>Add New Updates Post</h2>
      <div className="user-info" />

      <form onSubmit={handleSubmit} className="category-form">
        {/* Category */}
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

        {/* Media Type */}
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

        {/* Title */}
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

        {/* Thumbnail Image */}
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

        {/* Video Upload — only for VIDEO type */}
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

        {/* Status */}
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

        {/* Actions */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Add Post'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default UpdatePostForm;
