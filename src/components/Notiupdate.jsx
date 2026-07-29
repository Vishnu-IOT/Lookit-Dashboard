import React, { useEffect, useState } from "react";
import "../styles/Notiupdate.css";
import { Bell, Send, Plus } from 'lucide-react';
import { FaBell } from "react-icons/fa";
import StatusToggle from "./StatusToggle";

const API_BASE = "https://users.mpdatahub.com/api";

const Notiupdate = () => {
    const [notifications, setNotifications] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Add/Update notification modal state
    const [showFormModal, setShowFormModal] = useState(false);

    // Notification sending states
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationType, setNotificationType] = useState('single'); // 'single' or 'bulk'

    const [formData, setFormData] = useState({
        category_name: "",
        title: "",
        description: "",
        status: "1",
    });

    // Notification form states (used for both single and bulk)
    const [notificationForm, setNotificationForm] = useState({
        user_id: '',
        title: '',
        message: 'Check out this new notification! Tap to view now. 🔥',
        image: '',
        type: 'NOTIFICATION',
        type_id: ''
    });

    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE}/listNotificationsadmin`);
            const data = await res.json();
            setNotifications(data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationUpdateSubmit = async (notification, status) => {
        try {
            // const newValue = status === 1 ? 0 : 1;
            const formData = new FormData();

            formData.append('id', notification.id);
            formData.append('status', status);

            const url = `https://users.mpdatahub.com/api/notification/change-status`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                showToast('Notification Status updated successfully!', 'success');
                fetchNotifications();
            } else {
                const errData = await response.json();
                showToast(
                    errData.message || 'Failed to update status. Please try again.',
                    'error'
                );
            }
        } catch (error) {
            console.error('Error updating notification status:', error);
            showToast('Network error. Please try again.', 'error');
        }
    };

    const truncateWords = (text, maxWords = 3) => {
        if (!text) return "";

        const words = text.trim().split(/\s+/);

        return words.length > maxWords
            ? `${words.slice(0, maxWords).join(" ")}...`
            : text;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle notification form changes
    const handleNotificationInputChange = (e) => {
        const { name, value } = e.target;
        setNotificationForm({
            ...notificationForm,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
            showToast(
                "Only JPG, JPEG, PNG and GIF images are allowed.",
                "error"
            );

            e.target.value = "";
            return;
        }
        setImageFile(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const submitData = new FormData();
        submitData.append("category_name", formData.category_name);
        submitData.append("title", formData.title);
        submitData.append("description", formData.description);
        submitData.append("status", formData.status);
        if (imageFile) submitData.append("image", imageFile);

        const url = editingId
            ? `${API_BASE}/notifications/update/${editingId}`
            : `${API_BASE}/storeNotification`;

        try {
            await fetch(url, {
                method: "POST",
                body: submitData,
            });
            showToast(editingId ? "Notification updated successfully!" : "Notification created successfully!", "success");
            resetForm();
            setShowFormModal(false);
            fetchNotifications();
        } catch (err) {
            console.error("Submit error", err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            category_name: "",
            title: "",
            description: "",
            status: "1",
        });
        setImageFile(null);
        setPreview(null);
        setEditingId(null);
    };

    // Open the Add/Update modal for creating a new notification
    const openAddModal = () => {
        resetForm();
        setShowFormModal(true);
    };

    // Close the Add/Update modal
    const closeFormModal = () => {
        setShowFormModal(false);
        resetForm();
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            category_name: item.category_name,
            title: item.title,
            description: item.description,
            status: item.status,
        });
        setPreview(item.image);
        setShowFormModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete notification?")) return;
        try {
            await fetch(`${API_BASE}/notifications/delete/${id}`, {
                method: "post",
            });
            fetchNotifications();
            showToast("Notification deleted successfully!", "success");
        } catch (error) {
            console.error("Delete error", error);
            showToast("Error deleting notification.", "error");
        }
    };

    // Open notification modal for a specific notification
    const openNotificationModal = (notification, type = 'single') => {
        setSelectedNotification(notification);
        setNotificationType(type);

        // Set form data based on the notification
        setNotificationForm({
            user_id: type === 'single' ? '84' : '',
            title: notification.title || 'New Notification',
            message: notification.description || (type === 'single'
                ? 'Check out this new notification! Tap to view now. 🔥'
                : 'Check out this amazing update! Tap to explore now. 🚀'),
            image: notification.image || '',
            type: 'NOTIFICATION',
            type_id: notification.id.toString()
        });

        setShowNotificationModal(true);
    };

    // Close notification modal
    const closeNotificationModal = () => {
        setShowNotificationModal(false);
        setSelectedNotification(null);
        setNotificationType('single');
        setNotificationForm({
            user_id: '',
            title: '',
            message: 'Check out this new notification! Tap to view now. 🔥',
            image: '',
            type: 'NOTIFICATION',
            type_id: ''
        });
        setNotificationLoading(false);
    };

    // Send notification (both single and bulk)
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
                // For bulk, user_id is not needed
                title: notificationForm.title,
                message: notificationForm.message,
                image: notificationForm.image,
                type: notificationForm.type,
                type_id: notificationForm.type_id
            };

        try {
            const apiUrl = notificationType === 'single'
                ? 'https://users.mpdatahub.com/api/notification/sendSingleNotification'
                : 'https://users.mpdatahub.com/api/notification/bulk-send';

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

    return (
        <div className="notification-container">
            {toast.show && (
                <div className={`toast-box ${toast.type}`}>{toast.message}</div>
            )}

            {/* Add/Update Notification Modal */}
            {showFormModal && (
                <div className="noti-update-modal-overlay">
                    <div className="noti-update-modal-content">
                        <div className="noti-update-modal-header">
                            <h2>{editingId ? "Update Notification" : "Add Notification"}</h2>
                            <button
                                className="noti-update-modal-close-btn"
                                onClick={closeFormModal}
                            >
                                &times;
                            </button>
                        </div>

                        <form className="notification-form" onSubmit={handleSubmit}>
                            <input
                                name="category_name"
                                placeholder="Category Name"
                                value={formData.category_name}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="title"
                                placeholder="Title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                            <input type="file" accept="image/jpeg,image/png,image/gif" onChange={handleImageChange} />
                            {preview && (
                                <img src={preview} alt="preview" className="image-preview" />
                            )}
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            <button type="submit" disabled={loading}>
                                {loading ? "Uploading..." : editingId ? "Update" : "Create"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Send Notification Modal */}
            {showNotificationModal && (
                <div className="noti-update-modal-overlay">
                    <div className="noti-update-modal-content">
                        <div className="noti-update-modal-header">
                            <h2>
                                {notificationType === 'single' ? 'Send Single Notification' : 'Send Bulk Notification'}
                            </h2>
                            <button
                                className="noti-update-modal-close-btn"
                                onClick={closeNotificationModal}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={sendNotification} className="notification-form">
                            {notificationType === 'single' && (
                                <div className="noti-update-form-group">
                                    <label htmlFor="user_id">User ID *</label>
                                    <input
                                        type="text"
                                        id="user_id"
                                        name="user_id"
                                        value={notificationForm.user_id}
                                        onChange={handleNotificationInputChange}
                                        required
                                    />
                                </div>
                            )}

                            <div className="noti-update-form-group">
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

                            <div className="noti-update-form-group">
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

                            <div className="noti-update-form-group">
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
                                    <div className="noti-update-image-preview-small">
                                        <img src={notificationForm.image} alt="Notification preview" />
                                    </div>
                                )}
                            </div>

                            <div className="noti-update-form-group">
                                <label htmlFor="type">Type *</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={notificationForm.type}
                                    onChange={handleNotificationInputChange}
                                    required
                                >
                                    <option value="LOOKITINFO">LOOKITINFO</option>
                                    <option value="POSTERS">POSTERS</option>
                                    <option value="ARTICLE">ARTICLE</option>
                                    <option value="SHORTS">SHORTS</option>
                                    <option value="VIDEOS">VIDEOS</option>
                                </select>
                            </div>

                            <div className="noti-update-form-group">
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

                            <div className="noti-update-info">
                                <p className="noti-update-info-text">
                                    <strong>Note:</strong> This notification will be sent to {
                                        notificationType === 'single'
                                            ? 'a specific user'
                                            : 'ALL users'
                                    }
                                </p>
                            </div>

                            <div className="noti-update-form-actions">
                                <button
                                    type="submit"
                                    className={`noti-update-btn ${notificationType === 'single' ? 'noti-update-btn-primary' : 'noti-update-btn-bulk'}`}
                                    disabled={notificationLoading}
                                >
                                    {notificationLoading
                                        ? (notificationType === 'single' ? 'Sending...' : 'Sending to All...')
                                        : (notificationType === 'single' ? 'Send Notification' : 'Send to All Users')}
                                </button>
                                <button
                                    type="button"
                                    className="noti-update-btn noti-update-btn-secondary"
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

            <div className="noti-update-header-row">
                <h2 style={{ border: "none", margin: 0, padding: 0 }}>Notifications</h2>
                <button className="noti-update-add-btn" onClick={openAddModal}>
                    <Plus size={18} /> Add Notification
                </button>
            </div>

            <div className="notification-list">
                {notifications.map((item) => (
                    <div className="notification-card" key={item.id}>
                        <div className="noti-card-title-row" style={{ marginBottom: 14 }}>
                            <div className="noti-update-category">
                                <span className="noti-update-status-dot"></span>
                                <p className="category">
                                    {item.category_name}
                                </p>
                            </div>
                            <StatusToggle
                                defaultActive={
                                    item.status === '1' ? true : false
                                }
                                onChange={(isActive) => {
                                    handleNotificationUpdateSubmit(
                                        item,
                                        isActive ? 1 : 0
                                    );
                                }}
                            />
                        </div>
                        <div className="card-header">
                            <div className="noti-card-title-row">
                                <div className="noti-title-cat">
                                    <div className="uf-user-initial">
                                        <p className="noti-title-cat"><FaBell fontSize={24} /></p>
                                    </div>
                                    <h4>
                                        {item.title.length > 24
                                            ? item.title.slice(0, 24) + "..."
                                            : item.title}
                                        {/* {truncateWords(item.title, 5)} */}
                                    </h4>
                                </div>
                                <div className="notification-icons">
                                    <button
                                        className="notification-bell-btn single"
                                        onClick={() => openNotificationModal(item, 'single')}
                                        title="Send Single Notification"
                                    >
                                        <Bell size={18} />
                                    </button>
                                    <button
                                        className="notification-bell-btn bulk"
                                        onClick={() => openNotificationModal(item, 'bulk')}
                                        title="Send Bulk Notification to All Users"
                                    >
                                        <Send size={18} />
                                    </button>
                                    {/* <span
                                        className={`status-label ${item.status === "1" || item.status === 1 ? "active" : "inactive"
                                            }`}
                                    >
                                        {item.status === "1" || item.status === 1 ? "Active" : "Inactive"}
                                    </span> */}
                                </div>
                            </div>
                        </div>
                        <p>{item.description}</p>
                        {item.image && (
                            <img
                                src={item.image || "/assets/lookit.png"}
                                alt="notification"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/assets/lookit.png";
                                }}
                            />
                        )}
                        <div className="card-actions">
                            <button onClick={() => handleEdit(item)}>Edit</button>
                            <button className="delete" onClick={() => handleDelete(item.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notiupdate;