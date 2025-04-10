import { useState, useEffect } from 'react';
import ExercisePickerModal from './ExercisePickerModal';
import NoteModal from './NoteModal';
import RestTimerModal from './RestTimerModal';
import RestFloatingTimer from './RestFloatingTimer';
import defaultExercises from './exerciseList';
import GymScanModal from './GymScanModal_LocalV9';
import { useRestTimer } from './RestTimerContext';
import { useGlobalRestTimer } from './GlobalRestTimerContext'; // or your path
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';











export default function WorkoutTab() {
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showGymModal, setShowGymModal] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(null);
  const [showRestTimer, setShowRestTimer] = useState(null);
  const [floatingRest, setFloatingRest] = useState(null);
  const [restDurations, setRestDurations] = useState(() => {
    const saved = localStorage.getItem('exerciseRestDurations');
    return saved ? JSON.parse(saved) : {};
  });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [historyOptionsOpen, setHistoryOptionsOpen] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  const [exerciseList, setExerciseList] = useState(() => {
    const saved = localStorage.getItem('savedExercises');
    return saved ? JSON.parse(saved) : defaultExercises;
  });
  const [activeSetTag, setActiveSetTag] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [showPastWorkouts, setShowPastWorkouts] = useState(false);
  const [showRestPopup, setShowRestPopup] = useState(false);
  const { startRestTimer } = useRestTimer();
  const { startGlobalRestTimer } = useGlobalRestTimer();
  
  const [pendingRestTrigger, setPendingRestTrigger] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();






  useEffect(() => {
    if (location.state?.premade && location.state.premade.length > 0) {
      const newExercises = location.state.premade.map((name, index) => ({
        id: Date.now() + index,
        name,
        sets: [
          { id: 1, weight: '', reps: '', completed: false },
          { id: 2, weight: '', reps: '', completed: false },
          { id: 3, weight: '', reps: '', completed: false }
        ],
        note: '',
        restDuration: 30
      }));
      setSelectedExercises(newExercises);
      
    }
  }, [location]);
  


  
  useEffect(() => {
    const checkForRestAlert = () => {
      const flag = localStorage.getItem('rest-timer-alert');
      if (flag === 'true') {
        setShowRestPopup(true);
        localStorage.setItem('rest-timer-alert', 'false');
  
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          setShowRestPopup(false);
        }, 3000);
      }
    };
  
    // Check every second in case user is on a different tab
    const interval = setInterval(checkForRestAlert, 1000);
    return () => clearInterval(interval);
  }, []);
  

  useEffect(() => {
    const active = localStorage.getItem('activeWorkout');
    const start = localStorage.getItem('workoutStartTime');
    const history = localStorage.getItem('workoutHistory');
    if (active) setSelectedExercises(JSON.parse(active));
    if (start) setWorkoutStartTime(Number(start));
    if (history) setWorkoutHistory(JSON.parse(history));
  }, []);

  useEffect(() => {
    if (workoutStartTime !== null) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [workoutStartTime]);

  useEffect(() => {
    if (selectedExercises.length > 0) {
      localStorage.setItem('activeWorkout', JSON.stringify(selectedExercises));
      if (!workoutStartTime) {
        const now = Date.now();
        setWorkoutStartTime(now);
        localStorage.setItem('workoutStartTime', now.toString());
      }
    }
  }, [selectedExercises]);

  useEffect(() => {
    if (pendingRestTrigger) {
      startGlobalRestTimer();
      setPendingRestTrigger(false); // reset it
    }
  }, [pendingRestTrigger]);
  

  
  const staticCardio = [
    'Air Bike Sprint', 'Battle Ropes', 'Battle Ropes (Alternating)', 'Bear Crawl', 'Biking (Spin Bike)',
    'Cycling', 'Elliptical', 'Farmer Carry (Dumbbell)', 'Farmer Carry (Kettlebell)', 'High Knees',
    'Indoor Running', 'Jumping Jacks', 'Outdoor Running', 'Rowing Machine', 'Rowing Sprint', 'Shadow Boxing',
    'Sled Pull', 'Sled Push', 'Stairmaster', 'Treadmill Run', 'Treadmill Sprint', 'Treadmill Walk',
    'Walking Lunge (Barbell)', 'Walking Lunge (Dumbbell)', 'Wall Ball (Medicine Ball)', 'VR Gaming',
  ];

  const saved = localStorage.getItem('savedExercises');
  const userExercises = saved ? JSON.parse(saved) : [];
  const userCardio = userExercises
    .filter(e => e.type === 'cardio')
    .map(e => e.name);

  const cardioExercises = [...staticCardio, ...userCardio];


  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const calculateTotalWeight = (exercises) => {
    return exercises.reduce((total, exercise) => {
      if (!exercise.sets) return total;
  
      return total + exercise.sets.reduce((sum, set) => {
        const weight = parseFloat(set.weight) || 0;
        const reps = parseInt(set.reps) || 0;
        return sum + weight * reps;
      }, 0);
    }, 0);
  };
  

  const addSet = (exerciseIdx) => {
    setSelectedExercises((prev) => {
      const updated = [...prev];
      const exercise = updated[exerciseIdx];
      if (!exercise.sets) exercise.sets = [];
      const nextId = exercise.sets.length + 1;
      exercise.sets = [...exercise.sets, { id: nextId, weight: '', reps: '', completed: false, tag: '' }];
      return updated;
    });
  };
  

  const updateSetValue = (exerciseIdx, setIdx, field, value) => {
    setSelectedExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIdx].sets[setIdx][field] = value;
      return updated;
    });
  };

  const removeSet = (exerciseIdx, setIdx) => {
    setSelectedExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIdx].sets.splice(setIdx, 1);
      if (updated[exerciseIdx].sets.length === 0) {
        updated.splice(exerciseIdx, 1);
      }
      return updated;
    });
  };

  const toggleComplete = (exerciseIdx, setIdx) => {
    setSelectedExercises((prev) => {
      const updated = prev.map((exercise, i) => {
        if (i !== exerciseIdx) return exercise;
  
        const updatedSets = exercise.sets.map((set, j) => {
          if (j !== setIdx) return set;
          return { ...set, completed: !set.completed };
        });
  
        // ✅ If just marked as completed, start rest timer
        const justCompleted = !exercise.sets[setIdx].completed;
        if (justCompleted) {
          const duration = restDurations[exercise.name] || 30;
          setFloatingRest({ duration });
  
        }
  
        return { ...exercise, sets: updatedSets };
      });
  
      return updated;
    });
  };
  
  
  
  
  
  
  
  

  const cancelWorkout = () => {
    setSelectedExercises([]);
    setWorkoutStartTime(null);
    setElapsedTime(0);
    localStorage.removeItem('activeWorkout');
    localStorage.removeItem('workoutStartTime');
  };

  const finishWorkout = () => {
    const completedWorkout = {
      name: workoutName || `Workout - ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
      duration: elapsedTime,
      exercises: selectedExercises,
      totalWeight: calculateTotalWeight(selectedExercises),
    };
  
    const updatedHistory = [...workoutHistory, completedWorkout];
    setWorkoutHistory(updatedHistory);
    localStorage.setItem('workoutHistory', JSON.stringify(updatedHistory));
  
    setSelectedExercises([]);
    setWorkoutName('');
    setWorkoutStartTime(null);
    localStorage.removeItem('activeWorkout');
    localStorage.removeItem('workoutStartTime');
  };
  

  const handleDeleteWorkout = (indexToDelete) => {
    const updated = workoutHistory.filter((_, idx) => idx !== indexToDelete);
    setWorkoutHistory(updated);
    localStorage.setItem('workoutHistory', JSON.stringify(updated));
  };
  


  function getWorkingSetNumber(sets, currentIndex) {
    let count = 0;
    for (let i = 0; i <= currentIndex; i++) {
      if (!['Warm-Up', 'Drop Set', 'Failure'].includes(sets[i].tag)) {
        count++;
      }
    }
    return count;
  }
  

  return (
    <div className="text-white bg-black min-h-screen p-4 pb-24">
      {floatingRest && (
        <RestFloatingTimer
          duration={floatingRest.duration}
          onComplete={() => setFloatingRest(null)}
        />
      )}

      {selectedExercises.length === 0 ? (
        <>
          <button
            onClick={() => setShowPicker(true)}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded text-lg font-bold mb-4"
          >
            Start Custom Workout
          </button>

          <button
            onClick={() => navigate('/premade')}
            className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded text-lg font-bold mb-4"
          >
            Premade Workouts
          </button>

          <button
            onClick={() => setShowPastWorkouts(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded text-lg font-bold mb-4"
          >
            See Past Workouts
          </button>

          <button
            onClick={() => setShowPicker('edit')}
            className="w-full bg-yellow-600 hover:bg-yellow-700 py-3 rounded text-lg font-bold mb-4"
          >
            Exercises
          </button>



          {showPastWorkouts && (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-bold">Your Past Workouts</h2>
                <button onClick={() => setShowPastWorkouts(false)} className="text-red-400 text-xl">✖</button>
              </div>

              {workoutHistory.length === 0 ? (
                <p className="text-gray-400">No past workouts saved.</p>
              ) : (
                workoutHistory.map((workout, index) => (
                  <div key={index} className="bg-gray-800 text-white p-4 rounded-lg mb-4 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold">{workout.name || `Workout ${index + 1}`}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(workout.timestamp).toLocaleDateString()} • {new Date(workout.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-gray-400">
                          Duration: {workout.duration || 'N/A'} • Total Weight: {workout.totalWeight || 0} lbs
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(workout))}
                          className="text-blue-400 hover:text-blue-500 text-sm"
                        >
                          Share
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(index)}
                          className="text-red-400 hover:text-red-500 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      {workout.exercises.map((ex, idx) => (
                        <div key={idx} className="mb-2">
                          <p className="font-semibold">{ex.name}</p>
                          {ex.sets.map((set, i) => (
                            <p key={i} className="text-gray-300 ml-4">
                              {set.tag ? `${set.tag}` : `Set ${i + 1}`} — {set.reps} reps @ {set.weight} lbs
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </>
      ) : (
        
        <>
          <p className="text-sm text-gray-400 mb-2">
            Workout Time: <span className="text-white">{formatTime(elapsedTime)}</span>
          </p>

          <input
            type="text"
            placeholder="Workout Name (optional)"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          />

          {selectedExercises.map((exercise, exerciseIdx) => (
            <div key={exerciseIdx} className="mb-6 bg-gray-800 p-4 rounded relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{exercise.name}</h3>
                {exercise.note && (
                  <p className="text-sm text-yellow-300 mt-1 italic">{exercise.note}</p>
                )}

                <button
                  onClick={() =>
                    setOptionsOpen(optionsOpen === exerciseIdx ? null : exerciseIdx)
                  }
                  className="text-gray-400 hover:text-white"
                >
                  ⋯
                </button>
                {optionsOpen === exerciseIdx && (
                  <div className="absolute right-4 top-10 bg-gray-900 border border-gray-700 p-2 rounded shadow z-10">
                    <button
                      onClick={() => { setShowNoteModal(exerciseIdx); setOptionsOpen(null); }}
                      className="block w-full text-left text-sm text-yellow-300 hover:text-yellow-400"
                    >
                      📝 Add Notes
                    </button>
                    <button
                      onClick={() => { setShowRestTimer(exerciseIdx); setOptionsOpen(null); }}
                      className="block w-full text-left text-sm text-blue-300 hover:text-blue-400 mt-1"
                    >
                      ⏱ Set Rest Timer
                    </button>
                    <button
                      onClick={() => {
                        const updated = [...selectedExercises];
                        updated.splice(exerciseIdx, 1);
                        setSelectedExercises(updated);
                        setOptionsOpen(null);
                      }}
                      className="block w-full text-left text-sm text-red-400 hover:text-red-500 mt-1"
                    >
                      ❌ Remove Exercise
                    </button>
                  </div>
                )}
              </div>

              {(exercise.sets || []).map((set, setIdx) => (
                <div key={setIdx} className="flex items-center gap-2 mb-2">
                  <div className="relative w-14">
  <button
    onClick={() => setActiveSetTag({ exerciseIdx, setIdx })}
    className="text-sm text-gray-400 text-left w-full"
  >
    {set.tag === 'Warm-Up'
      ? 'WU'
      : set.tag === 'Drop Set'
      ? 'DS'
      : set.tag === 'Failure'
      ? 'F'
      : `Set ${getWorkingSetNumber(exercise.sets, setIdx)}`}
  </button>



  {activeSetTag &&
    activeSetTag.exerciseIdx === exerciseIdx &&
    activeSetTag.setIdx === setIdx && (
      <div className="absolute left-0 top-6 bg-gray-800 border border-gray-700 p-2 rounded shadow z-30 w-32">
        {['Warm-Up', 'Drop Set', 'Failure', ''].map((tagOption) => (
          <button
            key={tagOption || 'None'}
            onClick={() => {
              updateSetValue(exerciseIdx, setIdx, 'tag', tagOption);
              setActiveSetTag(null);
            }}
            className="block w-full text-left text-sm py-1 hover:bg-gray-700 text-white"
          >
            {tagOption || 'None'}
          </button>
        ))}
      </div>
    )}
</div>

      


                  {cardioExercises.includes(exercise.name) ? (
                    <>
                      <input
                        type="text"
                        placeholder="Distance (mi/km)"
                        value={set.distance || ''}
                        onChange={(e) =>
                          updateSetValue(exerciseIdx, setIdx, 'distance', e.target.value)
                        }
                        className="bg-gray-700 rounded px-2 py-1 text-sm w-24"
                      />
                      <input
                        type="text"
                        placeholder="Time (min)"
                        value={set.time || ''}
                        onChange={(e) =>
                          updateSetValue(exerciseIdx, setIdx, 'time', e.target.value)
                        }
                        className="bg-gray-700 rounded px-2 py-1 text-sm w-24"
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        placeholder="lbs"
                        value={set.weight}
                        onChange={(e) =>
                          updateSetValue(exerciseIdx, setIdx, 'weight', e.target.value)
                        }
                        className="bg-gray-700 rounded px-2 py-1 text-sm w-20"
                      />
                      <input
                        type="number"
                        placeholder="reps"
                        value={set.reps}
                        onChange={(e) =>
                          updateSetValue(exerciseIdx, setIdx, 'reps', e.target.value)
                        }
                        className="bg-gray-700 rounded px-2 py-1 text-sm w-20"
                      />
                    </>
                  )}

                  <button
                    onClick={() => toggleComplete(exerciseIdx, setIdx)}
                    className={`text-lg px-3 py-1 rounded font-bold ${
                      set.completed ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    ✔
                  </button>


                  <button
                    onClick={() => removeSet(exerciseIdx, setIdx)}
                    className="text-red-400 text-lg px-2"
                  >
                    ✖
                  </button>
                </div>
              ))}

              <button
                onClick={() => addSet(exerciseIdx)}
                className="text-sm text-green-400 hover:text-green-500"
              >
                + Add Set
              </button>
            </div>
          ))}

          <button
            onClick={() => setShowPicker(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded mb-2"
          >
            + Add Exercise
          </button>

          <button
            onClick={finishWorkout}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded text-lg font-bold mb-2 focus:outline-none"
          >
            Finish Workout
          </button>


          <button
            onClick={cancelWorkout}
            className="w-full bg-red-700 hover:bg-red-800 py-2 rounded"
          >
            Cancel Workout
          </button>
        </>
      )}

      {showGymModal && <GymScanModal onClose={() => setShowGymModal(false)} />}

      
{selectedExercises.length > 0 && (
  <button
    onClick={() => setShowGymModal(true)}
    className="fixed bottom-20 left-4 bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-full shadow-md"
    title="Gym Scan-In"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  </button>
)}



  <button
    onClick={() => setShowGymModal(true)}
    className="fixed bottom-20 left-4 bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-full shadow-md z-50"
    title="Gym Scan-In"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  </button>



  <button
    onClick={() => setShowGymModal(true)}
    className="fixed bottom-20 left-4 bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-full shadow-md z-50"
    title="Gym Scan-In"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  </button>


{showPicker && (
        <ExercisePickerModal
        selectedExercises={selectedExercises}
        setSelectedExercises={setSelectedExercises}
        onClose={() => setShowPicker(false)}
        exerciseList={exerciseList}
      />
      
      )}


      {showNoteModal !== null && (
        <NoteModal
          exercise={selectedExercises[showNoteModal]}
          onClose={() => setShowNoteModal(null)}
        />
      )}

      {showRestTimer !== null && (
        <RestTimerModal
          exercise={selectedExercises[showRestTimer]}
          restDurations={restDurations}
          setRestDurations={setRestDurations}
          onClose={() => setShowRestTimer(null)}
        />
      )}

      {showExercisesModal && (
        <ExercisesModal
          exercises={customExercises}
          setExercises={setCustomExercises}
          onClose={() => setShowExercisesModal(false)}
        />
      )}




{showRestPopup && (
  <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-[9999] text-center">
    ⏱ Time for your next set!
  </div>
)}


    </div>
  );
}
