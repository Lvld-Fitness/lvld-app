import { useEffect, useState } from 'react';

export default function RestCountdownModal({ duration, onComplete }) {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          onComplete();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded border border-gray-700 w-full max-w-sm text-center">
        <h3 className="text-xl font-bold text-white mb-4">⏳ Rest Time</h3>
        <div className="text-4xl font-mono text-green-400">{count}s</div>
        <p className="text-sm text-gray-400 mt-4">Recover and get ready...</p>
      </div>
    </div>
  );
}
