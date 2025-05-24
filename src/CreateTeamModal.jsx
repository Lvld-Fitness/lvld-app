import { useState } from "react";
import { db, storage, auth } from "./firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CreateTeamModal({ onClose }) {
  const [teamName, setTeamName] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [teamImage, setTeamImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file) => {
    const storageRef = ref(storage, `teamImages/${file.name}-${Timestamp.now()}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!teamName || !maxMembers || !teamImage) {
      alert("All fields are required");
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await handleImageUpload(teamImage);

      const newTeam = {
        name: teamName,
        maxMembers: parseInt(maxMembers),
        currentMembers: [],
        image: imageUrl,
        createdBy: auth.currentUser.uid,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "teams"), newTeam);

      setTeamName("");
      setMaxMembers("");
      setTeamImage(null);
      onClose();
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Error creating team. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#1f2937",
        padding: "20px",
        borderRadius: "8px",
        zIndex: 1000,
        width: "300px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
      }}
    >
      <h2 style={{ color: "#ffffff", marginBottom: "16px" }}>Create a Team</h2>

      <input
        type="text"
        placeholder="Team Name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "6px",
          backgroundColor: "#374151",
          border: "none",
          color: "#ffffff",
        }}
      />

      <input
        type="number"
        placeholder="Max Members"
        value={maxMembers}
        onChange={(e) => setMaxMembers(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "16px",
          borderRadius: "6px",
          backgroundColor: "#374151",
          border: "none",
          color: "#ffffff",
        }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setTeamImage(e.target.files[0])}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "16px",
          backgroundColor: "#374151",
          border: "none",
          color: "#ffffff",
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={uploading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          cursor: uploading ? "not-allowed" : "pointer",
          marginBottom: "10px",
        }}
      >
        {uploading ? "Creating..." : "Create Team"}
      </button>

      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#6b7280",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
