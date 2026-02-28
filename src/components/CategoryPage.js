import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/category.css";

const CategoryPage = () => {
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`, { state: { post } });
  };
  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      if (location.state?.category) {
        setCategory(location.state.category);
        setPosts(location.state.category.posts);
      } else {
        const res = await fetch("https://tnreaders.in/api/user/home-posts");
        const data = await res.json();
        if (data.homepageposts) {
          const foundCategory = data.homepageposts.find(
            cat => cat.id.toString() === categoryId
          );
          if (foundCategory) {
            const categoryPosts = (foundCategory.contentposts || [])
              .filter(post => 
                post.status === "request" && 
                post.isActive === "yes"
              )
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setCategory({
              id: foundCategory.id,
              name: foundCategory.name,
              image: foundCategory.FullImgPath,
              description: foundCategory.description
            });
            setPosts(categoryPosts);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching category data:", err);
    } finally {
      setLoading(false);
    }
  };
  const getFilteredPosts = () => {
    switch (filter) {
      case "latest":
        return [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case "popular":
        return [...posts].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      default:
        return posts;
    }
  };
  useEffect(() => {
    fetchCategoryData();
  }, [categoryId, location.state]);
  if (loading) {
    return (
      <div className="category-loading">
        <div className="loading-spinner"></div>
        <p>Loading category content...</p>
      </div>
    );
  }
  if (!category) {
    return (
      <div className="category-error">
        <h2>Category Not Found</h2>
        <p>The requested category could not be found.</p>
        <button onClick={() => navigate("/")} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }
  const filteredPosts = getFilteredPosts();
  return (
    <div className="category-pagecat">
      <div className="category-headercat">
        <button onClick={() => navigate("/")} className="back-buttoncat">
          ← Back to Dashboard
        </button>
        <div className="category-infocat">
          <div className="category-metacat">
            {category.image && (
              <img
                src={category.image || "/assets/lookit.png"}
                alt={category.name}
                className="category-imagecat"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/lookit.png";
                }}
              />
            )}
            <div className="category-detailscat">
              <h1>{category.name}</h1>
              {category.description && (
                <p className="category-descriptioncat">{category.description}</p>
              )}
              <div className="category-statscat">
                <span className="posts-countcat">
                  {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="filter-sectioncat">
        <div className="filter-buttonscat">
          <button
            className={`filter-btncat ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Posts
          </button>
          <button
            className={`filter-btncat ${filter === 'latest' ? 'active' : ''}`}
            onClick={() => setFilter('latest')}
          >
            Latest
          </button>
          <button
            className={`filter-btncat ${filter === 'popular' ? 'active' : ''}`}
            onClick={() => setFilter('popular')}
          >
            Most Popular
          </button>
        </div>
        
        <div className="sort-infocat">
          Showing {filteredPosts.length} of {posts.length} posts
        </div>
      </div>
      <div className="category-contentcat">
        {filteredPosts.length > 0 ? (
          <div className="posts-gridcat">
            {filteredPosts.map((post, index) => (
              <div
                key={post.id}
                className="post-cardcat"
                onClick={() => handlePostClick(post)}
              >
                <div className="post-image-containercat">
                  <img
                    src={post.app_thumbnail || post.web_thumbnail || "/assets/lookit.png"}
                    alt={post.title}
                    className="post-imagecat"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/lookit.png";
                    }}
                  />
                  <div className="post-overlaycat">
                    <span className="read-morecat">Read More</span>
                  </div>
                </div>
                <div className="post-contentcat">
                  <h3 className="post-titlecat">{post.title}</h3>
                  {post.description && (
                    <p className="post-excerptcat">
                      {post.description.length > 120 
                        ? `${post.description.substring(0, 120)}...` 
                        : post.description
                      }
                    </p>
                  )}
                  <div className="post-metacat">
                    <span className="post-datecat">
                      📅 {formatDate(post.created_at)}
                    </span>
                    {post.likes_count && (
                      <span className="post-likescat">
                        ❤️ {post.likes_count}
                      </span>
                    )}
                  </div>
                  {post.content_type && (
                    <div className={`content-badgecat ${post.content_type.toLowerCase()}`}>
                      {post.content_type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-postscat">
            <div className="no-posts-iconcat">📝</div>
            <h3>No Posts Available</h3>
            <p>There are no posts in this category at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;