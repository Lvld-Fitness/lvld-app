// 🌟 React and Utility Imports
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// 🧩 Modal Components
import ExercisePickerModal from './ExercisePickerModal';
import NoteModal from './NoteModal';
import RestTimerModal from './RestTimerModal';
import RestFloatingTimer from './RestFloatingTimer';
import GymScanModal from './GymScanModal_LocalV9';
import WorkoutSummaryPopup from './WorkoutSummaryPopup';
import { TITLE_ACHIEVEMENTS } from './titleCriteria'; // 🏷️ Title unlock rules
import { updateRankingAfterWorkout } from './updateRankingAfterWorkout';





// 📋 Default Exercise List
import defaultExercises from './exerciseList';

// ⏱️ Custom Timer Hooks
import { useRestTimer } from './RestTimerContext';
import { useGlobalRestTimer } from './GlobalRestTimerContext';

// 📆 Calendar Imports
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './WorkoutCalendarStyles.css';

// 🔥 Firebase Imports
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, addDoc as firebaseAddDoc, collection as firebaseCollection, arrayUnion, serverTimestamp, } from 'firebase/firestore';
import { differenceInCalendarDays } from 'date-fns'; // install with: npm i date-fns


// 🔽 WorkoutTab Component Starts
export default function WorkoutTab() {
  // 🧠 State Variables for UI and Data
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showGymModal, setShowGymModal] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const lbsRefs = useRef({});
  const repsRefs = useRef({});
  const checkRefs = useRef({});
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(null);
  const [showRestTimer, setShowRestTimer] = useState(null);
  const [floatingRest, setFloatingRest] = useState(null);
  const [userWeight, setUserWeight] = useState(0);
  const [restDurations, setRestDurations] = useState(() => {
    const saved = localStorage.getItem('exerciseRestDurations');
    return saved ? JSON.parse(saved) : {};



    
    


    
  });

  // ⚙️ More Control Toggles
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [historyOptionsOpen, setHistoryOptionsOpen] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  const [activeSetTag, setActiveSetTag] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [showPastWorkouts, setShowPastWorkouts] = useState(false);
  const [showRestPopup, setShowRestPopup] = useState(false);
  const [replaceIdx, setReplaceIdx] = useState(null);
  const [pendingRestTrigger, setPendingRestTrigger] = useState(false);
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  
  



  // 🔁 Context Functions
  const { startRestTimer } = useRestTimer();
  const { startGlobalRestTimer } = useGlobalRestTimer();

  // 🔀 Navigation + Route State
  const navigate = useNavigate();
  const location = useLocation();

  // 📡 Fetch Cloud Data on Mount
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();

        // Sync online -> local
        if (data.workoutHistory) {
          setWorkoutHistory(data.workoutHistory);
          localStorage.setItem('workoutHistory', JSON.stringify(data.workoutHistory));
        }

        if (data.savedExercises) {
          setExerciseList(data.savedExercises);
          localStorage.setItem('savedExercises', JSON.stringify(data.savedExercises));
        }

        if (data.weight) setUserWeight(parseFloat(data.weight));

        setTotalWeight(data.totalWeight || 0);
        setTotalDistance(data.totalDistance || 0);
        
      }
    };

    fetchUserData();
  }, [auth.currentUser]);

  // 📅 Weekly Streak Calculator
  const calculateWeeklyStreak = (history) => {
    const now = new Date();
    const recentDays = new Set();

    history.forEach(workout => {
      if (workout.timestamp) {
        const workoutDate = new Date(workout.timestamp);
        const daysAgo = (now - workoutDate) / (1000 * 60 * 60 * 24);
        if (daysAgo <= 7) {
          recentDays.add(workoutDate.toISOString().split('T')[0]);
        }
      }
    });

    return recentDays.size;
  };

// 🔁 Load premade workout from navigation state
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

// ⏰ Show popup when rest timer ends (across tabs)
useEffect(() => {
  const checkForRestAlert = () => {
    const flag = localStorage.getItem('rest-timer-alert');
    if (flag === 'true') {
      setShowRestPopup(true);
      localStorage.setItem('rest-timer-alert', 'false');
      setTimeout(() => setShowRestPopup(false), 3000);
    }
  };
  const interval = setInterval(checkForRestAlert, 1000);
  return () => clearInterval(interval);
}, []);

