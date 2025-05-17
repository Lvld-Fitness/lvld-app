// SeasonalLeaderboard.jsx
import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import RankIcon from "./RankIcon";
import { useNavigate } from "react-router-dom";

export default function SeasonalLeaderboard() {
  const [weightLeaders, setWeightLeaders] = useState([]);
  const [distanceLeaders, setDistanceLeaders] = useState([]);
  const [userRank, setUserRank] = useState({ weight: null, distance: null });
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const usersRef = collection(db, "users");

        // Fetch by Weight Lifted (All Time)
        const weightQuery = query(usersRef, orderBy("totalWeight", "desc"));
        const weightSnap = await getDocs(weightQuery);
        const weightData = weightSnap.docs
          .filter((doc) => doc.id !== "dKdmdsLKsTY51nFmqHjBWepZgDp2") // Exclude LVLD account
          .map((doc, index) => ({
            id: doc.id,
            position: index + 1,
            ...doc.data(),
          }));
        setWeightLeaders(weightData);

        // Fetch by Distance Traveled (All Time)
        const distanceQuery = query(usersRef, orderBy("totalDistance", "desc"));
        const distanceSnap = await getDocs(distanceQuery);
        const distanceData = distanceSnap.docs
          .filter((doc) => doc.id !== "dKdmdsLKsTY51nFmqHjBWepZgDp2") // Exclude LVLD account
          .map((doc, index) => ({
            id: doc.id,
            position: index + 1,
            ...doc.data(),
          }));
        setDistanceLeaders(distanceData);

        // Fetch Current User's Rank
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;

          if (userData) {
            const userWeightRank = weightData.find((user) => user.id === currentUser.uid);
            const userDistanceRank = distanceData.find((user) => user.id === currentUser.uid);

            setUserRank({
              weight: userWeightRank ? userWeightRank.position : "Not Ranked",
              distance: userDistanceRank ? userDistanceRank.position : "Not Ranked",
            });
          }
        }

      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchRankings();
  }, [currentUser]);

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-center">All Time Leaderboards</h2>

      {/* Weight Lifted Section */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-2xl font-bold mb-2 text-center">TOP WEIGHT LIFTED</h3>

        {/* User's Position */}
        <div className="text-center mb-4 text-yellow-400">
          Your current Ranked Position:{" "}
          {userRank.weight !== null ? `${userRank.weight}` : "Not Ranked"}
        </div>

        <div className="h-64 overflow-y-scroll">
          {weightLeaders.length === 0 ? (
            <p className="text-gray-400">No data available yet.</p>
          ) : (
            weightLeaders.map((user) => (
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
                  {user.totalWeight ? user.totalWeight.toLocaleString() : "0"} lbs
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Distance Traveled Section */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-2xl font-bold mb-2 text-center">TOP DISTANCE TRAVELED</h3>

        {/* User's Position */}
        <div className="text-center mb-4 text-yellow-400">
        Your current Ranked Position:{" "}
          {userRank.distance !== null ? `${userRank.distance}` : "Not Ranked"}
        </div>

        <div className="h-64 overflow-y-scroll">
          {distanceLeaders.length === 0 ? (
            <p className="text-gray-400">No data available yet.</p>
          ) : (
            distanceLeaders.map((user) => (
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
                  {user.totalDistance ? user.totalDistance.toFixed(2) : "0.00"} mi
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
