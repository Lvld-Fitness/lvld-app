import { useState, useEffect } from 'react';

export default function NoteModal({ exercise, onClose }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (exercise?.note) setNote(exercise.note);
  }, [exercise]);

  const handleSave = () => {
    exercise.note = note;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-lg font-bold text-white mb-4">
          Add Note for {exercise.name}
        </h2>
        <textarea
          rows="4"
          className="w-full p-2 rounded bg-gray-800 text-white mb-4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write something helpful for this exercise..."
        ></textarea>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