// 💾 Load active workout and history from localStorage on mount
useEffect(() => {
  const active = localStorage.getItem('activeWorkout');
  const start = localStorage.getItem('workoutStartTime');
  const history = localStorage.getItem('workoutHistory');
  const savedName = localStorage.getItem('currentWorkoutName');

  if (active) setSelectedExercises(JSON.parse(active));
  if (start) setWorkoutStartTime(Number(start));
  if (history) setWorkoutHistory(JSON.parse(history));
  if (savedName) setWorkoutName(savedName); // 👈 this is the one you're adding
}, []);

// 🕐 Timer tracking during an active workout
useEffect(() => {
  if (workoutStartTime !== null) {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }
}, [workoutStartTime]);

// 🧠 Save current workout to Firebase as it updates
useEffect(() => {
  const updateActiveWorkout = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        activeWorkout: selectedExercises.length > 0 ? selectedExercises : null,
        workingOut: selectedExercises.length > 0,
      });
    }
  };

  updateActiveWorkout();
}, [selectedExercises]);



// 🧠 Save current workout to localStorage as it updates
useEffect(() => {
  if (selectedExercises.length > 0) {
    localStorage.setItem('activeWorkout', JSON.stringify(selectedExercises));
    if (!workoutStartTime) {
      const now = Date.now();
      setWorkoutStartTime(now);
      localStorage.setItem('workoutStartTime', now.toString());
    }

    // 🆕 NEW: Update Firestore status
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      updateDoc(userRef, { workingOut: true });
    }
  }
}, [selectedExercises]);

// ⏱️ Trigger global rest timer from completed sets
useEffect(() => {
  if (pendingRestTrigger) {
    startGlobalRestTimer();
    setPendingRestTrigger(false);
  }
}, [pendingRestTrigger]);

// ☁️ Save exercise list to Firebase and localStorage
const saveExercisesToFirebase = async (newList) => {
  setExerciseList(newList);
  localStorage.setItem('savedExercises', JSON.stringify(newList));
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { savedExercises: newList });
  }
};

// ✏️ Rename an exercise and sync changes online
const renameExercise = async (oldName, newName) => {
  const updated = exerciseList.map(ex =>
    ex.name === oldName ? { ...ex, name: newName } : ex
  );
  await saveExercisesToFirebase(updated);
};

// ❌ Delete an exercise and sync changes online
const deleteExercise = async (nameToDelete) => {
  const updated = exerciseList.filter(ex => ex.name !== nameToDelete);
  await saveExercisesToFirebase(updated);
};

// List of Body-Weight Exercises
const bodyweightExercises = ['Pull-Ups', 'Chin-Ups', 'Pull-Ups (Wide Grip)', 'Push-Ups', 'Push-Ups (Wide Grip)', 'Diamond Push-Ups', 'Dips'];


// 🏃 List of built-in cardio exercises
const staticCardio = [
  'Air Bike Sprint', 'Battle Ropes', 'Battle Ropes (Alternating)', 'Bear Crawl', 'Biking (Spin Bike)',
  'Cycling', 'Elliptical', 'High Knees', 'Outdoor Run', 'Outdoor Walk', 'Run', 'Walk',
  'Indoor Running', 'Outdoor Running', 'Rowing Machine', 'Rowing Sprint', 'Shadow Boxing',
  'Sled Pull', 'Sled Push', 'Stairmaster', 'Treadmill Run', 'Treadmill Sprint', 'Treadmill Walk', 'Soccer', 'VR Gaming', 'Skateboarding',
  'Long Boarding'
];

// Define exerciseList First
const [exerciseList, setExerciseList] = useState(() => {
  const saved = localStorage.getItem('savedExercises');
  return saved ? JSON.parse(saved) : defaultExercises;
});
// 📋 Combine built-in and user-created cardio exercises
const userCardio = exerciseList
  .filter(e => e.type === 'cardio')
  .map(e => e.name);

const cardioExercises = [...staticCardio, ...userCardio];

// 🧮 Format seconds into MM:SS format
const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

// 🏋️ Calculate total weight lifted in a workout
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

// ➕ Adds a new set to an exercise at a specific index
const addSet = (exerciseIdx) => {
  setSelectedExercises((prev) => {
    const updated = [...prev];
    const exercise = updated[exerciseIdx];
    if (!exercise.sets) exercise.sets = [];
    const nextId = exercise.sets.length + 1;

    // Create new set
    const newSet = {
      id: nextId,
      weight: bodyweightExercises.includes(exercise.name) ? userWeight : '',
      reps: '',
      completed: false,
      tag: '',
      modifier: 0,
    };

    // 🛠️ Ensure weight is correctly calculated even without modifier change
    if (bodyweightExercises.includes(exercise.name)) {
      newSet.weight = userWeight;
    }

    exercise.sets = [...exercise.sets, newSet];
    return updated;
  });
};


