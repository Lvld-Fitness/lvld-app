import { useEffect, useState } from 'react';
import RestFloatingTimer from './RestFloatingTimer';

export default function RestTimerManager() {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const checkTimer = () => {
      const stored = localStorage.getItem('globalRestTimer');
      if (stored) {
        const { startTime, duration } = JSON.parse(stored);
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = duration - elapsed;

        if (remaining > 0) {
          setCountdown({ startTime, duration });
        } else {
          localStorage.removeItem('globalRestTimer');
          setCountdown(null);
        }
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = () => {
    setCountdown(null);
    localStorage.removeItem('globalRestTimer');
    alert('⏰ Time for your next set!');
  };

  if (!countdown) return null;

  return (
    <RestFloatingTimer
      duration={countdown.duration}
      key={countdown.startTime}
      onComplete={handleComplete}
    />
  );
}
