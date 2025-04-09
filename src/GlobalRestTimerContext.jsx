import { createContext, useContext, useState } from 'react';

const GlobalRestTimerContext = createContext();

export const GlobalRestTimerProvider = ({ children }) => {
  const [restTimerDone, setRestTimerDone] = useState(false);

  const startGlobalRestTimer = () => {
    setRestTimerDone(true);
    setTimeout(() => {
      setRestTimerDone(false);
    }, 2500);
  };

  return (
    <GlobalRestTimerContext.Provider value={{ restTimerDone, startGlobalRestTimer }}>
      {children}
    </GlobalRestTimerContext.Provider>
  );
};

export const useGlobalRestTimer = () => useContext(GlobalRestTimerContext);
