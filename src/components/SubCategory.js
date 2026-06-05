import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/SubCategory.css';
import '../styles/SubCategoryOverlay.css';
import Loder from './Loder';
import axios from 'axios';
import StatusToggle from './StatusToggle';

const SubCategory = () => {
  const { mainCategoryId } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState({
    trending: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);

  // ── Add / Edit Sub Category modal state ──────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode, object = edit mode
  const [addForm, setAddForm] = useState({
    parentCategory: '',
    subCategoryName: '',
    subCategoryTamName: '',
    subcategoryImage: '',
    subcategoryStatus: 'disable',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const addModalRef = useRef(null);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const [subCategory, setSubCategory] = useState([]);
  const [subCategoriesId, setSubCategoriesId] = useState('');

  // ── Fetch posts filtered by mainCategoryId ────────────────────────────────
  const fetchPosts = async () => {
    try {
      const res = await fetch('https://tnreaders.in/api/user/home-posts');
      const data = await res.json();
      const processedData = processApiData(data);
      setPosts(processedData);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories by the mainCategoryId from the URL param
  const processApiData = (apiData) => {
    const result = { trending: [], categories: [] };

    if (apiData.trendingposts) {
      result.trending = apiData.trendingposts
        .filter(
          (post) =>
            post.istrending === 1 &&
            post.status === 'request' &&
            post.isActive === 'yes'
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);
    }

    if (apiData.homepageposts) {
      result.categories = apiData.homepageposts
        .filter(
          (category) =>
            // Only show sub-categories whose parent_id matches the selected main category
            String(category.parent_id) === String(mainCategoryId)
        )
        .map((category) => ({
          id: category.id,
          parent_id: category.parent_id,
          name: category.name,
          status: category.status,
          image: category.FullImgPath,
          posts: (category.contentposts || [])
            .filter(
              (post) => post.status === 'request' && post.isActive === 'yes'
            )
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3),
        }))
        .filter((category) => category.posts.length > 0);
    }

    return result;
  };

  const fetchSubCategory = () => {
    if (!mainCategoryId) return;

    axios
      .get(`https://users.mpdatahub.com/api/sub-category?id=${mainCategoryId}`)
      .then((res) => setSubCategory(res.data || []))
      .catch(() => showToast('Failed to load sub categories', 'error'));
  };

  useEffect(() => {
    fetchSubCategory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  };

  // ── Add Sub Category modal handlers ───────────────────────────────────────
  const openAddModal = () => {
    setEditTarget(null);
    setAddForm({
      parentCategory: mainCategoryId || '',
      subCategoryName: '',
      subCategoryTamName: '',
      subcategoryImage: '',
      subcategoryStatus: 'disable',
    });
    setSubCategoriesId('');
    setAddError('');
    setShowAddModal(true);
  };

  // ── Edit Sub Category modal handler ──────────────────────────────────────
  const openEditModal = (category) => {
    setEditTarget(category);
    setAddForm({
      parentCategory: String(category.parent_id),
      subCategoryName: category.name,
      subCategoryTamName: category.tamil_name,
      subcategoryImage: '',
      subcategoryStatus: 'disable',
    });
    setSubCategoriesId(category.id);
    setAddError('');
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setEditTarget(null);
    setAddForm({
      parentCategory: '',
      subCategoryName: '',
      subCategoryTamName: '',
      subcategoryImage: '',
      subcategoryStatus: 'disable',
    });
    setSubCategoriesId('');
    setAddError('');
  };

  const handleAddBackdropClick = (e) => {
    if (e.target === addModalRef.current) {
      closeAddModal();
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    setAddError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!addForm.parentCategory) {
      setAddError('Please select a parent category.');
      return;
    }
    if (!addForm.subCategoryName.trim()) {
      setAddError('Please enter a sub category name.');
      return;
    }

    setAddLoading(true);
    setAddError('');

    try {
      const formData = new FormData();

      formData.append('category_id', subCategoriesId);
      formData.append('parent_id', addForm.parentCategory);
      formData.append('name', addForm.subCategoryName.trim());
      formData.append('tamil_name', addForm.subCategoryTamName.trim());
      formData.append('status', addForm.subcategoryStatus);

      if (addForm.subcategoryImage) {
        formData.append('image', addForm.subcategoryImage);
      }

      const isEdit = !!editTarget;
      const url = isEdit
        ? `https://users.mpdatahub.com/api/edit-sub-category`
        : 'https://users.mpdatahub.com/api/add-sub-category';

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert(
          isEdit
            ? 'Sub Category updated successfully!'
            : 'Sub Category added successfully!'
        );
        fetchSubCategory();
        closeAddModal();
        fetchPosts();
      } else {
        const errData = await response.json();
        setAddError(errData.message || 'Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Error saving sub category:', error);
      setAddError('Network error. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [mainCategoryId]);

  useEffect(() => {
    axios
      .get('https://users.mpdatahub.com/api/main-category')
      .then((res) => {
        const allowed = (res.data || []).filter(
          (cat) => cat.status === 'allow'
        );
        setMainCategories(allowed);
      })
      .catch(() => alert('Failed to load main categories', 'error'));
  }, []);

  const handleStatusUpdateSubmit = async (category, status) => {
    try {
      const formData = new FormData();

      formData.append('category_id', category.id);
      formData.append('parent_id', category.parent_id);
      formData.append('name', category.name);
      formData.append('status', status);

      const url = `https://users.mpdatahub.com/api/edit-sub-category`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showToast('Main Category Status updated successfully!', 'success');
        fetchSubCategory();
        fetchPosts();
      } else {
        const errData = await response.json();
        showToast(
          errData.message || 'Failed to update status. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating main category:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const limitText = (text, max = 50) => {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '...' : text;
  };

  const renderHTML = (htmlString) => ({ __html: htmlString || '' });

  const totalPosts =
    posts.trending.length +
    posts.categories.reduce((sum, cat) => sum + cat.posts.length, 0);
  const totalCategories = posts.categories.length;

  if (loading) return <Loder />;

  return (
    <div className="professional-dashboarddash">
      {toast.show && (
        <div className={`toast-box ${toast.type}`}>{toast.message}</div>
      )}
      {/* ── Add / Edit Sub Category Modal ─────────────────────────────────── */}
      {showAddModal && (
        <div
          className="subcategory-modal-overlay"
          ref={addModalRef}
          onClick={handleAddBackdropClick}
        >
          <div className="subcategory-modal-box">
            <div className="subcategory-modal-header">
              <div className="subcategory-modal-title-group">
                <h2 className="subcategory-modal-title">
                  {editTarget ? 'Edit Sub Category' : 'Add Sub Category'}
                </h2>
              </div>
              <button
                className="subcategory-modal-close"
                onClick={closeAddModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="subcategory-modal-form" onSubmit={handleAddSubmit}>
              {/* Parent Category dropdown */}
              <div className="subcategory-form-group">
                <label
                  className="subcategory-form-label"
                  htmlFor="parentCategory"
                >
                  Parent Category{' '}
                  <span className="subcategory-required">*</span>
                </label>
                <div className="subcategory-select-wrapper">
                  <select
                    id="parentCategory"
                    name="parentCategory"
                    className="subcategory-form-select"
                    value={addForm.parentCategory}
                    onChange={handleAddFormChange}
                    required
                    disabled
                    // disabled={!!editTarget}
                  >
                    <option value="">Select a category…</option>
                    {mainCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <span className="subcategory-select-arrow">▾</span>
                </div>
              </div>

              {/* Sub Category name */}
              <div className="subcategory-form-group">
                <label
                  className="subcategory-form-label"
                  htmlFor="subCategoryName"
                >
                  Sub Category Name{' '}
                  <span className="subcategory-required">*</span>
                </label>
                <input
                  id="subCategoryName"
                  name="subCategoryName"
                  type="text"
                  className="subcategory-form-input"
                  placeholder="Enter sub category name"
                  value={addForm.subCategoryName}
                  onChange={handleAddFormChange}
                  required
                  autoComplete="off"
                />
              </div>

              {/* Sub Category name */}
              <div className="subcategory-form-group">
                <label
                  className="subcategory-form-label"
                  htmlFor="subCategoryTamName"
                >
                  Sub Category Tamil Name{' '}
                  <span className="subcategory-required">*</span>
                </label>
                <input
                  id="subCategoryTamName"
                  name="subCategoryTamName"
                  type="text"
                  className="subcategory-form-input"
                  placeholder="Enter sub category name"
                  value={addForm.subCategoryTamName}
                  onChange={handleAddFormChange}
                  required
                  autoComplete="off"
                />
              </div>

              {/* Sub Category Image */}
              <div className="subcategory-form-group">
                <label
                  className="subcategory-form-label"
                  htmlFor="subcategoryImage"
                >
                  Sub Category Image
                </label>
                <input
                  id="subcategoryImage"
                  name="subcategoryImage"
                  type="file"
                  accept="image/*"
                  className="subcategory-form-input"
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      subcategoryImage: e.target.files[0],
                    })
                  }
                />
              </div>

              {addError && (
                <div className="subcategory-form-error">
                  <span className="subcategory-error-icon">⚠</span> {addError}
                </div>
              )}

              <div className="subcategory-modal-actions">
                <button
                  type="button"
                  className="subcategory-btn-cancel"
                  onClick={closeAddModal}
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="subcategory-btn-save"
                  disabled={addLoading}
                >
                  {addLoading ? (
                    <span className="subcategory-btn-spinner" />
                  ) : editTarget ? (
                    'Update'
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="content-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-refresh"
            style={{
              background: 'transparent',
              color: '#812baf',
              border: '1px solid #812baf',
            }}
            onClick={() => navigate('/main-category')}
          >
            ← Back
          </button>
          <h1 style={{ textAlign: 'left', margin: 0 }}>LookIt Sub Category</h1>
        </div>
        <div className="sub-content-btn">
          <button
            className="btn btn-refresh"
            disabled={loading}
            onClick={openAddModal}
          >
            Add Sub Category
          </button>
        </div>
      </div>

      {/* ── Main Dashboard Grid (identical to original) ───────────────────── */}
      <div className="dashboard-maindash">
        {/* {posts.trending.length > 0 && (
          <div className="section-carddash trending-sectiondash">
            <div className="section-headerdash">
              <div className="section-titledash">
                <span className="title-icondash">🔥</span>
                <h2>Trending Content</h2>
              </div>
            </div>
            <div className="trending-griddash">
              {posts.trending.map((post) => (
                <div
                  key={`trending-${post.id}`}
                  className="trending-carddash"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="card-imagedash">
                    <img
                      src={
                        post.app_thumbnail ||
                        post.web_thumbnail ||
                        '/assets/lookit.png'
                      }
                      alt={post.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/lookit.png';
                      }}
                    />
                    <div className="trending-overlaydash">
                      <h4 className="trending-titledash">
                        {limitText(post.title, 40)}
                      </h4>
                      <span className="trending-datedash">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Statistics */}
        {/* <div className="stats-sectiondash">
          <div className="stats-griddash">
            <div className="stat-carddash">
              <div className="stat-icondash totaldash">
                <img
                  className="icon-postdash"
                  src="/svg/post.svg"
                  alt="Posts"
                />
              </div>
              <div className="stat-infodash">
                <h3>{totalPosts}</h3>
                <p>Total Posts</p>
              </div>
            </div>
            <div className="stat-carddash">
              <div className="stat-icondash trendingdash">
                <img
                  className="icon-postdash"
                  src="/svg/trend.svg"
                  alt="Trending"
                />
              </div>
              <div className="stat-infodash">
                <h3>{posts.trending.length}</h3>
                <p>Trending Posts</p>
              </div>
            </div>
            <div className="stat-carddash">
              <div className="stat-icondash categoriesdash">
                <img
                  className="icon-postdash"
                  src="/svg/category.svg"
                  alt="Categories"
                />
              </div>
              <div className="stat-infodash">
                <h3>{totalCategories}</h3>
                <p>Active Categories</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Categories Grid — each card now has an Edit button */}
        <div className="sub-category-grid">
          {subCategory.map((category) => (
            <div
              key={`category-${category.id}`}
              className="section-carddash category-sectiondash sub-category-card"
            >
              <div className="sub-category-img">
                <img
                  src={category.FullImgPath || '/assets/lookit.png'}
                  alt={category.name}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 8,
                    objectFit: 'fill',
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/lookit.png';
                  }}
                />
              </div>

              <div className="section-headerdash sub-category-right">
                <div className="sub-category-toggle">
                  <StatusToggle
                    defaultActive={category.status === 'allow' ? true : false}
                    onChange={(isActive) => {
                      handleStatusUpdateSubmit(
                        category,
                        isActive ? 'allow' : 'disable'
                      );
                    }}
                  />
                </div>
                <div className="category-infodash sub-category-name">
                  <div className="category-infodash1">
                    <h3>{category.name}</h3>
                    <span className="posts-countdash">
                      {/* {category.posts.length} posts */}
                    </span>
                  </div>
                  {/* ── Edit button ── */}
                  <button
                    className="view-all-btndash"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(category);
                    }}
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>

              {/* <div className="category-postsdash">
                {category.posts.map((post) => (
                  <div
                    key={`${category.id}-${post.id}`}
                    className="post-carddash"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="post-imagedash">
                      <img
                        src={
                          post.app_thumbnail ||
                          post.web_thumbnail ||
                          '/assets/lookit.png'
                        }
                        alt={post.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/lookit.png';
                        }}
                      />
                    </div>
                    <div className="post-contentdash">
                      <h4 className="post-titledash">
                        {limitText(post.title, 35)}
                      </h4>
                      <div className="post-footerdash">
                        <span className="datedash">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>
          ))}
        </div>

        {totalPosts === 0 && (
          <div className="empty-statedash">
            <div className="empty-icondash">📝</div>
            <h3>No Content Available</h3>
            <p>There's no content to display for this category.</p>
            <button onClick={fetchPosts} className="retry-btn">
              Retry
            </button>
          </div>
        )}
      </div>

      {/* ── Article Detail Modal (unchanged) ──────────────────────────────── */}
      {showModal && selectedPost && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <div className="article-modal">
            <div className="modal-header">
              <h2 className="modal-title">{selectedPost.title}</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="article-hero-image">
                <img
                  src={
                    selectedPost.app_thumbnail ||
                    selectedPost.web_thumbnail ||
                    selectedPost.FullImgPath ||
                    '/assets/lookit.png'
                  }
                  alt={selectedPost.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/lookit.png';
                  }}
                />
              </div>
              <div className="article-meta">
                <div className="meta-item">
                  <strong>Published:</strong>
                  <span>{formatDate(selectedPost.created_at)}</span>
                </div>
                {selectedPost.category && (
                  <div className="meta-item">
                    <strong>Category:</strong>
                    <span>{selectedPost.category.name}</span>
                  </div>
                )}
                {selectedPost.istrending === 1 && (
                  <div className="meta-item trending-badge">
                    <strong>🔥 Trending</strong>
                  </div>
                )}
              </div>
              <div className="article-content">
                {selectedPost.content ? (
                  <div
                    className="content-html"
                    dangerouslySetInnerHTML={renderHTML(selectedPost.content)}
                  />
                ) : selectedPost.description ? (
                  <p>{selectedPost.description}</p>
                ) : (
                  <p>No content available for this article.</p>
                )}
              </div>
              {selectedPost.BlogURL && (
                <div className="article-actions">
                  <a
                    href={selectedPost.BlogURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link-btn"
                  >
                    Read Full Article on Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategory;
