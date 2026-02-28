import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [posts, setPosts] = useState({
    trending: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all posts from the API
  const fetchPosts = async () => {
    try {
      const res = await fetch("https://tnreaders.in/api/user/home-posts");
      const data = await res.json();
      // Process the data according to requirements
      const processedData = processApiData(data);
      setPosts(processedData);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Process API data to organize by trending, categories, date, etc.
  const processApiData = (apiData) => {
    const result = {
      trending: [],
      categories: []
    };

    // 1. Get trending posts (istrending = 1 and status = "request")
    if (apiData.trendingposts) {
      result.trending = apiData.trendingposts
        .filter(post =>
          post.istrending === 1 &&
          post.status === "request" &&
          post.isActive === "yes"
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6)
    }

    // 2. Process homepage categories
    if (apiData.homepageposts) {
      result.categories = apiData.homepageposts.map(category => ({
        id: category.id,
        parent_id: category.parent_id,
        name: category.name,
        status: category.status,
        image: category.FullImgPath,
        posts: (category.contentposts || [])
          .filter(post =>
            post.status === "request" &&
            post.isActive === "yes"
          )
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3)
      })).filter(category => category.posts.length > 0);
    }

    return result;
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle post click - navigate to detail page
  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`, { state: { post } });
  };

  // Handle view all for categories
  const handleViewAll = (category) => {
    navigate(`/category/${category.id}`, {
      state: {
        category: {
          ...category,
          posts: category.posts
        }
      }
    });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Limit text to specific characters
  const limitText = (text, max = 50) => {
    if (!text) return "";
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const totalPosts = posts.trending.length + posts.categories.reduce((sum, cat) => sum + cat.posts.length, 0);
  const totalCategories = posts.categories.length;

  if (loading) {
    return (
      <div className="dashboard-loadingdash">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="professional-dashboarddash">
      {/* Main Dashboard Grid */}
      <div className="dashboard-maindash">
        {/* Trending Posts Section */}
        {posts.trending.length > 0 && (
          <div className="section-carddash trending-sectiondash">
            <div className="section-headerdash">
              <div className="section-titledash">
                <span className="title-icondash">🔥</span>
                <h2>Trending Content</h2>
              </div>
            </div>
            <div className="trending-griddash">
              {posts.trending.map((post, index) => (
                <div
                  key={`trending-${post.id}`}
                  className="trending-carddash"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="card-imagedash">
                    <img
                      src={post.app_thumbnail || post.web_thumbnail || "/assets/lookit.png"}
                      alt={post.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/lookit.png";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        <div className="stats-sectiondash">
          <div className="stats-griddash">
            <div className="stat-carddash">
              <div className="stat-icondash totaldash">
                <img className="icon-postdash" src="/svg/post.svg" alt="" />
              </div>
              <div className="stat-infodash">
                <h3>{totalPosts}</h3>
                <p>Total Posts</p>
              </div>
            </div>

            <div className="stat-carddash">
              <div className="stat-icondash trendingdash">
                <img className="icon-postdash" src="/svg/trend.svg" alt="" />
              </div>
              <div className="stat-infodash">
                <h3>{posts.trending.length}</h3>
                <p>Trending Posts</p>
              </div>
            </div>

            <div className="stat-carddash">
              <div className="stat-icondash categoriesdash">
                <img className="icon-postdash" src="/svg/category.svg" alt="" />
              </div>
              <div className="stat-infodash">
                <h3>{totalCategories}</h3>
                <p>Active Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="categories-griddash">
          {posts.categories.map(category => (
            <div key={`category-${category.id}`} className="section-carddash category-sectiondash">
              <div className="section-headerdash">
                <div className="category-infodash">
                  {category.image && (
                    <img
                      src={category.image || "/assets/lookit.png"}
                      alt={category.name}
                      className="category-avatardash"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/lookit.png";
                      }}
                    />
                  )}
                  <div className="category-infodash1">
                    <h3>{category.name}</h3>
                  </div>
                </div>
              </div>

              <div className="category-postsdash">
                {category.posts.map((post) => (
                  <div
                    key={`${category.id}-${post.id}`}
                    className="post-carddash"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="post-imagedash">
                      <img
                        src={post.app_thumbnail || post.web_thumbnail || "/assets/lookit.png"}
                        alt={post.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/lookit.png";
                        }}
                      />
                    </div>
                    <div className="post-contentdash">
                      <h4 className="post-titledash">{limitText(post.title, 35)}</h4>
                      <div className="post-footerdash">
                        <span className="datedash">{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {totalPosts === 0 && (
          <div className="empty-statedash">
            <div className="empty-icondash">📝</div>
            <h3>No Content Available</h3>
            <p>There's no content to display at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;