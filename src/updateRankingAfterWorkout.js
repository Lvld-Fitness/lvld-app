import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { notifyAllUsers } from './notifyAllUsers';



// 📅 Season Definitions
const SEASONS = [
  { name: "Beta Season", start: new Date("2025-06-01"), end: new Date("2025-07-31") },
  { name: "Season 1", start: new Date("2025-08-01"), end: new Date("2025-10-31") },
  { name: "Season 2", start: new Date("2025-11-01"), end: new Date("2026-01-31") },
  { name: "Season 3", start: new Date("2026-02-01"), end: new Date("2026-04-30") },
];

const LVLD_ACCOUNT_ID = "dKdmdsLKsTY51nFmqHjBWepZgDp2";

export const getCurrentSeason = async () => {
  const snapshot = await getDocs(collection(db, "seasons"));
  const now = Date.now();

  for (const docSnap of snapshot.docs) {
    const season = docSnap.data();
    const start = new Date(season.startDate).getTime();
    const end = new Date(season.endDate).getTime();

    if (now >= start && now <= end) {
      return { id: docSnap.id, ...season };
    }
  }

  return null;
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

// 🛠️ Reset all users' ranks to Bronze 1
const resetAllUserRanks = async (currentSeason) => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const batchUpdates = snapshot.docs.map((docSnap) => {
      const userRef = doc(db, "users", docSnap.id);
      return updateDoc(userRef, {
        rank: "bronze_1",
        rankRP: 0,
        seasonTotalWeight: 0,
        seasonTotalDistance: 0,
        currentSeason,
      });
    });

    await Promise.all(batchUpdates);
    console.log("All user ranks have been reset to Bronze 1 for", currentSeason);
  } catch (error) {
    console.error("Error resetting user ranks:", error);
  }
};


// 🔥 Post LVLD Message
const postLVLDMessage = async (content, seasonName, type) => {
  try {
    // ✅ Only send @everyone if this post is from the LVLD account
    if (content.includes("@everyone")) {
      console.log("🚨 postLVLDMessage CALLED with content:", content);
      await notifyAllUsers(content);
    }

    // 📬 Create the actual post
    await addDoc(collection(db, "posts"), {
      userId: LVLD_ACCOUNT_ID,
      content,
      timestamp: new Date(),
      reactions: {},
      deleted: false,
      season: seasonName,
      type: type,
    });

  } catch (error) {
    console.error("Error posting LVLD message:", error);
  }
};






// 🔄 Seasonal Posts
const handleSeasonalPosts = async () => {
  const season = getCurrentSeason();
  if (!season) return;

  const { name, start, end } = season;
  const now = new Date();
  const halfWay = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);

  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const totalWeight = snapshot.docs.reduce((acc, doc) => acc + (doc.data().seasonTotalWeight || 0), 0);
  const totalDistance = snapshot.docs.reduce((acc, doc) => acc + (doc.data().seasonTotalDistance || 0), 0);

  const topWeightUser = snapshot.docs
    .filter(doc => doc.id !== LVLD_ACCOUNT_ID)
    .reduce((top, doc) => {
      const data = doc.data();
      return data.seasonTotalWeight > (top?.weight || 0) ? { name: data.name, weight: data.seasonTotalWeight } : top;
    }, null);

  const topDistanceUser = snapshot.docs
    .filter(doc => doc.id !== LVLD_ACCOUNT_ID)
    .reduce((top, doc) => {
      const data = doc.data();
      return data.seasonTotalDistance > (top?.distance || 0) ? { name: data.name, distance: data.seasonTotalDistance } : top;
    }, null);

  if (now >= start && now < halfWay) {
    console.log(`🏁 New season "${name}" started. Resetting all users to Bronze 1.`);

    const resetPromises = snapshot.docs.map(async (doc) => {
      const userRef = doc.ref;
      await updateDoc(userRef, {
        rank: "bronze_1",
        rankRP: 0,
        seasonTotalWeight: 0,
        seasonTotalDistance: 0,
        currentSeason: name,
      });
      
      // Keep LVLD as Champion 5
      if (doc.id === LVLD_ACCOUNT_ID) {
        const updates = {
          rank: "champion_5",
          rankRP: 40000,
        };
        await updateDoc(userRef, updates);
      }


    });

    await Promise.all(resetPromises);

    postLVLDMessage(`🔥 Everyone, **${name}** has officially started! Get those workouts going! 💪`, name, "seasonStart");
  }
//midseason announcement
  if (now >= halfWay && now < end) {
    postLVLDMessage(
      `🚀 Everyone, We're halfway through **${name}**! 
Current Leaders:
- Weight: **${topWeightUser?.name || "No data"}** (${topWeightUser?.weight?.toLocaleString() || "0"} lbs)
- Distance: **${topDistanceUser?.name || "No data"}** (${topDistanceUser?.distance?.toFixed(2) || "0.00"} mi)`,
      name,
      "seasonMidway"
    );
  }
//end of season announcement
  if (now >= end) {
    postLVLDMessage(
      `🏁 Everyone, **${name}** is complete! 
- Total Weight Lifted: ${totalWeight.toLocaleString()} lbs
- Total Distance Covered: ${totalDistance.toFixed(2)} mi
🏆 Congrats to the top lifters and runners!
- Weight: **${topWeightUser?.name || "No data"}** (${topWeightUser?.weight?.toLocaleString() || "0"} lbs)
- Distance: **${topDistanceUser?.name || "No data"}** (${topDistanceUser?.distance?.toFixed(2) || "0.00"} mi)`,
      name,
      "seasonEnd"
    );

    await resetAllUserRanks(name);
  }
};


// 🔥 Update Ranking After Workout
export const updateRankingAfterWorkout = async (userId, workout) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const currentSeason = await getCurrentSeason(); // ✅ must use await


  if (!userSnap.exists()) return "bronze_1";

  const userData = userSnap.data();
  const { weightLifted, distance } = workout;
  const isActiveSeason = currentSeason !== null;

  const weightRP = Math.floor(weightLifted / 100);
  const distanceRP = distance * (distance >= 1 ? 20 : 10);
  const workoutRP = weightRP + distanceRP;

  const newRP = (userData.rankRP || 0) + workoutRP;
  const newRank = getRankFromRP(newRP);

  const updates = {
    rankRP: newRP,
    rank: newRank,
    totalWeight: (userData.totalWeight || 0) + weightLifted,
    totalDistance: parseFloat(((userData.totalDistance || 0) + distance).toFixed(2)),
  };

  if (isActiveSeason) {
    updates.seasonTotalWeight = (userData.seasonTotalWeight || 0) + weightLifted;
    updates.seasonTotalDistance = parseFloat(((userData.seasonTotalDistance || 0) + distance).toFixed(2));
    updates.currentSeason = currentSeason.name;
  }

  await updateDoc(userRef, updates);

  console.log(`Updated user ${userId}: New Rank: ${newRank}, New RP: ${newRP}`);

  handleSeasonalPosts();
  return newRank;
};