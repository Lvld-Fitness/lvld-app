// fixTotalWeight.js
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// 🔐 Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function recalculateTotalWeight() {
  const userSnap = await db.collection("users").get();

  for (const userDoc of userSnap.docs) {
    const userData = userDoc.data();
    const workouts = userData.workoutHistory || [];

    let weightSum = 0;

    for (const workout of workouts) {
      for (const exercise of workout.exercises || []) {
        for (const set of exercise.sets || []) {
          if (set.weight && set.reps) {
            weightSum += set.weight * set.reps;
          }
        }
      }
    }

    await db.collection("users").doc(userDoc.id).update({
      totalWeight: weightSum,
    });

    console.log(`✅ Updated ${userData.name || userDoc.id}: ${weightSum} lbs`);
  }

  console.log("🎉 All totalWeight values updated.");
}

recalculateTotalWeight();
