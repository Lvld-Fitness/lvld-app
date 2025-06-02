import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const notifyTaggedUsers = async (content, postId, authorId) => {
  const tagMatches = content.match(/@(\w+)/g); // Match all @handles
  if (!tagMatches) return;

  const uniqueHandles = [...new Set(tagMatches.map(tag => tag.slice(1).toLowerCase()))];

  for (const handle of uniqueHandles) {
    const q = query(collection(db, "users"), where("handle", "==", `@${handle}`));
    const snap = await getDocs(q);

    for (const doc of snap.docs) {
      const userId = doc.id;
      if (userId === authorId) continue; // skip self

      await addDoc(collection(db, "users", userId, "notifications"), {
        message: `🔔 You were mentioned in a post.`,
        postId,
        timestamp: serverTimestamp(),
        type: "mention",
        read: false,
        fromUserName: "LVLD" // Or fetch author’s name if available
      });
    }
  }
};
