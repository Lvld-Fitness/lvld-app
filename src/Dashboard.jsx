import { useState, useEffect } from 'react';
import WorkoutTab from './WorkoutTab';
import FeedTab from './FeedTab';
import ProfileTab from './ProfileTab';
import RestFloatingTimer from './RestFloatingTimer';


export default function Dashboard({ setTheme }) {
  const [activeTab, setActiveTab] = useState('workout');
  const [floatingRest, setFloatingRest] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('floatingRest');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.duration && parsed?.startTime) {
        setFloatingRest(parsed);
      }
    }
  }, []);

  const [showRestPopup, setShowRestPopup] = useState(false);

useEffect(() => {
  const checkForRestAlert = () => {
    const flag = localStorage.getItem('rest-timer-alert');
    if (flag === 'true') {
      setShowRestPopup(true);
      localStorage.setItem('rest-timer-alert', 'false');

      setTimeout(() => {
        setShowRestPopup(false);
      }, 3000);
    }
  };

  const interval = setInterval(checkForRestAlert, 1000);
  return () => clearInterval(interval);
}, []);


  const renderTab = () => {
    switch (activeTab) {
      case 'workout':
        return <WorkoutTab />;
      case 'feed':
        return <FeedTab />;
      case 'profile':
        return <ProfileTab setTheme={setTheme} />;
      default:
        return <WorkoutTab />;
    }
  };

  return (
    <div className="relative bg-black text-white min-h-screen pb-20">
      {renderTab()}

      {floatingRest && (
        <RestFloatingTimer
          key={floatingRest.exerciseName + floatingRest.startTime}
          duration={floatingRest.duration}
          startTime={floatingRest.startTime}
          onComplete={() => {
            setFloatingRest(null);
            localStorage.removeItem('floatingRest');
          }}
        />
      )}

      {/* Bottom Navigation Tabs */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-700 flex justify-around py-5 z-50">
        <button
          onClick={() => setActiveTab('workout')}
          className={`text-sm font-semibold ${
            activeTab === 'workout' ? 'text-green-400' : 'text-gray-300'
          }`}
        >
          Workout
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`text-sm font-semibold ${
            activeTab === 'feed' ? 'text-green-400' : 'text-gray-300'
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`text-sm font-semibold ${
            activeTab === 'profile' ? 'text-green-400' : 'text-gray-300'
          }`}
        >
          Profile
        </button>
      </nav>
    </div>
  );
}
