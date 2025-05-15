import { useEffect, useState } from "react";
import { TITLE_ACHIEVEMENTS } from "./titleCriteria";

export default function TitleModal({ onClose, title }) {
  const [description, setDescription] = useState("");

  useEffect(() => {
    const achievement = TITLE_ACHIEVEMENTS.find((ach) => ach.title === title);
    if (achievement) {
      setDescription(achievement.description);
    } else {
      setDescription("No information available.");
    }
  }, [title]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-80 max-h-[80vh] overflow-y-scroll relative">
        <button 
          onClick={onClose} 
          className="text-white text-lg absolute top-3 right-3"
        >
          ✖
        </button>
        <h2 className="text-white text-xl font-bold mb-4 text-center">{title}</h2>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
}
