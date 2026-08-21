import React, { useState, useEffect, useRef } from 'react';
import '../styles/MainCategory.css';
import '../styles/SubCategoryOverlay.css';
import Loder from './Loder';
import axios from 'axios';
import StatusToggle from './StatusToggle';
import Toggle from './Togglebtn';

function UpdatesCategory() {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Add / Edit Updates Category modal state ──────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode, object = edit mode
  const [addForm, setAddForm] = useState({
    categoryName: '',
    categoryTamName: '',
    categoryImage: '',
    categoryStatus: 0,
  });
  const [categoriesId, setCategoriesId] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const addModalRef = useRef(null);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const [updatesCategory, setUpdatesCategory] = useState([]);

  const [showSortModal, setShowSortModal] = useState(false);
  const [sortCategory, setSortCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState("");
  const [sortLoading, setSortLoading] = useState(false);

  const fetchUpdatesCategories = async () => {
    axios
      .get('https://users.mpdatahub.com/api/update-categories')
      .then((res) => {
        // const allowed = (res.data || []).filter(
        //   (cat) => cat.status === 'allow'
        // );
        setUpdatesCategory(res.data.data);
      })
      .catch(() => showToast('Failed to load updates categories', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUpdatesCategories();
  }, []);

  // ── Add modal handler ─────────────────────────────────────────────────
  const openAddModal = () => {
    setEditTarget(null);
    setAddForm({
      categoryName: '',
      categoryTamName: '',
      categoryImage: '',
      categoryStatus: 0,
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
      categoryTamName: category.tamil_name,
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
      categoryTamName: '',
      categoryImage: '',
      categoryStatus: 0,
    });
    setCategoriesId('');
    setAddError('');
  };

  // ── Edit Sort Order modal handler ────────────────────────────────────────────────
  const openSortModal = (category) => {
    setSortCategory(category);
    setSortOrder(category.sort_order ?? "");
    setShowSortModal(true);
  };

  const closeSortModal = () => {
    setShowSortModal(false);
    setSortCategory(null);
    setSortOrder("");
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
    if (!addForm.categoryName.trim() || !addForm.categoryTamName.trim()) {
      setAddError('Please enter both category names.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const formData = new FormData();

      formData.append('category_id', categoriesId);
      formData.append('name', addForm.categoryName.trim());
      formData.append('tamil_name', addForm.categoryTamName.trim());
      formData.append('status', addForm.categoryStatus);

      if (addForm.categoryImage) {
        formData.append('image', addForm.categoryImage);
      }
      const isEdit = !!editTarget;
      const url = isEdit
        ? `https://users.mpdatahub.com/api/update-categories/update/${categoriesId}`
        : 'https://users.mpdatahub.com/api/update-categories/store';

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showToast(
          isEdit
            ? 'Updates Category updated successfully!'
            : 'Updates Category added successfully!',
          'success'
        );
        closeAddModal();
        fetchUpdatesCategories();
        // fetchPosts();
      } else {
        const errData = await response.json();
        setAddError(errData.message || 'Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Error saving updates category:', error);
      setAddError('Network error. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleStatusUpdateSubmit = async (category, status) => {
    try {
      const url = `https://users.mpdatahub.com/api/update-categories/status/${category.id}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (response.ok) {
        showToast('Updates Category Status updated successfully!', 'success');
        fetchUpdatesCategories();
        // fetchPosts();
      } else {
        const errData = await response.json();
        showToast(
          errData.message || 'Failed to update status. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating updates category:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const handleArticleUpdateSubmit = async (category, status) => {
    try {
      const newValue = status === 'yes' ? 'no' : 'yes';
      const formData = new FormData();

      formData.append('category_id', category.id);
      formData.append('single_article', newValue);

      const url = `https://users.mpdatahub.com/api/category/single-article-status`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showToast('Updates Category Article Status updated successfully!', 'success');
        fetchUpdatesCategories();
      } else {
        const errData = await response.json();
        showToast(
          errData.message || 'Failed to update status. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating updates category:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  const handleSortOrderUpdateSubmit = async (category, sortOrder) => {
    try {
      const url = `https://users.mpdatahub.com/api/update-categories/${category.id}/sort-order`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sort_order: sortOrder,
        }),
      });

      if (response.ok) {
        showToast('Updates Category Sort Order updated successfully!', 'success');
        fetchUpdatesCategories();
        closeSortModal();
      } else {
        const errData = await response.json();
        showToast(
          errData.message || 'Failed to update Sort Order. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating Sort Order:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  if (loading) return <Loder />;

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Updates Categories</h2>
        <p>{error}</p>
        <button onClick={fetchUpdatesCategories} className="retry-btn">
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
      {/* ── Add / Edit Updates Category Modal ───────────────────────────── */}
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
                  {editTarget ? 'Edit Updates Category' : 'Add Updates Category'}
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

              {/* Category Name */}
              <div className="subcategory-form-group">
                <label
                  className="subcategory-form-label"
                  htmlFor="categoryTamName"
                >
                  Category Tamil Name{' '}
                  <span className="subcategory-required">*</span>
                </label>
                <input
                  id="categoryTamName"
                  name="categoryTamName"
                  type="text"
                  className="subcategory-form-input"
                  placeholder="Enter category name"
                  value={addForm.categoryTamName}
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

      {showSortModal && (
        <div
          className="subcategory-modal-overlay"
          onClick={closeSortModal}
        >
          <div
            className="subcategory-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="subcategory-modal-header">
              <h2>Update Sort Order</h2>

              <button
                className="subcategory-modal-close"
                onClick={closeSortModal}
              >
                ×
              </button>
            </div>
            <div className='subcategory-modal-form'>
              <div className="subcategory-form-group">
                <label className="subcategory-form-label">
                  Category
                </label>

                <input
                  className="subcategory-form-input"
                  value={sortCategory?.name}
                  disabled
                />
              </div>

              <div className="subcategory-form-group">
                <label className="subcategory-form-label">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="1"
                  className="subcategory-form-input"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>

              <div className="subcategory-modal-actions">
                <button
                  className="subcategory-btn-cancel"
                  onClick={closeSortModal}
                >
                  Cancel
                </button>

                <button
                  className="subcategory-btn-save"
                  onClick={() => { handleSortOrderUpdateSubmit(sortCategory, sortOrder) }}
                  disabled={sortLoading}
                >
                  {sortLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="content-header">
        <h1 style={{ textAlign: 'left' }}>LookIt Updates Category</h1>
        <div className="sub-content-btn">
          <button
            className="btn btn-refresh"
            disabled={loading}
            onClick={openAddModal}
          >
            Add Updates Category
          </button>
        </div>
      </div>

      {/* ── Category List ─────────────────────────────────────────────── */}
      <main className="main-contentmain">
        {updatesCategory.length === 0 ? (
          <div className="no-posts">
            <h2>No Updates Categories Available</h2>
            <p>No updates categories were found in the API response.</p>
            <button onClick={fetchUpdatesCategories} className="retry-btn">
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
              Active Updates Category
            </h3>
            {updatesCategory.filter((category) => category.status === 1).length > 0 ? (
              <div className="categories-container">
                {updatesCategory
                  .filter((category) => category.status === 1)
                  .map((category) => {
                    //   const categoryData = categories[categoryId];
                    return (
                      <section
                        key={category.id}
                        className="category-section"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="category-img">
                          <img
                            src={
                              category.image
                                ? category.image
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

                        {/* <div className='mc-category-overlay'>
                          <p className='mc-category-sort'>{category.sort_order ?? "-"}</p>
                        </div> */}

                        <div className="category-headerm">

                          <div className="category-titles-wrapper">
                            <h2 className="category-titles">{category.name}</h2>
                          </div>
                          <div className='mc-main-toggle-container'>
                            {/* <div
                            className="mc-toggle-btn"
                            style={{ marginBottom: 10 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="view-all-btndash"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSortModal(category);
                              }}
                            >
                              🔢 Sort
                            </button>

                            <Toggle
                              checked={category.article === 'yes'}
                              label={'Article'}
                              onChange={() => handleArticleUpdateSubmit(category, category.article)}
                              labelOn="Article"
                              labelOff="Normal"
                            />
                          </div> */}

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
                                  category.status === 1 ? true : false
                                }
                                onChange={(isActive) => {
                                  handleStatusUpdateSubmit(
                                    category,
                                    isActive ? 'active' : 'inactive'
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    );
                  })}
              </div>
            ) : (
              <div className="empty-statedash">
                <p>No Active Categories available.</p>
                <p>Click "Add Category" to get started. ✅</p>
              </div>
            )}

            <h3
              style={{
                textAlign: 'left',
                // fontSize: 26,
                borderBottom: '1px solid gray',
                display: 'inline-flex',
                marginBottom: 10,
              }}
            >
              Inactive Updates Category
            </h3>

            {updatesCategory.filter((category) => category.status === 0).length > 0 ? (
              <div className="categories-container">
                {updatesCategory
                  .filter((category) => category.status === 0)
                  .map((category) => {
                    //   const categoryData = categories[categoryId];
                    return (
                      <section
                        key={category.id}
                        className="category-section"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="category-img">
                          <img
                            src={
                              category.image
                                ? category.image
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
                                category.status === 1 ? true : false
                              }
                              onChange={(isActive) => {
                                handleStatusUpdateSubmit(
                                  category,
                                  isActive ? 'active' : 'inactive'
                                );
                              }}
                            />
                          </div>
                        </div>
                      </section>
                    );
                  })}
              </div>
            ) : (
              <div className="empty-statedash">
                <p>No Inactive Categories available.</p>
                <p>Click "Add Category" to get started. ✅</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default UpdatesCategory;
