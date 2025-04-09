import { createContext, useContext } from 'react';

const GlobalRestTimerContext = createContext();

export function GlobalRestTimerProvider({ children }) {
  const startGlobalRestTimer = () => {
    console.log("Global rest timer started!");
    // Add actual logic here later if needed
  };

  return (
    <GlobalRestTimerContext.Provider value={{ startGlobalRestTimer }}>
      {children}
    </GlobalRestTimerContext.Provider>
  );
}

export const useGlobalRestTimer = () => useContext(GlobalRestTimerContext);