// 🔄 Updates a specific field (like weight or reps) for a set
const updateSetValue = (exerciseIdx, setIdx, field, value) => {
  setSelectedExercises((prev) => {
    const updated = [...prev];
    updated[exerciseIdx].sets[setIdx][field] = value;

    // Auto-calculate weight if bodyweight + modifier
    if (field === 'modifier' && bodyweightExercises.includes(updated[exerciseIdx].name)) {
      const mod = parseFloat(value) || 0;
      updated[exerciseIdx].sets[setIdx].weight = parseFloat(userWeight) + mod;
    }
    return updated;
  });

};



// ❌ Removes a specific set; if it was the last set in the exercise, it removes the whole exercise
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

// ✅ Toggles a set as complete/incomplete, and triggers a rest timer if completed
const toggleComplete = (exerciseIdx, setIdx) => {
  setSelectedExercises((prev) => {
    const updated = prev.map((exercise, i) => {
      if (i !== exerciseIdx) return exercise;

      const updatedSets = exercise.sets.map((set, j) => {
        if (j !== setIdx) return set;
        return { ...set, completed: !set.completed };
      });

      const justCompleted = !exercise.sets[setIdx].completed;
      if (justCompleted) {
        const duration = restDurations[exercise.name] || 30;
        const payload = {
          duration,
          startTime: Date.now(),
          exerciseName: exercise.name,
        };
        setFloatingRest(payload);
        localStorage.setItem('floatingRest', JSON.stringify(payload));
        localStorage.setItem('rest-timer-alert', 'false');
        setPendingRestTrigger(true); // this triggers startGlobalRestTimer()
      }
      

      return { ...exercise, sets: updatedSets };
    });

    return updated;
  });
};

// 🛑 Cancels the current workout session and clears all related local state and storage
const cancelWorkout = async () => {
  setSelectedExercises([]);
  setWorkoutStartTime(null);
  setElapsedTime(0);
  localStorage.removeItem('activeWorkout');
  localStorage.removeItem('workoutStartTime');
  localStorage.removeItem('currentWorkoutName');

  const user = auth.currentUser;
  if (user) {
    await updateDoc(doc(db, 'users', user.uid), { workingOut: false });
  }
};



const calculateDistance = (exercises) => {
  let totalDistance = 0;

  exercises.forEach(ex => {
    if (ex.sets) {
      ex.sets.forEach(set => {
        const dist = parseFloat(set.distance) || 0;
        if (dist > 0) {
          totalDistance += dist;
        }
      });
    }
  });

  return parseFloat(totalDistance.toFixed(2)); // Ensures precision and no accidental updates
};



const finishWorkout = async () => {
  const totalWeight = calculateTotalWeight(selectedExercises);
  const totalDistance = calculateDistance(selectedExercises);

  const cardioSets = selectedExercises
    .filter(e => cardioExercises.includes(e.name))
    .flatMap(e => e.sets || []);

  const topCardio = cardioSets.reduce((best, set) => {
    const distance = parseFloat(set.distance || 0);
    const time = parseFloat(set.time || 0);
    const speed = time > 0 ? distance / time : 0;
    return (speed > best.speed) ? { distance, time, speed } : best;
  }, { distance: 0, time: 0, speed: 0 });

  const allSets = selectedExercises.flatMap(ex =>
    (ex.sets || []).map(set => ({ ...set, exerciseName: ex.name }))
  );
  
  const topSets = [...allSets]
    .filter(set => parseFloat(set.weight) > 0 && parseInt(set.reps) > 0)
    .sort((a, b) =>
      (parseFloat(b.weight) * parseInt(b.reps)) - (parseFloat(a.weight) * parseInt(a.reps))
    )
    .slice(0, 3);
  

    const completedWorkout = {
      name: workoutName?.trim() || "Today's Workout",
      timestamp: Date.now(),
      duration: elapsedTime,
      exercises: selectedExercises,
      totalWeight,
      totalDistance,
    };
    

  const lastSets = JSON.parse(localStorage.getItem('lastUsedSets') || '{}');
  selectedExercises.forEach(ex => {
    if (ex.sets?.length > 0) {
      lastSets[ex.name] = ex.sets;
    }
  });
  localStorage.setItem('lastUsedSets', JSON.stringify(lastSets));

  const updatedHistory = [completedWorkout, ...workoutHistory].splice(0, 10000);
  setWorkoutHistory(updatedHistory);
  localStorage.setItem('workoutHistory', JSON.stringify(updatedHistory));

  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    let lastWorkoutDate = userData.lastWorkoutDate ? new Date(userData.lastWorkoutDate) : null;
    let newStreak = userData.workoutStreak || 0;

    const today = new Date();
    const dayDiff = lastWorkoutDate ? Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24)) : null;
    if (dayDiff !== null && dayDiff > 7) newStreak = 0;
    newStreak += 1;

    await updateDoc(userRef, {
      workoutHistory: updatedHistory,
      totalWeight: (userData.totalWeight || 0) + totalWeight,
      totalDistance,
      lastWorkoutDate: today.toISOString(),
      workoutStreak: newStreak,
      activeWorkout: [], // Clear active workout as the workout is finished
      workingOut: false // Mark the user as not working out
    });

    // 🏆 Update Ranking
{/*try {
  await updateRankingAfterWorkout(user.uid, {
    weightLifted: totalWeight,
    distance: totalDistance,
  });
  console.log("Ranking updated successfully.");
} catch (err) {
  console.error("Error updating ranking:", err);
}
*/}




