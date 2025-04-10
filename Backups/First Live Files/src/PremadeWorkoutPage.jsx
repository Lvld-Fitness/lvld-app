
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categorizedWorkouts = {
  'Push Day': [
    ['Push Day (Classic)', ['Treadmill - 5 min', 'Bench Press', 'Shoulder Press', 'Tricep Dips']],
    ['Push Day (Machine)', ['Bike - 5 min', 'Chest Press (Machine)', 'Shoulder Press (Machine)', 'Tricep Extension']]
  ],
  'Pull Day': [
    ['Pull Day (Rows)', ['Row Machine - 5 min', 'Barbell Rows', 'Face Pulls', 'Bicep Curls']],
    ['Pull Day (Lat Focus)', ['Lat Pulldown', 'Seated Cable Row', 'Reverse Fly', 'Hammer Curl']]
  ],
  'Leg Day': [
    ['Leg Day (Heavy)', ['Bike - 5 min', 'Squat (Barbell)', 'Leg Press', 'Calf Raises']],
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
  ],
  'Custom Premades': [
    ['Push Day (Classic)', ['Treadmill - 5 min', 'Bench Press', 'Shoulder Press', 'Tricep Dips']],
    ['Push Day (Machine)', ['Bike - 5 min', 'Chest Press (Machine)', 'Shoulder Press (Machine)', 'Tricep Extension']]
  ],
};

export default function PremadeWorkoutPage() {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(null);

  const handleSelect = (exercises) => {
    navigate('/dashboard', { state: { premade: exercises } });
  };

  return (
    <div className="p-4 bg-black min-h-screen text-white">
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
      </div>
    </div>
  );
}
