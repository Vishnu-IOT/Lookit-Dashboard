import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import "../styles/listall.css";
import Loder from "./Loder";
import { AiFillBell } from "react-icons/ai";
import { FcAlarmClock } from "react-icons/fc";
import { IoPersonCircleOutline } from "react-icons/io5";
import { LuEye } from "react-icons/lu";
import { MdOutlineEdit } from "react-icons/md";

const NotificationModal = ({
  showNotificationModal,
  notificationData,
  setNotificationData,
  handleCloseNotificationModal,
  handleSendNotification,
  isSendingNotification,
  isScheduled = false,
}) => {
  const typeInputRef = useRef(null);
  const titleInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const dateTimeInputRef = useRef(null);

  useEffect(() => {
    if (showNotificationModal) {
      const timer = setTimeout(() => {
        if (typeInputRef.current) {
          typeInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showNotificationModal]);

  // In the NotificationModal component, update the handleInputChange for image:
  const handleInputChange = useCallback(
    (field) => (e) => {
      setNotificationData((prev) => ({
        ...prev,
        [field]:
          field === "type"
            ? e.target.value.toUpperCase()
            : field === "image"
              ? e.target.value // Make sure image field updates correctly
              : e.target.value,
      }));
    },
    [setNotificationData],
  );

  const handleSelectChange = useCallback(
    (e) => {
      setNotificationData((prev) => ({
        ...prev,
        topic: e.target.value,
      }));
    },
    [setNotificationData],
  );

  const handleDateTimeChange = useCallback(
    (e) => {
      setNotificationData((prev) => ({
        ...prev,
        scheduled_time: e.target.value,
      }));
    },
    [setNotificationData],
  );

  if (!showNotificationModal) return null;

  return (
    <div className="modal-overlay" onClick={handleCloseNotificationModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isScheduled
              ? "Schedule Push Notification"
              : "Send Push Notification"}
          </h2>
          <button
            className="modal-close-btn"
            onClick={handleCloseNotificationModal}
            type="button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="modal-content1">
          <div className="form-group">
            <label className="form-label">Type</label>
            <input
              ref={typeInputRef}
              className="form-input"
              value={notificationData.type}
              onChange={handleInputChange("type")}
              type="text"
              style={{ textTransform: "uppercase" }}
            />
            <small className="form-help">
              Content type (ARTICLE, VIDEO, etc.)
            </small>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              ref={titleInputRef}
              className="form-input"
              value={notificationData.title}
              onChange={handleInputChange("title")}
              type="text"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              ref={messageInputRef}
              className="form-textarea"
              value={notificationData.message}
              onChange={handleInputChange("message")}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              ref={imageInputRef}
              className="form-input"
              value={notificationData.image || ""} // Add fallback empty string
              onChange={handleInputChange("image")}
              type="text"
              placeholder="Enter image URL or path"
            />
            {notificationData.image && (
              <div className="image-preview">
                <img
                  src={notificationData.image}
                  alt="Notification Preview"
                  className="preview-image-small"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Scheduled Date/Time Field - Only shown for scheduled notifications */}
          {isScheduled && (
            <div className="form-group">
              <label className="form-label">Schedule Date & Time</label>
              <input
                ref={dateTimeInputRef}
                className="form-input"
                type="datetime-local"
                value={notificationData.scheduled_time || ""}
                onChange={handleDateTimeChange}
                min={new Date().toISOString().slice(0, 16)}
                required={isScheduled}
              />
              <small className="form-help">
                Select future date and time for notification
              </small>
              {notificationData.scheduled_time && (
                <div className="schedule-preview">
                  <p>
                    Selected:{" "}
                    {new Date(notificationData.scheduled_time).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Topic</label>
            <select
              className="form-select"
              value={notificationData.topic}
              onChange={handleSelectChange}
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
        </div>
        <div className="modal-actions">
          <button
            className="modal-cancel-btn"
            onClick={handleCloseNotificationModal}
            disabled={isSendingNotification}
            type="button"
          >
            Cancel
          </button>
          <button
            className="modal-send-btn"
            onClick={handleSendNotification}
            disabled={
              isSendingNotification ||
              (isScheduled && !notificationData.scheduled_time)
            }
            type="button"
          >
            {isSendingNotification ? (
              <>
                <span
                  className="processing-spinner"
                  role="status"
                  aria-hidden="true"
                ></span>
                {isScheduled ? "Scheduling..." : "Sending..."}
              </>
            ) : isScheduled ? (
              "Schedule Notification"
            ) : (
              "Send Notification"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const Listarticle = () => {
  // const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeURL, setYoutubeURL] = useState("");
  const [imageone, setImageone] = useState(null);
  const [imagetwo, setImagetwo] = useState(null);
  const [imageonePreview, setImageonePreview] = useState("");
  const [imagetwoPreview, setImagetwoPreview] = useState("");
  const [isSubCategoriesLoaded, setIsSubCategoriesLoaded] = useState(false);
  const [contentType, setContentType] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [postsPerPage] = useState(20);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    contentType: "",
    trending: "",
  });
  const [allPosts, setAllPosts] = useState([]);

  // Notification states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedPostForNotification, setSelectedPostForNotification] =
    useState(null);
  const [isScheduledNotification, setIsScheduledNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: "",
    title: "",
    message: "",
    image: "",
    topic: "MPeoplesNEWS",
    detailed_content: "",
    scheduled_time: "",
  });
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [userId, setUserId] = useState("");

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category: "",
      status: "",
      contentType: "",
      trending: "",
    });
    setCurrentPage(1);
  }, []);

  const handleCloseNotificationModal = useCallback(() => {
    setShowNotificationModal(false);
    setSelectedPostForNotification(null);
    setIsScheduledNotification(false);
    setNotificationData({
      type: "",
      title: "",
      message: "",
      image: "",
      topic: "MPeoplesNEWS",
      detailed_content: "",
      scheduled_time: "",
    });
    setIsSendingNotification(false);
  }, []);

  const handleSendNotification = useCallback(async () => {
    if (!selectedPostForNotification) return;

    // Validate scheduled time if it's a scheduled notification
    if (isScheduledNotification && !notificationData.scheduled_time) {
      alert("Please select a schedule date and time");
      return;
    }

    setIsSendingNotification(true);

    // Declare variables outside try block so they can be used in alert
    let scheduledDate = "";
    let scheduledTime = "";

    console.log("Selected Post:", selectedPostForNotification);
    console.log("Notification Data:", notificationData);

    try {
      // FIXED: Use notificationData.image which contains the web_thumbnail
      const basePayload = {
        type: notificationData.type || "ARTICLE",
        type_id:
          notificationData.type_id || selectedPostForNotification.id.toString(),
        post_id: selectedPostForNotification.id.toString(),
        title: notificationData.title,
        message: notificationData.message,
        image:
          notificationData.image ||
          selectedPostForNotification.web_thumbnail ||
          "", // Changed to web_thumbnail
        topics: "MPeoplesNEWS",
        detailed_content:
          notificationData.detailed_content ||
          selectedPostForNotification.app_thumbnail ||
          "",
      };

      console.log("Base Payload:", basePayload);

      let response;

      if (isScheduledNotification) {
        // Parse the datetime-local value into separate date and time
        const scheduledDateTime = new Date(notificationData.scheduled_time);

        // Format date as YYYY-MM-DD
        scheduledDate = scheduledDateTime.toISOString().split("T")[0];

        // Format time as HH:MM (24-hour format)
        scheduledTime = scheduledDateTime
          .toTimeString()
          .split(" ")[0]
          .substring(0, 5);

        // Send to the schedule API with separate date and time fields
        response = await axios.post(
          "https://users.mpdatahub.com/api/notification/date-time",
          {
            ...basePayload,
            date: scheduledDate,
            time: scheduledTime,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );
      } else {
        // Immediate notification - use your existing bulk-send endpoint
        response = await axios.post(
          "https://users.mpdatahub.com/api/bulk-send",
          basePayload,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );
      }

      if (response.data.success) {
        alert(
          isScheduledNotification
            ? `Notification scheduled successfully for ${scheduledDate} at ${scheduledTime}!`
            : "Notification sent successfully!",
        );
        handleCloseNotificationModal();
      } else {
        alert(
          response.data.message ||
          `Failed to ${isScheduledNotification ? "schedule" : "send"} notification`,
        );
      }
    } catch (err) {
      console.error("Notification error:", err);

      // More specific error message for 405 errors
      if (err.response?.status === 405) {
        alert(
          "The scheduling API endpoint exists but may need to be configured correctly on the server. Please check with your backend team.",
        );
      } else {
        alert(`Error: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setIsSendingNotification(false);
    }
  }, [
    selectedPostForNotification,
    notificationData,
    isScheduledNotification,
    handleCloseNotificationModal,
  ]);

  const handleOpenNotificationModal = useCallback(
    (post, isScheduled = false) => {
      console.log(post);

      setSelectedPostForNotification(post);
      setIsScheduledNotification(isScheduled);
      const contentTypeUpper = post.content_type
        ? post.content_type.toUpperCase()
        : "ARTICLE";
      setNotificationData({
        type: contentTypeUpper,
        type_id: post.id.toString(),
        title: post.title || "",
        message: (() => {
          const temp = document.createElement("div");
          temp.innerHTML = post.description;
          return temp.textContent || temp.innerText || "";
        })() || "",
        image: post.web_thumbnail || "", // This sets the image field
        // web_thumbnail: post.web_thumbnail || "", // Also store separately if needed
        app_thumbnail: post.app_thumbnail || "",
        topics: "MPeoplesNEWS",
        detailed_content: post.app_thumbnail || "",
        scheduled_time: "", // Reset scheduled time
      });
      setShowNotificationModal(true);
    },
    [],
  );

  const fetchPosts = useCallback(() => {
    setIsLoading(true);
    axios
      .get(
        `https://users.mpdatahub.com/api/view-post-sub?currentPage=1&perPage=200`,
      )
      .then((response) => {
        setAllPosts(response.data.data || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("API fetch error:", error);
        setIsLoading(false);
      });
  }, []);

  // ... (keep all your existing functions: handleEdit, handleView, handleImageOneChange, handleImageTwoChange, handleSubmit, togglePostStatus, updateFlag, pagination functions)

  const handleEdit = useCallback(async (post) => {
    setIsEditLoading(true);
    try {
      const [mainCatRes, subCatRes] = await Promise.all([
        axios.get("https://users.mpdatahub.com/api/main-category"),
        axios.get(
          `https://users.mpdatahub.com/api/sub-category?id=${post.category?.parent_id || ""}`,
        ),
      ]);
      setEditingPost(post);
      setTitle(post.title || "");
      setDescription(post.description || "");
      setYoutubeURL(post.youtube_url || "");
      setContentType(post.content_type || "");
      setImageonePreview(post.app_thumbnail || "");
      setImagetwoPreview(post.web_thumbnail || "");
      setImageone(null);
      setImagetwo(null);
      const allowedCategories = (mainCatRes.data || []).filter(
        (cat) => cat.status === "allow",
      );
      setMainCategories(allowedCategories);
      setSubCategories(subCatRes.data || []);
      setSelectedMain(post.category?.parent_id?.toString() || "");
      setSelectedSub(post.category_id?.toString() || "");
    } catch (err) {
      console.error("Edit load error:", err);
      alert("Failed to load edit data");
    } finally {
      setIsEditLoading(false);
    }
  }, []);

  const handleView = useCallback((post) => {
    setViewingPost(post);
    setEditingPost(null);
  }, []);

  const handleImageOneChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setImageone(file);
      const previewUrl = URL.createObjectURL(file);
      setImageonePreview(previewUrl);
    }
  }, []);

  const handleImageTwoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setImagetwo(file);
      const previewUrl = URL.createObjectURL(file);
      setImagetwoPreview(previewUrl);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (editingPost && !editingPost.id) {
      alert("Error: Post ID is missing for editing");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("category_id", selectedSub ? String(selectedSub) : "");
    formData.append("title", title || "");
    formData.append("message", description || "");
    formData.append("youtube_url", youtubeURL || "");
    formData.append("content_type", contentType || "");
    if (imageone) {
      formData.append("app_thumbnail", imageone);
    }
    if (imagetwo) {
      formData.append("web_thumbnail", imagetwo);
    }
    const endpoint = editingPost
      ? "https://users.mpdatahub.com/api/store-new-post"
      : "https://users.mpdatahub.com/api/upload-post";
    if (editingPost) {
      formData.append("post_id", editingPost.id.toString());
    }
    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        alert(editingPost ? "Post updated!" : "Post submitted!");
        setEditingPost(null);
        setImageone(null);
        setImagetwo(null);
        setImageonePreview("");
        setImagetwoPreview("");
        fetchPosts();
      } else {
        alert(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Submission error", err);
      alert(err.response?.data?.message || "Error during submission.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    editingPost,
    isSubmitting,
    selectedSub,
    title,
    description,
    youtubeURL,
    contentType,
    imageone,
    imagetwo,
    fetchPosts,
    userId,
  ]);

  const togglePostStatus = useCallback(
    async (postId, currentStatus) => {
      // const newStatus = currentStatus === 'yes' ? 'no' : 'yes';
      const newStatus = currentStatus;
      setIsProcessing(true);
      try {
        await axios.post("https://users.mpdatahub.com/api/update-status", {
          postId,
          isActive: newStatus,
        });
        alert(
          `Post status updated to ${newStatus === "yes" ? "Active" : "Disabled"}`,
        );
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, isActive: newStatus } : post,
          ),
        );
        if (viewingPost?.id === postId) {
          setViewingPost((prev) => ({
            ...prev,
            isActive: newStatus,
          }));
        }
      } catch (err) {
        console.error("Status update error", err);
        alert("Error updating post status");
      } finally {
        setIsProcessing(false);
      }
    },
    [viewingPost],
  );

  const updateFlag = useCallback(
    async (postId, field, currentValue) => {
      const newValue = currentValue === 1 ? 0 : 1;

      try {
        const payload = {
          id: postId,
          istrending: "",
          isBreaking: "",
          is_entertainment: "",
          is_spotlight: "",
        };

        payload[field] = newValue;

        const response = await axios.post(
          "https://users.mpdatahub.com/api/update-flags",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        const storeValue =
          field === "isBreaking"
            ? newValue === 1
              ? "yes"
              : "no"
            : newValue === 1
              ? 1
              : 0;

        if (response.data.success) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, [field]: storeValue } : post,
            ),
          );

          if (viewingPost?.id === postId) {
            setViewingPost((prev) => ({
              ...prev,
              [field]: storeValue,
            }));
          }
        }
      } catch (err) {
        console.error("Flag update error", err);
      }
    },
    [viewingPost],
  );

  // Pagination functions
  const goToPage = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const getPageNumbers = useCallback(() => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  }, [currentPage, totalPages]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (allPosts.length === 0) return;
    let filtered = [...allPosts];

    if (filters.category) {
      filtered = filtered.filter(
        (post) => post.category?.parent_id?.toString() === filters.category,
      );
    }
    if (filters.status) {
      filtered = filtered.filter((post) => post.isActive === filters.status);
    }
    if (filters.contentType) {
      filtered = filtered.filter(
        (post) => post.content_type === filters.contentType,
      );
    }
    if (filters.trending !== "") {
      filtered = filtered.filter(
        (post) => post.istrending?.toString() === filters.trending,
      );
    }
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = filtered.slice(startIndex, endIndex);
    setPosts(paginatedPosts);
    setTotalPosts(filtered.length);
    setTotalPages(Math.ceil(filtered.length / postsPerPage));
  }, [allPosts, currentPage, filters, postsPerPage]);

  useEffect(() => {
    axios
      .get("https://users.mpdatahub.com/api/main-category")
      .then((res) => {
        const allowedCategories = (res.data || []).filter(
          (cat) => cat.status === "allow",
        );
        setMainCategories(allowedCategories);
      })
      .catch((err) => console.error("Main category error", err));
  }, []);

  useEffect(() => {
    if (selectedMain) {
      setIsSubCategoriesLoaded(false);
      axios
        .get(`https://users.mpdatahub.com/api/sub-category?id=${selectedMain}`)
        .then((res) => {
          const subs = res.data || [];
          setSubCategories(subs);
          setIsSubCategoriesLoaded(true);
          setIsEditLoading(false);
        })
        .catch((err) => {
          console.error("Sub category error", err);
          setIsEditLoading(false);
        });
    }
  }, [selectedMain]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    return () => {
      if (imageonePreview) URL.revokeObjectURL(imageonePreview);
      if (imagetwoPreview) URL.revokeObjectURL(imagetwoPreview);
    };
  }, [imageonePreview, imagetwoPreview]);

  // Get logged in user email from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserId(userData.id || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const initials = (name) => {
    return name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const Loader = () => <Loder />;

  return (
    <div className="articles-container">
      <NotificationModal
        showNotificationModal={showNotificationModal}
        notificationData={notificationData}
        setNotificationData={setNotificationData}
        handleCloseNotificationModal={handleCloseNotificationModal}
        handleSendNotification={handleSendNotification}
        isSendingNotification={isSendingNotification}
        isScheduled={isScheduledNotification}
      />

      {isLoading ? (
        <Loader />
      ) : !editingPost && !viewingPost ? (
        <>
          <h1 style={{ textAlign: "left", marginBottom: "20px" }}>
            List & Edit LookIt Articles
          </h1>

          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  className="filter-select"
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <option value="">All Categories</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                  className="filter-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="yes">Active</option>
                  <option value="no">Disabled</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Content Type</label>
                <select
                  className="filter-select"
                  value={filters.contentType}
                  onChange={(e) =>
                    handleFilterChange("contentType", e.target.value)
                  }
                >
                  <option value="">All Content Types</option>
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="shorts">Shorts</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Trending</label>
                <select
                  className="filter-select"
                  value={filters.trending}
                  onChange={(e) =>
                    handleFilterChange("trending", e.target.value)
                  }
                >
                  <option value="">All Trending</option>
                  <option value="1">Trending</option>
                  <option value="0">Not Trending</option>
                </select>
              </div>
              <div className="filter-group">
                <button
                  className="reset-filters-btn"
                  onClick={resetFilters}
                  type="button"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className="posts-grid">
            {posts.length > 0 ? (
              posts
                .filter((post) => post.category.parent_id !== 224)
                .map((post) => (
                  <div className="post-cardss" key={post.id}>
                    <div className="post-author">
                      <div className="sub-post-author">
                        <span className="user-initial">
                          {post.user?.name ? (
                            initials(post.user.name)
                          ) : (
                            <IoPersonCircleOutline />
                          )}
                        </span>
                        <small>{post.user?.name || "Unknown Author"}</small>
                      </div>
                      <div className="post-actions-icons">
                        <button
                          className="notification-btn"
                          onClick={() =>
                            handleOpenNotificationModal(post, false)
                          }
                          title="Send Notification"
                          type="button"
                        >
                          {/* 🔔 */}
                          <AiFillBell />
                        </button>
                        <button
                          className="notification-btn"
                          onClick={() =>
                            handleOpenNotificationModal(post, true)
                          }
                          title="Schedule Notification"
                          type="button"
                        >
                          {/* ⏰ */}
                          <FcAlarmClock />
                        </button>
                      </div>
                    </div>
                    <img
                      src={post.web_thumbnail || "/assets/no-img.jpeg"}
                      className="post-image"
                      alt={post.title || "Post"}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="post-contentss">
                      <div className="post-header">
                        <div className="post-meta">
                          <div>
                            <div className="post-category">
                              {post.category?.name || "Uncategorized"}
                            </div>
                          </div>
                          <div className="post-date">
                            {/* <div className="date-label">Created At</div> */}
                            <div className="date-value">
                              {new Date(post.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <h3 className="post-title">{post.title}</h3>

                      <div className="la-post-actions">
                        <div className="status-controls">
                          <div
                            className={`toggle-group ${post.istrending === 1 ? "trending-active" : ""
                              }`}
                            onChange={(e) =>
                              updateFlag(post.id, "istrending", e.target.value)
                            }
                          >
                            <span
                              style={{
                                color: "black",
                                fontWeight: 300,
                                fontSize: 16,
                              }}
                            >
                              Trending:
                            </span>
                            <input
                              className="toggle-switch"
                              type="checkbox"
                              role="switch"
                              checked={post.istrending === 1}
                              readOnly
                            />
                            <span className="toggle-label">
                              {post.istrending === 1 ? "Trending" : "Normal"}
                            </span>
                          </div>

                          {/* <div
                            className={`toggle-group ${
                              post.isActive === 'yes'
                                ? 'status-active'
                                : 'status-inactive'
                            }`}
                            onClick={() =>
                              togglePostStatus(post.id, post.isActive)
                            }
                          >
                            <input
                              className="toggle-switch"
                              type="checkbox"
                              role="switch"
                              checked={post.isActive === 'yes'}
                              readOnly
                            />
                            <span className="toggle-label">
                              {post.isActive === 'yes' ? 'Active' : 'Disabled'}
                            </span>
                          </div> */}

                          <div
                            className={`toggle-group ${post.isActive === "yes"
                              ? "status-active"
                              : post.isActive === "reject"
                                ? "status-rejected"
                                : "status-inactive"
                              }`}
                          >
                            <span
                              style={{
                                color: "black",
                                fontWeight: 300,
                                fontSize: 16,
                              }}
                            >
                              Status:
                            </span>
                            <select
                              value={post.isActive || ""}
                              onChange={(e) =>
                                togglePostStatus(post.id, e.target.value)
                              }
                            >
                              {/* <option value="">Select Status</option> */}
                              <option className="toggle-label" value="yes">
                                Active
                              </option>
                              <option value="no">Disabled</option>
                              <option value="reject">Rejected</option>
                            </select>
                          </div>
                        </div>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(post)}
                            type="button"
                          >
                            <MdOutlineEdit /> Edit
                          </button>
                          <button
                            className="view-btn"
                            onClick={() => handleView(post)}
                            type="button"
                          >
                            <LuEye /> View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">No posts found</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-section">
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  <li
                    className={`pagination-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="pagination-link pagination-first"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      type="button"
                    >
                      First
                    </button>
                  </li>
                  <li
                    className={`pagination-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="pagination-link pagination-prev"
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      type="button"
                    >
                      Previous
                    </button>
                  </li>
                  {getPageNumbers().map((pageNum, index) => (
                    <li
                      key={index}
                      className={`pagination-item ${pageNum === "..." ? "pagination-ellipsis" : ""} ${currentPage === pageNum ? "active" : ""
                        }`}
                    >
                      {pageNum === "..." ? (
                        <span className="pagination-ellipsis">...</span>
                      ) : (
                        <button
                          className="pagination-link"
                          onClick={() => goToPage(pageNum)}
                          type="button"
                        >
                          {pageNum}
                        </button>
                      )}
                    </li>
                  ))}
                  <li
                    className={`pagination-item ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="pagination-link pagination-next"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      type="button"
                    >
                      Next
                    </button>
                  </li>
                  <li
                    className={`pagination-item ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="pagination-link pagination-last"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      type="button"
                    >
                      Last
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          <div className="results-info">
            Showing {(currentPage - 1) * postsPerPage + 1} to{" "}
            {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts}{" "}
            posts
          </div>
        </>
      ) : viewingPost ? (
        <div className="post-detail-container">
          <h2 className="detail-header">Post Details</h2>
          <div className="detail-content">
            <div className="detail-grid">
              <div className="detail-group">
                <span className="detail-label">Title</span>
                <p className="detail-value">{viewingPost.title}</p>
              </div>
              <div className="detail-group">
                <span className="detail-label">Content Type</span>
                <p className="detail-value">{viewingPost.content_type}</p>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-group">
                <span className="detail-label">Main Category</span>
                <p className="detail-value">
                  {viewingPost.category?.name || "N/A"}
                </p>
              </div>
              <div className="detail-group">
                <span className="detail-label">Sub Category</span>
                <p className="detail-value">
                  {viewingPost.sub_category?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="detail-group">
              <span className="detail-label">Description</span>
              <p className="detail-value">{viewingPost.description}</p>
            </div>
            {viewingPost.youtube_url && (
              <div className="detail-group">
                <span className="detail-label">YouTube URL</span>
                <a
                  href={viewingPost.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-value"
                >
                  {viewingPost.youtube_url}
                </a>
              </div>
            )}
            <div className="detail-grid">
              <div className="detail-group">
                <span className="detail-label">App Thumbnail</span>
                {viewingPost.app_thumbnail && (
                  <img
                    src={viewingPost.app_thumbnail}
                    alt="App Thumbnail"
                    className="detail-image"
                  />
                )}
              </div>
              <div className="detail-group">
                <span className="detail-label">Web Thumbnail</span>
                {viewingPost.web_thumbnail && (
                  <img
                    src={viewingPost.web_thumbnail}
                    alt="Web Thumbnail"
                    className="detail-image"
                  />
                )}
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-group">
                <span className="detail-label">Status</span>
                <div className="status-controls-group">
                  <div>
                    <span className="detail-label">Active:</span>
                    {isProcessing ? (
                      <div className="processing-overlay">
                        <div className="processing-spinner"></div>
                        <div className="processing-text">Updating...</div>
                      </div>
                    ) : (
                      // <div
                      //   className={`toggle-group ${
                      //     viewingPost.isActive === 'yes'
                      //       ? 'status-active'
                      //       : 'status-inactive'
                      //   }`}
                      //   onClick={() =>
                      //     togglePostStatus(viewingPost.id, viewingPost.isActive)
                      //   }
                      // >
                      //   <input
                      //     className="toggle-switch"
                      //     type="checkbox"
                      //     role="switch"
                      //     checked={viewingPost.isActive === 'yes'}
                      //     readOnly
                      //   />
                      //   <span className="toggle-label">
                      //     {viewingPost.isActive === 'yes'
                      //       ? 'Active'
                      //       : 'Disabled'}
                      //   </span>
                      // </div>
                      <div
                        className={`toggle-group ${viewingPost.isActive === "yes"
                          ? "status-active"
                          : viewingPost.isActive === "reject"
                            ? "status-rejected"
                            : "status-inactive"
                          }`}
                      >
                        {/* <span
                          style={{
                            color: 'black',
                            fontWeight: 300,
                            fontSize: 16,
                          }}
                        >
                          Status:
                        </span> */}
                        <select
                          value={viewingPost.isActive || ""}
                          onChange={(e) =>
                            togglePostStatus(viewingPost.id, e.target.value)
                          }
                        >
                          {/* <option value="">Select Status</option> */}
                          <option className="toggle-label" value="yes">
                            Active
                          </option>
                          <option value="no">Disabled</option>
                          <option value="reject">Rejected</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="detail-label">Trending:</span>
                    {isProcessing ? (
                      <div className="processing-overlay">
                        <div className="processing-spinner"></div>
                        <div className="processing-text">Updating...</div>
                      </div>
                    ) : (
                      <div
                        className={`toggle-group ${viewingPost.istrending === 1 ? "trending-active" : ""
                          }`}
                        onChange={(e) =>
                          updateFlag(
                            viewingPost.id,
                            "istrending",
                            viewingPost.istrending,
                          )
                        }
                      >
                        <input
                          className="toggle-switch"
                          type="checkbox"
                          role="switch"
                          checked={viewingPost.istrending === 1}
                          readOnly
                        />
                        <span className="toggle-label">
                          {viewingPost.istrending === 1 ? "Trending" : "Normal"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="detail-label">Breaking:</span>
                    {isProcessing ? (
                      <div className="processing-overlay">
                        <div className="processing-spinner"></div>
                        <div className="processing-text">Updating...</div>
                      </div>
                    ) : (
                      <div
                        className={`toggle-group ${viewingPost.isBreaking === "yes"
                          ? "status-active"
                          : ""
                          }`}
                        onChange={(e) =>
                          updateFlag(
                            viewingPost.id,
                            "isBreaking",
                            viewingPost.isBreaking === "yes" ? 1 : 0,
                          )
                        }
                      >
                        <input
                          className="toggle-switch"
                          type="checkbox"
                          role="switch"
                          checked={viewingPost.isBreaking === "yes"}
                          readOnly
                        />
                        <span className="toggle-label">
                          {viewingPost.isBreaking === "yes"
                            ? "Breaking"
                            : "Normal"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="detail-label">Entertainment:</span>
                    {isProcessing ? (
                      <div className="processing-overlay">
                        <div className="processing-spinner"></div>
                        <div className="processing-text">Updating...</div>
                      </div>
                    ) : (
                      <div
                        className={`toggle-group ${viewingPost.is_entertainment === 1
                          ? "status-active"
                          : ""
                          }`}
                        onChange={(e) =>
                          updateFlag(
                            viewingPost.id,
                            "is_entertainment",
                            viewingPost.is_entertainment,
                          )
                        }
                      >
                        <input
                          className="toggle-switch"
                          type="checkbox"
                          role="switch"
                          checked={viewingPost.is_entertainment === 1}
                          readOnly
                        />
                        <span className="toggle-label">
                          {viewingPost.is_entertainment === 1
                            ? "Entertainment"
                            : "Normal"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="detail-label">Spotlight:</span>
                    {isProcessing ? (
                      <div className="processing-overlay">
                        <div className="processing-spinner"></div>
                        <div className="processing-text">Updating...</div>
                      </div>
                    ) : (
                      <div
                        className={`toggle-group ${viewingPost.is_spotlight === 1 ? "status-active" : ""
                          }`}
                        onChange={(e) =>
                          updateFlag(
                            viewingPost.id,
                            "is_spotlight",
                            viewingPost.is_spotlight,
                          )
                        }
                      >
                        <input
                          className="toggle-switch"
                          type="checkbox"
                          role="switch"
                          checked={viewingPost.is_spotlight === 1}
                          readOnly
                        />
                        <span className="toggle-label">
                          {viewingPost.is_spotlight === 1
                            ? "Spotlighted"
                            : "Normal"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="detail-group">
                <span className="detail-label">Author</span>
                <p className="detail-value">
                  {viewingPost.user?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-group">
                <span className="detail-label">Created At</span>
                <p className="detail-value">
                  {new Date(viewingPost.created_at).toLocaleString()}
                </p>
              </div>
              <div className="detail-group">
                <span className="detail-label">Updated At</span>
                <p className="detail-value">
                  {new Date(viewingPost.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="detail-actions">
              <button
                className="back-btn"
                onClick={() => setViewingPost(null)}
                type="button"
              >
                Back to List
              </button>
              <button
                className="edit-detail-btn"
                onClick={() => {
                  handleEdit(viewingPost);
                  setViewingPost(null);
                }}
                type="button"
              >
                Edit Post
              </button>
              <button
                className="notification-btn-detail"
                onClick={() => handleOpenNotificationModal(viewingPost, false)}
                type="button"
              >
                🔔 Send Notification
              </button>
              <button
                className="schedule-btn-detail"
                onClick={() => handleOpenNotificationModal(viewingPost, true)}
                type="button"
              >
                ⏰ Schedule Notification
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="form-container">
          {isEditLoading ? (
            <Loader />
          ) : (
            <>
              <h2 className="form-title">
                {editingPost ? "Edit Article" : "Add Article"}
              </h2>
              {isSubmitting && (
                <div className="processing-overlay">
                  <div className="processing-spinner"></div>
                  <p className="processing-text">Processing your request...</p>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <div className="radio-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="contentType"
                      value="article"
                      className="radio-input"
                      checked={contentType === "article"}
                      onChange={() => setContentType("article")}
                    />
                    Article
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="contentType"
                      value="shorts"
                      checked={contentType === "shorts"}
                      onChange={() => setContentType("shorts")}
                      className="radio-input"
                    />
                    Shorts
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="contentType"
                      value="video"
                      className="radio-input"
                      checked={contentType === "video"}
                      onChange={() => setContentType("video")}
                    />
                    Video
                  </label>
                </div>
              </div>
              <div className="form-columns">
                <div className="form-group">
                  <label className="form-label">Main Category</label>
                  <select
                    className="form-select"
                    value={selectedMain}
                    onChange={(e) => setSelectedMain(e.target.value)}
                  >
                    <option value="">Select Main Category</option>
                    {mainCategories.length > 0 &&
                      mainCategories.map((cat) => (
                        <option key={cat.id} value={cat.id.toString()}>
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
                    {subCategories.length > 0 &&
                      subCategories.map((sub) => (
                        <option key={sub.id} value={sub.id.toString()}>
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
              {/* App Thumbnail - File Upload */}
              <div className="form-group">
                <label className="form-label">App Thumbnail</label>
                <input
                  className="form-input-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageOneChange}
                />
                {imageonePreview && (
                  <div className="image-preview">
                    <img
                      src={imageonePreview}
                      alt="App Thumbnail Preview"
                      className="preview-image"
                    />
                    <p className="preview-text">
                      Selected: {imageone?.name || "Current Image"}
                    </p>
                  </div>
                )}
                {editingPost &&
                  !imageonePreview &&
                  editingPost.app_thumbnail && (
                    <div className="image-preview">
                      <img
                        src={editingPost.app_thumbnail}
                        alt="Current App Thumbnail"
                        className="preview-image"
                      />
                      <p className="preview-text">Current Image</p>
                    </div>
                  )}
              </div>
              <div className="form-group">
                <label className="form-label">Web Thumbnail</label>
                <input
                  className="form-input-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageTwoChange}
                />
                {imagetwoPreview && (
                  <div className="image-preview">
                    <img
                      src={imagetwoPreview}
                      alt="Web Thumbnail Preview"
                      className="preview-image"
                    />
                    <p className="preview-text">
                      Selected: {imagetwo?.name || "Current Image"}
                    </p>
                  </div>
                )}
                {editingPost &&
                  !imagetwoPreview &&
                  editingPost.web_thumbnail && (
                    <div className="image-preview">
                      <img
                        src={editingPost.web_thumbnail}
                        alt="Current Web Thumbnail"
                        className="preview-image"
                      />
                      <p className="preview-text">Current Image</p>
                    </div>
                  )}
              </div>
              <div className="form-actions">
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  type="button"
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="processing-spinner"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : editingPost ? (
                    "Update Article"
                  ) : (
                    "Submit Article"
                  )}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditingPost(null);
                    setImageone(null);
                    setImagetwo(null);
                    setImageonePreview("");
                    setImagetwoPreview("");
                  }}
                  disabled={isSubmitting}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Listarticle;
