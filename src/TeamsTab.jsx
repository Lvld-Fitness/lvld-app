import { useState, useEffect } from "react";
import { UserCirclePlus, Gear, Backspace } from "phosphor-react";
import { db, auth, storage } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CreateTeamModal from "./CreateTeamModal";
import TeamChallenges from "./TeamChallenges";


export default function TeamsTab() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamPage, setShowTeamPage] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showKickConfirm, setShowKickConfirm] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchTeams = async () => {
      const querySnapshot = await getDocs(collection(db, "teams"));
      const teamList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeams(teamList);
    };

    fetchTeams();
  }, []);

  const handleQuickJoinClick = (team) => {
    setSelectedTeam(team);
    setShowJoinConfirm(true);
  };

  const handleConfirmJoin = async () => {
    const teamRef = doc(db, "teams", selectedTeam.id);
    const teamSnap = await getDoc(teamRef);

    if (teamSnap.exists()) {
      const teamData = teamSnap.data();
      if (
        !teamData.currentMembers.includes(user.uid) &&
        teamData.currentMembers.length < teamData.maxMembers
      ) {
        await updateDoc(teamRef, {
          currentMembers: arrayUnion(user.uid),
        });
      }
    }
    setShowJoinConfirm(false);
    setSelectedTeam(null);
  };

  const handleCancelJoin = () => {
    setShowJoinConfirm(false);
    setSelectedTeam(null);
  };

