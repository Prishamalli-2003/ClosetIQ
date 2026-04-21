import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { touchLastActive } from './services/userDataService';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import OutfitLog from './pages/OutfitLog';
import Recommendations from './pages/Recommendations';
import PurchaseSupport from './pages/PurchaseSupport';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (u) touchLastActive(); // track last active
    });
    return () => unsub();
  }, []);

  if (!authReady) {
    return <div className="app-loading">Loading ClosetIQ...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* NOTE:
           We intentionally do NOT auto-redirect authenticated users away from /register.
           During sign-up, auth state flips to "logged in" immediately, and App-level redirects
           can override Register's navigate('/onboarding'). */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/onboarding"
          element={
            user ? (
              <div className="app-with-nav">
                <Navigation />
                <main className="main-content main-content--full-bleed">
                  <Onboarding />
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="app-with-nav">
                <Navigation />
                <main className="main-content">
                  <Dashboard />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wardrobe"
          element={
            <ProtectedRoute>
              <div className="app-with-nav">
                <Navigation />
                <main className="main-content">
                  <Wardrobe />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-outfit"
          element={
            <ProtectedRoute>
              <div className="app-with-nav">
                <Navigation />
                <main className="main-content">
                  <OutfitLog />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <div className="app-with-nav">
                <Navigation />
                <main className="main-content">
                  <Recommendations />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-support"
          element={
            <ProtectedRoute>
              <div className="app-with-nav">
                <Navigation />
                <main className="main-content">
                  <PurchaseSupport />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <div className="app-with-nav">
                <Navigation />
                <main className="main-content">
                  <Analytics />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="app-with-nav">
                <Navigation />
                <main className="main-content">
                  <Profile />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
