import React, { useState, useEffect } from 'react';
import '../styles/navbar.css';

const Navbar = ({ isLoggedIn, currentUser, onLogout, onMenuToggle }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userData, setUserData] = useState(currentUser);

  // Load user data from localStorage on component mount
  useEffect(() => {
    if (isLoggedIn) {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
      }
    }
  }, [isLoggedIn, currentUser]);

  // Format date of birth
  const formatDOB = (dobString) => {
    if (!dobString) return 'Not provided';
    try {
      const dob = new Date(dobString);
      return dob.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dobString;
    }
  };

  // Format login time
  const formatLoginTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      const loginTime = new Date(timestamp);
      const now = new Date();
      const diffMs = now - loginTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    } catch {
      return 'Recently';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-section')) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfileDropdown]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          ☰
        </button>
        <div className="logo">
          <img alt='' className='navlogo1' src='/assets/lookit.png' />
          <a className='logoa' href='/dashboard'> LookIt </a>
        </div>
      </div>
      
      <div className="navbar-right">
        {isLoggedIn ? (
          <div className="profile-section">
            <button
              className="profile-button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <img
                src={userData?.image || '/api/placeholder/40/40'}
                alt="Profile"
                className="profile-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff';
                }}
              />
              <span className="profile-name">
                {userData?.name || 'User'}
              </span>
            </button>
            
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="user-header">
                  <img
                    src={userData?.image || 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff'}
                    alt="Profile"
                    className="dropdown-profile-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff';
                    }}
                  />
                  <div className="user-info">
                    <strong className="user-name">{userData?.name || 'User'}</strong>
                    <small className="user-email">{userData?.email || 'user@example.com'}</small>
                    <div className="user-badge">
                      <span className="badge">ID: {userData?.id || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="user-details">
                  <div className="detail-item">
                    <span className="detail-label">Mobile:</span>
                    <span className="detail-value">{userData?.mobile || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Date of Birth:</span>
                    <span className="detail-value">{formatDOB(userData?.dob)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Referral Code:</span>
                    <span className="detail-value referral-code">
                      {userData?.referal_code || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Logged in:</span>
                    <span className="detail-value login-time">
                      {formatLoginTime(userData?.loginTime)}
                    </span>
                  </div>
                </div>
                
                <div className="dropdown-actions">
                  <button 
                    className="logout-btn"
                    onClick={() => {
                      onLogout();
                      setShowProfileDropdown(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={() => window.location.reload()}>
            <span className="login-icon">🔑</span>
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;