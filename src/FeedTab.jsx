// FeedTab.jsx
import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, query, where, orderBy, onSnapshot, getDoc, getDocs, doc } from 'firebase/firestore';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';
import StoryBar from './StoryBar';

export default function FeedTab() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchHandle, setSearchHandle] = useState('');
  const [following, setFollowing] = useState([]);
  const [showDiscovery, setShowDiscovery] = useState(false);

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
        .filter(post =>
          showDiscovery ||
          post.userId === auth.currentUser.uid ||
          following.includes(post.userId) ||
          (post.repostedFrom && (post.userId === auth.currentUser.uid || following.includes(post.userId)))
        );
      setPosts(loadedPosts);
    });
    return () => unsubscribe();
  }, [following, showDiscovery]);

  const handleSearch = async (e) => {
    e.preventDefault();

    const input = searchHandle.trim().replace('@', '').toLowerCase();
    const usersRef = collection(db, 'users');

    const q = query(usersRef, where('handleSearch', '==', input));
    const results = await getDocs(q);
    if (!results.empty) {
      const uid = results.docs[0].id;
      window.location.href = `/profile/${uid}`;
    } else {
      const q2 = query(usersRef, where('nameSearch', '==', input));
      const results2 = await getDocs(q2);
      if (!results2.empty) {
        const uid = results2.docs[0].id;
        window.location.href = `/profile/${uid}`;
      } else {
        alert('User not found');
      }
    }
  };

   return (
    <div className="bg-black text-white min-h-screen p-4 pb-24">
      {/*<StoryBar />*/}

      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={searchHandle}
          onChange={(e) => setSearchHandle(e.target.value)}
          placeholder="Search LVLD"
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </form>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowDiscovery(false)}
          className={`w-1/2 py-2 rounded font-bold ${!showDiscovery ? 'bg-red-500' : 'bg-gray-700'}`}
        >
          Following
        </button>
        <button
          onClick={() => setShowDiscovery(true)}
          className={`w-1/2 py-2 rounded font-bold ${showDiscovery ? 'bg-yellow-400' : 'bg-gray-700'}`}
        >
          Discover
        </button>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded text-lg font-bold mb-4"
      >
        + Create Post
      </button>

      {posts.map((post) => (
  <PostCard
    key={post.id}
    post={post}
    showFollowOption={showDiscovery}
    currentUserId={auth.currentUser?.uid}
    following={following}
  />
))}


      {showModal && <CreatePostModal onClose={() => setShowModal(false)} />}
    </div>
  );
  
}
