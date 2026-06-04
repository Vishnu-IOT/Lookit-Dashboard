import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MainContent from './components/MainContent';
import AuthModal from './components/AuthModal';
import SubCategory from './components/SubCategory';
import AddArticle from './components/AddArticle';
import Listarticle from './components/Listarticle';
import List from './components/List';
import NotificationList from './components/NotificationList';
import ScheduleForm from './components/ScheduleForm';
import Form from './CalendarList/duration';
import Banner from './CalendarList/Banner';
import AddArticleRm from './components/AddArticleRm';
import ListarticleRm from './components/ListarticleRm';
import MainCategoryRm from './components/MainCategoryRm';
import SubCategoryRm from './components/SubCategoryRm';
import RasiAllList from './components/RasiAllList';
import Updates from './components/Updates';
import Notiupdate from './components/Notiupdate';
import ScrollToTopButton from './components/ScrollToTopButton';
import ScrollToo from './components/ScrollToo';
import MainCategory from './components/MainCategory';
import Todaytalksform from './components/Todaytalksform';
import Todayjobsform from './components/Todayjobsform';
import VegetablePriceList from './components/VegetablePriceList';
import FuelRates from './components/FuelRates';
import Thirumanam from './components/Thirumanam';
import AddNews from './components/AddNews';
import Listnews from './components/Listnews';
import { BottomNav } from './components/BottomNav';
import UpdatePostForm from './components/UpdatePostForm';
import UpdatePostList from './components/UpdatePostList';
import PollForm from './components/PollForm';
import PollList from './components/PollList';

