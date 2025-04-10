// RestTimerContext.jsx
import { createContext, useContext, useState } from 'react';

const RestTimerContext = createContext();

export function RestTimerProvider({ children }) {
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);

  const startTimer = (duration) => {
    setTimerDuration(duration);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
  };

  return (
    <RestTimerContext.Provider value={{ timerActive, timerDuration, startTimer, stopTimer }}>
      {children}
    </RestTimerContext.Provider>
  );
}

export const useRestTimer = () => useContext(RestTimerContext);
