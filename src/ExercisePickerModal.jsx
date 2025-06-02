import { useState, useEffect, useRef } from 'react';
import defaultExercises from './exerciseList';

export default function ExercisePickerModal({
  selectedExercises,
  setSelectedExercises,
  showPicker,
  onClose,
}) {
  const [search, setSearch] = useState('');
  const [exerciseList, setExerciseList] = useState([]);
  const [highlighted, setHighlighted] = useState([]);
  const [optionsOpen, setOptionsOpen] = useState(null);
  const optionsRef = useRef(null);

  const lastSets = JSON.parse(localStorage.getItem('lastUsedSets') || '{}');

  useEffect(() => {
    const saved = localStorage.getItem('savedExercises');
    const parsed = saved ? JSON.parse(saved) : [];
    const merged = Array.from(new Set([...parsed, ...defaultExercises])).sort();
    setExerciseList(merged);
    localStorage.setItem('savedExercises', JSON.stringify(merged));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setOptionsOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const newExercises = highlighted.map((name) => ({
    name,
    sets: lastSets[name]?.length
      ? lastSets[name].map((set, i) => ({
          id: i + 1,
          weight: set.weight,
          reps: set.reps,
          completed: false,
          tag: '',
        }))
      : [
          { id: 1, weight: '', reps: '', completed: false },
          { id: 2, weight: '', reps: '', completed: false },
          { id: 3, weight: '', reps: '', completed: false },
        ],
  }));

  const filteredExercises = exerciseList.filter(
    (name) =>
      typeof name === 'string' &&
      name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExercise = (name) => {
    if (highlighted.includes(name)) {
      setHighlighted((prev) => prev.filter((n) => n !== name));
    } else {
      setHighlighted((prev) => [...prev, name]);
    }
  };

  const handleAddToWorkout = () => {
    if (!Array.isArray(highlighted)) return;

    const newExercises = highlighted.map((name) => {
      const isCardio = name.toLowerCase().includes('run') || name.toLowerCase().includes('bike') || name.toLowerCase().includes('treadmill') || name.toLowerCase().includes('walk') || name.toLowerCase().includes('elliptical') || name.toLowerCase().includes('stairs') || name.toLowerCase().includes('cycle') || name.toLowerCase().includes('carry');

      return {
        name,
        sets: isCardio
          ? [{ id: 1, distance: '', time: '', completed: false }]
          : [
              { id: 1, weight: '', reps: '', completed: false },
              { id: 2, weight: '', reps: '', completed: false },
              { id: 3, weight: '', reps: '', completed: false }
            ],
      };
    });

    if (typeof showPicker === 'object' && showPicker.replaceIdx !== undefined) {
      const updated = [...selectedExercises];
      newExercises.forEach((ex, i) => {
        updated.splice(showPicker.replaceIdx + i, 1, ex);
      });
      setSelectedExercises(updated);
    } else {
      const updated = [...selectedExercises, ...newExercises];
      setSelectedExercises(updated);
    }

    setHighlighted([]);
    onClose();
  };

  const renameExercise = (oldName) => {
    const newName = prompt('Rename exercise:', oldName);
    if (!newName || exerciseList.includes(newName)) return;

    const updatedList = exerciseList.map((name) =>
      name === oldName ? newName : name
    );
    setExerciseList(updatedList);
    localStorage.setItem('savedExercises', JSON.stringify(updatedList));

    setSelectedExercises((prev) =>
      prev.map((ex) => (ex.name === oldName ? { ...ex, name: newName } : ex))
    );
  };

  const deleteExercise = (nameToDelete) => {
    const updated = exerciseList.filter((name) => name !== nameToDelete);
    setExerciseList(updated);
    localStorage.setItem('savedExercises', JSON.stringify(updated));

    setSelectedExercises((prev) =>
      prev.filter((ex) => ex.name !== nameToDelete)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col">
      <div className="bg-gray-900 p-4 text-white rounded-t-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">Select Exercises</span>
          <button onClick={onClose} className="text-red-400 text-xl">✖</button>
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 rounded bg-gray-800 text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-800 px-4 pt-2 pb-32">
        {filteredExercises.map((exerciseName) => (
          <div
            key={exerciseName}
            className={`flex justify-between items-center p-2 mb-2 rounded relative cursor-pointer ${
              highlighted.includes(exerciseName)
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => toggleExercise(exerciseName)}
          >
            <span>{exerciseName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOptionsOpen(optionsOpen === exerciseName ? null : exerciseName);
              }}
              className="text-yellow-400 text-sm hover:text-yellow-300"
            >
              ⋯
            </button>

            {optionsOpen === exerciseName && (
              <div
                ref={optionsRef}
                className="absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded shadow z-50"
              >
                <button
                  onClick={() => {
                    renameExercise(exerciseName);
                    setOptionsOpen(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-yellow-300 hover:bg-gray-700"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete '${exerciseName}'?`)) {
                      deleteExercise(exerciseName);
                      setOptionsOpen(null);
                    }
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-20 left-0 w-full px-4 z-[999] pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={handleAddToWorkout}
            className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 font-bold text-lg shadow-lg"
          >
            Add Selected Exercises
          </button>
        </div>
      </div>
    </div>
  );
}
