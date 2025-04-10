
import { useState, useEffect } from 'react';
import { Gear } from 'phosphor-react';

export default function ProfileTab() {
  const [profilePic, setProfilePic] = useState('/default-avatar.png');
  const [name, setName] = useState('John Doe');
  const [handle, setHandle] = useState('@johndoe');
  const [bio, setBio] = useState('This is your bio. Click to edit.');
  const [editingBio, setEditingBio] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpProgress, setXpProgress] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    const storedWorkouts = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    let total = 0;
    const now = new Date();
    const recentDays = new Set();

    storedWorkouts.forEach(workout => {
      if (workout.timestamp) {
        const workoutDate = new Date(workout.timestamp);
        const daysAgo = (now - workoutDate) / (1000 * 60 * 60 * 24);
        if (daysAgo <= 7) {
          const key = workoutDate.toISOString().split('T')[0];
          recentDays.add(key);
        }
      }

      workout.exercises?.forEach(ex => {
        ex.sets?.forEach(set => {
          const reps = parseInt(set.reps) || 0;
          const weight = parseFloat(set.weight) || 0;
          total += reps * weight;
        });
      });
    });

    setTotalWeight(total);
    setWeeklyStreak(recentDays.size);
  }, []);

  useEffect(() => {
    setXp(totalWeight);
    let level = 1;
    let xpRemaining = totalWeight;
    let xpToNext = 1000;

    while (xpRemaining >= xpToNext) {
      xpRemaining -= xpToNext;
      level++;
      xpToNext = level * 1000;
    }

    setLevel(level);
    setXpProgress(Math.floor((xpRemaining / xpToNext) * 100));
  }, [totalWeight]);

  useEffect(() => {
    const storedPic = localStorage.getItem('profilePic');
    const storedName = localStorage.getItem('profileName');
    const storedHandle = localStorage.getItem('profileHandle');
    const storedBio = localStorage.getItem('profileBio');

    if (storedPic) setProfilePic(storedPic);
    if (storedName) setName(storedName);
    if (storedHandle) setHandle(storedHandle);
    if (storedBio) setBio(storedBio);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        localStorage.setItem('profilePic', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 text-white bg-black min-h-screen relative">
      <button onClick={() => setShowSettings(true)} className="absolute top-4 right-4 text-white">
        <Gear size={24} weight="bold" />
      </button>
      <div className="flex flex-col items-center">
        <label className="cursor-pointer">
          <img
            src={profilePic}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-gray-700"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        <h1 className="text-3xl font-extrabold mt-4 uppercase">{name}</h1>
        <p className="text-2xl font-bold text-red-500">{handle}</p>

        {editingBio ? (
          <textarea
            value={bio}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 100) {
                setBio(value);
                localStorage.setItem('profileBio', value);
              }
            }}
            onBlur={() => setEditingBio(false)}
            className="bg-gray-800 text-white p-2 rounded w-full max-w-md"
            autoFocus
          />
        ) : (
          <p
            className="text-gray-300 text-center max-w-md cursor-pointer"
            onClick={() => setEditingBio(true)}
          >
            {bio}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center w-full max-w-2xl">
          <div>
            <p className="text-2xl font-extrabold">{totalWeight.toLocaleString()}</p>
            <p className="text-gray-400 text-xs mt-1">TOTAL WEIGHT LIFTED</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-red-500">{weeklyStreak}</p>
            <p className="text-gray-400 text-xs mt-1">WEEKLY STREAK</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-red-500 mb-1">XP</p>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-1 overflow-hidden">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${xpProgress}%` }}></div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">Level {level}</p>
            <p className="text-gray-400 text-xs mt-1">ACCOUNT LEVEL</p>
          </div>
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg text-white w-80 space-y-4">
              <h2 className="text-xl font-bold mb-2">Settings</h2>
              <div>
                <label className="block text-sm mb-1">Account Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                  setName(e.target.value);
                  localStorage.setItem('profileName', e.target.value);
                }}
                  className="w-full px-2 py-1 rounded bg-gray-800 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => {
                  setHandle(e.target.value);
                  localStorage.setItem('profileHandle', e.target.value);
                }}
                  className="w-full px-2 py-1 rounded bg-gray-800 text-white"
                />
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 py-2 rounded font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
