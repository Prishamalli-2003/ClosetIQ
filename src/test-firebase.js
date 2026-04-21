// src/test-firebase.js
import { auth, db } from './services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Test Firebase connection
console.log("Firebase Auth:", auth);
console.log("Firebase Firestore:", db);

// Test function
const testFirebase = async () => {
  try {
    console.log("Testing Firebase connection...");
    
    // Try to create a test user
    const testEmail = `test${Date.now()}@test.com`;
    const testPassword = "password123";
    
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      testEmail, 
      testPassword
    );
    
    console.log("✅ User created:", userCredential.user.uid);
    
    // Try to write to Firestore
    await setDoc(doc(db, 'test', 'test-doc'), {
      message: 'Firebase is working!',
      timestamp: new Date()
    });
    
    console.log("✅ Firestore write successful!");
    
    return true;
  } catch (error) {
    console.error("❌ Firebase error:", error.message);
    return false;
  }
};

export default testFirebase;