// Dashboard Layout Component
const DashboardLayout = ({
  isLoggedIn,
  currentUser,
  onLogout,
  onMenuToggle,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const getActiveMenuFromPath = () => {
    const path = location.pathname.replace('/', '');
    const pathToMenuMap = {
      dashboard: 'Dashboard',
      'main-category': 'Main-Category',
      'sub-category': 'sub-Category',
      'main-category-rm': 'MainCategoryRm',
      'sub-category-rm': 'subCategoryRm',
      'add-article': 'Add Article',
      'list-articles': 'List & Edit Articles',
      'add-news': 'Add News',
      'list-news': 'List News',
      'add-article-rm': 'AddArticlerm',
      'list-articles-rm': 'List and Edit Articles',
      'rasi-upload': 'Rasi Upload Form',
      'rasi-list': 'RasiList',
      updates: 'Updates',
      'add-updates': 'Add Updates',
      'list-updates': 'List & Edit Updates',
      'notification-update': 'Notification update',
      notifications: 'Notifications',
      schedule: 'Schedule',
      banner: 'Banner',
      list: 'List',
      article: 'Article',
    };
    return pathToMenuMap[path] || 'Dashboard';
  };

  const [showMore, setShowMore] = useState(false);

  const activeMenu = getActiveMenuFromPath();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add scroll to top effect for dashboard routes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <ScrollToo /> {/* Add this line */}
      <Navbar
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogout={onLogout}
        onMenuToggle={toggleSidebar}
      />
      <div className="dashboard-container">
        <Sidebar
          activeMenu={activeMenu}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="main-content">
          <Routes>
            <Route path="dashboard" element={<MainContent />} />
            <Route path="main-category" element={<MainCategory />} />
            <Route
              path="sub-category/:mainCategoryId"
              element={<SubCategory />}
            />
            <Route path="main-category-rm" element={<MainCategoryRm />} />
            <Route path="sub-category-rm" element={<SubCategoryRm />} />
            <Route path="add-article" element={<AddArticle />} />
            <Route path="list-articles" element={<Listarticle />} />
            <Route path="add-news" element={<AddNews />} />
            <Route path="list-news" element={<Listnews />} />
            <Route path="add-article-rm" element={<AddArticleRm />} />
            <Route path="list-articles-rm" element={<ListarticleRm />} />
            <Route path="poll-form" element={<PollForm />} />
            <Route path="poll-list" element={<PollList />} />
            <Route path="rasi-upload" element={<Form />} />
            <Route path="today-talks" element={<Todaytalksform />} />
            <Route path="today-jobs" element={<Todayjobsform />} />
            <Route path="rasi-list" element={<RasiAllList />} />
            <Route path="updates" element={<Updates />} />
            <Route path="add-updates" element={<UpdatePostForm />} />
            <Route path="list-updates" element={<UpdatePostList />} />
            <Route path="notification-update" element={<Notiupdate />} />
            <Route path="notifications" element={<NotificationList />} />
            <Route path="schedule" element={<ScheduleForm />} />
            <Route path="banner" element={<Banner />} />
            <Route path="vegetableprice" element={<VegetablePriceList />} />
            <Route path="fuelprice" element={<FuelRates />} />
            <Route path="list" element={<List />} />
            <Route path="thirumana-porutham" element={<Thirumanam />} />
            <Route path="article" element={<h2>Article Management</h2>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
      <ScrollToTopButton /> {/* Add this line for the floating button */}
      <BottomNav
        onMoreClick={() => setShowMore((s) => !s)}
        activeMenu={activeMenu}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      {/* Mobile More Menu */}
      {/* {showMore && (
        <>
          <div
            style={{
              position: 'fixed',
              bottom: '64px',
              left: 0,
              right: 0,
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              zIndex: '200',
              padding: '0.75rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: '0.5rem',
            }}
          >
            {MORE_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  window.location.hash = item.key;
                  setShowMore(false);
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background:
                    activeMenu === item.key
                      ? 'var(--primary-light)'
                      : 'var(--bg-hover)',
                  color:
                    activeMenu === item.key
                      ? 'var(--primary)'
                      : 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 'calc(200 - 1)',
            }}
            onClick={() => setShowMore(false)}
          />
        </>
      )} */}
    </>
  );
};

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Function to check if token is expired
  const checkTokenExpiry = (userData) => {
    if (!userData || !userData.loginTime) return false;

    const currentTime = Date.now();
    const hoursSinceLogin =
      (currentTime - userData.loginTime) / (1000 * 60 * 60);

    // Logout after 24 hours
    if (hoursSinceLogin > 24) {
      return false;
    }

    return true;
  };

  // Auto logout function
  const autoLogout = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (!checkTokenExpiry(user)) {
          handleLogout();
        }
      } catch (error) {
        console.error('Error checking login time:', error);
        handleLogout();
      }
    }
  };

  // Check for existing login on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedLogin = localStorage.getItem('isLoggedIn');

    if (storedUser && storedLogin === 'true') {
      try {
        const user = JSON.parse(storedUser);

        // Check if token is still valid
        if (checkTokenExpiry(user)) {
          setCurrentUser(user);
          setIsLoggedIn(true);
          setShowAuthModal(false);
        } else {
          // Token expired, logout
          localStorage.removeItem('currentUser');
          localStorage.removeItem('isLoggedIn');
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        setShowAuthModal(true);
      }
    } else {
      setShowAuthModal(true);
    }
  }, []);

  // Set up auto-logout interval
  useEffect(() => {
    // Run autoLogout immediately to check current session
    autoLogout();

    // Check every hour
    const interval = setInterval(autoLogout, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // When user logs in
  const handleLogin = (userData) => {
    const userWithTime = {
      ...userData,
      loginTime: Date.now(),
    };

    setIsLoggedIn(true);
    setCurrentUser(userWithTime);
    setShowAuthModal(false);

    // Store in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userWithTime));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowAuthModal(true);

    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <div className="App">
        {isLoggedIn ? (
          <Routes>
            <Route
              path="/*"
              element={
                <DashboardLayout
                  isLoggedIn={isLoggedIn}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
          </Routes>
        ) : (
          showAuthModal && (
            <AuthModal
              onClose={() => setShowAuthModal(false)}
              onLogin={handleLogin}
            />
          )
        )}
      </div>
    </Router>
  );
}

export default App;
