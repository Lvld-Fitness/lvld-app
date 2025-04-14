// FeedTab.jsx
import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';

export default function FeedTab() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchHandle, setSearchHandle] = useState('');
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setFollowing(data.following || []);
      }
    };
    fetchFollowing();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPosts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(post => post.userId === auth.currentUser.uid || following.includes(post.userId));
      setPosts(loadedPosts);
    });
    return () => unsubscribe();
  }, [following]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const handle = searchHandle.trim().replace('@', '').toLowerCase();
    if (!handle) return;
    const userSnap = await getDoc(doc(db, 'handles', handle));
    if (userSnap.exists()) {
      const { uid } = userSnap.data();
      window.location.href = `/profile/${uid}`;
    } else {
      alert('User not found');
    }
  };
  

  return (
    <div className="bg-black text-white min-h-screen p-4 pb-24">
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={searchHandle}
          onChange={(e) => setSearchHandle(e.target.value)}
          placeholder="Search LVLD"
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </form>

      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded text-lg font-bold mb-4"
      >
        + Create Post
      </button>

      {posts.map(post => <PostCard key={post.id} post={post} />)}

      {showModal && <CreatePostModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
