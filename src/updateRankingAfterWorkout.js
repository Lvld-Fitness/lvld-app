// updateRankingAfterWorkout.js
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Define season dates
const SEASONS = [
  { name: "Beta Season", start: new Date("2025-06-01"), end: new Date("2025-07-31") },
  { name: "Season 1", start: new Date("2025-08-01"), end: new Date("2025-10-31") },
  { name: "Season 2", start: new Date("2025-11-01"), end: new Date("2026-01-31") },
];

const getCurrentSeason = () => {
  const now = new Date();
  for (const season of SEASONS) {
    if (now >= season.start && now <= season.end) {
      return season.name;
    }
  }
  return "Off Season";
};

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
  { tier: "platinum_2", minRP: 7650 },
  { tier: "platinum_3", minRP: 8600 },
  { tier: "platinum_4", minRP: 9600 },
  { tier: "platinum_5", minRP: 10650 },
  { tier: "diamond_1", minRP: 11750 },
  { tier: "diamond_2", minRP: 12950 },
  { tier: "diamond_3", minRP: 14250 },
  { tier: "diamond_4", minRP: 15650 },
  { tier: "diamond_5", minRP: 17150 },
  { tier: "onyx_1", minRP: 18750 },
  { tier: "onyx_2", minRP: 20450 },
  { tier: "onyx_3", minRP: 22250 },
  { tier: "onyx_4", minRP: 24150 },
  { tier: "onyx_5", minRP: 26150 },
  { tier: "champion_1", minRP: 28350 },
  { tier: "champion_2", minRP: 30750 },
  { tier: "champion_3", minRP: 33350 },
  { tier: "champion_4", minRP: 36150 },
  { tier: "champion_5", minRP: 39150 },
];

const getRankFromRP = (rp) => {
  for (let i = rankTiers.length - 1; i >= 0; i--) {
    if (rp >= rankTiers[i].minRP) return rankTiers[i].tier;
  }
  return "bronze_1";
};

// Reset Rank and Seasonal Data for New Season
const resetRankForNewSeason = async (userId, currentSeason) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    rank: "bronze_1",
    rankRP: 0,
    seasonTotalWeight: 0,
    seasonTotalDistance: 0,
    currentSeason,
  });
};

// Main Update Function
export const updateRankingAfterWorkout = async (userId, workout) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return "bronze_1";

  const userData = userSnap.data();
  const { weightLifted, distance } = workout;

  // Get current season
  const currentSeason = getCurrentSeason();

  // Check for season reset
  if (userData.currentSeason !== currentSeason) {
    await resetRankForNewSeason(userId, currentSeason);
    console.log(`User ${userId} has been reset for the new season: ${currentSeason}`);
  }

  // Calculate RP
  const weightRP = Math.floor(weightLifted / 100);
  const distanceRP = distance * (distance >= 1 ? 20 : 10);
  const workoutRP = weightRP + distanceRP;

  const newRP = (userData.rankRP || 0) + workoutRP;
  const newWeightTotal = (userData.seasonTotalWeight || 0) + weightLifted;

  // ✅ Ensure distance is rounded to two decimal places to prevent float precision errors
  const previousDistance = userData.seasonTotalDistance || 0;
  const newDistanceTotal = parseFloat((previousDistance + distance).toFixed(2));

  // Debugging logs
console.log(`🏋️ Weight Lifted: ${weightLifted}`);
console.log(`📏 Distance: ${distance}`);
console.log(`🌟 Previous Distance: ${previousDistance}`);
console.log(`✅ New Distance Total: ${newDistanceTotal}`);

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
  return newRank;
};

