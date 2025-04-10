export default function RestTimerModal({ exercise, restDurations, setRestDurations, onClose }) {
  const options = [15, 30, 45, 60, 90, 120];

  const handleSet = (duration) => {
    const updated = {
      ...restDurations,
      [exercise.name]: duration,
    };
    setRestDurations(updated);
    localStorage.setItem('exerciseRestDurations', JSON.stringify(updated));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 p-6 rounded shadow-md w-full max-w-xs text-center">
        <h2 className="text-lg font-bold text-white mb-4">
          Set Rest Timer for {exercise.name}
        </h2>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {options.map((sec) => (
            <button
              key={sec}
              onClick={() => handleSet(sec)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              {sec}s
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
