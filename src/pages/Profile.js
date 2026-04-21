import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { COLOR_PALETTE, STYLE_PREFERENCES, BODY_TYPES } from '../utils/constants';
import useUserProfile from '../services/useUserProfile';

const Profile = () => {
  const { firstName, gender } = useUserProfile();
  const [profile, setProfile] = useState({ name: '', email: '', gender: '', bodyType: '', comfortLevel: '', favoriteColors: [], stylePreferences: [] });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, 'users', userId)).then((snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      setProfile({
        name: d.name || '',
        email: d.email || auth.currentUser?.email || '',
        gender: d.preferences?.gender || d.gender || '',
        bodyType: d.preferences?.bodyType || '',
        comfortLevel: d.preferences?.comfortLevel || '',
        favoriteColors: d.preferences?.favoriteColors || [],
        stylePreferences: d.preferences?.stylePreferences || [],
      });
    });
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        name: profile.name,
        gender: profile.gender,
        'preferences.gender': profile.gender,
        'preferences.bodyType': profile.bodyType,
        'preferences.comfortLevel': profile.comfortLevel,
        'preferences.favoriteColors': profile.favoriteColors,
        'preferences.stylePreferences': profile.stylePreferences,
      });
      setEditing(false);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !currentPassword) { setPwMsg('Enter both current and new password.'); return; }
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPwMsg('✅ Password updated successfully!');
      setNewPassword(''); setCurrentPassword('');
    } catch (err) {
      setPwMsg('❌ ' + (err.message || 'Failed to update password'));
    }
  };

  const toggleColor = (color) => {
    setProfile(p => ({
      ...p,
      favoriteColors: p.favoriteColors.includes(color)
        ? p.favoriteColors.filter(c => c !== color)
        : [...p.favoriteColors, color]
    }));
  };

  const toggleStyle = (style) => {
    setProfile(p => ({
      ...p,
      stylePreferences: p.stylePreferences.includes(style)
        ? p.stylePreferences.filter(s => s !== style)
        : [...p.stylePreferences, style]
    }));
  };

  return (
    <div className="recommendations-page">
      <div className="form-container">
        <div className="form-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="form-title" style={{ margin: 0 }}>
                {gender === 'female' ? '👩' : gender === 'male' ? '👨' : '👤'} {firstName || 'My'} Profile
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{profile.email}</p>
            </div>
            {!editing ? (
              <button className="btn-pill btn-pill--primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-pill btn-pill--cancel" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn-pill btn-pill--primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '✅ Save'}</button>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              {editing ? (
                <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              ) : (
                <p style={{ color: 'white', margin: 0, padding: '0.75rem 0' }}>{profile.name || '—'}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              {editing ? (
                <select className="form-select" value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Non-binary / Other</option>
                </select>
              ) : (
                <p style={{ color: 'white', margin: 0, padding: '0.75rem 0', textTransform: 'capitalize' }}>{profile.gender || '—'}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Body Type</label>
              {editing ? (
                <select className="form-select" value={profile.bodyType} onChange={e => setProfile(p => ({ ...p, bodyType: e.target.value }))}>
                  <option value="">Select...</option>
                  {BODY_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              ) : (
                <p style={{ color: 'white', margin: 0, padding: '0.75rem 0', textTransform: 'capitalize' }}>{profile.bodyType || '—'}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Comfort vs Style</label>
              {editing ? (
                <select className="form-select" value={profile.comfortLevel} onChange={e => setProfile(p => ({ ...p, comfortLevel: e.target.value }))}>
                  <option value="">Select...</option>
                  <option value="comfort-first">Comfort First</option>
                  <option value="balanced">Balanced</option>
                  <option value="style-first">Style First</option>
                </select>
              ) : (
                <p style={{ color: 'white', margin: 0, padding: '0.75rem 0', textTransform: 'capitalize' }}>{profile.comfortLevel?.replace('-', ' ') || '—'}</p>
              )}
            </div>
          </div>

          {/* Favourite Colors */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">🎨 Favourite Colors</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.5rem' }}>
              {COLOR_PALETTE.map(c => (
                <button key={c.name} type="button"
                  onClick={() => editing && toggleColor(c.name)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: profile.favoriteColors.includes(c.name) ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                    backgroundColor: c.hex, cursor: editing ? 'pointer' : 'default',
                    transform: profile.favoriteColors.includes(c.name) ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s'
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Style Preferences */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">✨ Style Preferences</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {STYLE_PREFERENCES.map(s => (
                <button key={s} type="button"
                  onClick={() => editing && toggleStyle(s)}
                  className={`chip ${profile.stylePreferences.includes(s) ? 'active' : ''}`}
                  style={{ cursor: editing ? 'pointer' : 'default' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.5rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>🔒 Change Password</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" />
              </div>
            </div>
            {pwMsg && <p style={{ color: pwMsg.startsWith('✅') ? '#86efac' : '#fca5a5', fontSize: '0.9rem', margin: '0.5rem 0' }}>{pwMsg}</p>}
            <button className="form-submit" style={{ marginTop: '0.75rem' }} onClick={handlePasswordChange}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
