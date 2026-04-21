import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

/**
 * Protects routes that require authentication.
 * If user is not logged in, redirects to /login.
 * If user is logged in but onboarding is not complete, redirects to /onboarding.
 * Otherwise renders children.
 */
const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'onboarding' | 'ready'
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('auth');
        return;
      }
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          // Auto-create user profile doc when missing
          await setDoc(
            userRef,
            {
              email: user.email || null,
              name: user.displayName || user.email?.split('@')[0] || null,
              createdAt: serverTimestamp(),
              onboardingComplete: false,
            },
            { merge: true }
          );
        }
        const data = (await getDoc(userRef)).data();
        // Only redirect to onboarding if explicitly false (not missing/undefined)
        if (data?.onboardingComplete === false) {
          setStatus('onboarding');
          return;
        }
        setStatus('ready');
      } catch (err) {
        setStatus('ready'); // allow through if Firestore fails
      }
    });
    return () => unsub();
  }, []);

  if (status === 'loading') {
    return <div className="auth-loading">Loading...</div>;
  }
  if (status === 'auth') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (status === 'onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;
