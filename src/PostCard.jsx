// PostCard.jsx (Updated for Mobile Long Press)
import { useEffect, useState, useRef } from 'react';
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from './firebase';
import { DotsThreeVertical } from 'phosphor-react';
import { ThumbsUp, ThumbsDown, Barbell } from '@phosphor-icons/react'; // ✅ updated icon source
import { useNavigate } from 'react-router-dom';

export default function PostCard({ post }) {
  const [username, setUsername] = useState('User');
  const [profilePic, setProfilePic] = useState('/default-avatar.png');
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactionHeld, setReactionHeld] = useState(false);
  const currentUser = auth.currentUser;
  const isOwner = currentUser?.uid === post.userId;
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userRef = doc(db, 'users', post.userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setUsername(data.name || 'User');
        setProfilePic(data.profilePic || '/default-avatar.png');
      }
    };
    fetchUser();
  }, [post.userId]);

  const handleReport = () => {
    const subject = encodeURIComponent('LVLD Post Report');
    const body = encodeURIComponent(`This post was reported:\n\nhttps://lvld.vercel.app/post/${post.id}`);
    window.location.href = `mailto:lvldworkout@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deleteDoc(doc(db, 'posts', post.id));
    }
  };

  const handleReact = async (type) => {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', post.id);
    const current = post.reactions?.[type] || [];

    try {
      const updated = current.includes(currentUser.uid)
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid);

      await updateDoc(postRef, {
        [`reactions.${type}`]: updated,
      });
    } catch (err) {
      console.error('Reaction failed:', err);
    }

    setShowReactions(false);
  };

  const handleTouchStart = () => {
    timeoutRef.current = setTimeout(() => {
      setShowReactions(true);
      setReactionHeld(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(timeoutRef.current);
    if (!reactionHeld) handleReact('thumbsUp');
    setReactionHeld(false);
  };

  return (
    <div className="bg-gray-800 p-4 rounded mb-4 shadow relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <img
            src={profilePic}
            onClick={() => navigate(`/profile/${post.userId}`)}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-600 cursor-pointer"
          />
          <div className="text-lg font-extrabold text-white">{username}</div>
        </div>
        <button onClick={() => setShowOptions(!showOptions)} className="text-white">
          <DotsThreeVertical size={24} />
        </button>
      </div>

      {showOptions && (
        <div className="absolute right-4 top-8 bg-gray-900 border border-gray-700 rounded shadow-md z-50">
          {isOwner && (
            <>
              <button className="block w-full text-left text-sm text-blue-400 hover:bg-gray-700 px-4 py-2">
                ✏️ Edit
              </button>
              <button onClick={handleDelete} className="block w-full text-left text-sm text-red-400 hover:bg-gray-700 px-4 py-2">
                🗑️ Delete
              </button>
            </>
          )}
          <button className="block w-full text-left text-sm text-purple-400 hover:bg-gray-700 px-4 py-2">
            🔁 Repost
          </button>
          <button className="block w-full text-left text-sm text-yellow-400 hover:bg-gray-700 px-4 py-2">
            🚫 Hide
          </button>
          {!isOwner && (
            <button onClick={handleReport} className="block w-full text-left text-sm text-red-400 hover:bg-gray-700 px-4 py-2">
              🚨 Report
            </button>
          )}
        </div>
      )}

      <p className="text-white mb-2 whitespace-pre-line">{post.content}</p>

      {post.mediaUrl && post.mediaType === 'image' && (
        <img src={post.mediaUrl} alt="post" className="rounded w-full max-h-96 object-cover mb-2" />
      )}

      {post.mediaUrl && post.mediaType === 'video' && (
        <video src={post.mediaUrl} controls className="rounded w-full mb-2 max-h-96" />
      )}

      <div className="mt-2 relative w-fit">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative"
        >
          <ThumbsUp size={24} className="text-white" />
          {showReactions && (
            <div className="absolute top-[-55px] left-0 flex gap-3 bg-gray-900 p-2 rounded shadow-lg z-50">
              <ThumbsUp
                size={28}
                onClick={() => handleReact('thumbsUp')}
                className="text-white active:scale-110"
              />
              <ThumbsDown
                size={28}
                onClick={() => handleReact('thumbsDown')}
                className="text-white active:scale-110"
              />
              <Barbell
                size={28}
                onClick={() => handleReact('barbell')}
                className="text-white active:scale-110"
              />
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        {post.timestamp?.toDate?.().toLocaleString() || 'Just now'}
      </div>
    </div>
  );
}
