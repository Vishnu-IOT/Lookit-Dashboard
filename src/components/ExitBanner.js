import React, { useState, useEffect, useCallback } from "react";
import "../styles/ExitBanner.css";

const API_BASE = "https://users.mpdatahub.com/api/exitbanner";

const emptyForm = {
    id: null,
    title: "",
    description: "",
    image: null,
    imagePreview: "",
    url_link: "",
    status: true, // boolean for store/update
};

export default function ExitBanner() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(API_BASE, { method: "GET" });
            if (!res.ok) throw new Error("Failed to load exit banners");
            const data = await res.json();
            const list = Array.isArray(data) ? data : data.data || [];
            setBanners(list);
        } catch (err) {
            setError(err.message || "Something went wrong while loading banners");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    const openCreateModal = () => {
        setFormData(emptyForm);
        setFormErrors({});
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (banner) => {
        setFormData({
            id: banner.id,
            title: banner.title || "",
            description: banner.description || "",
            image: null,
            imagePreview: banner.image || "",
            url_link: banner.url_link || "",
            status: Number(banner.status) === 1 || banner.status === true,
        });
        setFormErrors({});
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(emptyForm);
        setFormErrors({});
    };

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowed.includes(file.type)) {
            setFormErrors((prev) => ({
                ...prev,
                image: "Only jpg, jpeg, png or webp images are allowed",
            }));
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setFormErrors((prev) => ({ ...prev, image: "Image must be 2MB or smaller" }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            image: file,
            imagePreview: URL.createObjectURL(file),
        }));
        setFormErrors((prev) => ({ ...prev, image: undefined }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.title.trim()) errs.title = "Title is required";
        if (formData.title.length > 255) errs.title = "Title must be under 255 characters";
        if (formData.url_link && formData.url_link.length > 255)
            errs.url_link = "Link must be under 255 characters";
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const buildFormData = () => {
        const fd = new FormData();
        fd.append("title", formData.title);
        fd.append("description", formData.description || "");
        fd.append("url_link", formData.url_link || "");
        fd.append("status", formData.status ? 1 : 0);
        if (formData.image) fd.append("image", formData.image);
        return fd;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setError("");
        try {
            const url = isEditing ? `${API_BASE}/update/${formData.id}` : `${API_BASE}/store`;
            const res = await fetch(url, { method: "POST", body: buildFormData() });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to save the exit banner");
            }
            closeModal();
            fetchBanners();
        } catch (err) {
            setError(err.message || "Something went wrong while saving");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (banner) => setDeleteTarget(banner);
    const cancelDelete = () => setDeleteTarget(null);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setError("");
        try {
            const res = await fetch(`${API_BASE}/delete/${deleteTarget.id}`, { method: "GET" });
            if (!res.ok) throw new Error("Failed to delete the exit banner");
            setDeleteTarget(null);
            fetchBanners();
        } catch (err) {
            setError(err.message || "Something went wrong while deleting");
        }
    };

    const handleToggleStatus = async (banner) => {
        const nextStatus = banner.status === 1 ? 0 : 1; // API expects 0 or 1 for this endpoint
        setError("");
        try {
            const res = await fetch(`${API_BASE}/status/${banner.id}?status=${nextStatus}`, {
                method: "GET",
            });
            if (!res.ok) throw new Error("Failed to update banner status");
            fetchBanners();
        } catch (err) {
            setError(err.message || "Something went wrong while updating status");
        }
    };

    return (
        <div className="eb-wrapper">
            <div className="eb-header">
                <div>
                    <h1 className="eb-title">Explore Banners</h1>
                    <p className="eb-subtitle">Manage the banners shown when visitors try to leave</p>
                </div>
                <button className="eb-btn eb-btn-primary" onClick={openCreateModal}>
                    + New Banner
                </button>
            </div>

            {error && <div className="eb-alert">{error}</div>}

            {loading ? (
                <div className="eb-empty">Loading banners…</div>
            ) : banners.length === 0 ? (
                <div className="eb-empty">No exit banners yet. Create your first one.</div>
            ) : (
                <div className="eb-card-grid">
                    {banners.map((banner) => {
                        const active = Number(banner.status) === 1 || banner.status === true;
                        return (
                            <div className="eb-card" key={banner.id}>
                                <div className="eb-card-media">
                                    {banner.image ? (
                                        <img src={banner.image} alt={banner.title} />
                                    ) : (
                                        <div className="eb-card-media-empty">No image</div>
                                    )}
                                    <button
                                        className={`eb-status-toggle eb-card-status ${active ? "is-active" : "is-inactive"
                                            }`}
                                        onClick={() => handleToggleStatus(banner)}
                                        title="Click to toggle status"
                                    >
                                        <span className="eb-status-dot" />
                                        {active ? "Active" : "Inactive"}
                                    </button>
                                </div>

                                <div className="eb-card-body">
                                    <div className="eb-card-title">{banner.title}</div>
                                    {banner.description && (
                                        <div className="eb-card-desc">{banner.description}</div>
                                    )}
                                    {banner.url_link ? (
                                        <a
                                            className="eb-card-link"
                                            href={banner.url_link}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {banner.url_link}
                                        </a>
                                    ) : (
                                        <span className="eb-card-link eb-muted">No link set</span>
                                    )}
                                </div>

                                <div className="eb-card-footer">
                                    <button className="eb-btn eb-btn-ghost" onClick={() => openEditModal(banner)}>
                                        Edit
                                    </button>
                                    <button className="eb-btn eb-btn-danger" onClick={() => confirmDelete(banner)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="eb-modal-overlay" onClick={closeModal}>
                    <div className="eb-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="eb-modal-header">
                            <h2>{isEditing ? "Edit Banner" : "New Banner"}</h2>
                            <button className="eb-icon-btn" onClick={closeModal} aria-label="Close">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="eb-form">
                            <label className="eb-field">
                                <span>Title *</span>
                                <input
                                    type="text"
                                    maxLength={255}
                                    value={formData.title}
                                    onChange={(e) => handleFieldChange("title", e.target.value)}
                                    placeholder="Enter banner title"
                                />
                                {formErrors.title && <span className="eb-field-error">{formErrors.title}</span>}
                            </label>

                            <label className="eb-field">
                                <span>Description</span>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => handleFieldChange("description", e.target.value)}
                                    placeholder="Optional description"
                                />
                            </label>

                            <label className="eb-field">
                                <span>Link URL</span>
                                <input
                                    type="text"
                                    maxLength={255}
                                    value={formData.url_link}
                                    onChange={(e) => handleFieldChange("url_link", e.target.value)}
                                    placeholder="https://example.com"
                                />
                                {formErrors.url_link && (
                                    <span className="eb-field-error">{formErrors.url_link}</span>
                                )}
                            </label>

                            <label className="eb-field">
                                <span>Image (jpg, jpeg, png, webp — max 2MB)</span>
                                <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageChange} />
                                {formErrors.image && <span className="eb-field-error">{formErrors.image}</span>}
                                {formData.imagePreview && (
                                    <img src={formData.imagePreview} alt="Preview" className="eb-preview" />
                                )}
                            </label>

                            <label className="eb-field eb-field-inline">
                                <span>Status</span>
                                <button
                                    type="button"
                                    className={`eb-status-toggle ${formData.status ? "is-active" : "is-inactive"}`}
                                    onClick={() => handleFieldChange("status", !formData.status)}
                                >
                                    <span className="eb-status-dot" />
                                    {formData.status ? "Active" : "Inactive"}
                                </button>
                            </label>

                            <div className="eb-modal-footer">
                                <button type="button" className="eb-btn eb-btn-ghost" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="eb-btn eb-btn-primary" disabled={submitting}>
                                    {submitting ? "Saving…" : isEditing ? "Save Changes" : "Create Banner"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="eb-modal-overlay" onClick={cancelDelete}>
                    <div className="eb-modal eb-modal-small" onClick={(e) => e.stopPropagation()}>
                        <h2>Delete banner?</h2>
                        <p className="eb-confirm-text">
                            This will permanently delete "{deleteTarget.title}". This action cannot be undone.
                        </p>
                        <div className="eb-modal-footer">
                            <button className="eb-btn eb-btn-ghost" onClick={cancelDelete}>
                                Cancel
                            </button>
                            <button className="eb-btn eb-btn-danger" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}