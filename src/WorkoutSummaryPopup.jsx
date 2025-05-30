// WorkoutSummaryPopup.jsx
import React from 'react';
import { Export, BookmarkSimple } from 'phosphor-react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from './firebase';

export default function WorkoutSummaryPopup({ summaryData, onClose }) {
  if (!summaryData) return null;

  const { name, date, totalWeight, funFact } = summaryData;

  const handleShare = () => {
    const fullWorkoutText = summaryData.exercises.map(ex => {
      const setsText = ex.sets.map((set, i) => {
        if (set.weight && set.reps) {
          return `  • ${set.weight} lbs × ${set.reps} reps${set.isPR ? ' 🏆 PR' : ''}`;
        } else if (set.distance && set.time) {
          return `  • ${set.distance} mi in ${set.time} min`;
        }
        return '';
      }).join('\n');
      return `📌 ${ex.name}:\n${setsText}`;
    }).join('\n\n');

    const shareText = `🏋️ ${summaryData.name} (${summaryData.date})\n\n${fullWorkoutText}`;

    if (navigator.share) {
      navigator.share({ title: 'LVLD Workout', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Workout copied to clipboard!');
    }
  };

const handleSaveAsPremade = async () => {
  if (!auth.currentUser || !summaryData) return;

  const premadeWorkout = {
    name: summaryData.name || "Saved Workout",
    exercises: summaryData.exercises || [],
    createdBy: auth.currentUser.uid,
    timestamp: Date.now(),
  };

  try {
    const customRef = doc(db, "premadeWorkouts", auth.currentUser.uid, "custom", `${Date.now()}`);
    await setDoc(customRef, premadeWorkout);
    alert("Workout saved to Custom Premades!");
  } catch (err) {
    console.error("Failed to save premade workout:", err.message);
    alert("Error saving workout.");
  }
};




  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center px-4">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md shadow-lg border border-red-600 max-h-[80vh] overflow-y-auto pb-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-extrabold text-red-500 tracking-wide">WORKOUT COMPLETE</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="text-red-400 text-xl hover:text-red-500" title="Share Workout">
              <Export size={24} weight="bold" />
            </button>
            <button onClick={handleSaveAsPremade} className="text-yellow-400 text-xl hover:text-yellow-500" title="Save as Premade">
              <BookmarkSimple size={24} weight="bold" />
            </button>
            <div className="absolute top-5 right-5 flex gap-3 p-2 bg-black bg-opacity-60 rounded-bl-lg z-50">
              <button onClick={onClose} className="text-red-400 text-xl hover:text-red-500">✖</button>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm italic mb-4">
          {name} • {date}
        </p>

        <div className="space-y-3 text-sm font-mono">
          <div className="flex justify-between border-b border-gray-700 pb-1">
            <span className="text-gray-300">🔥 Total Weight Lifted:</span>
            <span className="text-yellow-400 font-bold">{totalWeight.toLocaleString()} lbs</span>
          </div>
        </div>

        {funFact && (
          <div className="mt-5 p-3 bg-gray-800 rounded border border-yellow-500">
            <p className="text-yellow-300 font-semibold mb-1">💡 Motivational Quote</p>
            <p className="text-sm text-white italic">{funFact}</p>
          </div>
        )}

        {summaryData.exercises?.length > 0 && (
          <div className="mt-6 text-sm text-white">
            <p className="text-lg font-bold text-red-400 mb-2">📋 Full Workout</p>
            {summaryData.exercises.map((ex, idx) => (
              <div key={idx} className="mb-3">
                <p className="font-bold text-yellow-300">{ex.name}</p>
                <ul className="ml-3 space-y-1">
                  {ex.sets.map((set, i) => {
                    const isWeightValid = set.weight && set.reps;
                    const isCardioValid = set.distance && set.time;

                    return (
                      <li key={i} className={set.isPR && isWeightValid ? "text-yellow-400 font-bold" : "text-gray-300"}>
                        • {isWeightValid
                          ? `${set.weight} lbs × ${set.reps} reps`
                          : isCardioValid
                          ? `${set.distance} mi in ${set.time} min`
                          : '—'}
                        {set.isPR && isWeightValid && (
                          <span className="ml-1 text-red-400">🏆 PR</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
