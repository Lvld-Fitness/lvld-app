
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login';
import Dashboard from './Dashboard';
import { RestTimerProvider } from './RestTimerContext';
import { GlobalRestTimerProvider } from './GlobalRestTimerContext';
import PremadeWorkoutPage from './PremadeWorkoutPage';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <RestTimerProvider>
                <GlobalRestTimerProvider>
                  <Dashboard />
                </GlobalRestTimerProvider>
              </RestTimerProvider>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/premade"
          element={
            user ? (
              <RestTimerProvider>
                <GlobalRestTimerProvider>
                  <PremadeWorkoutPage />
                </GlobalRestTimerProvider>
              </RestTimerProvider>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
