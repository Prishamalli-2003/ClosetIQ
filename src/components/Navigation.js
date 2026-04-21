import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import useUserProfile from '../services/useUserProfile';

const NAV_ITEMS = [
  { to: '/dashboard',        label: 'Dashboard',  icon: '🏠' },
  { to: '/wardrobe',         label: 'Wardrobe',   icon: '👗' },
  { to: '/log-outfit',       label: 'Log Outfit', icon: '📝' },
  { to: '/recommendations',  label: 'Outfits',    icon: '✨' },
  { to: '/purchase-support', label: 'Purchase',   icon: '🛍️' },
  { to: '/analytics',        label: 'Analytics',  icon: '📊' },
];

const Navigation = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { firstName } = useUserProfile();

  const handleLogout = async () => {
    setDrawerOpen(false);
    await signOut(auth);
    navigate('/login', { replace: true });
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">ClosetIQ {firstName ? <span style={{ fontSize: '0.85rem', opacity: 0.85, fontWeight: 400 }}>· {firstName}</span> : ''}</div>

        <div className="nav-links nav-links--desktop">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to}
              className={location.pathname === item.to ? 'nav-active' : ''}>
              {item.icon} {item.label}
            </Link>
          ))}
          <button onClick={handleLogout}>Logout</button>
        </div>

        <button className="hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </nav>

      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top">
              <div>
                <span className="drawer-brand">ClosetIQ</span>
                {firstName && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>Hi, {firstName}!</p>}
              </div>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to}
                className={`drawer-link ${location.pathname === item.to ? 'drawer-link--active' : ''}`}
                onClick={() => setDrawerOpen(false)}>
                <span className="drawer-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button className="drawer-logout" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      )}

      <div className="bottom-tabs">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <Link key={item.to} to={item.to}
            className={`bottom-tab ${location.pathname === item.to ? 'bottom-tab--active' : ''}`}>
            <span className="bottom-tab-icon">{item.icon}</span>
            <span className="bottom-tab-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Navigation;
