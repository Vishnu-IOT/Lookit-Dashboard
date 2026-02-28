import React, { useState, useRef, useEffect } from "react";
import "../styles/tt.css";
import axios from "axios";

const categoryTags = {
    Insights: [
        "Surprising Facts",
        "Mind Blowing",
        "Unexpected Discoveries",
        "Curious Findings",
        "Fascinating Research",
        "Thought Provoking",
        "Eye Opening",
        "Aha Moments",
        "Hidden Patterns",
        "Revelations",
        "Breakthrough Insights",
        "Interesting Perspectives",
        "Unusual Data",
        "Mysteries Solved",
        "Behind the Scenes",
        "Little Known Facts",
        "Unexplained Phenomena",
        "Future Predictions",
        "Historical Insights",
        "Scientific Wonders",
        "Cultural Revelations",
        "Psychological Insights",
        "Behavioral Patterns",
        "Innovative Ideas",
        "Trend Analysis",
        "Unexpected Connections",
        "World Mysteries",
        "Human Nature",
        "Social Insights",
        "Extraordinary Stories",
    ],
    Technology: [
        "Artificial Intelligence",
        "Machine Learning",
        "Cloud Computing",
        "Cybersecurity",
        "Blockchain",
        "Internet of Things",
        "Software Development",
        "Hardware Innovations",
        "Mobile Technology",
        "Data Science",
        "Robotics",
        "Virtual Reality",
        "Augmented Reality",
    ],
    Business: [
        "Startups",
        "Entrepreneurship",
        "Leadership",
        "Management",
        "Finance",
        "Investment Strategies",
        "Marketing",
        "Sales",
        "Corporate Strategy",
        "Economic Trends",
        "Supply Chain",
        "Human Resources",
        "Business Ethics",
        "International Trade",
    ],
    Health: [
        "Nutrition",
        "Fitness",
        "Mental Health",
        "Preventive Care",
        "Medical Research",
        "Wellness",
        "Chronic Diseases",
        "Healthcare Policy",
        "Alternative Medicine",
        "Public Health",
        "Medical Technology",
        "Diet & Nutrition",
        "Exercise Science",
    ],
    Education: [
        "Teaching Methods",
        "E-Learning",
        "Curriculum Development",
        "Higher Education",
        "K-12 Education",
        "Educational Technology",
        "Student Success",
        "Education Policy",
        "Special Education",
        "Career Development",
        "Online Learning",
        "Educational Research",
    ],
    Stories: [
        "Personal Experiences",
        "Inspirational Stories",
        "Biographies",
        "Historical Accounts",
        "Short Stories",
        "Travel Experiences",
        "Cultural Stories",
        "Life Lessons",
        "Overcoming Challenges",
        "Human Interest",
        "Memoirs",
        "Adventure Stories",
    ],
    Updates: [
        "Breaking News",
        "Company Announcements",
        "Product Launches",
        "Policy Changes",
        "Industry Updates",
        "Regulatory News",
        "Market Updates",
        "Event Announcements",
        "Service Updates",
        "Appointments",
        "Mergers & Acquisitions",
        "Financial Results",
    ],
    Sports: [
        "Football",
        "Basketball",
        "Cricket",
        "Tennis",
        "Olympics",
        "Athlete Profiles",
        "Game Analysis",
        "Tournament Updates",
        "Team Strategies",
        "Sports Science",
        "Injury Reports",
        "Transfer News",
        "Match Previews",
        "Player Statistics",
    ],
    Entertainment: [
        "Movie Reviews",
        "Celebrity News",
        "Music Releases",
        "TV Shows",
        "Award Shows",
        "Film Festivals",
        "Book Reviews",
        "Concert Updates",
        "Cultural Events",
        "Streaming Services",
        "Gaming News",
        "Theater Productions",
    ],
};

