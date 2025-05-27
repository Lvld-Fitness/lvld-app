import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function TeamChallenges({ teamId }) {
  const [challenges, setChallenges] = useState([]);

 useEffect(() => {
  const fetchChallenges = async () => {
    if (!teamId) return;
    const ref = doc(db, "teams", teamId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      setChallenges(data.challenges || []);
    }
  };

  fetchChallenges();
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
