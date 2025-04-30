import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, limit, getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import StoryUploadModal from './StoryUploadModal';
import { Barbell } from 'phosphor-react';

export default function StoryBar() {
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stories, setStories] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const ref = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUserData({ uid: currentUser.uid, ...data });
        setFollowing(data.following || []);
      }
    };

    const fetchStories = async () => {
      const now = Date.now();
      const cutoff = now - 24 * 60 * 60 * 1000;

      const storyList = [];

      for (const uid of following) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) continue;

        const userData = userSnap.data();
        const entriesRef = collection(db, 'stories', uid, 'entries');
        const q = query(entriesRef, orderBy('timestamp', 'desc'), limit(1));
        const entrySnap = await getDocs(q);

        let story = null;
        if (!entrySnap.empty) {
          const entry = entrySnap.docs[0].data();
          const entryTime = entry.timestamp?.toMillis?.() ?? 0;
          if (entryTime >= cutoff) {
            story = { ...entry };
          }
        }

        storyList.push({
          userId: uid,
          hasStory: !!story,
          ...userData,
          ...story
        });
      }

      setStories(storyList);
    };

    fetchUser();
    fetchStories();
  }, [following]);

  return (
    <>
      <div className="w-full overflow-x-auto flex gap-4 p-3 border-b border-gray-700 bg-black relative">
        {userData && (
          <div className="flex flex-col items-center relative">
            <div
              onClick={() => navigate(`/story/${userData.uid}`)}
              className="w-16 h-16 rounded-full border-4 border-blue-500 relative"
            >
              <div className="relative w-full h-full">
                <img
                  src={userData.profilePic || '/default-avatar.png'}
                  alt={userData.username}
                  className="w-full h-full object-cover rounded-full cursor-pointer"
                />
                {userData.workingOut === true && (
                  <div className="absolute -bottom-1 -right-1 bg-green-600 p-1 rounded-full shadow">
                    <Barbell size={16} weight="bold" className="text-white" />
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-white mt-1 w-16 truncate text-center">Your Story</span>
          </div>
        )}

        {stories.map((story) => (
          <div key={story.userId} className="flex flex-col items-center relative">
            <div
              onClick={story.hasStory ? () => navigate(`/story/${story.userId}`) : undefined}
              className={`w-16 h-16 rounded-full border-4 relative ${
                story.hasStory ? 'border-blue-500' : 'border-gray-600 opacity-40 cursor-default'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={story.profilePic || '/default-avatar.png'}
                  alt={story.username}
                  className="w-full h-full object-cover rounded-full"
                />
                {story.workingOut === true && (
                  <div className="absolute -bottom-1 -right-1 bg-green-600 p-1 rounded-full shadow">
                    <Barbell size={14} weight="bold" className="text-white" />
                  </div>
                )}
              </div>
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
