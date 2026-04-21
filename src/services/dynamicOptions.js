import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Get user's custom options (moods/occasions)
export const getUserCustomOptions = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { customMoods: [], customOccasions: [] };

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    return {
      customMoods: userData?.customMoods || [],
      customOccasions: userData?.customOccasions || []
    };
  } catch (error) {
    console.error('Error fetching custom options:', error);
    return { customMoods: [], customOccasions: [] };
  }
};

// Add a custom mood
export const addCustomMood = async (mood) => {
  const userId = auth.currentUser?.uid;
  if (!userId || !mood.trim()) return false;

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const currentMoods = userDoc.data().customMoods || [];
      if (!currentMoods.includes(mood.trim())) {
        await updateDoc(userDocRef, {
          customMoods: [...currentMoods, mood.trim()]
        });
      }
    } else {
      await setDoc(userDocRef, {
        customMoods: [mood.trim()]
      }, { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Error adding custom mood:', error);
    return false;
  }
};

// Add a custom occasion
export const addCustomOccasion = async (occasion) => {
  const userId = auth.currentUser?.uid;
  if (!userId || !occasion.trim()) return false;

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const currentOccasions = userDoc.data().customOccasions || [];
      if (!currentOccasions.includes(occasion.trim())) {
        await updateDoc(userDocRef, {
          customOccasions: [...currentOccasions, occasion.trim()]
        });
      }
    } else {
      await setDoc(userDocRef, {
        customOccasions: [occasion.trim()]
      }, { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Error adding custom occasion:', error);
    return false;
  }
};