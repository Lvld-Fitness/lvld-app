import { useState, useEffect } from 'react';
import defaultExercises from './exerciseList';

export default function ExercisePickerModal({
  selectedExercises,
  setSelectedExercises,
  onClose,
}) {
  const [search, setSearch] = useState('');
  const [exerciseList, setExerciseList] = useState([]);
  const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);
  const [highlighted, setHighlighted] = useState([]); // Track selected/highlighted ones
  const lastSets = JSON.parse(localStorage.getItem('lastUsedSets') || '{}');

  useEffect(() => {
    const saved = localStorage.getItem('savedExercises');
    const parsed = saved ? JSON.parse(saved) : [];
    const merged = Array.from(new Set([...parsed, ...defaultExercises])).sort();
    setExerciseList(merged);
    localStorage.setItem('savedExercises', JSON.stringify(merged));
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
      // Unselect
      setHighlighted((prev) => prev.filter((n) => n !== name));
    } else {
      // Select
      setHighlighted((prev) => [...prev, name]);
    }
  };

  const handleAddToWorkout = () => {
    const newExercises = highlighted
      .filter((name) => !selectedExercises.some((ex) => ex.name === name))
      .map((name) => {
        const isCardio = name.toLowerCase().includes('run') || name.toLowerCase().includes('bike') || name.toLowerCase().includes('treadmill') || name.toLowerCase().includes('row') || name.toLowerCase().includes('walk') || name.toLowerCase().includes('sprint') || name.toLowerCase().includes('elliptical') || name.toLowerCase().includes('stairs') || name.toLowerCase().includes('cycle') || name.toLowerCase().includes('carry');
  
        return {
          name,
          sets: isCardio
            ? [{ id: 1, distance: '', time: '', completed: false }]
            : [
                { id: 1, weight: '', reps: '', completed: false },
                { id: 2, weight: '', reps: '', completed: false },
                { id: 3, weight: '', reps: '', completed: false }
              ]
        };
      });
  
    setSelectedExercises([...selectedExercises, ...newExercises]);
    setHighlighted([]);
    onClose();
  };
  
  

  const handleEdit = (exerciseName) => {
    const newName = prompt('Rename exercise:', exerciseName);
    if (!newName) return;

    if (exerciseList.includes(newName)) {
      alert('That name already exists.');
      return;
    }

    const updatedList = exerciseList.map((name) =>
      name === exerciseName ? newName : name
    );
    setExerciseList(updatedList);
    localStorage.setItem('savedExercises', JSON.stringify(updatedList));

    setSelectedExercises((prev) =>
      prev.map((ex) =>
        ex.name === exerciseName ? { ...ex, name: newName } : ex
      )
    );
  };

  const handleAddNewExercise = () => {
    const newExercise = prompt('Enter name of new exercise:');
    if (!newExercise) return;

    if (exerciseList.includes(newExercise)) {
      alert('This exercise already exists.');
      return;
    }

    const updated = [...exerciseList, newExercise].sort();
    setExerciseList(updated);
    localStorage.setItem('savedExercises', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col">
      {/* Header */}
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
          <button
            onClick={handleAddNewExercise}
            className="text-green-400 font-bold"
          >
            New
          </button>
        </div>
      </div>

      {/* Scrollable Exercise List */}
      <div className="flex-1 overflow-y-auto bg-gray-800 px-4 pt-2 pb-32">
        {filteredExercises.map((exerciseName) => (
          <div
            key={exerciseName}
            className={`flex justify-between items-center p-2 mb-2 rounded cursor-pointer ${
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
                handleEdit(exerciseName);
              }}
              className="text-yellow-400 text-sm hover:text-yellow-300"
            >
              ⋯
            </button>
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
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