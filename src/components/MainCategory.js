import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainCategory.css';
import '../styles/SubCategoryOverlay.css';
import Loder from './Loder';
import axios from 'axios';
import StatusToggle from './StatusToggle';

const categoryTitles = {
  157: 'INFORMATION',
  158: 'HEALTH',
  160: 'WOMENS CHOICE',
  172: 'EDUCATION',
  178: 'TECHTIPS',
  185: 'LAW',
  190: 'STORY SPOT',
  195: 'HOW TO APPLY',
  200: 'SUCCESS STORY',
  202: 'MOTIVATION',
  210: 'AI PROMPTS',
  214: 'SPORTS',
  224: 'UPDATES',
};

function MainCategory() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Add / Edit Main Category modal state ──────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode, object = edit mode
  const [addForm, setAddForm] = useState({
    categoryName: '',
    categoryImage: '',
    categoryStatus: 'disable',
  });
  const [categoriesId, setCategoriesId] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const addModalRef = useRef(null);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const [mainCategory, setMainCategory] = useState([]);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        'https://tnreaders.in/api/user/mainhomepost'
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const processedCategories = {};
      if (data.homepageposts && typeof data.homepageposts === 'object') {
        Object.keys(data.homepageposts).forEach((categoryId) => {
          const categoryData = data.homepageposts[categoryId];
          if (
            categoryData &&
            categoryData.posts &&
            Array.isArray(categoryData.posts) &&
            categoryData.posts.length > 0
          ) {
            const posts = categoryData.posts;
            const categoryName =
              categoryTitles[categoryId] ||
              posts[0]?.category?.name ||
              `Category ${categoryId}`;
            const categoryImage = posts[0]?.category?.FullImgPath;
            processedCategories[categoryId] = {
              id: categoryId,
              name: categoryName,
              image: categoryImage,
              posts: posts,
              categoryInfo: posts[0]?.category,
            };
          }
        });
      }
      setCategories(processedCategories);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchMainCategories = async () => {
    axios
      .get('https://users.mpdatahub.com/api/main-category')
      .then((res) => {
        // const allowed = (res.data || []).filter(
        //   (cat) => cat.status === 'allow'
        // );
        setMainCategory(res.data);
      })
      .catch(() => showToast('Failed to load main categories', 'error'));
  };

  useEffect(() => {
    fetchMainCategories();
  }, []);

  // ── Add modal handler ─────────────────────────────────────────────────
  const openAddModal = () => {
    setEditTarget(null);
    setAddForm({
      categoryName: '',
      categoryImage: '',
      categoryStatus: 'disable',
    });
    setCategoriesId('');
    setAddError('');
    setShowAddModal(true);
  };

  // ── Edit modal handler ────────────────────────────────────────────────
  const openEditModal = (category) => {
    setEditTarget(category);
    setAddForm({
      categoryName: category.name,
      categoryImage: '',
      categoryStatus: category.status,
    });
    setCategoriesId(category.id);
    setAddError('');
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setEditTarget(null);
    setAddForm({
      categoryName: '',
      categoryImage: '',
      categoryStatus: 'disable',
    });
    setCategoriesId('');
    setAddError('');
  };

  const handleAddBackdropClick = (e) => {
    if (e.target === addModalRef.current) closeAddModal();
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    setAddError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.categoryName.trim()) {
      setAddError('Please enter a category name.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const formData = new FormData();

      formData.append('category_id', categoriesId);
      formData.append('name', addForm.categoryName.trim());
      formData.append('status', addForm.categoryStatus);

      if (addForm.categoryImage) {
        formData.append('image', addForm.categoryImage);
      }
      const isEdit = !!editTarget;
      const url = isEdit
        ? `https://users.mpdatahub.com/api/edit-main-category`
        : 'https://users.mpdatahub.com/api/add-main-category';

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showToast(
          isEdit
            ? 'Main Category updated successfully!'
            : 'Main Category added successfully!',
          'success'
        );
        closeAddModal();
        fetchMainCategories();
        fetchPosts();
      } else {
        const errData = await response.json();
        setAddError(errData.message || 'Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Error saving main category:', error);
      setAddError('Network error. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleStatusUpdateSubmit = async (category, status) => {
    try {
      const formData = new FormData();

      formData.append('category_id', category.id);
      formData.append('name', category.name);
      formData.append('status', status);

      const url = `https://users.mpdatahub.com/api/edit-main-category`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showToast('Main Category Status updated successfully!', 'success');
        fetchMainCategories();
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

  if (loading) return <Loder />;

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Content</h2>
        <p>{error}</p>
        <button onClick={fetchPosts} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      {toast.show && (
        <div className={`toast-box ${toast.type}`}>{toast.message}</div>
      )}
      {/* ── Add / Edit Main Category Modal ───────────────────────────── */}
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
                  {editTarget ? 'Edit Main Category' : 'Add Main Category'}
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
              {/* Category Name */}
              <div className="subcategory-form-group">
                <label
                  className="subcategory-form-label"
                  htmlFor="categoryName"
                >
                  Category Name <span className="subcategory-required">*</span>
                </label>
                <input
                  id="categoryName"
                  name="categoryName"
                  type="text"
                  className="subcategory-form-input"
                  placeholder="Enter category name"
                  value={addForm.categoryName}
                  onChange={handleAddFormChange}
                  required
                  autoComplete="off"
                />
              </div>

              {/* Category Image */}
              <div className="subcategory-form-group">
                <label
                  className="subcategory-form-label"
                  htmlFor="categoryImage"
                >
                  Category Image
                </label>
                <input
                  id="categoryImage"
                  name="categoryImage"
                  type="file"
                  accept="image/*"
                  className="subcategory-form-input"
                  onChange={(e) =>
                    setAddForm({ ...addForm, categoryImage: e.target.files[0] })
                  }
                />
              </div>

              {/* Category Allow/Disable */}
              {/* <div className="subcategory-form-group">
                <label
                  className="subcategory-form-label"
                  htmlFor="categoryStatus"
                >
                  Category Status
                  <span className="subcategory-required">*</span>
                </label>

                <select
                  id="categoryStatus"
                  name="categoryStatus"
                  className="subcategory-form-input"
                  value={addForm.categoryStatus}
                  onChange={handleAddFormChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="allow">Allow</option>
                  <option value="disable">Disable</option>
                </select>
              </div> */}

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

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="content-header">
        <h1 style={{ textAlign: 'left' }}>LookIt Main Category</h1>
        <div className="sub-content-btn">
          <button
            className="btn btn-refresh"
            disabled={loading}
            onClick={openAddModal}
          >
            Add Main Category
          </button>
        </div>
      </div>

      {/* ── Category List ─────────────────────────────────────────────── */}
      <main className="main-contentmain">
        {mainCategory.length === 0 ? (
          <div className="no-posts">
            <h2>No Posts Available</h2>
            <p>No posts were found in the API response.</p>
            <button onClick={fetchPosts} className="retry-btn">
              Retry
            </button>
          </div>
        ) : (
          <>
            <h3
              style={{
                textAlign: 'left',
                // fontSize: 18,
                borderBottom: '1px solid gray',
                display: 'inline-flex',
                marginBottom: 10,
              }}
            >
              Active Main Category
            </h3>
            <div className="categories-container">
              {mainCategory
                .filter((category) => category.status === 'allow')
                .map((category) => {
                  //   const categoryData = categories[categoryId];
                  return (
                    <section
                      key={category.id}
                      className="category-section"
                      onClick={() => navigate(`/sub-category/${category.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="category-img">
                        <img
                          src={
                            category.FullImgPath
                              ? category.FullImgPath
                              : '/assets/lookit.png'
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/lookit.png';
                          }}
                          alt={category.name}
                          style={{
                            width: 70,
                            height: 70,
                            borderRadius: 8,
                            objectFit: 'fill',
                            //   marginRight: 10,
                          }}
                        />
                      </div>

                      <div className="category-headerm">
                        <div className="category-titles-wrapper">
                          <h2 className="category-titles">{category.name}</h2>
                        </div>
                        <div
                          className="mc-toggle-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
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

                          <StatusToggle
                            defaultActive={
                              category.status === 'allow' ? true : false
                            }
                            onChange={(isActive) => {
                              handleStatusUpdateSubmit(
                                category,
                                isActive ? 'allow' : 'disable'
                              );
                            }}
                          />
                        </div>
                      </div>
                    </section>
                  );
                })}
            </div>

            <h3
              style={{
                textAlign: 'left',
                // fontSize: 26,
                borderBottom: '1px solid gray',
                display: 'inline-flex',
                marginBottom: 10,
              }}
            >
              Inactive Main Category
            </h3>
            <div className="categories-container">
              {mainCategory
                .filter((category) => category.status === 'disable')
                .map((category) => {
                  //   const categoryData = categories[categoryId];
                  return (
                    <section
                      key={category.id}
                      className="category-section"
                      onClick={() => navigate(`/sub-category/${category.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="category-img">
                        <img
                          src={
                            category.FullImgPath
                              ? category.FullImgPath
                              : '/assets/lookit.png'
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/lookit.png';
                          }}
                          alt={category.name}
                          style={{
                            width: 70,
                            height: 70,
                            borderRadius: 8,
                            objectFit: 'fill',
                            //   marginRight: 10,
                          }}
                        />
                      </div>

                      <div className="category-headerm">
                        <div className="category-titles-wrapper">
                          <h2 className="category-titles">{category.name}</h2>
                        </div>
                        <div
                          className="mc-toggle-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                          <StatusToggle
                            defaultActive={
                              category.status === 'allow' ? true : false
                            }
                            onChange={(isActive) => {
                              handleStatusUpdateSubmit(
                                category,
                                isActive ? 'allow' : 'disable'
                              );
                            }}
                          />
                        </div>
                      </div>
                    </section>
                  );
                })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MainCategory;
