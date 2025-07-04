// PostCard.jsx
import { useEffect, useState, useRef, React } from 'react';
import { doc, getDoc, getDocs, collection, deleteDoc, updateDoc, addDoc, arrayUnion, arrayRemove, setDoc, increment } from 'firebase/firestore';
import { db, auth } from './firebase';
import { DotsThreeVertical, ThumbsUp, Barbell, Fire, Chats, CheckCircle, UserPlus, UserCirclePlus, ShareNetwork, ArrowsOut, ArrowsIn } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection';
import RankIcon from "./RankIcon";
import TitleModal from "./TitleModal";






const checkMentionsAndNotify = async (content, postId, senderName) => {
  const mentioned = Array.from(content.matchAll(/@(\w+)/g)).map(m => m[1]);

  if (mentioned.length === 0) return;

  const usersSnap = await getDocs(collection(db, 'users'));

  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();
    const uid = docSnap.id;

    if (mentioned.includes(data.handle)) {
      await addDoc(collection(db, 'users', uid, 'notifications'), {
        type: 'mention',
        fromUserName: senderName,
        postId,
        message: `💬 ${senderName} mentioned you in a post!`,
        timestamp: Date.now(),
        read: false,
      });
    }
  }
};

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
  const [linkPreview, setLinkPreview] = useState(null);
  const [rank, setRank] = useState('bronze_1');
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  const hasShared = (type) => reactions[type]?.includes(currentUser?.uid);
  const [workoutExpanded, setWorkoutExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const [hasReposted, setHasReposted] = useState(false);




  

const handleRepost = async () => {
  try {
    if (!auth.currentUser) return;
    const repostRef = doc(db, 'posts', post.id + '_repost_' + auth.currentUser.uid);
    const repostSnap = await getDoc(repostRef);

    if (repostSnap.exists()) {
      // 🔁 Undo repost
      await deleteDoc(repostRef);
      const originalId = post.repostedPostId || post.id;
      await updateDoc(doc(db, 'posts', originalId), {
        repostCount: increment(-1),
      });
      setRepostCount((prev) => prev - 1);
      setHasReposted(false);
      alert('Repost removed.');
    } else {
      // 🔎 Always pull original post from Firestore to get true user info
      const originalId = post.repostedPostId || post.id;
      const originalRef = doc(db, 'posts', originalId);
      const originalSnap = await getDoc(originalRef);

      if (!originalSnap.exists()) {
        alert('Original post not found.');
        return;
      }

      const original = originalSnap.data();
      const originalUsername = original.username || original.name || original.userId;
      const newRepostRef = doc(db, 'posts', originalId + '_repost_' + auth.currentUser.uid);
      await setDoc(newRepostRef, {
        ...original,
        id: newRepostRef.id,
        repostedFrom: post.username || post.name || 'HERE',
        repostedPostId: originalId,
        userId: auth.currentUser.uid,
        timestamp: new Date(),
      });

      await updateDoc(originalRef, { repostCount: increment(1) });
      setRepostCount((prev) => prev + 1);
      setHasReposted(true);
      alert('Post shared!');
    }
  } catch (err) {
    console.error('Failed to repost:', err);
    alert('Failed to repost. Try again.');
  }
};







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
      fetch(`https://api.microlink.io/?url=${encodeURIComponent(urlMatch[0])}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setLinkPreview({
              title: data.data.title,
              ogImage: data.data.image?.url,
              url: data.data.url
            });
          }
        })
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
        setRank(data.rank || 'bronze_1'); 
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

  if (type === 'share') {
    // ✅ ShareFat logic
    if (post.shares?.includes(userId)) return;

    await updateDoc(postRef, {
      shares: arrayUnion(userId),
      repostCount: increment(1)
    });

    await addDoc(collection(db, 'posts'), {
      userId,
      content: post.content,
      timestamp: new Date(),
      reactions: {},
      repostedFrom: post.handle || post.userId,
      repostedPostId: post.id,
      deleted: false,
    });

    return;
  }

  // 🔁 Normal reaction logic
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

    const postSnap = await getDoc(postRef);
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
  const shareCount = repostCount;
  const getReactionCount = (type) => reactions[type]?.length || 0;
  const hasReacted = (type) => reactions[type]?.includes(currentUser?.uid);
  

if (hideInDiscovery) return null;
  return (
    <div className="bg-gray-800 p-4 rounded mb-4 shadow relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-1">
          <img
            src={profilePic}
            alt="avatar"
            onClick={() => navigate(`/profile/${post.userId}`)}
            className="w-10 h-10 rounded-full object-cover border border-gray-600 cursor-pointer"
          />
          
          <div className="flex items-center gap-1">
            <div className="text-lg font-extrabold text-black flex items-center gap-2">
              {/*<RankIcon rank={rank} size={34} />*/}
              <div className="flex flex-col">
                <span className="font-bold text-white">{username}</span>
                {userTitle && (
                  <span 
                    className="text-yellow-400 text-sm font-semibold cursor-pointer" 
                    onClick={() => {
                      setSelectedTitle(userTitle);
                      setShowTitleModal(true);
                    }}
                  >
                    {userTitle}
                  </span>
                )}

                {/* TitleModal Implementation */}
                {showTitleModal && (
                  <TitleModal 
                    title={selectedTitle} 
                    onClose={() => setShowTitleModal(false)} 
                  />
                )}

              </div>
            </div>
          </div>

               

           
          <div className="text-lg font-extrabold text-white flex items-center gap-2">




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
      <UserCirclePlus size={34} weight="fill" className="text-green-500 hover:text-green-500" />
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
          onClick={async () => {
            const newContent = prompt("Edit your post:", post.content);
            if (newContent !== null) {
              await updateDoc(doc(db, 'posts', post.id), { content: newContent });

              const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
              const senderName = userSnap.exists() ? userSnap.data().name : 'Someone';

              await checkMentionsAndNotify(newContent, post.id, senderName);

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

{post.exercises?.length > 0 && (
  <div className="mb-2 bg-gray-900 border border-gray-700 rounded p-3">
    <button
      onClick={() => setWorkoutExpanded(!workoutExpanded)}
      className="text-sm text-blue-400 hover:text-blue-500 font-bold w-full text-left"
    >
  <>
  {workoutExpanded ? (
    <ArrowsIn size={18} className="inline-block mr-1" />
  ) : (
    <ArrowsOut size={18} className="inline-block mr-1" />
  )}
  {username} just finished a workout!
</>

    </button>

    {workoutExpanded && (
      <div className="mt-2">
        {post.exercises.map((ex, i) => (
          <div key={i} className="mb-2">
            <p className="text-yellow-300 font-semibold">{ex.name}</p>
            <ul className="ml-4 text-sm text-gray-300">
              {ex.sets.map((set, j) => (
                <li key={j}>
                  {set.weight !== undefined
                    ? `${set.tag ? `${set.tag} • ` : ''}${set.weight || 0} lbs × ${set.reps || 0} reps`
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

    
{post.repostedFrom && post.repostedPostId && (
  <p
    className="text-sm text-blue-400 cursor-pointer hover:underline flex items-center gap-1"
    onClick={() => navigate(`/post/${post.repostedPostId}`)}
  >
    <ShareNetwork size={18} />
    REPOSTED 
  </p>
)}



      {(!post.exercises || post.exercises.length === 0) && (
        <p className="text-white mb-2 whitespace-pre-line">{linkify(post.content)}</p>
      )}


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
            <ThumbsUp size={25} className={hasReacted('thumbsUp') ? 'text-blue-500' : 'text-blue-500'} />
            <span className="text-xs">{getReactionCount('thumbsUp')}</span>
          </button>
          <button onClick={() => handleReact('barbell')}>
            <Barbell size={25} className={hasReacted('barbell') ? 'text-yellow-400' : 'text-yellow-400'} />
            <span className="text-xs">{getReactionCount('barbell')}</span>
          </button>
          <button onClick={() => handleReact('fire')}>
            <Fire size={25} className={hasReacted('fire') ? 'text-red-500' : 'text-red-500'} />
            <span className="text-xs">{getReactionCount('fire')}</span>
          </button>
          <button onClick={handleRepost} className="flex flex-col items-center text-white hover:text-white-400">
            <ShareNetwork size={25} className={hasShared ? 'text-green-400' : 'text-white'} />
            <span className="text-xs">{shareCount}</span>
          </button>

        </div>
        <button onClick={() => setShowComments(!showComments)} className="text-white hover:text-blue-400">
          <Chats size={35} />
          {commentCount > 0 && <span className="text-sm ml-1">{commentCount}</span>}
        </button>
        
      </div>



      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}