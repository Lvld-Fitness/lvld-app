// SinglePost.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore'; // ✨ Added deleteDoc
import { db, auth } from './firebase';
import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { ArrowLeft } from '@phosphor-icons/react';

export default function SinglePost() {
  const { postId, notifId } = useParams(); // ✨ Now we get both postId and notifId
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      const snap = await getDoc(doc(db, 'posts', postId));
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() });

        // ✨ If notifId is present, delete the notification
        if (notifId && auth.currentUser?.uid) {
          await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', notifId));
        }
      }
    };

    loadPost();
  }, [postId, notifId]); // ✨ depend on both postId and notifId

  if (!post) return <div className="text-white p-4">Loading post...</div>;

  return (
    <div className="bg-black min-h-screen p-4 relative">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate('/profile')}
        className="text-red-400 hover:text-red-500 mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={24} />
        <span className="font-bold">Back to Profile</span>
      </button>

      {/* 📦 Full Post */}
      <PostCard post={post} currentUserId={auth.currentUser?.uid} />
    </div>
  );
}
