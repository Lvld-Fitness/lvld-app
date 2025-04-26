// SinglePost.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { ArrowLeft } from '@phosphor-icons/react';

export default function SinglePost() {
  const { postId, notifId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [postExists, setPostExists] = useState(true); // ✨

  useEffect(() => {
    const loadPost = async () => {
      const snap = await getDoc(doc(db, 'posts', postId));
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() });

        if (notifId && auth.currentUser?.uid) {
          await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', notifId));
        }
      } else {
        setPostExists(false); // ✨ Post doesn't exist
        if (notifId && auth.currentUser?.uid) {
          await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', notifId)); // still remove notif
        }
      }
    };

    loadPost();
  }, [postId, notifId]);

  if (!postExists) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-8">
        <p className="text-lg mb-4">🚫 Sorry, this post no longer exists.</p>
        <button
          onClick={() => navigate('/profile')}
          className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded text-white font-bold"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  if (!post) return <div className="text-white p-4">Loading post...</div>;

  return (
    <div className="bg-black min-h-screen p-4 relative">
      <button
        onClick={() => navigate('/profile')}
        className="text-red-400 hover:text-red-500 mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={24} />
        <span className="font-bold">Back to Profile</span>
      </button>

      <PostCard post={post} currentUserId={auth.currentUser?.uid} />
    </div>
  );
}
