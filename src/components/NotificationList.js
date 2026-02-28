import React, { useEffect, useState } from "react";
import "../styles/notifications.css";
import ScheduleForm from "./ScheduleForm";

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingData, setEditingData] = useState(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("https://users.mpdatahub.com/api/notifications/list");
            const data = await res.json();
            setNotifications(data.data || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // const triggerSingleNotification = async () => {
    //     try {
    //         const res = await fetch(
    //             "https://users.mpdatahub.com/api/single-notification",
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify({
    //                     user_id: 84,
    //                 }),
    //             }
    //         );

    //         const result = await res.json();
    //         alert("Trigger API called successfully");
    //         fetchNotifications();
    //     } catch (error) {
    //         console.error("Trigger API error:", error);
    //         alert("Failed to trigger notification");
    //     }
    // };
    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;

        try {
            const res = await fetch(
                `https://users.mpdatahub.com/api/notification/${id}/status`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Status: newStatus }),
                }
            );

            if (res.ok) {
                alert(`Status updated!`);
                fetchNotifications();
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id) => {
        if (!window.confirm("Delete this notification?")) return;

        try {
            const res = await fetch(
                `https://users.mpdatahub.com/deletenotification/${id}`,
                { method: "DELETE" }
            );

            if (res.ok) {
                alert("Notification deleted!");
                fetchNotifications();
            } else {
                alert("Failed to delete");
            }
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    return (
        <div className="notification-containerntn">
            <div className="notification-headerntn">
                <h2>All Notifications</h2>
            </div>

            {editingData && (
                <div className="modal-overlayntn">
                    <div className="modal-boxntn modal-animatentn">
                        <button className="modal-close-btnntn" onClick={() => setEditingData(null)}>
                            ✕
                        </button>

                        <h3 className="modal-titlentn">Edit Notification</h3>

                        <div className="modal-bodyntn">
                            <ScheduleForm
                                editMode={true}
                                editData={editingData}
                                onClose={() => {
                                    setEditingData(null);
                                    fetchNotifications();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}


            {loading ? (
                <div className="dashboard-loadingdashntn">
                    Loading notifications...
                </div>
            ) : notifications.length === 0 ? (
                <p>No notifications found.</p>
            ) : (
                <ul className="notification-listntn">
                    {notifications.map((item) => (
                        <li key={item.type_id} className="notification-cardntn">
                            <h3>{item.title}</h3>
                            <img src={item.image} alt={item.title} className="notification-imagentn" />
                            <p>{item.message}</p>
                            <p><b>Date:</b> {item.date}</p>
                            <p><b>Time:</b> {item.time}</p>

                            <p>
                                <b>Status:</b>{" "}
                                <span className={item.Status === 1 ? "status-active" : "status-inactive"}>
                                    {item.Status === 1 ? "Active" : "Inactive"}
                                </span>
                            </p>
                            <div className="notbtn">
                                {/* Toggle Button */}
                                <button
                                    className={`status-btnntn ${item.Status === 1 ? "deactivate" : "activate"}`}
                                    onClick={() => toggleStatus(item.id, item.Status)}
                                >
                                    {item.Status === 1 ? "Deactivate" : "Activate"}
                                </button>

                                {/* EDIT BUTTON */}
                                <button
                                    className="edit-btnntn"
                                    onClick={() => setEditingData(item)}
                                >
                                    Edit
                                </button>

                                {/* DELETE BUTTON */}
                                <button
                                    className="delete-btnntn"
                                    onClick={() => deleteNotification(item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationList;