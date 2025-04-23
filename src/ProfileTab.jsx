import { useState, useEffect } from 'react';
import { Gear } from 'phosphor-react';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function ProfileTab() {
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);

  const [profilePic, setProfilePic] = useState('/default-avatar.png');
  const [name, setName] = useState('John Doe');
  const [handle, setHandle] = useState('@johndoe');
  const [bio, setBio] = useState('This is your bio. Click to edit.');
  const [editingBio, setEditingBio] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpProgress, setXpProgress] = useState(0);
  const [currentLevelXp, setCurrentLevelXp] = useState(0);
  const [currentLevelXpNeeded, setCurrentLevelXpNeeded] = useState(1000);

  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastWorkoutWeight, setLastWorkoutWeight] = useState(0);
  const [showLastWorkoutWeight, setShowLastWorkoutWeight] = useState(false);
  const [useKilometers, setUseKilometers] = useState(() => localStorage.getItem('distanceUnit') === 'km');
  const [useKilograms, setUseKilograms] = useState(() => localStorage.getItem('weightUnit') === 'kg');
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [showDistanceBreakdown, setShowDistanceBreakdown] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState('miles'); // or 'km' if you prefer default
  const [distanceByType, setDistanceByType] = useState({
    Walking: 0,
    Running: 0,
    Cycling: 0,
    Other: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [unlockedTitles, setUnlockedTitles] = useState([]);


useEffect(() => {
  if (!uid) return;
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('timestamp', 'desc')
  );

  const unsub = onSnapshot(q, (snap) => {
    const notes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setNotifications(notes);
  });

  return () => unsub();
}, [uid]);


  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.workoutHistory) {
          setWorkoutHistory(data.workoutHistory);
        }
      }
    };
  
    fetchWorkoutHistory();
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        fetchUserData(user.uid);
      } else {
        navigate('/login');
      }
    });
  }, []);

  const fetchUserData = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      setName(data.name || 'John Doe');
      setHandle(data.handle || '@johndoe');
      setBio(data.bio || 'This is your bio. Click to edit.');
      setProfilePic(data.profilePic !== undefined ? data.profilePic : '/default-avatar.png');
      setTotalWeight(data.totalWeight || 0);
      setTotalDistance(data.totalDistance || 0);
      if (data.totalDistanceByType) {
        setDistanceByType(data.totalDistanceByType);
      }      
      const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
      if (history.length > 0) {
        const last = history[history.length - 1];
        setLastWorkoutWeight(last.totalWeight || 0);
      }

      setSelectedTitle(data.selectedTitle || 'No Titles Unlocked');
      setUnlockedTitles(data.unlockedTitles || []);

      

          // ✅ Auto-register handle mapping if missing
    const handleClean = (data.handle || '').replace('@', '').toLowerCase();
    if (handleClean) {
      const handleRef = doc(db, 'handles', handleClean);
      const handleSnap = await getDoc(handleRef);
      if (!handleSnap.exists()) {
        await setDoc(handleRef, { uid });
      }
    }
  }
};


const recalculateDistanceByType = (history) => {
  const result = {};
  history.forEach(workout => {
    workout.exercises?.forEach(ex => {
      if (ex.sets && Array.isArray(ex.sets)) {
        ex.sets.forEach(set => {
          const distance = parseFloat(set.distance || 0);
          if (distance > 0) {
            if (!result[ex.name]) result[ex.name] = 0;
            result[ex.name] += distance;
          }
        });
      }
    });
  });
  return result;
};


         

  const saveUserData = async (field, value) => {
    if (!uid) return;
    await setDoc(doc(db, 'users', uid), { [field]: value }, { merge: true });
  };

  useEffect(() => {
    const storedWorkouts = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    let total = 0;
    let distance = 0;
    const now = new Date();
    const recentDays = new Set();
  
    storedWorkouts.forEach(workout => {
      if (workout.timestamp) {
        const workoutDate = new Date(workout.timestamp);
        const daysAgo = (now - workoutDate) / (1000 * 60 * 60 * 24);
        if (daysAgo <= 7) {
          recentDays.add(workoutDate.toISOString().split('T')[0]);
        }
      }
  
      workout.exercises?.forEach(ex => {
        ex.sets?.forEach(set => {
          const reps = parseInt(set.reps) || 0;
          const weight = parseFloat(set.weight) || 0;
          total += reps * weight;
          distance += parseFloat(set.distance || 0);
        });
      });
    });
  
    // Update local state
    setTotalWeight(total);
    setTotalDistance(distance);
    setWeeklyStreak(recentDays.size);
    setXp(total + distance * 1000);
  
    // Then update Firebase
    if (uid) {
      saveUserData('totalWeight', total);
      saveUserData('totalDistance', distance);
    }
  }, [uid]); // <- rerun when user is known
  

  useEffect(() => {
    let currentLevel = 1;
    let xpCopy = xp;
    let xpForLevel = 1000;

    while (xpCopy >= xpForLevel) {
      xpCopy -= xpForLevel;
      currentLevel++;
      xpForLevel = currentLevel * 1000;
    }

    setLevel(currentLevel);
    setXpProgress(Math.floor((xpCopy / xpForLevel) * 100));
    setCurrentLevelXp(xpCopy);
    setCurrentLevelXpNeeded(xpForLevel);
  }, [xp]);