// 🔓 Title Achievements Check
const unlocked = new Set(userData.unlockedTitles || []);
TITLE_ACHIEVEMENTS.forEach((achievement) => {
  const { title, condition } = achievement;

  if (typeof condition === "function") {
    if (condition({
      workoutHistory: updatedHistory,
      totalDistance,
      totalWeight,
      singleWorkoutWeight: totalWeight,
    })) {
      unlocked.add(title);
    }
  } else {
    console.warn(`Invalid condition for title: ${title}`);
  }
});



    await updateDoc(userRef, {
      unlockedTitles: Array.from(unlocked),
    });

    const newlyUnlocked = TITLE_ACHIEVEMENTS
    .filter((achievement) => {
      const { title, condition } = achievement;
      if (typeof condition !== "function") {
        console.error(`Invalid condition for title: ${title}`);
        return false;
      }
  
      return (
        condition({
          workoutHistory: updatedHistory,
          totalDistance,
          totalWeight,
          singleWorkoutWeight: totalWeight,
        }) && !userData.unlockedTitles?.includes(title)
      );
    })
    .map(({ title }) => title);
  



//Update Team Challenges
const finishedExercises = selectedExercises;

// 1. Get the user's team ID
const teamId = userSnap.exists() ? userSnap.data().teamId : null;

if (teamId) {
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);
  if (teamSnap.exists()) {
    const teamData = teamSnap.data();
    const updatedChallenges = [...(teamData.challenges || [])];

    // 2. Loop over finished exercises
    for (const ex of finishedExercises) {
      const matchingChallenge = updatedChallenges.find(
  (ch) =>
    ex.name.toLowerCase().includes(ch.exercise.toLowerCase()) ||
    ch.exercise.toLowerCase().includes(ex.name.toLowerCase())
);


      if (matchingChallenge) {
        // Update reps if applicable
        if (matchingChallenge.goalReps) {
          const totalReps = ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
          matchingChallenge.progressReps =
            (matchingChallenge.progressReps || 0) + totalReps;
        }

        // Update distance if it's a distance-based exercise
        if (matchingChallenge.goalDistance) {
          const totalDistance = (ex.sets || []).reduce((sum, set) => {
            return sum + (parseFloat(set.distance) || 0);
          }, 0);

          matchingChallenge.progressDistance =
            (matchingChallenge.progressDistance || 0) + totalDistance;
        }


        // Update weight lifted
        if (matchingChallenge.goalWeight) {
          const totalWeight = ex.sets.reduce(
            (sum, s) => sum + ((s.reps || 0) * (s.weight || 0)),
            0
          );
          matchingChallenge.progressWeight =
            (matchingChallenge.progressWeight || 0) + totalWeight;
        }
      }
    }

    // 3. Write updated challenges back to Firestore
    await updateDoc(teamRef, { challenges: updatedChallenges });
  }
}



    for (const title of newlyUnlocked) {
      await firebaseAddDoc(firebaseCollection(db, 'posts'), {
        userId: 'dKdmdsLKsTY51nFmqHjBWepZgDp2', // LVLD account UID
        content: `🎉 Congrats ${userData.handle || 'user'} on unlocking the title "${title}"!\nKeep grinding! 💪`,
        timestamp: serverTimestamp(),  // Ensure it's the latest
        reactions: {},
        deleted: false,
      });
      
    }
  }



