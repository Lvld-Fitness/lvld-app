// PublicProfile.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import PostCard from './PostCard';
import RankIcon from "./RankIcon";
import TitleModal from "./TitleModal";
import { ChatCircle, ChatsCircle } from "phosphor-react";
import MessageModal from "./MessageModal";

export default function PublicProfile() {
  const { uid } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const userData = snap.data();
        const workoutCount = (userData.workoutHistory || []).length;

        setData({
          ...userData,
          workoutCount
        });
        setSelectedTitle(userData.selectedTitle || '');
      }
      setLoading(false);
    };
    fetchUser();
  }, [uid]);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', uid),
      orderBy('timestamp', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(results);
    });
    return () => unsub();
  }, [uid]);

  const toggleFollow = async () => {
    if (!currentUser || currentUser.uid === uid) return;
    const myRef = doc(db, 'users', currentUser.uid);
    const theirRef = doc(db, 'users', uid);

    if (isFollowing) {
      await updateDoc(myRef, { following: arrayRemove(uid) });
      await updateDoc(theirRef, { followers: arrayRemove(currentUser.uid) });
      setIsFollowing(false);
    } else {
      await updateDoc(myRef, { following: arrayUnion(uid) });
      await updateDoc(theirRef, { followers: arrayUnion(currentUser.uid) });
      setIsFollowing(true);
    }
  };

  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (!data) return <div className="text-white p-4">User not found</div>;

  const totalXP = Math.floor((data.totalWeight || 0) + (data.totalDistance || 0) * 1000);
  let level = 1, xpCopy = totalXP, xpForLevel = 1000;

  while (xpCopy >= xpForLevel) {
    xpCopy -= xpForLevel;
    level++;
    xpForLevel = level * 1000;
  }

  const xpProgress = Math.floor((xpCopy / xpForLevel) * 100);

  return (
    <div className="min-h-screen bg-black text-white p-6 relative">

{/*
 //Message Button 
{currentUser?.uid !== uid && (
  <button
    onClick={() => setShowMessageModal(true)}
    className="absolute top-4 left-4 text-yellow-400 hover:text-yellow-500"
  >
    <ChatsCircle size={32} />
  </button>
)}

{showMessageModal && (
  <MessageModal 
    recipientId={uid} 
    onClose={() => setShowMessageModal(false)} 
    mode="send"
  />
)}
*/}




      <div className="flex flex-col items-center">
        <img 
          src={data.profilePic || '/default-avatar.png'} 
          className="w-28 h-28 rounded-full border-4 border-gray-700 object-cover" 
          alt="avatar" 
        />
        <h1 className="text-3xl font-bold mt-4">{data.name}</h1>
        <p className="text-3xl font-bold text-red-500">{data.handle}</p>

        {selectedTitle && (
          <div className="relative">
            <p 
              className="text-2xl font-bold text-yellow-400 cursor-pointer" 
              onClick={() => setShowTitleModal(true)}
            >
              {selectedTitle}
            </p>
          </div>
        )}

        {showTitleModal && (
          <TitleModal 
            title={selectedTitle} 
            onClose={() => setShowTitleModal(false)} 
          />
        )}

        <p className="text-center text-gray-300 max-w-md mt-2">{data.bio || 'This user has no bio.'}</p>

        <div className="grid grid-cols-2 gap-6 text-center mt-6 w-full max-w-md">
          <div>
            <p className="text-2xl font-extrabold">{(data.totalDistance || 0).toFixed(2)} mi</p>
            <p className="text-gray-400 text-xs mt-1">TOTAL DISTANCE</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">{(data.totalWeight || 0).toLocaleString()} lbs</p>
            <p className="text-gray-400 text-xs mt-1">TOTAL WEIGHT</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-red-500">{data.workoutCount}</p>
            <h3 className="text-gray-400 text-xs mt-1">WORKOUTS COMPLETED</h3>
          </div>
          <div>
            <p className="text-2xl font-extrabold">Level {level}</p>
            <p className="text-gray-400 text-xs mt-1">ACCOUNT LEVEL</p>
          </div>
        </div>

        <div className="mt-6 text-center w-full max-w-md">
          <p className="text-2xl font-extrabold text-red-500 mb-1">XP</p>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-1 overflow-hidden">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${xpProgress}%` }}></div>
          </div>
          <p className="text-xs text-gray-300 font-bold mt-1">{totalXP} XP</p>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-10 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Posts by {data.name}</h2>
        {posts.length === 0 ? (
          <p className="text-gray-400 text-center">No posts yet.</p>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