//Notifications
  <div className="mt-6">
  <h2 className="text-xl font-bold mb-2">Notifications</h2>
  {notifications.length === 0 ? (
    <p className="text-gray-400 text-sm">No notifications yet.</p>
  ) : (
    notifications.map(n => (
      <div
        key={n.id}
        onClick={async () => {
          await updateDoc(doc(db, 'users', uid, 'notifications', n.id), { read: true });
          navigate(`/post/${n.postId}`);
        }}
        className="p-3 mb-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer"
      >
        <div className="text-sm text-white">You were mentioned in a post</div>
        <div className="text-xs text-gray-400">{new Date(n.timestamp).toLocaleString()}</div>
      </div>
    ))
  )}
</div>


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setProfilePic(reader.result);
        saveUserData('profilePic', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDistanceUnit = () => {
    const newSetting = !useKilometers;
    setUseKilometers(newSetting);
    localStorage.setItem('distanceUnit', newSetting ? 'km' : 'mi');
  };

  const displayDistance = useKilometers ? (totalDistance * 1.60934).toFixed(2) + ' km' : totalDistance.toFixed(2) + ' mi';
  const displayWeight = useKilograms ? (totalWeight * 0.453592).toFixed(0).toLocaleString() + ' kg' : totalWeight.toLocaleString() + ' lbs';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="p-4 text-white bg-black min-h-screen relative">
      <button onClick={() => setShowSettings(true)} className="absolute top-4 right-4 text-white">
        <Gear size={24} weight="bold" />
      </button>
      <div className="flex flex-col items-center">
        <label className="cursor-pointer">
          <img src={profilePic} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-gray-700" />
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        <h1 className="text-3xl font-extrabold mt-4 uppercase">{name}</h1>
        {selectedTitle !== 'No Titles Unlocked' && (
         <p className="text-sm font-bold text-yellow-400">{selectedTitle}</p>
       )}

        <p className="text-2xl font-bold text-red-500">{handle}</p>

        {editingBio ? (
          <textarea
            value={bio}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 100) {
                setBio(value);
                saveUserData('bio', value);
              }
            }}
            onBlur={() => setEditingBio(false)}
            className="bg-gray-800 text-white p-2 rounded w-full max-w-md"
            autoFocus
          />
        ) : (
          <p onClick={() => setEditingBio(true)} className="text-gray-300 text-center max-w-md cursor-pointer">
            {bio}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-6 text-center w-full max-w-2xl">

          {/*} Drop Downs*/}
          <div>
  <p className="text-2xl font-extrabold cursor-default">
    {displayDistance}
  </p>
  <p className="text-gray-400 text-xs mt-1">TOTAL DISTANCE TRAVELED</p>

  {/* 
  {showDistanceBreakdown && (
    <div className="mt-2 ml-2 text-sm text-white space-y-1">
      <div>Running: {distanceByType.Running?.toFixed(2) || 0} {distanceUnit}</div>
      <div>Walking: {distanceByType.Walking?.toFixed(2) || 0} {distanceUnit}</div>
      <div>Cycling: {distanceByType.Cycling?.toFixed(2) || 0} {distanceUnit}</div>
      <div>Other: {distanceByType.Other?.toFixed(2) || 0} {distanceUnit}</div>
    </div>
  )}
  */}
</div>


          <div>
            <p
              onClick={() => setShowLastWorkoutWeight(!showLastWorkoutWeight)}
              className="text-2xl font-extrabold cursor-pointer"
            >
              {displayWeight}
            </p>
            <p className="text-gray-400 text-xs mt-1">TOTAL WEIGHT LIFTED</p>
            {showLastWorkoutWeight && (
              <p className="text-sm text-gray-300 mt-2">Last Workout: {lastWorkoutWeight.toLocaleString()} lbs</p>
            )}
          </div>
          <div>
            <p className="text-2xl font-extrabold text-red-500">{weeklyStreak}</p>
            <p className="text-gray-400 text-xs mt-1">WORKOUT STREAK</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">Level {level}</p>
            <p className="text-gray-400 text-xs mt-1">ACCOUNT LEVEL</p>
          </div>
        </div>

        <div className="mt-6 text-center w-full max-w-2xl">
          <p className="text-2xl font-extrabold text-red-500 mb-1">XP</p>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-1 overflow-hidden">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${xpProgress}%` }}></div>
          </div>
          <p className="text-xs text-gray-300 font-bold mt-1">
            {Math.floor(currentLevelXp)} / {currentLevelXpNeeded} XP
          </p>
        </div>

          

        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg text-white w-80 space-y-4 relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">✖</button>
              <h2 className="text-xl font-bold mb-2">Settings</h2>
              <div>
                <label className="block text-sm mb-1">Account Name</label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); saveUserData('name', e.target.value); }} className="w-full px-2 py-1 rounded bg-gray-800 text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/^@/, ''); // remove any leading @
                    const formatted = `@${raw}`;
                    setHandle(formatted);
                    saveUserData('handle', formatted);
                  }}
                  className="w-full px-2 py-1 rounded bg-gray-800 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Distance Units</label>
                <button onClick={toggleDistanceUnit} className="w-full bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded text-sm">Switch to {useKilometers ? 'Miles' : 'Kilometers'}</button>
              </div>
              <div>
                <label className="block text-sm mb-1">Weight Units</label>
                <button onClick={() => { const newSetting = !useKilograms; setUseKilograms(newSetting); localStorage.setItem('weightUnit', newSetting ? 'kg' : 'lbs'); }} className="w-full bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded text-sm">Switch to {useKilograms ? 'Pounds' : 'Kilograms'}</button>
              </div>

              {unlockedTitles.length > 0 && (
                <div>
                  <label className="block text-sm mb-1">Choose Title</label>
                  <select
                    value={selectedTitle}
                    onChange={async (e) => {
                      const newTitle = e.target.value;
                      setSelectedTitle(newTitle);
                      await saveUserData('selectedTitle', newTitle);
                    }}
                    className="w-full px-2 py-1 rounded bg-gray-800 text-white"
                  >
                    {unlockedTitles.map((title, idx) => (
                      <option key={idx} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
              )}


              {/* 🔁 Reset Buttons for Distance and Weight */}
              <div className="space-y-2 mt-4">
                <button
                  onClick={async () => {
                    setTotalDistance(0);
                    await saveUserData('totalDistance', 0);
                    localStorage.setItem('workoutHistory', JSON.stringify([]));
                  }}
                  className="w-full bg-blue-700 hover:bg-blue-800 py-2 rounded text-sm"
                >
                  Reset Distance
                </button>

                <button
                  onClick={async () => {
                    setTotalWeight(0);
                    await saveUserData('totalWeight', 0);
                    localStorage.setItem('workoutHistory', JSON.stringify([]));
                  }}
                  className="w-full bg-blue-700 hover:bg-blue-800 py-2 rounded text-sm"
                >
                  Reset Weight
                </button>
              </div>

              <button
  onClick={async () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      const user = auth.currentUser;
      const uid = user?.uid;
      if (uid) {
        try {
          await deleteDoc(doc(db, 'users', uid));
          await user.delete(); // Delete auth account
          navigate('/signup');
        } catch (err) {
          console.error('Account deletion failed:', err);
          alert('Failed to delete account. Please reauthenticate or try again.');
        }
      }
    }
  }}
  className="w-full bg-red-800 hover:bg-red-900 py-2 rounded font-bold text-white"
>
  Delete Account
</button>

<button onClick={handleLogout} className="w-full mt-2 bg-red-600 hover:bg-red-700 py-2 rounded font-bold">Log Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
