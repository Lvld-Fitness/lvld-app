// SinglePost.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { ArrowLeft } from '@phosphor-icons/react'; // 🔥

export default function SinglePost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      const snap = await getDoc(doc(db, 'posts', postId));
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() });
      }
    };
    loadPost();
  }, [postId]);

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
