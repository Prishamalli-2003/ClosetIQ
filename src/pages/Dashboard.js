import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { seedWardrobe } from '../utils/seedWardrobe';
import useUserProfile from '../services/useUserProfile';

const Dashboard = () => {
  const { firstName, gender } = useUserProfile();
  const [stats, setStats] = useState({ totalItems: 0, wornThisWeek: 0, utilization: 0 });
  const [notifications, setNotifications] = useState([]);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
    const snapshot = await getDocs(wardrobeRef);
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const totalItems = items.length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const wornThisWeek = items.filter(item => {
      const lastWorn = item.lastWorn;
      if (!lastWorn) return false;
      const t = typeof lastWorn?.toMillis === 'function' ? lastWorn.toMillis() : new Date(lastWorn).getTime();
      return t > weekAgo;
    }).length;
    const utilization = totalItems > 0 ? ((wornThisWeek / totalItems) * 100).toFixed(1) : 0;

    setStats({ totalItems, wornThisWeek, utilization });

    // Simple rule-based notifications
    const rarelyWorn = items.filter((item) => (item.wearCount ?? 0) <= 1);
    const heavyCategory = Object.entries(
      items.reduce((acc, item) => {
        const cat = item.category || 'other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    const notes = [];
    if (rarelyWorn.length >= 3) {
      notes.push(`👀 ${rarelyWorn.length} pieces are just chilling in your closet (0–1 wears). Give them a spin or send them to the declutter pile in Analytics.`);
    }
    if (heavyCategory && heavyCategory[1] >= 5) {
      notes.push(`🛒 Your “${heavyCategory[0]}” section is stacked. Before one more swipe, run Purchase Support to see if it’s a “don’t buy – you already own this” situation.`);
    }
    if (!notes.length && totalItems > 0) {
      notes.push('✨ Your wardrobe is working hard for you. Keep logging outfits and we’ll keep cheering your best repeats and smart buys.');
    }
    setNotifications(notes);
  };

  return (
    <div className="recommendations-page">
      <div className="form-container">
        <div className="form-card dashboard-form-card">
          <h1 className="form-title">
            {gender === 'female' ? '👩' : gender === 'male' ? '👨' : '🎉'} Hello, {firstName || 'there'}!
          </h1>
          <p className="form-subtitle">Welcome back to ClosetIQ – your smart wardrobe companion.</p>

          {notifications.length > 0 && (
            <div className="dashboard-notifications">
              <h3 className="form-label" style={{ marginBottom: '0.75rem' }}>Smart alerts</h3>
              <ul className="dashboard-notifications-list">
                {notifications.map((n, idx) => (
                  <li key={idx}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="dashboard-stats-row">
            <div className="dashboard-stat-tile">
              <h3>Total items</h3>
              <p>{stats.totalItems}</p>
            </div>
            <div className="dashboard-stat-tile">
              <h3>Worn this week</h3>
              <p>{stats.wornThisWeek}</p>
            </div>
            <div className="dashboard-stat-tile">
              <h3>Utilization</h3>
              <p>{stats.utilization}%</p>
            </div>
          </div>

          <nav className="dashboard-quick-actions">
            <Link to="/wardrobe" className="dash-action-btn">
              <span className="dash-action-icon">👗</span>
              <span>My Wardrobe</span>
            </Link>
            <Link to="/log-outfit" className="dash-action-btn">
              <span className="dash-action-icon">📝</span>
              <span>Log Today's Outfit</span>
            </Link>
            <Link to="/recommendations" className="dash-action-btn">
              <span className="dash-action-icon">✨</span>
              <span>Outfit Recommendations</span>
            </Link>
            <Link to="/purchase-support" className="dash-action-btn">
              <span className="dash-action-icon">🛍️</span>
              <span>Purchase Support</span>
            </Link>
            <Link to="/analytics" className="dash-action-btn">
              <span className="dash-action-icon">📊</span>
              <span>Analytics</span>
            </Link>
          </nav>

          {/* Seed data button — always visible */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.08)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <p style={{ color: 'white', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>🌱 Sample Wardrobe Data</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0', fontSize: '0.82rem' }}>
                Load 70 sample items to test outfit recommendations
              </p>
            </div>
            <button
              style={{ background: 'white', color: '#667eea', border: 'none', borderRadius: '10px', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              disabled={seeding}
              onClick={async () => {
                if (!window.confirm('This will REPLACE your current wardrobe with sample items. Continue?')) return;
                setSeeding(true);
                const result = await seedWardrobe();
                alert(result.message);
                setSeeding(false);
                window.location.reload();
              }}
            >
              {seeding ? '⏳ Loading...' : '🔄 Load Sample Items'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;