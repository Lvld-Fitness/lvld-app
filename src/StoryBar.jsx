import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, limit, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import StoryUploadModal from './StoryUploadModal';
import { Barbell } from 'phosphor-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function StoryBar() {
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stories, setStories] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const navigate = useNavigate();
  const [refreshStories, setRefreshStories] = useState(false);


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
          ...story,
        });
      }

      setStories(storyList);
    };

    fetchUser();
    fetchStories();
  }, [following]);

  const handleOptions = (user) => {
    setShowOptions(user);
    setActiveWorkout(null);  // Reset active workout when opening the options
  };

  const closeOptions = () => {
    setShowOptions(null);
    setActiveWorkout(null);
  };

  const fetchWorkout = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const workoutData = userSnap.data().activeWorkout || [];
      setActiveWorkout({ userId, exercises: workoutData });
    } else {
      setActiveWorkout({ userId, exercises: [] });
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto flex gap-4 p-3 border-b border-gray-700 bg-black relative">
        {userData && (
          <div className="flex flex-col items-center relative">
            <div
              onClick={() => handleOptions(userData)}
              className="w-16 h-16 rounded-full border-4 border-blue-500 relative cursor-pointer"
            >
              <img
                src={userData.profilePic || '/default-avatar.png'}
                alt={userData.username}
                className="w-full h-full object-cover rounded-full"
              />
              {userData.workingOut && (
                <div className="absolute -bottom-1 -right-1 bg-green-600 p-1 rounded-full shadow">
                  <Barbell size={16} weight="bold" className="text-white" />
                </div>
              )}
            </div>
            <span className="text-xs text-white mt-1 w-16 truncate text-center">You</span>
          </div>
        )}

        {stories.map((story) => (
          <div key={story.userId} className="flex flex-col items-center relative">
            <div
              onClick={() => handleOptions(story)}
              className={`w-16 h-16 rounded-full border-4 relative cursor-pointer ${
                story.hasStory ? 'border-blue-500' : 'border-gray-600 opacity-40'
              }`}
            >
              <img
                src={story.profilePic || '/default-avatar.png'}
                alt={story.username}
                className="w-full h-full object-cover rounded-full"
              />
              {story.workingOut && (
                <div className="absolute -bottom-1 -right-1 bg-green-600 p-1 rounded-full shadow">
                  <Barbell size={14} weight="bold" className="text-white" />
                </div>
              )}
            </div>
            <span className="text-xs text-white mt-1 truncate w-16 text-center">
              {story.name || 'User'}
            </span>
          </div>
        ))}
      </div>


{/* Options Modal */}
{showOptions && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-4 rounded-lg w-64">
      <h2 className="text-white text-lg font-bold mb-4">Select an Option</h2>

      {showOptions.uid === auth.currentUser?.uid ? (
        <>
          {showOptions.hasStory && (
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 mb-2 rounded"
              onClick={() => {
                navigate(`/story/${showOptions.userId}`);
                closeOptions();
              }}
            >
              View Story
            </button>
          )}

          <button
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 mb-2 rounded"
            onClick={() => {
              document.getElementById('story-upload-input')?.click();
              closeOptions();
            }}
          >
            Stories Coming Soon
          </button>

          <input
  id="story-upload-input"
  type="file"
  accept="image/*,video/*"
  style={{ display: 'none' }}
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const timestamp = Date.now();

    const storage = getStorage(); // ✅ correct initialization
    const fileRef = ref(storage, `stories/${userId}/${timestamp}_${file.name}`); // ✅ reference to file path

    try {
      await uploadBytes(fileRef, file); // ✅ upload
      const downloadURL = await getDownloadURL(fileRef); // ✅ fetch URL

      const entryRef = doc(db, 'stories', userId, 'entries', `${timestamp}`);
      await setDoc(entryRef, {
        mediaUrl: downloadURL,
        mediaType: file.type.startsWith('video') ? 'video' : 'image',
        timestamp: serverTimestamp(),
      });

      alert('Story uploaded!');
      setRefreshStories((prev) => !prev); // 🔁 force refresh
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload story.');
    }
  }}
/>

          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 mb-2 rounded"
            onClick={() => {
              navigate(`/profile`);
              closeOptions();
            }}
          >
            View Profile
          </button>
        </>
      ) : (
        <>
          {showOptions.hasStory && (
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 mb-2 rounded"
              onClick={() => {
                navigate(`/story/${showOptions.userId}`);
                closeOptions();
              }}
            >
              View Story
            </button>
          )}
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 mb-2 rounded"
            onClick={() => {
              navigate(`/profile/${showOptions.userId}`);
              closeOptions();
            }}
          >
            View Profile
          </button>
          {showOptions.workingOut && (
            <button
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              onClick={() => fetchWorkout(showOptions.userId)}
            >
              View Workout
            </button>
          )}
        </>
      )}

      <button
        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 mt-2 rounded"
        onClick={closeOptions}
      >
        Cancel
      </button>
    </div>
  </div>
)}





{/* Active Workout Modal */}
{activeWorkout && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-4 rounded-lg w-64 max-h-[80vh] overflow-y-auto">
      <h2 className="text-white text-lg font-bold mb-4">Active Workout</h2>
      {activeWorkout.exercises.length > 0 ? (
        activeWorkout.exercises.map((exercise, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-yellow-400 font-bold">{exercise.name}</h3>
            {exercise.sets.map((set, idx) => (
              <p key={idx} className="text-white text-sm">
                {set.weight && set.reps
                  ? `${set.weight} lbs x ${set.reps} reps`
                  : set.distance && set.time
                  ? `${set.distance} mi in ${set.time} min`
                  : `Set not complete yet.`}
              </p>
            ))}
          </div>
        ))
      ) : (
        <p className="text-gray-400">No active workout data available.</p>
      )}
      <button
        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 mt-2 rounded"
        onClick={() => setActiveWorkout(null)}
      >
        Close
      </button>
    </div>
  </div>
)}

    </>
  );
}
