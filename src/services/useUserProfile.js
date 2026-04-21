import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Hook — returns { name, firstName, gender } from Firestore user doc.
 * Used across all pages to show the user's name and personalise content.
 */
const useUserProfile = () => {
  const [profile, setProfile] = useState({ name: '', firstName: '', gender: '' });

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    getDoc(doc(db, 'users', userId)).then((snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      // Use saved name, fall back to email prefix, then Firebase displayName
      const rawName = data?.name || auth.currentUser?.displayName || '';
      const emailPrefix = (auth.currentUser?.email || '').split('@')[0];
      const name = rawName || emailPrefix;
      // Capitalise first letter
      const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
      const gender = data?.preferences?.gender || data?.gender || '';
      setProfile({
        name: cleanName,
        firstName: cleanName.trim().split(' ')[0],
        gender,
      });
    });
  }, []);

  return profile;
};

export default useUserProfile;
