import ProfileTab from './ProfileTab';
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login';
import { RestTimerProvider } from './RestTimerContext';
import { GlobalRestTimerProvider } from './GlobalRestTimerContext';
import PremadeWorkoutPage from './PremadeWorkoutPage';
import Signup from './Signup';
import PublicProfile from './PublicProfile';
import AppLayout from './AppLayout';
import FeedTab from './FeedTab';
import WorkoutTab from './WorkoutTab';

function TeamsTab() {
  return <div className="text-white p-4">Teams Tab Coming Soon</div>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingUser) return <div className="text-white bg-black p-4">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

      <Route path="/dashboard" element={user ? (
        <RestTimerProvider>
          <GlobalRestTimerProvider>
            <AppLayout>
              <WorkoutTab />
            </AppLayout>
          </GlobalRestTimerProvider>
        </RestTimerProvider>
      ) : <Navigate to="/login" />} />

      <Route path="/teams" element={user ? (
        <RestTimerProvider>
          <GlobalRestTimerProvider>
            <AppLayout>
              <TeamsTab />
            </AppLayout>
          </GlobalRestTimerProvider>
        </RestTimerProvider>
      ) : <Navigate to="/login" />} />

      <Route path="/feed" element={user ? (
        <RestTimerProvider>
          <GlobalRestTimerProvider>
            <AppLayout>
              <FeedTab />
            </AppLayout>
          </GlobalRestTimerProvider>
        </RestTimerProvider>
      ) : <Navigate to="/login" />} />

      <Route path="/profile" element={user ? (
        <RestTimerProvider>
          <GlobalRestTimerProvider>
            <AppLayout>
              <ProfileTab />
            </AppLayout>
          </GlobalRestTimerProvider>
        </RestTimerProvider>
      ) : <Navigate to="/login" />} />

      <Route path="/profile/:uid/*" element={user ? (
        <RestTimerProvider>
          <GlobalRestTimerProvider>
            <AppLayout>
              <PublicProfile />
            </AppLayout>
          </GlobalRestTimerProvider>
        </RestTimerProvider>
      ) : <Navigate to="/login" />} />
    </Routes>
  );
}
