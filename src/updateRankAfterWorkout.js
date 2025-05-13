// src/updateRankingAfterWorkout.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const rankTiers = [
  { tier: "bronze_1", minRP: 0 },
  { tier: "bronze_2", minRP: 100 },
  { tier: "bronze_3", minRP: 250 },
  { tier: "bronze_4", minRP: 450 },
  { tier: "bronze_5", minRP: 700 },
  { tier: "silver_1", minRP: 1000 },
  { tier: "silver_2", minRP: 1350 },
  { tier: "silver_3", minRP: 1750 },
  { tier: "silver_4", minRP: 2200 },
  { tier: "silver_5", minRP: 2700 },
  { tier: "gold_1", minRP: 3250 },
  { tier: "gold_2", minRP: 3850 },
  { tier: "gold_3", minRP: 4500 },
  { tier: "gold_4", minRP: 5200 },
  { tier: "gold_5", minRP: 5950 },
  { tier: "platinum_1", minRP: 6750 },
  { tier: "platinum_2", minRP: 7600 },
  { tier: "platinum_3", minRP: 8500 },
  { tier: "diamond_1", minRP: 9450 },
  { tier: "diamond_2", minRP: 10450 },
  { tier: "diamond_3", minRP: 11550 },
  { tier: "onyx_1", minRP: 12750 },
  { tier: "onyx_2", minRP: 14050 },
  { tier: "onyx_3", minRP: 15450 },
  { tier: "champion_1", minRP: 16950 },
  { tier: "champion_2", minRP: 28550 }
];

const getRankFromRP = (rp) => {
  for (let i = rankTiers.length - 1; i >= 0; i--) {
    if (rp >= rankTiers[i].minRP) return rankTiers[i].tier;
  }
  return "bronze_1";
};

export const updateRankingAfterWorkout = async (userId, workout) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const { weightLifted, distance } = workout;

  // Calculate RP
  const weightRP = Math.floor(weightLifted / 100);
  const distanceRP = distance * (distance >= 1 ? 20 : 10);
  const workoutRP = weightRP + distanceRP;

  const newRP = userData.rankRP + workoutRP;
  const newWeightTotal = userData.seasonTotalWeight + weightLifted;
  const newDistanceTotal = userData.seasonTotalDistance + distance;

  // Determine new rank
  const newRank = getRankFromRP(newRP);

  // Update user data
  await updateDoc(userRef, {
    rankRP: newRP,
    rank: newRank,
    seasonTotalWeight: newWeightTotal,
    seasonTotalDistance: newDistanceTotal,
  });

  console.log(`Workout processed. New Rank: ${newRank}, New RP: ${newRP}`);
};
