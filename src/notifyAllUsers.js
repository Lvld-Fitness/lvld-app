import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const LVLD_ACCOUNT_ID = 'dKdmdsLKsTY51nFmqHjBWepZgDp2'; // Replace with your actual LVLD UID

export const notifyAllUsers = async (content) => {
  const usersSnapshot = await getDocs(collection(db, 'users'));

  for (const doc of usersSnapshot.docs) {
  const userId = doc.id;

  //if (userId === LVLD_ACCOUNT_ID) continue;

  console.log("📣 notifyAllUsers CALLED");

  await addDoc(collection(db, 'users', userId, 'notifications'), {
    message: '📢 You were mentioned in an @everyone post!',
    postContent: content,
    timestamp: serverTimestamp(),
    type: 'mention',
    read: false,
  });
}

};
