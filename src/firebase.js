// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGF4yUUMuDaqT19P3OV4dYdh4gTP5AnAY",
  authDomain: "lvld-b0d41.firebaseapp.com",
  projectId: "lvld-b0d41",
  storageBucket: "lvld-b0d41.firebasestorage.app", // ✅ correct bucket
  messagingSenderId: "683063656449",
  appId: "1:683063656449:web:7c955960ebcf0de0f2c000"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// ✅ force correct bucket for uploads
const storage = getStorage(app, 'gs://lvld-b0d41.firebasestorage.app');

export { auth, db, storage };
