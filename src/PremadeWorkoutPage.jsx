import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const categorizedWorkouts = {
  'MURPH': [
    ['Murph (No Vest)', ['Run', 'Pull-Ups', 'Push-Ups', 'Squats', 'Run']],
    ['Murph (20lb Vest)', ['Run', 'Pull-Ups', 'Push-Ups', 'Squats', 'Run']]
  ],
  'Pull Day': [
    ['Pull Day (Rows)', ['Row Machine', 'Barbell Rows', 'Face Pulls', 'Bicep Curls']],
    ['Pull Day (Lat Focus)', ['Lat Pulldown', 'Seated Cable Row', 'Reverse Fly', 'Hammer Curl']]
  ],
  'Leg Day': [
    ['Leg Day (Heavy)', ['Bike', 'Squat (Barbell)', 'Leg Press', 'Calf Raises']],
    ['Leg Day (Machine)', ['Walk - 5 min', 'Leg Extension', 'Leg Curl', 'Hip Abduction']]
  ],
  'Chest Day': [
    ['Chest Day (Incline)', ['Incline Press', 'Incline Fly', 'Push Ups']],
    ['Chest Day (Flat)', ['Flat Press', 'Cable Crossover', 'Dips']]
  ],
  'Back Day': [
    ['Back Day (Strength)', ['Deadlift', 'Pull-Ups', 'Seated Row']],
    ['Back Day (Machine)', ['Lat Pulldown', 'Back Extension (Machine)', 'Cable Row']]
  ],
  'Arm Day': [
    ['Arm Day (Balanced)', ['Barbell Curl', 'Skullcrusher', 'Hammer Curl', 'Tricep Pushdown']],
    ['Arm Day (Isolation)', ['Concentration Curl', 'Overhead Tricep Extension', 'Preacher Curl']]
  ],
  'Core Blast': [
    ['Core Blast #1', ['Crunches', 'Plank', 'Leg Raise', 'Russian Twist']],
    ['Core Blast #2', ['Sit-Up', 'Cable Crunch', 'Toe Touches', 'Mountain Climbers']]
  ]
};

export default function PremadeWorkoutPage() {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(null);
  const [customWorkouts, setCustomWorkouts] = useState([]);

  const handleSelect = (exercises) => {
    navigate('/dashboard', { state: { premade: exercises } });
  };

  useEffect(() => {
    const fetchCustomWorkouts = async () => {
      if (!auth.currentUser) return;

      const customRef = collection(db, 'premadeWorkouts', auth.currentUser.uid, 'custom');
      const snapshot = await getDocs(customRef);

      const workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomWorkouts(workouts);
    };

    fetchCustomWorkouts();
  }, []);

  return (
    <div className="p-4 bg-black min-h-screen text-white relative">
      {/* Exit button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white"
      >
        ✖
      </button>

      <h1 className="text-2xl font-bold mb-4 text-center">Premade Workouts</h1>
      <div className="space-y-4">
        {Object.entries(categorizedWorkouts).map(([category, workouts], idx) => (
          <div key={idx} className="bg-gray-800 rounded-lg shadow-md">
            <button
              className="w-full text-left px-4 py-3 font-bold text-lg bg-gray-700 rounded-t-lg"
              onClick={() => setOpenCategory(openCategory === idx ? null : idx)}
            >
              {category}
            </button>
            {openCategory === idx && (
              <div className="p-4 space-y-3">
                {workouts.map(([title, exercises], i) => (
                  <div
                    key={i}
                    onClick={() => handleSelect(exercises)}
                    className="bg-gray-900 hover:bg-gray-700 p-3 rounded cursor-pointer"
                  >
                    <h3 className="font-bold text-white mb-1">{title}</h3>
                    <ul className="text-sm text-gray-300 list-disc list-inside">
                      {exercises.map((ex, j) => (
                        <li key={j}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

{/* 🔥 Custom Premades */}
<div className="bg-gray-800 rounded-lg shadow-md">
  <button
    className="w-full text-left px-4 py-3 font-bold text-lg bg-gray-700 rounded-t-lg"
    onClick={() => setOpenCategory('custom')}
  >
    Custom Premades
  </button>
  {openCategory === 'custom' && (
    <div className="p-4 space-y-3">
      {customWorkouts.length === 0 ? (
        <p className="text-gray-400">No saved workouts yet.</p>
      ) : (
        customWorkouts.map((workout, i) => (
          <div
            key={workout.id || i}
            className="bg-gray-900 hover:bg-gray-700 p-3 rounded cursor-pointer relative"
          >
            <h3
              onClick={() => handleSelect(workout.exercises.map(ex => ex.name))}
              className="font-bold text-yellow-300 mb-1"
            >
              {workout.name}
            </h3>
            <ul
              onClick={() => handleSelect(workout.exercises.map(ex => ex.name))}
              className="text-sm text-gray-300 list-disc list-inside"
            >
              {workout.exercises.map((ex, j) => (
                <li key={j}>{ex.name}</li>
              ))}
            </ul>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const confirmed = window.confirm(`Delete "${workout.name}"?`);
                if (!confirmed) return;

                const docRef = doc(db, "premadeWorkouts", auth.currentUser.uid, "custom", workout.id);
                await deleteDoc(docRef);
                setCustomWorkouts(prev => prev.filter(w => w.id !== workout.id));
              }}
              className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-sm"
              title="Delete"
            >
              ✖
            </button>
          </div>
        ))
      )}
    </div>
  )}
</div>
      </div>
    </div>
  );
}
