
import { useEffect, useState } from 'react';
import RestFloatingTimer from './RestFloatingTimer';

export default function GlobalFloatingRestBar() {
  const [restData, setRestData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = localStorage.getItem('floatingRest');
      if (data) {
        const parsed = JSON.parse(data);
        const elapsed = (Date.now() - parsed.startTime) / 1000;
        const timeLeft = parsed.duration - elapsed;

        if (timeLeft > 0) {
          setRestData({
            ...parsed,
            remaining: timeLeft
          });
        } else {
          localStorage.removeItem('floatingRest');
          setRestData(null);
        }
      } else {
        setRestData(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!restData || restData.remaining <= 0) return null;

  return (
    <RestFloatingTimer
      key={restData.exerciseName + restData.startTime}
      duration={restData.remaining}
      onComplete={() => {
        localStorage.removeItem('floatingRest');
        setRestData(null);
      }}
    />
  );
}