const Todaytalksform = () => {
    const [formData, setFormData] = useState({
        category: "",
        title: "",
        summary: "",
        description: "",
        tags: [],
        status: false,
        trending: false,
        image: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filteredTags, setFilteredTags] = useState([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [resCat, setResCat] = useState()
    const fileInputRef = useRef(null);

    const toggleExpand = (postId) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(postId);
        }
    };

    const categoryApiMap = {
        Updates: "tech-updates",
        Education: "study-articles",
        Entertainment: "movienewsartcles",
        Insights: "getScientificFacts",
        Technology: "technews",
        Business: "newsarticles",
        Health: "getHealthArticles",
        Sports: "getSportsArticles",
        Stories: "getShortStories",
    };

    // Define categories and their associated tags
    const categories = [
        "Insights",
        "Technology",
        "Business",
        "Health",
        "Education",
        "Stories",
        "Updates",
        "Sports",
        "Entertainment",
    ];

    useEffect(() => {
        if (formData.category && categoryTags[formData.category]) {
            setFilteredTags(categoryTags[formData.category]);
        } else {
            setFilteredTags([]);
        }
    }, [formData.category]);


    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFormData((prev) => ({
                ...prev,
                image: file, // ✅ File object
            }));

            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            image: null,
        }));
        setPreviewImage(null);
        fileInputRef.current.value = "";
    };

    const handleCategorySelect = (category) => {
        setShowCategoryModal(false);
        fetchPosts(category);
    };

    const [wordCount, setWordCount] = useState({
        summary: 0,
        description: 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "summary" || name === "description") {
            const words = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;
            setWordCount((prev) => ({
                ...prev,
                [name]: words,
            }));
        }
    };

    const fetchPosts = async (category) => {
        try {
            setIsLoading(true);

            const apiCategory = categoryApiMap[category];

            if (!apiCategory) {
                throw new Error("Invalid category selected");
            }

            const response = await axios.get(
                `https://jobs.mpdatahub.com/api/${apiCategory}`
            );

            setResCat(response.data.category)


            setPosts(response.data.data);
            setSelectedCategory(category); // keep original category for UI
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching posts:", error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    const handleTagSelect = (tag) => {
        setFormData((prev) => {
            const currentTags = Array.isArray(prev.tags) ? prev.tags : [];

            if (currentTags.includes(tag)) {
                return {
                    ...prev,
                    tags: currentTags.filter((t) => t !== tag),
                };
            } else {
                return {
                    ...prev,
                    tags: [...currentTags, tag],
                };
            }
        });
    };


    const toggleStatus = () => {
        setFormData((prev) => ({
            ...prev,
            status: !prev.status,
        }));
    };

    const toggleTrending = () => {
        setFormData((prev) => ({
            ...prev,
            trending: !prev.trending,
        }));
    };

    const resetForm = () => {
        setFormData({
            category: "",
            title: "",
            summary: "",
            description: "",
            tags: [],
            status: false,
            trending: false,
            image: null,
        });
        setPreviewImage(null);
        setEditingId(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = new FormData();

            payload.append("category", formData.category);
            payload.append("title", formData.title);
            payload.append("summary", formData.summary);
            payload.append("description", formData.description);
            payload.append(
                "tags",
                JSON.stringify(Array.isArray(formData.tags) ? formData.tags : [])
            );
            payload.append("status", formData.status ? 1 : 0);
            payload.append("trending", formData.trending ? 1 : 0);

            // ✅ Send image ONLY if exists
            if (formData.image) {
                payload.append("image", formData.image);
            }

            const url = editingId
                ? `https://jobs.mpdatahub.com/api/talksupdate/${editingId}`
                : `https://jobs.mpdatahub.com/api/talksstore`;

            await axios.post(url, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert(editingId ? "Content updated!" : "Content created!");
            resetForm();
            fetchPosts(selectedCategory);

        } catch (error) {
            console.error("Submit failed:", error);
            alert(error.response?.data?.message || "Submission failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (post) => {
        setShowModal(false);
        setEditingId(post.id || post._id);

        let normalizedTags = [];

        if (Array.isArray(post.tags)) {
            normalizedTags = post.tags;
        } else if (typeof post.tags === "string") {
            try {
                normalizedTags = JSON.parse(post.tags);
            } catch {
                normalizedTags = [];
            }
        }

        setFormData({
            category: post.category || selectedCategory,
            title: post.title || "",
            summary: post.summary || "",
            description: post.description || "",
            tags: normalizedTags, // ✅ ALWAYS ARRAY
            status: Boolean(post.status),
            trending: Boolean(post.trending),
            image: null, // IMPORTANT
            imageUrl: post.imageUrl || null,
        });

        setPreviewImage(post.imageUrl || null);
    };

    const handleDelete = async (postId, category) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            setIsLoading(true);

            if (!category) {
                throw new Error("Invalid category selected");
            }

            await axios.get(
                `https://jobs.mpdatahub.com/api/talksdelete/${postId}?category=${category}`,
            );

            alert("Post deleted successfully!");
            fetchPosts(selectedCategory);
        } catch (error) {
            console.error("Error deleting post:", error);
            alert(error.response?.data?.message || "Delete failed");
        } finally {
            setIsLoading(false);
        }
    };


    const handleStatusToggle = async (postId, newStatus) => {
        try {
            setIsLoading(true);
            await axios.patch(
                `https://api.todaytalks.in/api/contents/toggle-status/${postId}`,
                { status: newStatus }
            );
            setPosts(
                posts.map((post) =>
                    post._id === postId ? { ...post, status: newStatus } : post
                )
            );
        } catch (error) {
            console.error("Error updating status:", error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrendingToggle = async (postId, newTrending) => {
        try {
            setIsLoading(true);
            await axios.patch(
                `https://api.todaytalks.in/api/contents/toggle-trending/${postId}`,
                { trending: newTrending }
            );
            setPosts(
                posts.map((post) =>
                    post._id === postId ? { ...post, trending: newTrending } : post
                )
            );
        } catch (error) {
            console.error("Error updating trending:", error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            {isLoading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}

            <h2>{editingId ? "Edit Content" : "Today Talks Form"}</h2>

            {/* List Posts Button */}
            <div className="list-posts-container">
                <button
                    type="button"
                    className="list-posts-btn"
                    onClick={() => setShowCategoryModal(true)}
                >
                    List Posts
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Category Select */}
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    // disabled={!!editingId}
                    >
                        <option value="">Select a category</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tags Selection - Now a dropdown based on category */}
                <div className="form-group">
                    <label>Tags</label>
                    <div className="tags-dropdown-container">
                        <button
                            type="button"
                            className="tags-dropdown-toggle"
                            onClick={() => setShowTagDropdown(!showTagDropdown)}
                            disabled={!formData.category}
                        >
                            Select Tags{" "}
                            {formData.tags.length > 0
                                ? `(${formData.tags.length} selected)`
                                : ""}
                        </button>

                        {showTagDropdown && formData.category && (
                            <div className="tags-dropdown">
                                {filteredTags.length > 0 ? (
                                    filteredTags.map((tag, index) => (
                                        <div key={index} className="tag-dropdown-item">
                                            <input
                                                type="checkbox"
                                                id={`tag-${index}`}
                                                checked={formData.tags.includes(tag)}
                                                onChange={() => handleTagSelect(tag)}
                                            />
                                            <label htmlFor={`tag-${index}`}>{tag}</label>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-tags-message">
                                        No tags available for this category
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Show selected tags */}
                        {formData.tags.length > 0 && (
                            <div className="selected-tags">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="selected-tag">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleTagSelect(tag)}
                                            className="remove-tag-btn"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {!formData.category && (
                            <div className="tags-message">Please select a category first</div>
                        )}
                    </div>
                </div>

                {/* Title Input */}
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter title"
                    />
                </div>

                {/* Summary Textarea */}
                <div className="form-group">
                    <label htmlFor="summary">Summary (max 150 words)</label>
                    <textarea
                        id="summary"
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        required
                        maxLength={1000}
                        placeholder="Brief summary (150 words max)"
                    />
                    <div className="word-count">{wordCount.summary}/150 words</div>
                </div>

                {/* Description Textarea */}
                <div className="form-group">
                    <label htmlFor="description">Description (max 1000 words)</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        maxLength={7000}
                        placeholder="Detailed description (1000 words max)"
                    />
                    <div className="word-count">{wordCount.description}/1000 words</div>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                    <label htmlFor="image">Image</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                    {previewImage && (
                        <div className="image-preview">
                            <img src={previewImage} alt="Preview" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="remove-image-btn"
                            >
                                Remove Image
                            </button>
                        </div>
                    )}
                    {editingId && formData.imageUrl && !previewImage && (
                        <div className="image-preview">
                            <img src={formData.imageUrl} alt="Current" />
                            <p className="image-note">
                                Current image (upload new to replace)
                            </p>
                        </div>
                    )}
                </div>

                {/* Status and Trending Toggles */}
                <div className="toggle-group">
                    <div className="toggle-item">
                        <label>Status</label>
                        <div
                            className={`toggle-switch ${formData.status ? "active" : ""}`}
                            onClick={toggleStatus}
                        >
                            <div className="toggle-knob1"></div>
                        </div>
                        <span>{formData.status ? "Active" : "Inactive"}</span>
                    </div>

                    <div className="toggle-item">
                        <label>Trending</label>
                        <div
                            className={`toggle-switch ${formData.trending ? "active" : ""}`}
                            onClick={toggleTrending}
                        >
                            <div className="toggle-knob1"></div>
                        </div>
                        <span>{formData.trending ? "Yes" : "No"}</span>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? "Processing..." : editingId ? "Update" : "Submit"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={resetForm}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Category Selection Modal */}
            {showCategoryModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="close-modal"
                            onClick={() => setShowCategoryModal(false)}
                        >
                            ×
                        </button>
                        <h3>Select a Category</h3>
                        <div className="categories-list">
                            {categories.map((category) => (
                                <div
                                    key={category}
                                    className="category-item"
                                    onClick={() => handleCategorySelect(category)}
                                >
                                    {category}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Posts List Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content posts-modal">
                        <div className="modal-header">
                            <h3>Posts in {selectedCategory}</h3>
                            <button
                                className="close-modal"
                                onClick={() => setShowModal(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>

                        <div className="posts-list">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <div key={post._id} className="post-item">
                                        <div className="post-header">
                                            <h4 onClick={() => toggleExpand(post._id)}>
                                                {post.title}
                                                <span className="expand-icon">
                                                    {expandedPostId === post._id ? "▼" : "▶"}
                                                </span>
                                            </h4>

                                            <div className="post-actions">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(post)}
                                                    aria-label={`Edit ${post.title}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(post.id, resCat)}
                                                    aria-label={`Delete ${post.title}`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            className={`post-details ${expandedPostId === post._id ? "expanded" : "collapsed"
                                                }`}
                                        >
                                            <p className="post-summary">{post.summary}</p>
                                            <p className="post-description">{post.description}</p>
                                            <p className="post-description">{post.tags}</p>
                                            {post.imageUrl && (
                                                <div className="post-image-container">
                                                    <img
                                                        src={post.imageUrl}
                                                        alt={post.title}
                                                        className="post-image"
                                                    />
                                                </div>
                                            )}

                                            {Array.isArray(post.tags) && post.tags.length > 0 && (
                                                <div className="post-tags">
                                                    {post.tags.map((tag, i) => (
                                                        <span key={i} className="tag">{tag}</span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="toggle-actions">
                                                <div className="toggle-group">
                                                    <span>Status:</span>
                                                    <div
                                                        className={`toggle-switch ${post.status ? "active" : ""
                                                            }`}
                                                        onClick={() =>
                                                            handleStatusToggle(post._id, !post.status)
                                                        }
                                                        aria-label={`Toggle status for ${post.title}`}
                                                    >
                                                        <div className="toggle-knob"></div>
                                                    </div>
                                                    <span className="toggle-label">
                                                        {post.status ? "Active" : "Inactive"}
                                                    </span>
                                                </div>

                                                <div className="toggle-group">
                                                    <span>Trending:</span>
                                                    <div
                                                        className={`toggle-switch ${post.trending ? "active" : ""
                                                            }`}
                                                        onClick={() =>
                                                            handleTrendingToggle(post._id, !post.trending)
                                                        }
                                                        aria-label={`Toggle trending for ${post.title}`}
                                                    >
                                                        <div className="toggle-knob"></div>
                                                    </div>
                                                    <span className="toggle-label">
                                                        {post.trending ? "Yes" : "No"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-posts">No posts found in this category.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Todaytalksform;
