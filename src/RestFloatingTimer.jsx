import { useEffect, useRef } from 'react';

export default function RestFloatingTimer({ duration = 30, onComplete }) {
  const barRef = useRef(null);
  const animationRef = useRef(null);
  const startTime = useRef(null);

  const animate = (timestamp) => {
    if (!startTime.current) startTime.current = timestamp;
    const elapsed = (timestamp - startTime.current) / 1000;
    const progress = Math.max((duration - elapsed) / duration, 0);

    if (barRef.current) {
      barRef.current.style.width = `${progress * 100}%`;
      if (progress > 0.66) {
        barRef.current.className = 'h-full bg-green-500';
      } else if (progress > 0.33) {
        barRef.current.className = 'h-full bg-yellow-500';
      } else {
        barRef.current.className = 'h-full bg-red-600';
      }
    }

    if (progress > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (onComplete) {
        onComplete();
      } else {
        localStorage.setItem('rest-timer-alert', 'true');
      }
    }
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-2 z-50">
      <div ref={barRef} className="h-full bg-green-500" style={{ width: '100%' }} />
    </div>
  );
}
