// src/firebase/initializeUserDoc.js
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const initializeUserDoc = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      createdAt: new Date().toISOString(),
      barcodes: [],
      // You can add more default values here later (e.g. profile info)
    });
  }
};
