import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import '../styles/dashboard.css';
import Loder from './Loder';

const MainContent = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const response = await fetch('https://tnreaders.in/api/dashboard');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
      setDashboardLoading(false);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setDashboardLoading(false);
    }
  };

  // Effect to handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      setShowScrollToTop(scrollPosition > 300);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Activity item component
  const ActivityItem = ({ activity }) => {
    const safeActivity = activity || {};
    return (
      <div className={`activity-item ${safeActivity.type || 'info'}`}>
        <div className="activity-icon">
          {safeActivity.type === 'success' && '📝'}
          {safeActivity.type === 'info' && '👤'}
          {safeActivity.type === 'warning' && '✏️'}
          {safeActivity.type === 'error' && '⚠️'}
          {!['success', 'info', 'warning', 'error'].includes(safeActivity.type) && '📝'}
        </div>
        <div className="activity-content">
          <p className="activity-action">{safeActivity.action || 'Activity'}</p>
          <p className="activity-meta">
            by {safeActivity.user || 'User'} • {safeActivity.time || 'Recently'}
          </p>
        </div>
      </div>
    );
  };

  // Top post card component
  const TopPostCard = ({ post }) => {
    const safePost = post || {};
    const title = safePost.title || 'Untitled Post';

    return (
      <div className="top-post-card">
        <div className="post-header">
          <h4>{title}</h4>
        </div>
      </div>
    );
  };

  // Bar Graph Component
  const BarGraph = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bar-graph-empty">
          <p>No category data available</p>
        </div>
      );
    }

    // Find the maximum value for scaling
    const maxValue = Math.max(...data.map(item => Number(item.post_count) || 0));
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4ecdc4', '#ff6b6b', '#f6ad55'];

    return (
      <div className="bar-graph">
        <div className="bar-graph-container">
          <div className="y-axis">
            {[...Array(5)].map((_, i) => {
              const value = Math.round((maxValue * (4 - i)) / 4);
              return (
                <div key={i} className="y-tick">
                  <span className="y-tick-label">{value}</span>
                  <div className="y-grid-line"></div>
                </div>
              );
            })}
          </div>

          <div className="bars-container">
            {data.map((item, index) => {
              const value = Number(item.post_count) || 0;
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

              return (
                <div key={item.category_id || index} className="bar-column">
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        height: `${percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    >
                      <span className="bar-value">{value}</span>
                    </div>
                  </div>
                  <div className="bar-label">
                    <span className="category-name-truncated">
                      {item.name || `Category ${index + 1}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="x-axis-label">
          <span>Categories</span>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (dashboardLoading) {
      return (
        <Loder />
      );
    }

    if (!dashboardData) {
      return (
        <div className="error">
          <h2>Error Loading Dashboard</h2>
          <p>Unable to load dashboard data</p>
          <button onClick={fetchDashboardData} className="retry-btn">Try Again</button>
        </div>
      );
    }

    const safeDashboardData = dashboardData || {};
    const recentActivities = safeDashboardData.last_three_posts?.map(post => ({
      id: post.id,
      action: `New Post: ${post.title || 'Untitled'}`,
      user: 'Author',
      time: 'Recently',
      type: 'success'
    })) || [];
    const recentPosts = safeDashboardData.last_three_posts?.map(post => ({
      id: post.id,
      title: post.title || 'Untitled Post',
      views: post.view_count || 0,
      likes: post.like_count || 0,
      category: post.category_name || 'Uncategorized'
    })) || [];
    const categoryData = safeDashboardData.category_wise_post_count || [];

    return (
      <div className="dashboard-container1">
        <div className="welcome-header">
          <div className="welcome-content">
            <h1>Welcome to LookIt Dashboard! 🎉</h1>
            <p>Here's what's happening with your content today</p>
          </div>
        </div>
        <div className="analytics-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Content Distribution by Category</h3>
              <p className="chart-subtitle">Number of posts per category</p>
            </div>
            <div className="bar-graph-wrapper">
              <BarGraph data={categoryData} />
            </div>
            {categoryData.length > 0 && (
              <div className="category-legend">
                <div className="legend-title">Categories:</div>
                <div className="legend-items">
                  {categoryData.map((item, index) => {
                    const colors = ['#667eea', '#764ba2', '#f093fb', '#4ecdc4', '#ff6b6b', '#f6ad55'];
                    return (
                      <div key={item.category_id || index} className="legend-item">
                        <span
                          className="legend-color"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></span>
                        <span className="legend-text">
                          {item.name || `Category ${index + 1}`}: {item.post_count || 0} posts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bottom-section">
          <div className="activities-card">
            <div className="card-header">
              <h3>Recent Activities</h3>
            </div>
            <div className="activities-list">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={activity.id || index} activity={activity} />
              ))}
            </div>
          </div>
          <div className="top-posts-card">
            <div className="card-header">
              <h3>Recent Posts</h3>
            </div>
            <div className="top-posts-list">
              {recentPosts.map((post, index) => (
                <TopPostCard key={post.id || index} post={post} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="main-contentmain">
      <div className="content-body">
        {renderDashboard()}
      </div>
      {showScrollToTop && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <FaArrowUp />
        </button>
      )}
    </main>
  );
};

export default MainContent;