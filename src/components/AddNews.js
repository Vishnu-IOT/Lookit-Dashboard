import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Addarticle.css';
import imageCompression from 'browser-image-compression';

const AddNews = () => {
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeURL, setYoutubeURL] = useState('');
  const [imageone, setImageone] = useState(null);
  const [imagetwo, setImagetwo] = useState(null);
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };
  const resetForm = () => {
    setSelectedMain('');
    setSelectedSub('');
    setTitle('');
    setDescription('');
    setYoutubeURL('');
    setImageone(null);
    setImagetwo(null);
    setContentType('');
    setProgress(0);
  };
  const [userId, setUserId] = useState('');
  const [imageOnePreview, setImageOnePreview] = useState('');
  const [imageTwoPreview, setImageTwoPreview] = useState('');
  useEffect(() => {
    axios
      .get('https://users.mpdatahub.com/api/main-category')
      .then((res) => {
        const allowed = (res.data || []).filter(
          (cat) => cat.status === 'allow' && cat.name === 'News'
        );
        setMainCategories(allowed);
      })
      .catch(() => showToast('Failed to load main categories', 'error'));
  }, []);
  useEffect(() => {
    if (selectedMain) {
      axios
        .get(`https://users.mpdatahub.com/api/sub-category?id=${selectedMain}`)
        .then((res) => setSubCategories(res.data || []))
        .catch(() => showToast('Failed to load sub categories', 'error'));
    }
  }, [selectedMain]);
  // Get logged in user email from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserId(userData.id || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  const handleSubmit = async () => {
    if (!title || !description || !selectedSub || !contentType) {
      showToast('Please fill all required fields!', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('user_id', userId);
    formData.append('message', description);
    formData.append('category_id', selectedSub);
    formData.append('youtube_url', youtubeURL);
    formData.append('content_type', contentType);
    if (imageone) formData.append('app_thumbnail', imageone);
    if (imagetwo) formData.append('web_thumbnail', imagetwo);
    try {
      setLoading(true);
      await axios.post('https://tnreaders.in/mobile/store-new-post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setProgress(percent);
        },
      });
      showToast('Post submitted successfully!', 'success');
      resetForm();
    } catch (err) {
      console.error(err);
      showToast('Submission failed!', 'error');
    } finally {
      setLoading(false);
    }
  };
  const compressImage = async (file) => {
    if (!file) return null;

    try {
      const options = {
        maxSizeMB: 1,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      return compressedFile;
    } catch (error) {
      console.error('Image compression error:', error);
      return file;
    }
  };
  return (
    <div className="alignthem">
      {toast.show && (
        <div className={`toast-box ${toast.type}`}>{toast.message}</div>
      )}
      <div className="add-post-container">
        <h2 className="form-title">Add News to LookIt</h2>
        <div className="form-group">
          <label className="form-label">Content Type</label>
          <div className="radio-group">
            {['article', 'shorts', 'video'].map((type) => (
              <label key={type} className="radio-label">
                <input
                  type="radio"
                  name="contentType"
                  value={type}
                  className="checking"
                  checked={contentType === type}
                  onChange={() => setContentType(type)}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Main Category</label>
            <select
              className="form-select"
              value={selectedMain}
              onChange={(e) => setSelectedMain(e.target.value)}
            >
              <option value="">Select Main Category</option>
              {mainCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sub Category</label>
            <select
              className="form-select"
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
            >
              <option value="">Select Sub Category</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">YouTube URL</label>
          <input
            className="form-input"
            value={youtubeURL}
            onChange={(e) => setYoutubeURL(e.target.value)}
            type="text"
          />
        </div>
        <div className="form-group">
          <label className="form-label">App Thumbnail</label>
          <input
            className="form-input"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const compressed = await compressImage(file);
              setImageone(compressed);
              setImageOnePreview(URL.createObjectURL(compressed));
            }}
          />
        </div>
        {imageOnePreview && (
          <img
            src={imageOnePreview}
            alt="Preview"
            className="aart-image-preview"
          />
        )}

        <div className="form-group">
          <label className="form-label">Web Thumbnail</label>
          <input
            className="form-input"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const compressed = await compressImage(file);
              setImagetwo(compressed);
              setImageTwoPreview(URL.createObjectURL(compressed));
            }}
          />
        </div>
        {imageTwoPreview && (
          <img
            src={imageTwoPreview}
            alt="Preview"
            className="aart-image-preview"
          />
        )}
        {loading && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}>
              {progress}%
            </div>
          </div>
        )}
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'சமர்ப்பிக்கவும்'}
        </button>
      </div>
    </div>
  );
};
export default AddNews;
