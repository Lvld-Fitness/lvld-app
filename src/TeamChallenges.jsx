import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
} from "firebase/firestore";


export default function TeamChallenges({ teamId }) {
  const [challenges, setChallenges] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    if (!teamId) return;

    const teamRef = doc(db, "teams", teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) return;

    const { challenges = [], currentMembers = [] } = teamSnap.data();

    let updatedChallenges = [...challenges];

    for (const memberId of currentMembers) {
      const workoutsRef = collection(db, "users", memberId, "workouts");
      const workoutsSnap = await getDocs(workoutsRef);

      workoutsSnap.forEach((docSnap) => {
        const workout = docSnap.data();

        workout.exercises?.forEach((ex) => {
          updatedChallenges = updatedChallenges.map((ch) => {
            if (ch.exercise !== ex.name) return ch;

            const sets = ex.sets || [];

            const totalReps = sets.reduce((sum, set) => sum + (set.reps || 0), 0);
            const totalWeight = sets.reduce((sum, set) => sum + ((set.reps || 0) * (set.weight || 0)), 0);
            const totalDistance = ex.distance || 0;

            return {
              ...ch,
              progressReps: (ch.progressReps || 0) + totalReps,
              progressWeight: (ch.progressWeight || 0) + totalWeight,
              progressDistance: (ch.progressDistance || 0) + totalDistance,
            };
          });
        });
      });
    }

    setChallenges(updatedChallenges);
  };

  fetchData();
}, [teamId]);



  const formatNumber = (num) => num?.toLocaleString() || 0;

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg mt-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Monthly Challenges Coming Soon</h2>

      {challenges.length === 0 ? (
        <p className="text-gray-400 text-center">No challenges assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge, idx) => (
            <div key={idx} className="bg-gray-800 p-4 rounded shadow">
              <h3 className="text-lg font-bold mb-2">{challenge.exercise}</h3>

              {challenge.goalReps && (
                <p>
                  Reps:{" "}
                  <span className="text-yellow-400 font-bold">
                    {formatNumber(challenge.progressReps)}
                  </span>{" "}
                  / {formatNumber(challenge.goalReps)}
                </p>
              )}

              {challenge.goalDistance && (
                <p>
                  Distance:{" "}
                  <span className="text-yellow-400 font-bold">
                    {formatNumber(challenge.progressDistance)}
                  </span>{" "}
                  / {formatNumber(challenge.goalDistance)} miles
                </p>
              )}

              {challenge.goalWeight && (
                <p>
                  Weight Lifted:{" "}
                  <span className="text-yellow-400 font-bold">
                    {formatNumber(challenge.progressWeight)}
                  </span>{" "}
                  / {formatNumber(challenge.goalWeight)} lbs
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
