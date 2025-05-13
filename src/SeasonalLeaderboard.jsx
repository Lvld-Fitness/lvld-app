// SeasonalLeaderboard.jsx
import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import RankIcon from "./RankIcon";

const SEASONS = [
  { name: "Beta Season", start: new Date("2025-05-01"), end: new Date("2025-07-31") },
  { name: "Season 1", start: new Date("2025-08-01"), end: new Date("2025-10-31") },
  { name: "Season 2", start: new Date("2025-11-01"), end: new Date("2026-01-31") },
  { name: "Season 3", start: new Date("2026-02-01"), end: new Date("2026-04-30") },
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

export default function SeasonalLeaderboard() {
  const [weightLeaders, setWeightLeaders] = useState([]);
  const [distanceLeaders, setDistanceLeaders] = useState([]);
  const [currentSeason, setCurrentSeason] = useState(getCurrentSeason());

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const usersRef = collection(db, "users");

        // Fetch Top 10 by Weight Lifted (excluding LVLD account)
        const weightQuery = query(
          usersRef,
          orderBy("seasonTotalWeight", "desc"),
          limit(10)
        );
        const weightSnap = await getDocs(weightQuery);
        const weightData = weightSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== "dKdmdsLKsTY51nFmqHjBWepZgDp2");
        setWeightLeaders(weightData);

        // Fetch Top 10 by Distance Traveled (excluding LVLD account)
        const distanceQuery = query(
          usersRef,
          orderBy("seasonTotalDistance", "desc"),
          limit(10)
        );
        const distanceSnap = await getDocs(distanceQuery);
        const distanceData = distanceSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== "dKdmdsLKsTY51nFmqHjBWepZgDp2");
        setDistanceLeaders(distanceData);

      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Leaderboard - {currentSeason}</h2>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Top 10 Weight Lifters</h3>
        {weightLeaders.length === 0 ? (
          <p className="text-gray-400">No data available yet.</p>
        ) : (
          weightLeaders.map(user => (
            <div key={user.id} className="bg-gray-800 p-3 mb-2 rounded flex items-center gap-4">
              <RankIcon rank={user.rank} size={34} />
              <div className="flex-1">
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-400">{user.seasonTotalWeight} lbs lifted</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-2">Top 10 Distance Travelers</h3>
        {distanceLeaders.length === 0 ? (
          <p className="text-gray-400">No data available yet.</p>
        ) : (
          distanceLeaders.map(user => (
            <div key={user.id} className="bg-gray-800 p-3 mb-2 rounded flex items-center gap-4">
              <RankIcon rank={user.rank} size={34} />
              <div className="flex-1">
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-400">
                  {parseFloat(user.seasonTotalDistance.toFixed(2))} miles
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