const openTeamPage = async (team) => {
  setSelectedTeam(team);
  setShowTeamPage(true);

  try {
    // Fetch team member data
    const memberData = await Promise.all(
      team.currentMembers.map(async (uid) => {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          return {
            id: uid,
            name: data.name || "User",
            profilePic: data.profilePic || "/default-avatar.png",
          };
        } else {
          return { id: uid, name: "Unknown", profilePic: "/default-avatar.png" };
        }
      })
    );
    setMembers(memberData);

    // ✅ Fetch team messages with usernames
    const messagesRef = collection(db, "teams", team.id, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedMessages = await Promise.all(
        snapshot.docs.map(async (chatDoc) => {
          const data = chatDoc.data();
          let username = "Unknown";

          try {
            const userDoc = await getDoc(doc(db, "users", data.senderId));
            if (userDoc.exists()) {
              username = userDoc.data().name || "User";
            }
          } catch (err) {
            console.error("Error getting username for chat message:", err);
          }

          return {
            id: chatDoc.id,
            text: data.text,
            senderId: data.senderId,
            username,
          };
        })
      );
      setMessages(fetchedMessages);
    });

    // Optional: store unsubscribe in state to clean up later
  } catch (err) {
    console.error("Error loading team data:", err);
  }
};


  const confirmKick = (uid) => {
  handleKickMember(uid);
};


  const closeTeamPage = () => {
    setShowTeamPage(false);
    setSelectedTeam(null);
    setShowSettings(false);
  };

  const handleChatSubmit = async () => {
  if (!chatInput.trim() || !selectedTeam) return;

  const messageData = {
    senderId: user.uid,
    text: chatInput.trim(),
    timestamp: Date.now(),
  };

  try {
    await addDoc(collection(db, "teams", selectedTeam.id, "messages"), messageData);
    setChatInput("");
  } catch (err) {
    console.error("Error sending message:", err);
  }
};


  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    await deleteDoc(doc(db, "teams", selectedTeam.id));
    setShowTeamPage(false);
    setSelectedTeam(null);
    const updatedTeams = teams.filter((t) => t.id !== selectedTeam.id);
    setTeams(updatedTeams);
  };

  const handleChangePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const storageRef = ref(storage, `teams/${selectedTeam.id}/profile`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "teams", selectedTeam.id), {
      image: url,
    });
    setSelectedTeam((prev) => ({ ...prev, image: url }));
  };

  const handleChangeName = async () => {
    const newName = prompt("Enter new team name:");
    if (newName?.trim()) {
      await updateDoc(doc(db, "teams", selectedTeam.id), {
        name: newName,
      });
      setSelectedTeam((prev) => ({ ...prev, name: newName }));
    }
  };

  const handleKickMember = async (uid) => {
    await updateDoc(doc(db, "teams", selectedTeam.id), {
      currentMembers: arrayRemove(uid),
    });
    setSelectedTeam((prev) => ({
      ...prev,
      currentMembers: prev.currentMembers.filter((id) => id !== uid),
    }));
    setShowKickConfirm(null);
  };
  return (
    <div className="text-white p-4">
{!showTeamPage ? (
  <>
    <input
      type="text"
      placeholder="Search Teams..."
      className="w-full p-2 mb-4 bg-gray-800 text-white border border-gray-600 rounded"
    />
    <button
      onClick={() => setShowCreateModal(true)}
      className="text-lg w-full bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
    >
      CREATE TEAM
    </button>

    {showCreateModal && (
      <CreateTeamModal onClose={() => setShowCreateModal(false)} />
    )}

    <div className="mt-6 flex flex-col gap-4">
      {teams.length === 0 ? (
        <p className="text-gray-400">No teams have been created yet.</p>
      ) : (
        teams.map((team) => (
          <div
            key={team.id}
            className="relative bg-gray-800 p-4 rounded-lg flex items-center gap-4 cursor-pointer"
            onClick={() => openTeamPage(team)}
          >
            <div className="w-16 h-16 bg-gray-700 flex items-center justify-center rounded-full overflow-hidden">
              {team.image ? (
                <img
                  src={team.image}
                  alt="Team"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCirclePlus size={32} className="text-gray-500" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">{team.name}</h3>
              <p className="text-gray-400">
                {team.currentMembers.length} / {team.maxMembers} Members
              </p>
            </div>

            <UserCirclePlus
              size={32}
              className="text-green-500 hover:text-green-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickJoinClick(team);
              }}
            />
          </div>
        ))
      )}
    </div>
  </>
) : (

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-6">
            <button
              onClick={closeTeamPage}
              className="text-white hover:text-red-400 transition"
            >
              <Backspace size={32} weight="bold" />
            </button>


            {auth.currentUser?.uid === selectedTeam.createdBy && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Gear
                size={28}
                className="text-white cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                  if (showKickConfirm === "open") setShowKickConfirm(null); // reset member removal mode
                }}
              />
              {showSettings && (
                <>
                  {/* Click outside to close settings */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setShowSettings(false);
                      setShowKickConfirm(null); // also close member removal
                    }}
                  />
                  <div className="absolute right-0 mt-2 bg-gray-800 p-2 rounded shadow-lg w-52 z-50">
                    <button
                      onClick={handleDeleteTeam}
                      className="block w-full text-left text-red-500 hover:bg-red-700 hover:text-white px-2 py-1 rounded"
                    >
                      Delete Team
                    </button>
                    <label className="block text-left text-white hover:bg-blue-700 hover:text-white px-2 py-1 rounded cursor-pointer">
                      Change Team Picture
                      <input
                        type="file"
                        onChange={handleChangePicture}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleChangeName}
                      className="block w-full text-left hover:bg-blue-700 hover:text-white px-2 py-1 rounded"
                    >
                      Change Team Name
                    </button>
                    <button
                      onClick={() => setShowKickConfirm("open")}
                      className="block w-full text-left text-yellow-400 hover:bg-yellow-700 hover:text-white px-2 py-1 rounded"
                    >
                      Remove Team Members
                    </button>
                  </div>
                </>
              )}
            </div>
            )}
          </div>
          {/* Team Name and Image - Centered */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 bg-gray-700 flex items-center justify-center rounded-full overflow-hidden mb-4">
              {selectedTeam?.image ? (
                <img
                  src={selectedTeam.image}
                  alt="Team"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCirclePlus size={64} className="text-gray-500" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-center">{selectedTeam?.name}</h2>
            {selectedTeam?.id && (
              <TeamChallenges teamId={selectedTeam.id} />
            )}

          </div>

          {/* Team Chat */}
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-2">Team Chat</h3>
            <div className="h-32 overflow-y-scroll bg-gray-700 p-2 rounded mb-2">
              {messages.length === 0 ? (
                <p className="text-gray-400 italic">No messages yet.</p>
              ) : (
                messages.map((msg, idx) => (
                  <p key={idx} className="text-gray-300">
                    <span
                      className={`font-semibold ${
                        msg.senderId === user.uid ? "text-yellow-400" : "text-white"
                      }`}
                    >
                      {msg.username}:
                    </span>{" "}
                    {msg.text}
                  </p>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-2 bg-gray-600 text-white rounded"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                onClick={handleChatSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Enter
              </button>
            </div>
          </div>


          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Team Members</h3>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="relative bg-gray-800 p-2 rounded-lg text-center w-20"
                >
                  <img
                    src={member.profilePic || "/default-avatar.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full mx-auto mb-1 object-cover"
                  />
                  <p className="text-sm text-gray-400 truncate">{member.name}</p>

                  {showKickConfirm === "open" && auth.currentUser?.uid === selectedTeam.createdBy && (
                    <button
                      onClick={() => setShowKickConfirm(member)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          

          {/* Confirm Kick Modal */}
          {showKickConfirm && showKickConfirm !== "open" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg text-white">
                <h2 className="text-lg font-semibold mb-4">
                  Are you sure you want to remove {showKickConfirm.name} from your team?
                </h2>
                <div className="flex justify-between">
                  <button
                    className="bg-green-500 px-4 py-2 rounded-lg"
                    onClick={() => confirmKick(showKickConfirm.id)}
                  >
                    Yes
                  </button>
                  <button
                    className="bg-red-500 px-4 py-2 rounded-lg"
                    onClick={() => setShowKickConfirm(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {showJoinConfirm && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg text-white">
              <h2 className="text-lg font-semibold mb-4">
                Join team: {selectedTeam.name}?
              </h2>
              <div className="flex justify-between">
                <button
                  className="bg-green-500 px-4 py-2 rounded-lg"
                  onClick={handleConfirmJoin}
                >
                  Yes
                </button>
                <button
                  className="bg-red-500 px-4 py-2 rounded-lg"
                  onClick={handleCancelJoin}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
