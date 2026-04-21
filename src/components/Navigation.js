import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const NAV_ITEMS = [
  { to: '/dashboard',        label: 'Dashboard',        icon: '🏠' },
  { to: '/wardrobe',         label: 'Wardrobe',         icon: '👗' },
  { to: '/log-outfit',       label: 'Log Outfit',       icon: '📝' },
  { to: '/recommendations',  label: 'Outfits',          icon: '✨' },
  { to: '/purchase-support', label: 'Purchase',         icon: '🛍️' },
  { to: '/analytics',        label: 'Analytics',        icon: '📊' },
];

const Navigation = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setDrawerOpen(false);
    await signOut(auth);
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* ── Top bar (mobile: brand + hamburger | desktop: full links) ── */}
      <nav className="navbar">
        <div className="logo">ClosetIQ</div>

        {/* Desktop links */}
        <div className="nav-links nav-links--desktop">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname === item.to ? 'nav-active' : ''}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className="hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── Slide-in drawer (mobile) ── */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top">
              <span className="drawer-brand">ClosetIQ</span>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`drawer-link ${location.pathname === item.to ? 'drawer-link--active' : ''}`}
                onClick={() => setDrawerOpen(false)}
              >
                <span className="drawer-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button className="drawer-logout" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      )}

      {/* ── Bottom tab bar (mobile only) ── */}
      <div className="bottom-tabs">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-tab ${location.pathname === item.to ? 'bottom-tab--active' : ''}`}
          >
            <span className="bottom-tab-icon">{item.icon}</span>
            <span className="bottom-tab-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Navigation;
