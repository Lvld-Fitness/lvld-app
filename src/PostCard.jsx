// PostCard.jsx
import { useEffect, useState } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { DotsThreeVertical } from 'phosphor-react';

export default function PostCard({ post }) {
  const [username, setUsername] = useState('User');
  const [profilePic, setProfilePic] = useState('/default-avatar.png');
  const [showOptions, setShowOptions] = useState(false);
  const currentUser = auth.currentUser;
  const isOwner = currentUser?.uid === post.userId;

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

  return (
    <div className="bg-gray-800 p-4 rounded mb-4 shadow relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <img src={profilePic} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-600" />
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

      <div className="text-xs text-gray-500">
        {post.timestamp?.toDate?.().toLocaleString() || 'Just now'}
      </div>
    </div>
  );
}
