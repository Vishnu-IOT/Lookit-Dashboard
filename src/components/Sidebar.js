import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen, onClose, activeMenu }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const navigate = useNavigate();

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  /** ✅ ONE handler for submenu clicks */
  const handleSubmenuClick = (path) => {
    navigate(path);
    onClose && onClose();
    setHoveredMenu(null);
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '/assets/dashboard.png'
    },
    {
      name: 'LookIt Categories',
      submenus: [
        { name: 'Main-Category', path: '/main-category', icon: '/assets/mainc.png' },
        { name: 'Sub-Category', path: '/sub-category', icon: '/assets/subc.png' }
      ],
      icon: '/assets/lookit.png'
    },
    {
      name: 'Lookit Articles',
      submenus: [
        { name: 'Add Article', path: '/add-article', icon: '/assets/add.png' },
        { name: 'List & Edit Articles', path: '/list-articles', icon: '/assets/list.png' }
      ],
      icon: '/assets/lookit.png'
    },
    {
      name: 'ReadersMenu Categories',
      submenus: [
        { name: 'MainCategoryRm', path: '/main-category-rm', icon: '/assets/mainc.png' }
      ],
      icon: '/assets/readersmenu.png'
    },
    {
      name: 'ReadersMenu Articles',
      submenus: [
        { name: 'AddArticlerm', path: '/add-article-rm', icon: '/assets/add.png' },
        { name: 'List and Edit Articles', path: '/list-articles-rm', icon: '/assets/list.png' }
      ],
      icon: '/assets/readersmenu.png'
    },
    {
      name: 'Astrology',
      submenus: [
        { name: 'Rasi Upload Form', path: '/rasi-upload', icon: '/assets/add.png' },
        { name: 'RasiList', path: '/rasi-list', icon: '/assets/list.png' }
      ],
      icon: '/assets/astrology.png'
    },
    {
      name: 'Updates',
      path: '/updates',
      icon: '/assets/update.png'
    },
    {
      name: 'Notification update',
      path: '/notification-update',
      icon: '/assets/notification-bell.png'
    },
    {
      name: 'Today Talks Form',
      path: '/today-talks',
      icon: '/assets/tt.png'
    },
    {
      name: 'Today Jobs Form',
      path: '/today-jobs',
      icon: '/assets/tj.png'
    },
    {
      name: 'Vegetable Price',
      path: '/vegetableprice',
      icon: '/assets/apple.png'
    },
    {
      name: 'Fuel Price',
      path: '/fuelprice',
      icon: '/assets/pump.png'
    },
    {
      name: 'Schedule',
      path: '/schedule',
      icon: '/assets/calendar.png'
    },
    {
      name: 'Notification List',
      path: '/notifications',
      icon: '/assets/calendarntn.png'
    },
    {
      name: 'Banner',
      path: '/banner',
      icon: '/assets/astrology.png'
    },
    {
      name: 'ThirumanaPorutham',
      path: '/thirumana-porutham',
      icon: '/assets/weddingday.png'
    }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <div className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>

        {/* Header */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <button className="toggle-btn" onClick={toggleSidebar}>
              <img src="/assets/left.png" alt="" className="sideicon" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="expand-section">
            <button className="expand-btn" onClick={toggleSidebar}>
              <img src="/assets/right.png" alt="" className="sideicon" />
            </button>
          </div>
        )}

        {/* FULL MENU */}
        {!isCollapsed ? (
          <ul className="sidebar-menu">
            {menuItems.map(item => (
              <li key={item.name} className="menu-item">

                {item.submenus ? (
                  <>
                    <div
                      className={`menu-title ${activeMenu === item.name ? 'active' : ''}`}
                      onClick={() => toggleSubmenu(item.name)}
                    >
                      <div className="menu-content">
                        <div className='childr'>
                          <img src={item.icon} alt="" className="sideicon" />
                          <span>{item.name}</span>
                        </div>
                        <span className="menu-arrow">
                          {openSubmenus[item.name] ? '▾' : '▸'}
                        </span>
                      </div>
                    </div>

                    {openSubmenus[item.name] && (
                      <ul className="submenu open">
                        {item.submenus.map(submenu => (
                          <li
                            key={submenu.name}
                            className={`submenu-item ${activeMenu === submenu.name ? 'active' : ''}`}
                            onClick={() => handleSubmenuClick(submenu.path)}
                          >
                            <span className="submenu-icon"> <img src={submenu.icon} alt="" className="sideicon" /> </span>
                            {submenu.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={`menu-title ${activeMenu === item.name ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="menu-content">
                      <img src={item.icon} alt="" className="sideicon" />
                      {item.name}
                    </div>
                  </NavLink>
                )}

              </li>
            ))}
          </ul>
        ) : (
          /* COLLAPSED ICON MODE */
          <div className="sidebar-icons">
            {menuItems.map(item => (
              <div
                key={item.name}
                className="icon-container"
                onMouseEnter={() => setHoveredMenu(item.name)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                {item.submenus ? (
                  <>
                    <div className="icon-item">
                      <img src={item.icon} alt="" className="sideicon" />
                    </div>

                    {hoveredMenu === item.name && (
                      <div className="submenu-popout">
                        {item.submenus.map(sub => (
                          <div
                            key={sub.name}
                            className="popout-item"
                            onClick={() => handleSubmenuClick(sub.path)}
                          >
                            {sub.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink to={item.path} className="icon-item" onClick={onClose}>
                    <img src={item.icon} alt="" className="sideicon" />
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
};

export default Sidebar;
