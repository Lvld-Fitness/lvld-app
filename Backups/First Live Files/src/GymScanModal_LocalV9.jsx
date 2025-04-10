
import { useState, useEffect } from 'react';

export default function GymScanModal({ onClose }) {
  const [gymList, setGymList] = useState([]);
  const [gymName, setGymName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('localGyms');
    if (stored) {
      const parsed = JSON.parse(stored);
      setGymList(parsed);
      const savedIndex = localStorage.getItem("lastGymIndex");
      setSelectedIndex(savedIndex ? parseInt(savedIndex) : 0);
    }
  }, []);

  const saveGyms = (gyms) => {
    setGymList(gyms);
    localStorage.setItem('localGyms', JSON.stringify(gyms));
    const savedIndex = localStorage.getItem("lastGymIndex");
      setSelectedIndex(savedIndex ? parseInt(savedIndex) : 0);
  };

  const handleUpload = () => {
    if (!imageFile || !gymName || gymList.length >= 3) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newGym = { name: gymName, url: reader.result };
      const updatedGyms = [...gymList, newGym];
      saveGyms(updatedGyms);
      setGymName('');
      setImageFile(null);
      setShowAddForm(false);
    };
    reader.readAsDataURL(imageFile);
  };

  const handleDelete = (index) => {
    const updated = gymList.filter((_, i) => i !== index);
    saveGyms(updated);
    setActiveMenu(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-white px-4 pt-3 pb-4 rounded w-96 relative">
        <h2 className="text-xl font-bold mb-4">Gym Scan-In</h2>

        <button
          className="bg-purple-600 text-white px-3 py-1 rounded mb-4"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '➕ Add Gym'}
        </button>

        {showAddForm && (
          <div className="border p-3 mb-4 rounded">
            <input
              type="text"
              placeholder="Gym Name"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              className="border w-full p-1 rounded mb-2 text-black bg-white"
            />
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            <button onClick={handleUpload} className="bg-green-600 text-white px-4 py-1 mt-2 rounded">
              Save Locally
            </button>
          </div>
        )}

        {gymList.length > 0 && (
          <div className="flex space-x-2 mb-3">
            {gymList.map((gym, i) => (
              <button
                key={i}
                className={`px-2 py-1 rounded text-sm font-semibold ${
                  i === selectedIndex ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                setSelectedIndex(i);
                localStorage.setItem("lastGymIndex", i);
              }}
              >
                {gym.name}
              </button>
            ))}
          </div>
        )}

        {gymList[selectedIndex] && (
          <div className="border p-2 rounded relative">
            <p className="font-semibold mb-1">{gymList[selectedIndex].name}</p>
            <img src={gymList[selectedIndex].url} alt={gymList[selectedIndex].name} className="w-full rounded" />
            <button
              onClick={() => setActiveMenu(activeMenu === selectedIndex ? null : selectedIndex)}
              className="absolute top-1 right-2 text-lg font-bold text-gray-600"
            >
              ...
            </button>
            {activeMenu === selectedIndex && (
              <div className="absolute right-2 top-8 bg-white border rounded shadow p-2 z-10">
                <button
                  onClick={() => {
                    setGymName(gymList[selectedIndex].name);
                    setShowAddForm(true);
                    handleDelete(selectedIndex);
                  }}
                  className="block text-sm text-left w-full px-2 py-1 hover:bg-gray-100 text-gray-700 font-medium"
                >
                  Change Gym
                </button>
                <button
                  onClick={() => handleDelete(selectedIndex)}
                  className="block text-sm text-left w-full px-2 py-1 hover:bg-gray-100 text-red-600"
                >
                  Delete Gym
                </button>
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 text-sm">✕</button>
      </div>
    </div>
  );
}
