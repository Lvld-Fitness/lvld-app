// PostCard.jsx
import { useEffect, useState, useRef } from 'react';
import { doc, getDoc, getDocs, collection, deleteDoc, updateDoc, addDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from './firebase';
import { DotsThreeVertical, ThumbsUp, Barbell, Fire, Chats, CheckCircle, } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection';







export default function PostCard({ post, showFollowOption = false, currentUserId, following = [] }) {
  const [username, setUsername] = useState('User');
  const [profilePic, setProfilePic] = useState('/default-avatar.png');
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [commentCount, setCommentCount] = useState(0);
  const optionsRef = useRef();
  const [hideInDiscovery, setHideInDiscovery] = useState(false);
  const [userTitle, setUserTitle] = useState('');
  const [showFullWorkout, setShowFullWorkout] = useState(false);
  const [linkPreview, setLinkPreview] = useState(null);



  function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline break-all"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  }
  
  useEffect(() => {
    const urlMatch = post.content?.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlMatch[0] }),
      })
        .then(res => res.json())
        .then(data => setLinkPreview(data))
        .catch(err => console.error('Preview error:', err));
    }
  }, [post.content]);
  
  
  useEffect(() => {
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, 'users', post.userId));
      if (snap.exists()) {
        const data = snap.data();
        setUsername(data.name || 'User');
        setProfilePic(data.profilePic || '/default-avatar.png');
        setUserTitle(data.selectedTitle || '');
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
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
  
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);
  

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
  
    if (currentReactions[type]?.includes(userId)) {
      await updateDoc(postRef, { [`reactions.${type}`]: arrayRemove(userId) });
    } else {
      await updateDoc(postRef, {
        ...batch,
        [`reactions.${type}`]: arrayUnion(userId)
      });
  
      // 🔥 NEW: Send notification for reaction
      const postSnap = await getDoc(doc(db, 'posts', post.id));
      const postData = postSnap.exists() ? postSnap.data() : null;
  
      if (postData?.userId && postData.userId !== userId) {
        const userSnap = await getDoc(doc(db, 'users', userId));
        const userName = userSnap.exists() ? userSnap.data().name : 'Someone';
  
        await addDoc(collection(db, 'users', postData.userId, 'notifications'), {
          type: 'reaction',
          from: userId,
          fromUserName: userName,
          postId: post.id,
          timestamp: Date.now(),
          read: false,
        });
      }
    }
  };
  
  
  
  
  const reactions = post.reactions || {};

  const getReactionCount = (type) => reactions[type]?.length || 0;
  const hasReacted = (type) => reactions[type]?.includes(currentUser?.uid);
  

if (hideInDiscovery) return null;
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
          <div className="text-lg font-extrabold text-white flex items-center gap-2">

          <>
            {username}
            {userTitle && (
              <span className="ml-1 text-yellow-400 text-sm font-semibold">{userTitle}</span>
            )}
          </>


  {showFollowOption && !following.includes(post.userId) && post.userId !== currentUserId && (
    <button
      onClick={async () => {
        const userRef = doc(db, 'users', currentUserId);
        await updateDoc(userRef, {
          following: arrayUnion(post.userId)
        });
        // Hide the post from discovery immediately
        setHideInDiscovery(true); // use local state to skip render
      }}
      title="Follow this user"
      className="text-green-400 hover:text-green-500 text-lg"
    >
      <CheckCircle size={22} weight="fill" className="text-green-400 hover:text-green-500" />
    </button>
  )}
</div>

        </div>
        <button onClick={() => setShowOptions(!showOptions)} className="text-white">
          <DotsThreeVertical size={24} />
        </button>
      </div>

      {showOptions && (
  <div
    ref={optionsRef}
    className="absolute right-4 top-10 bg-gray-900 border border-gray-700 rounded shadow-md z-50"
  >
    {currentUser?.uid === post.userId ? (
      <>
        <button
          onClick={() => {
            const newContent = prompt("Edit your post:", post.content);
            if (newContent !== null) {
              updateDoc(doc(db, 'posts', post.id), { content: newContent });
              setShowOptions(false);
            }
          }}
          className="block w-full text-left text-sm text-blue-400 hover:bg-gray-700 px-4 py-2"
        >
          Edit
        </button>
        <button
          onClick={async () => {
            await deleteDoc(doc(db, 'posts', post.id));
            setShowOptions(false);
          }}          
          className="block w-full text-left text-sm text-red-400 hover:bg-gray-700 px-4 py-2"
        >
          Delete
        </button>
      </>
    ) : (
      <>
        <button
          onClick={async () => {
            await updateDoc(doc(db, 'users', currentUser.uid), {
              hiddenPosts: arrayUnion(post.id)
            });
            setShowOptions(false);
          }}
          className="block w-full text-left text-sm text-yellow-300 hover:bg-gray-700 px-4 py-2"
        >
          Hide
        </button>
        <button
          onClick={async () => {
            window.location.href = `mailto:lvldworkout@gmail.com?subject=Reported%20Post&body=Reported%20Post%20Link:%20https://lvld.app/post/${post.id}`;
            await updateDoc(doc(db, 'users', currentUser.uid), {
              hiddenPosts: arrayUnion(post.id)
            });
            setShowOptions(false);
          }}
          className="block w-full text-left text-sm text-red-300 hover:bg-gray-700 px-4 py-2"
        >
          Report
        </button>
      </>
    )}
  </div>
)}

{/* {post.exercises?.length > 0 && (
  <div className="mb-2">
    <button
      onClick={() => setShowFullWorkout(!showFullWorkout)}
      className="text-sm text-blue-400 hover:text-blue-500 font-bold mb-1"
    >
      {showFullWorkout ? 'Hide Full Workout ▲' : 'View Full Workout ▼'}
    </button>

    {showFullWorkout && (
      <div className="bg-gray-900 p-3 rounded border border-gray-700 mt-2">
        {post.exercises.map((ex, i) => (
          <div key={i} className="mb-2">
            <p className="text-yellow-300 font-semibold">{ex.name}</p>
            <ul className="ml-4 text-sm text-gray-300">
              {ex.sets.map((set, j) => (
                <li key={j}>
                  {set.weight !== undefined
                    ? `${set.weight} lbs × ${set.reps} reps`
                    : `${set.distance || 0} mi in ${set.time || 0} min`}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}
  </div>
)}
  */}


      <p className="text-white mb-2 whitespace-pre-line">{linkify(post.content)}</p>

      {linkPreview?.title && (
        <div className="bg-gray-900 border border-gray-700 rounded p-3 mt-2">
          {linkPreview.ogImage && (
            <img
              src={linkPreview.ogImage}
              alt="preview"
              className="w-full h-48 object-cover rounded mb-2"
            />
          )}
          <a
            href={linkPreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-lg font-bold block break-all mb-1"
          >
            {linkPreview.title}
          </a>
        </div>
      )}




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