const didLift = selectedExercises.some(ex =>
  ex.sets?.some(set => parseFloat(set.weight || 0) > 0)
);
const didCardio = topCardio?.distance > 0;

let fact = "YOU ARE A BEAST!"; // 💥 Static motivational message — no fetch call


  const formattedExercises = selectedExercises.map(ex => {
    const sets = ex.sets || [];
    const maxPR = Math.max(...sets.map(s => (parseFloat(s.weight || 0) * parseInt(s.reps || 0))));
    const setsWithPR = sets.map(s => ({
      ...s,
      isPR: (parseFloat(s.weight || 0) * parseInt(s.reps || 0)) === maxPR
    }));
    return { ...ex, sets: setsWithPR };
  });

  const postContentLines = [
    `🏋️ ${completedWorkout.name} (${new Date().toLocaleDateString()})`,
    `🔥 Total Weight: ${totalWeight.toLocaleString()} lbs`,
  ];
  
  if (topCardio?.distance > 0) {
    postContentLines.push(`📏 Distance: ${topCardio.distance.toFixed(2)} mi`);
  }
  
  
  // Add full workout breakdown
  selectedExercises.forEach((ex) => {
    postContentLines.push(`\n${ex.name}`);
    ex.sets.forEach((set) => {
      if (set.weight && set.reps) {
        postContentLines.push(`• ${set.weight} lbs × ${set.reps} reps`);
      } else if (set.distance && set.time) {
        postContentLines.push(`• ${set.distance} mi in ${set.time} min`);
      }
    });
  });
  
  await firebaseAddDoc(firebaseCollection(db, 'posts'), {
    userId: user.uid,
    content: postContentLines.join('\n'),
    timestamp: serverTimestamp(),
    reactions: {},
    deleted: false,
    type: 'workout', // ← mark this as a workout post
    exercises: formattedExercises // used by PostCard dropdown
  });
  
  // 🆕 After finishing, mark user as NOT working out
  await updateDoc(doc(db, 'users', user.uid), { workingOut: false });


  setSummaryData({
    name: completedWorkout.name,
    date: new Date().toLocaleDateString(),
    totalWeight,
    topSets,
    topCardio,
    exercises: formattedExercises,
    funFact: fact
  });




  setShowWorkoutSummary(true);
  setSelectedExercises([]);
  setWorkoutName('');
  setWorkoutStartTime(null);
  localStorage.removeItem('activeWorkout');
  localStorage.removeItem('workoutStartTime');
  localStorage.removeItem('currentWorkoutName');
};


// ❌ Deletes a workout from local state and Firebase by index
const handleDeleteWorkout = async (indexToDelete) => {
  const updated = workoutHistory.filter((_, idx) => idx !== indexToDelete);
  setWorkoutHistory(updated);
  localStorage.setItem('workoutHistory', JSON.stringify(updated));

  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      workoutHistory: updated
    });
  }
};

