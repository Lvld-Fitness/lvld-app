
import { useState, useEffect } from 'react';

export default function GymScanModal({ onClose }) {
  const [gymList, setGymList] = useState([]);
  const [gymName, setGymName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('localGyms');
    if (stored) {
      setGymList(JSON.parse(stored));
    }
  }, []);

  const saveGyms = (gyms) => {
    setGymList(gyms);
    localStorage.setItem('localGyms', JSON.stringify(gyms));
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
      <div className="bg-white p-4 rounded w-96 relative">
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

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {gymList.map((gym, i) => (
            <div key={i} className="border p-2 rounded relative">
              <p className="font-semibold mb-1">{gym.name}</p>
              <img src={gym.url} alt={gym.name} className="w-full rounded" />
              <button
                onClick={() => setActiveMenu(activeMenu === i ? null : i)}
                className="absolute top-1 right-2 text-lg font-bold text-gray-600"
              >
                ...
              </button>
              {activeMenu === i && (
                <div className="absolute right-2 top-8 bg-white border rounded shadow p-2 z-10">
                  <button
                    onClick={() => {
                      setGymName(gym.name);
                      setShowAddForm(true);
                      handleDelete(i);
                    }}
                    className="block text-sm text-left w-full px-2 py-1 hover:bg-gray-100"
                  >
                    Change Gym
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    className="block text-sm text-left w-full px-2 py-1 hover:bg-gray-100 text-red-600"
                  >
                    Delete Gym
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 text-sm">✕</button>
      </div>
    </div>
  );
}
