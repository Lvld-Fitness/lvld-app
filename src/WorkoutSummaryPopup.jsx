// WorkoutSummaryPopup.jsx
import React from 'react';

export default function WorkoutSummaryPopup({ summaryData, onClose }) {
  if (!summaryData) return null;

  const { name, date, totalWeight, topSets, topCardio, funFact } = summaryData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Workout Summary</h2>
          <button onClick={onClose} className="text-red-400 text-lg">✖</button>
        </div>

        <p className="mb-2"><strong>Name:</strong> {name}</p>
        <p className="mb-2"><strong>Date:</strong> {date}</p>
        <p className="mb-2"><strong>Total Weight:</strong> {totalWeight} lbs</p>

        {topSets.length > 0 && (
          <>
            <p className="mt-4 mb-1 font-bold">🏋️ Top Sets</p>
            <ul className="mb-2 text-sm">
              {topSets.map((set, i) => (
                <li key={i}>
                  {set.weight} lbs × {set.reps} reps
                </li>
              ))}
            </ul>
          </>
        )}

        {topCardio.distance > 0 && (
          <>
            <p className="mt-4 mb-1 font-bold">🏃 Best Cardio</p>
            <p className="text-sm">
              {topCardio.distance} mi in {topCardio.time} min (
              {(topCardio.speed || 0).toFixed(2)} mi/min)
            </p>
          </>
        )}

        {funFact && (
          <>
            <p className="mt-4 mb-1 font-bold">🎉 Fun Fact</p>
            <p className="text-sm italic text-yellow-300">{funFact}</p>
          </>
        )}
      </div>
    </div>
  );
}