// 🔢 Calculates "working set number" (ignoring warm-ups, drop sets, and failure sets)
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
  // 📦 Main container
  <div className="text-white bg-black min-h-screen p-4 pb-24">

    {/* ⏱️ Floating rest timer if a set is completed */}
    {floatingRest && (
      <RestFloatingTimer
      duration={floatingRest.duration}
      onComplete={() => {
        setFloatingRest(null);
        localStorage.setItem('rest-timer-alert', 'true');
      }}
    />
    
    )}

    {/* 🏁 No workout started — show main options */}
    {selectedExercises.length === 0 ? (
      <>
        {/* 🔘 Start a custom workout */}
        <button
          onClick={() => setShowPicker('new')}
          className="w-full bg-red-500 hover:bg-red-700 py-3 rounded text-lg font-bold mb-4"
        >
          Start Custom Workout
        </button>

        {/* 🔘 Go to premade workouts screen */}
        <button
          onClick={() => navigate('/premade')}
          className="w-full bg-red-500 hover:bg-red-700 py-3 rounded text-lg font-bold mb-4"
        >
          Premade Workouts
        </button>

        {/* 🔘 View past workouts */}
        <button
          onClick={() => setShowPastWorkouts(true)}
          className="w-full bg-red-500 hover:bg-red-700 py-3 rounded text-lg font-bold mb-4"
        >
          Past Workouts
        </button>

        {/* 🔘 Open exercise list editor */}
        <button
          onClick={() => setShowPicker('edit')}
          className="w-full bg-red-500 hover:bg-red-700 py-3 rounded text-lg font-bold mb-4"
        >
          Exercises
        </button>

        {/* 📆 Calendar showing red circles on days with saved workouts */}
        <div className="bg-gray-900 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-bold mb-2 text-center">LVLD Calendar</h2>
          <Calendar
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const formatted = date.toISOString().split('T')[0];
                const workoutDays = workoutHistory.map(w =>
                  new Date(w.timestamp).toISOString().split('T')[0]
                );
                return workoutDays.includes(formatted)
                  ? 'bg-red-500 text-white rounded-full'
                  : 'text-white';
              }
            }}
            onClickDay={(value) => {
              const clickedDate = value.toISOString().split('T')[0];
              const match = workoutHistory.find(w =>
                new Date(w.timestamp).toISOString().split('T')[0] === clickedDate
              );
              if (match) {
                setCalendarWorkoutPopup(match); // 🔍 Show popup with details
              }
            }}
          />
        </div>

        {/* 🏋️‍♂️ Gym scan-in button */}
        <button
          onClick={() => setShowGymModal(true)}
          className="w-full bg-red-500 hover:bg-red-700 py-3 rounded text-lg font-bold mb-4"
        >
          Gym Scan-In
        </button>

        {/* 📜 Past workout modal (if triggered) */}
        {showPastWorkouts && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-bold">Your Past Workouts</h2>
              <button onClick={() => setShowPastWorkouts(false)} className="text-red-400 text-xl">✖</button>
            </div>

            {/* 🧾 Show message or list of previous workouts */}
            {workoutHistory.length === 0 ? (
              <p className="text-gray-400">No past workouts saved.</p>
            ) : (
              workoutHistory.map((workout, index) => (
                <div key={index} className="bg-gray-800 text-white p-4 rounded-lg mb-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      {/* 📝 Workout summary */}
                      <p className="text-lg font-semibold">{workout.name || `Workout ${index + 1}`}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(workout.timestamp).toLocaleDateString()} • {new Date(workout.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-400">
                        • Total Weight: {workout.totalWeight || 0} lbs
                      </p>
                    </div>

                    {/* ✉️ Share & 🗑️ Delete workout */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => {
                          const shareText = `
Workout: ${workout.name}
Date: ${new Date(workout.timestamp).toLocaleString()}
Total Weight: ${workout.totalWeight || 0} lbs

Exercises:
${workout.exercises.map(ex => {
  const isCardio = cardioExercises.includes(ex.name);
  const setLines = ex.sets.map((set, idx) => {
    if (isCardio) {
      return `${set.distance || 0} mi in ${set.time || 0} min`;
    } else {
      return `${set.weight || 0} lbs x ${set.reps || 0} reps`;
    }
  }).join('\n ');
  return `- ${ex.name}:\n ${setLines}`;
}).join('\n')}

                          `.trim();

                          if (navigator.share) {
                            navigator.share({ title: 'LVLD Workout', text: shareText });
                          } else {
                            navigator.clipboard.writeText(shareText);
                            alert("Workout copied to clipboard!");
                          }
                        }}
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

                  {/* 🏋️ List of exercises and sets for that workout */}
                  <div className="mt-2 text-sm">
                  {workout.exercises.map((ex, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="font-semibold">{ex.name}</p>
                      {ex.sets.map((set, i) => (
                        <p key={i} className="text-gray-300 ml-4">
                          {cardioExercises.includes(ex.name)
                            ? `${set.distance || 0} mi in ${set.time || 0} min`
                            : `${set.tag ? `${set.tag} • ` : ''}${set.weight || 0} lbs x ${set.reps || 0} reps`}
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
  // ✅ This block shows when a workout is in progress (exercises have been added)
  <>
    {/* ⏱️ Display live workout timer */}
    <p className="text-lg text-gray-400 mb-2">
      Workout Time: <span className="text-white">{formatTime(elapsedTime)}</span>
    </p>

    {/* 📝 Input to name the current workout */}
    <input
      type="text"
      placeholder="Workout Name (optional)"
      value={workoutName}
      onChange={(e) => {
        setWorkoutName(e.target.value);
        localStorage.setItem('currentWorkoutName', e.target.value);
      }}      
      className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
    />

    {/* 🏋️ Loop through selected exercises */}
    {selectedExercises.map((exercise, exerciseIdx) => (
      <div key={exerciseIdx} className="mb-6 bg-gray-800 p-4 rounded relative">
        {/* 🏷️ Exercise name and control menu */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{exercise.name}</h3>

          {/* ✏️ Show note if added */}
          {exercise.note && (
            <p className="text-sm text-yellow-300 mt-1 italic">{exercise.note}</p>
          )}

          {/* ⋯ More options menu toggle */}
          <button
            onClick={() =>
              setOptionsOpen(optionsOpen === exerciseIdx ? null : exerciseIdx)
            }
            className="text-gray-400 hover:text-white"
          >
            ⋯
          </button>

          {/* 📋 Options popup for this exercise */}
          {optionsOpen === exerciseIdx && (
            <div className="absolute right-4 top-10 bg-gray-900 border border-gray-700 p-2 rounded shadow z-10">
              <button
                onClick={() => {
                  setShowNoteModal(exerciseIdx);
                  setOptionsOpen(null);
                }}
                className="block w-full text-left text-sm text-yellow-300 hover:text-yellow-400"
              >
                📝 Add Notes
              </button>
              <button
                onClick={() => {
                  setShowRestTimer(exerciseIdx);
                  setOptionsOpen(null);
                }}
                className="block w-full text-left text-sm text-blue-300 hover:text-blue-400 mt-1"
              >
                ⏱ Set Rest Timer
              </button>
              <button
                onClick={() => {
                  setShowPicker({ replaceIdx: exerciseIdx });
                }}
                className="block w-full text-left text-sm text-purple-300 hover:text-purple-400 mt-1"
              >
                🔁 Replace Exercise
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

        {/* 🔄 Loop through sets within this exercise */}
        {(exercise.sets || []).map((set, setIdx) => (
  <div key={setIdx} className="flex items-center gap-2 mb-2">
    {/* 🔖 Set tag button */}
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

      {/* 🏷️ Tag selector dropdown */}
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
  


{!cardioExercises.includes(exercise.name) && (
  <>
    {/* 🔁 Bodyweight Exercises: show only +/- lbs and reps */}
    {bodyweightExercises.includes(exercise.name) ? (
      <>
        {/* Modifier (+/- lbs) */}
        <input
          type="number"
          placeholder="+/- lbs"
          value={set.modifier || ''}
          onChange={(e) => updateSetValue(exerciseIdx, setIdx, 'modifier', e.target.value)}
          className="bg-gray-700 rounded px-2 py-1 text-sm w-16"
        />

        {/* Reps */}
        <input
          ref={(el) => (repsRefs.current[`${exerciseIdx}-${setIdx}`] = el)}
          type="number"
          placeholder="Reps"
          value={set.reps}
          onChange={(e) => updateSetValue(exerciseIdx, setIdx, 'reps', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') checkRefs.current[`${exerciseIdx}-${setIdx}`]?.click();
          }}
          className="bg-gray-700 rounded px-2 py-1 text-sm w-16"
        />
      </>
    ) : (
      <>
        {/* LBS */}
        <input
          ref={(el) => (lbsRefs.current[`${exerciseIdx}-${setIdx}`] = el)}
          type="number"
          placeholder={(() => {
            const last = JSON.parse(localStorage.getItem('lastUsedSets') || '{}')[exercise.name]?.[setIdx];
            return last?.weight ? `${last.weight} lbs` : 'lbs';
          })()}
          value={set.weight}
          onChange={(e) => updateSetValue(exerciseIdx, setIdx, 'weight', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') repsRefs.current[`${exerciseIdx}-${setIdx}`]?.focus();
          }}
          className="bg-gray-700 rounded px-2 py-1 text-sm w-16"
        />

        {/* Reps */}
        <input
          ref={(el) => (repsRefs.current[`${exerciseIdx}-${setIdx}`] = el)}
          type="number"
          placeholder={(() => {
            const last = JSON.parse(localStorage.getItem('lastUsedSets') || '{}')[exercise.name]?.[setIdx];
            return last?.reps ? `${last.reps} reps` : 'reps';
          })()}
          value={set.reps}
          onChange={(e) => updateSetValue(exerciseIdx, setIdx, 'reps', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') checkRefs.current[`${exerciseIdx}-${setIdx}`]?.click();
          }}
          className="bg-gray-700 rounded px-2 py-1 text-sm w-16"
        />
      </>
    )}
  </>
)}


    {/* ✅ Check */}
    <button
      ref={(el) => (checkRefs.current[`${exerciseIdx}-${setIdx}`] = el)}
      onClick={() => toggleComplete(exerciseIdx, setIdx)}
      className={`text-lg px-3 py-1 rounded font-bold ${
        set.completed ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
      }`}
    >
      ✔
    </button>

    {/* Cardio Inputs or Delete Button */}
    {cardioExercises.includes(exercise.name) ? (
      <>
        <input
          type="text"
          placeholder="Distance (mi/km)"
          value={set.distance || ''}
          onChange={(e) => updateSetValue(exerciseIdx, setIdx, 'distance', e.target.value)}
          className="bg-gray-700 rounded px-2 py-1 text-sm w-24"
        />
        <input
          type="text"
          placeholder="Time (min)"
          value={set.time || ''}
          onChange={(e) => updateSetValue(exerciseIdx, setIdx, 'time', e.target.value)}
          className="bg-gray-700 rounded px-2 py-1 text-sm w-24"
        />
        <button
          onClick={() => removeSet(exerciseIdx, setIdx)}
          className="text-red-400 text-lg px-2"
        >
          ✖
        </button>
      </>
    ) : (
      <button
        onClick={() => removeSet(exerciseIdx, setIdx)}
        className="text-red-400 text-lg px-2"
      >
        ✖
      </button>
    )}
  </div>
))}

{/* 🔢 Totals for non-cardio exercises */}
{!cardioExercises.includes(exercise.name) && (
  <div className="mt-2 text-sm text-gray-300">
    Total Reps:{" "}
    <span className="text-white font-bold">
      {exercise.sets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0)}
    </span>{" "}
    | Total Weight:{" "}
    <span className="text-white font-bold">
      {exercise.sets.reduce(
        (sum, s) => sum + ((parseInt(s.reps) || 0) * (parseInt(s.weight) || 0)),
        0
      )}{" "}
      lbs
    </span>
  </div>
)}




{/* ➕ Add a new set to this exercise */}
<button
  onClick={() => addSet(exerciseIdx)}
  className="text-sm text-green-400 hover:text-green-500"
>
  + Add Set
</button>
</div>
))}

{/* ➕ Add new exercise to workout */}
<button
  onClick={() => setShowPicker(true)}
  className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded mb-2"
>
  + Add Exercise
</button>

{/* ✅ Finish workout button */}
<button
  onClick={() => {
    if (window.confirm('Are you sure you want to finish and save this workout?')) {
      finishWorkout();
    }
  }}  
  className="w-full bg-green-600 hover:bg-green-700 py-3 rounded text-lg font-bold mb-2 focus:outline-none"
>
  Finish Workout
</button>

{/* ❌ Cancel workout button */}
<button
  onClick={() => {
    if (window.confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      cancelWorkout();
    }
  }}  
  className="w-full bg-red-700 hover:bg-red-800 py-2 rounded"
>
  Cancel Workout
</button>
</>
)}

{/* 🏋️ Gym scan-in modal */}
{showGymModal && <GymScanModal onClose={() => setShowGymModal(false)} />}

{/*📋 Modal for selecting exercises (appears when user clicks "+ Add Exercise" or "Start Custom Workout")*/}
{showPicker && (
  <ExercisePickerModal
    selectedExercises={selectedExercises}
    setSelectedExercises={setSelectedExercises}
    showPicker={showPicker} // 👈 ADD THIS
    onClose={() => setShowPicker(false)}
    exerciseList={exerciseList}
  />
)}


{/* 📝 Modal for adding/editing notes for a specific exercise */}
{showNoteModal !== null && (
  <NoteModal
    exercise={selectedExercises[showNoteModal]}
    onClose={() => setShowNoteModal(null)}
  />
)}

{/* ⏱ Modal for setting a custom rest timer for a specific exercise */}
{showRestTimer !== null && (
  <RestTimerModal
    exercise={selectedExercises[showRestTimer]}
    restDurations={restDurations}
    setRestDurations={setRestDurations}
    onClose={() => setShowRestTimer(null)}
  />
)}

{/* ⚙️ Modal for managing saved exercises (rename/delete existing exercises) */}
{showExercisesModal && (
  <ExercisesModal
    exercises={customExercises}
    setExercises={setCustomExercises}
    onClose={() => setShowExercisesModal(false)}
  />
)}

 {/* 🔔 Floating rest timer notification (pops up when rest ends) */}
{showRestPopup && (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-[9999] text-center">
    ⏱ Time for your next set!
  </div>
)}

{showWorkoutSummary && (
  <WorkoutSummaryPopup
    summaryData={summaryData}
    onClose={() => setShowWorkoutSummary(false)}
  />
)}


    </div>
  );
}