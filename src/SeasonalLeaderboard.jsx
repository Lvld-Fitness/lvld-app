// SeasonalLeaderboard.jsx
import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import RankIcon from "./RankIcon";
import { useNavigate } from "react-router-dom";


const SEASONS = [
  { name: "Beta Season", start: new Date("2025-05-16"), end: new Date("2025-07-31") },
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
  const [view, setView] = useState("seasonal"); // "seasonal" or "alltime"
  const navigate = useNavigate();


  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const usersRef = collection(db, "users");

        // Fetch by Weight Lifted
        const weightQuery = query(
          usersRef,
          orderBy(view === "seasonal" ? "seasonTotalWeight" : "totalWeight", "desc")
        );
        const weightSnap = await getDocs(weightQuery);
        const weightData = weightSnap.docs.map((doc, index) => ({
          id: doc.id,
          position: index + 1,
          ...doc.data(),
        }));
        setWeightLeaders(weightData);

        // Fetch by Distance Traveled
        const distanceQuery = query(
          usersRef,
          orderBy(view === "seasonal" ? "seasonTotalDistance" : "totalDistance", "desc")
        );
        const distanceSnap = await getDocs(distanceQuery);
        const distanceData = distanceSnap.docs.map((doc, index) => ({
          id: doc.id,
          position: index + 1,
          ...doc.data(),
        }));
        setDistanceLeaders(distanceData);

      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchRankings();
  }, [view]);

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-center">Leaderboards</h2>

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-10 py-2 rounded ${view === "seasonal" ? "bg-red-500" : "bg-gray-700"}`}
          onClick={() => setView("seasonal")}
        >
          Seasons
        </button>
        <button
          className={`px-10 py-2 rounded ${view === "alltime" ? "bg-red-500" : "bg-gray-700"}`}
          onClick={() => setView("alltime")}
        >
          All Time
        </button>
      </div>

      {/* Scrollable Sections */}
      <div className="space-y-6">
        {/* Weight Lifted Section */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h3 className="text-2xl font-bold mb-2 text-center">TOP WEIGHT LIFTED</h3>
          <div className="h-64 overflow-y-scroll">
            {weightLeaders.length === 0 ? (
              <p className="text-gray-400">No data available yet.</p>
            ) : (
              weightLeaders
              .filter(user => user.id !== "dKdmdsLKsTY51nFmqHjBWepZgDp2") // Exclude LVLD account
              .map((user) => (
                <div key={user.id} className="flex items-center gap-4 mb-2">
                  <span className="text-lg font-bold text-gray-300">{user.position}.</span>
                  <img
                    src={user.profilePic || "/default-avatar.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-gray-600 cursor-pointer"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  />
                  <div className="flex-1">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.handle}</p>
                  </div>
                  <RankIcon rank={user.rank} size={30} />
                  <span className="text-sm text-gray-400">
                    {view === "seasonal" 
                      ? (user.seasonTotalWeight ? user.seasonTotalWeight.toLocaleString() : "0") 
                      : (user.totalWeight ? user.totalWeight.toLocaleString() : "0")
                    } lbs
                  </span>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Distance Traveled Section */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-2xl font-bold mb-2 text-center">TOP DISTANCE TRAVELED</h3>
          <div className="h-64 overflow-y-scroll">
            {distanceLeaders.length === 0 ? (
              <p className="text-gray-400">No data available yet.</p>
            ) : (
              distanceLeaders
              .filter(user => user.id !== "dKdmdsLKsTY51nFmqHjBWepZgDp2") // Exclude LVLD account
              .map((user) => (
                <div key={user.id} className="flex items-center gap-4 mb-2">
                  <span className="text-lg font-bold text-gray-300">{user.position}.</span>
                  <img
                    src={user.profilePic || "/default-avatar.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-gray-600 cursor-pointer"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  />
                  <div className="flex-1">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.handle}</p>
                  </div>
                  <RankIcon rank={user.rank} size={30} />
                  <span className="text-sm text-gray-400">
                    {view === "seasonal" 
                      ? (user.seasonTotalDistance ? user.seasonTotalDistance.toFixed(2) : "0.00") 
                      : (user.totalDistance ? user.totalDistance.toFixed(2) : "0.00")
                    } mi
                  </span>
                </div>
              ))
            )}
          </div>
        </div>



      </div>
    </div>
  );
}