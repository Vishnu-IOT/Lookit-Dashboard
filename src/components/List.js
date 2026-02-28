import React, { useEffect, useState } from "react";
import "../styles/list.css";

const List = () => {
    const [mainCategories, setMainCategories] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    useEffect(() => {
        fetch("https://tnreaders.in/mobile/list-main-category")
            .then((res) => res.json())
            .then((data) => {
                const allowed = data
                    .filter((x) => x.status === "allow")
                    .sort((a, b) => a.name.localeCompare(b.name));

                setMainCategories(allowed);
                if (allowed.length > 0) setSelectedId(allowed[0].id);
            })
            .catch(console.log);
    }, []);
    useEffect(() => {
        if (!selectedId) return;

        fetch(`https://tnreaders.in/mobile/list-sub-category/${selectedId}`)
            .then((res) => res.json())
            .then((data) => {
                const allowed = data.filter((x) => x.status === "allow");
                setSubCategories(allowed);
            })
            .catch(console.log);
    }, [selectedId]);
    useEffect(() => {
        if (subCategories.length > 0) {
            loadPosts(subCategories[0].id);
        }
    }, [subCategories]);
    const loadPosts = (subcategoryId) => {
        setLoadingPosts(true);
        fetch("https://tnreaders.in/api/user/mainhomepost")
            .then((res) => res.json())
            .then((data) => {
                const trending = data.trendingposts || [];
                const homepage = Object.values(data.homepageposts || {}).flat();
                const all = [...trending, ...homepage];
                const matched = all.filter(
                    (p) => p.category?.id == subcategoryId
                );
                const sorted = matched.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setPosts(sorted);
                setLoadingPosts(false);
            })
            .catch((e) => {
                console.log("Posts API Error", e);
                setLoadingPosts(false);
            });
    };
    return (
        <div className="list-container">
            <div className="horizontal-tabs">
                {mainCategories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`h-tab ${selectedId === cat.id ? "active" : ""}`}
                        onClick={() => {
                            setSelectedId(cat.id);
                            setPosts([]);
                        }}
                    >
                        {cat.name}
                    </div>
                ))}
            </div>
            <div className="verticaltabs">
                <div className="sub-grid">
                    {subCategories.map((item) => (
                        <div
                            key={item.id}
                            className="sub-card"
                            onClick={() => loadPosts(item.id)}
                        >
                            <img
                                src={item.FullImgPath}
                                alt={item.name}
                                onError={(e) => (e.target.src = "https://via.placeholder.com/200")}
                            />
                            <p>{item.name}</p>
                        </div>
                    ))}
                </div>
                <div className="posts-section">
                    {loadingPosts && <div className="dashboard-loadingdash">Loading...
                    </div>}
                    {!loadingPosts && posts.length === 0 && (
                        <p className="no-posts">Tap a subcategory to view posts</p>
                    )}
                    {!loadingPosts &&
                        posts.map((post) => (
                            <div key={post.id} className="post-card">
                                <img
                                    src={
                                        post.web_thumbnail ||
                                        post.app_thumbnail ||
                                        post.FullImgPath
                                    }
                                    alt={post.title}
                                    onError={(e) =>
                                    (e.target.src =
                                        "https://via.placeholder.com/400x200")
                                    }
                                />
                                <div className="info">
                                    <h3>{post.title}</h3>
                                    <p>
                                        {post.description?.substring(0, 120)}...
                                    </p>
                                    <div className="meta">
                                        <span>❤️ {post.likes_count}</span>
                                        <span>💬 {post.comment_count}</span>
                                        <span>📅 {post.created_at?.slice(0, 10)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};
export default List;