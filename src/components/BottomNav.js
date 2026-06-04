import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonBoundingBox } from 'react-icons/bs';
import { IoNewspaperOutline } from 'react-icons/io5';
import { PiNewspaperClippingDuotone } from 'react-icons/pi';
import { CgFeed } from 'react-icons/cg';
import '../styles/BottomNav.css';
import LoggedInUser from './LoggedInUser';

const NAV_ITEMS = [
  {
    key: '/list-news',
    icon: <IoNewspaperOutline />,
    label: 'News',
    menu: 'List News',
  },
  {
    key: '/list-articles',
    icon: <PiNewspaperClippingDuotone />,
    label: 'Articles',
    menu: 'List & Edit Articles',
  },
  {
    key: '/dashboard',
    icon: <img src="/assets/lookit.webp" alt="LookIt" className="nav-logo" />,
    // label: 'LookIt',
  },
  { key: '/list-updates', icon: <CgFeed />, label: 'Updates', menu: 'Updates' },
  {
    key: 'more',
    icon: <BsPersonBoundingBox />,
    label: 'Account',
    menu: 'Updates',
  },
];

export function BottomNav({ onMoreClick, activeMenu, currentUser, onLogout }) {
  const navigate = useNavigate();
  const [showUser, setShowUser] = useState(false);

  return (
    <nav className="bottom-nav">
      {showUser && (
        <LoggedInUser currentUser={currentUser} onLogout={onLogout} />
      )}
      {NAV_ITEMS.map((item) =>
        item.key === 'more' ? (
          <button
            key="more"
            className={`bottom-nav__item ${showUser ? 'active' : ''}`}
            onClick={() => setShowUser(!showUser)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ) : (
          <button
            key={item.key}
            className={`bottom-nav__item ${activeMenu === item.menu ? 'active' : ''}`}
            onClick={() => {
              navigate(item.key);
              setShowUser(false);
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        )
      )}
      <svg
        className="nav-shape"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
      >
        <path d="M0 0 H38 A12 12 0 0 0 62 0 H100 V20 H0 Z" fill="white" />
      </svg>
    </nav>
  );
}
