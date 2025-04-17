// PostCard.jsx
import { useEffect, useState } from 'react';
import { doc, getDoc, getDocs, collection, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from './firebase';
import { DotsThreeVertical, ThumbsUp, Barbell, Fire, Chats } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection';



export default function PostCard({ post }) {
  const [username, setUsername] = useState('User');
  const [profilePic, setProfilePic] = useState('/default-avatar.png');
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [commentCount, setCommentCount] = useState(0);


  useEffect(() => {
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, 'users', post.userId));
      if (snap.exists()) {
        const data = snap.data();
        setUsername(data.name || 'User');
        setProfilePic(data.profilePic || '/default-avatar.png');
      }
    };
    fetchUser();
  }, [post.userId]);

  useEffect(() => {
    const fetchCommentCount = async () => {
      const q = collection(db, 'posts', post.id, 'comments');
      const snap = await getDocs(q);
      setCommentCount(snap.size);
    };
  
    fetchCommentCount();
  }, [post.id]);
  

  const handleReact = async (type) => {
    if (!currentUser) return;
  
    const postRef = doc(db, 'posts', post.id);
    const userId = currentUser.uid;
    const currentReactions = post.reactions || {};
  
    const batch = {
      [`reactions.thumbsUp`]: arrayRemove(userId),
      [`reactions.fire`]: arrayRemove(userId),
      [`reactions.barbell`]: arrayRemove(userId),
    };
  
    // If already reacted with this type, just remove it (toggle off)
    if (currentReactions[type]?.includes(userId)) {
      await updateDoc(postRef, { [ `reactions.${type}` ]: arrayRemove(userId) });
    } else {
      // Remove from all, then add the selected
      await updateDoc(postRef, {
        ...batch,
        [`reactions.${type}`]: arrayUnion(userId)
      });
    }
  };
  

  const getReactionCount = (type) => post.reactions?.[type]?.length || 0;
  const hasReacted = (type) => post.reactions?.[type]?.includes(currentUser?.uid);

  return (
    <div className="bg-gray-800 p-4 rounded mb-4 shadow relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <img
            src={profilePic}
            alt="avatar"
            onClick={() => navigate(`/profile/${post.userId}`)}
            className="w-10 h-10 rounded-full object-cover border border-gray-600 cursor-pointer"
          />
          <div className="text-lg font-extrabold text-white">{username}</div>
        </div>
        <button onClick={() => setShowOptions(!showOptions)} className="text-white">
          <DotsThreeVertical size={24} />
        </button>
      </div>

      {showOptions && (
        <div className="absolute right-4 top-10 bg-gray-900 border border-gray-700 rounded shadow-md z-50">
          <button onClick={() => updateDoc(doc(db, 'posts', post.id), { deleted: true })} className="block w-full text-left text-sm text-red-400 hover:bg-gray-700 px-4 py-2">
            🗑️ Delete
          </button>
        </div>
      )}

      <p className="text-white mb-2 whitespace-pre-line">{post.content}</p>

      {post.mediaUrl && post.mediaType === 'image' && (
        <img src={post.mediaUrl} alt="post" className="rounded w-full max-h-96 object-cover mb-2" />
      )}
      {post.mediaUrl && post.mediaType === 'video' && (
        <video src={post.mediaUrl} controls className="rounded w-full mb-2 max-h-96" />
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-4 text-sm text-gray-300">
          <button onClick={() => handleReact('thumbsUp')}>
            <ThumbsUp size={25} className={hasReacted('thumbsUp') ? 'text-blue-500' : 'text-white'} />
            <span className="text-xs">{getReactionCount('thumbsUp')}</span>
          </button>
          <button onClick={() => handleReact('barbell')}>
            <Barbell size={25} className={hasReacted('barbell') ? 'text-yellow-400' : 'text-white'} />
            <span className="text-xs">{getReactionCount('barbell')}</span>
          </button>
          <button onClick={() => handleReact('fire')}>
            <Fire size={25} className={hasReacted('fire') ? 'text-red-500' : 'text-white'} />
            <span className="text-xs">{getReactionCount('fire')}</span>
          </button>
        </div>
        <button onClick={() => setShowComments(!showComments)} className="text-white hover:text-blue-400">
          <Chats size={30} />
          {commentCount > 0 && <span className="text-sm ml-1">{commentCount}</span>}
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}
