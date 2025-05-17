import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth } from "./firebase";

export default function ActiveWorkoutView() {
  const { userId } = useParams();
  const [workout, setWorkout] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setWorkout(data.activeWorkout || null);
      }
      setLoading(false);
    };

    fetchWorkout();
  }, [userId]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    const newComment = {
      userId: user.uid,
      username: user.displayName,
      text: comment,
      timestamp: new Date().toISOString(),
    };

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "activeWorkout.comments": arrayUnion(newComment),
    });

    setComment("");
    setWorkout((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
    }));
  };

  if (loading) return <div>Loading workout...</div>;
  if (!workout) return <div>No active workout found.</div>;

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h2 className="text-xl font-bold mb-4">Active Workout</h2>
      {workout.exercises.map((exercise, idx) => (
        <div key={idx} className="mb-3">
          <h3 className="font-bold">{exercise.name}</h3>
          {exercise.sets.map((set, setIdx) => (
            <p key={setIdx} className="text-gray-400">
              {set.weight} lbs x {set.reps} reps
            </p>
          ))}
        </div>
      ))}

      <div className="mt-4">
        <h3 className="font-bold mb-2">Comments</h3>
        {workout.comments?.map((com, idx) => (
          <div key={idx} className="mb-2 p-2 bg-gray-800 rounded">
            <span className="font-bold">{com.username}: </span>
            {com.text}
          </div>
        ))}

        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment..."
          className="w-full p-2 bg-gray-700 rounded mt-2"
        />
        <button onClick={handleAddComment} className="bg-green-500 p-2 rounded mt-2">
          Comment
        </button>
      </div>
    </div>
  );
}
