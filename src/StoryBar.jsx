import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, limit, getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import StoryUploadModal from './StoryUploadModal';

export default function StoryBar() {
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const ref = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserData({ uid: currentUser.uid, ...snap.data() });
      }
    };

    const fetchStories = async () => {
      const usersRef = collection(db, 'users');
      const userSnaps = await getDocs(usersRef);
      const now = Date.now();
      const cutoff = now - 24 * 60 * 60 * 1000;

      const storyList = [];

      for (const userDoc of userSnaps.docs) {
        const userId = userDoc.id;
        const entriesRef = collection(db, 'stories', userId, 'entries');
        const q = query(entriesRef, orderBy('timestamp', 'desc'), limit(1));
        const entrySnap = await getDocs(q);

        if (!entrySnap.empty) {
          const entry = entrySnap.docs[0].data();
          const entryTime = entry.timestamp?.toMillis?.() ?? 0;
          if (entryTime >= cutoff) {
            storyList.push({
              userId,
              ...userDoc.data(),
              ...entry
            });
          }
        }
      }

      setStories(storyList);
    };

    fetchUser();
    fetchStories();
  }, []);

  return (
    <>
      <div className="w-full overflow-x-auto flex gap-4 p-3 border-b border-gray-700 bg-black relative">
        {userData && (
          <div className="flex flex-col items-center relative">
            <div
              onClick={() => navigate(`/story/${userData.uid}`)}
              className="w-16 h-16 rounded-full border-4 border-blue-500"
            >
              <img
                src={userData.profilePic || '/default-avatar.png'}
                alt={userData.username}
                className="w-full h-full object-cover rounded-full cursor-pointer"
              />
            </div>
            <span className="text-xs text-white mt-1 w-16 truncate text-center">Your Story</span>
          </div>
        )}

        {stories
          .filter(s => s.userId !== userData?.uid)
          .map((story) => (
            <div key={story.userId} className="flex flex-col items-center">
              <div
                onClick={() => navigate(`/story/${story.userId}`)}
                className="w-16 h-16 rounded-full border-4"
                style={{
                  borderColor:
                    Date.now() - (story.timestamp?.toMillis?.() ?? 0) <= 30000
                      ? '#00ff00'
                      : '#444'
                }}
              >
                <img
                  src={story.profilePic || '/default-avatar.png'}
                  alt={story.username}
                  className="w-full h-full object-cover rounded-full cursor-pointer"
                />
              </div>
              <span className="text-xs text-white mt-1 truncate w-16 text-center">
                {story.name || 'User'}
              </span>
            </div>
          ))}
      </div>

      {showModal && (
        <StoryUploadModal
          onClose={() => setShowModal(false)}
          userData={userData}
        />
      )}
    </>
  );
}
