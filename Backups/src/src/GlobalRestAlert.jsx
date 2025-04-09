import { useEffect, useState } from 'react';

export default function GlobalRestAlert() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkStorage = () => {
      if (localStorage.getItem('rest-timer-alert') === 'true') {
        setShowAlert(true);
        localStorage.removeItem('rest-timer-alert');
        setTimeout(() => setShowAlert(false), 2000);
      }
    };

    window.addEventListener('storage', checkStorage);
    const interval = setInterval(checkStorage, 500);

    return () => {
      window.removeEventListener('storage', checkStorage);
      clearInterval(interval);
    };
  }, []);

  if (!showAlert) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-[1000] text-lg">
      ⏱ Time for your next set!
    </div>
  );
}
