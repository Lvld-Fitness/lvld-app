import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login';
import Signup from './Signup';
import ProfileTab from './ProfileTab';
import PublicProfile from './PublicProfile';
import FeedTab from './FeedTab';
import WorkoutTab from './WorkoutTab';
import PremadeWorkoutPage from './PremadeWorkoutPage';
import AppLayout from './AppLayout';
import { RestTimerProvider } from './RestTimerContext';
import { GlobalRestTimerProvider } from './GlobalRestTimerContext';
import StoryViewer from './StoryViewer';
import SinglePost from './SinglePost'; // if you have a SinglePost component (or whatever you named it)
import SeasonalLeaderboard from "./SeasonalLeaderboard";
import ActiveWorkoutView from "./ActiveWorkoutView";
import TeamsTab from './TeamsTab';



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
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={
          user ? (
            <RestTimerProvider>
              <GlobalRestTimerProvider>
                <AppLayout>
                  <WorkoutTab />
                </AppLayout>
              </GlobalRestTimerProvider>
            </RestTimerProvider>
          ) : <Navigate to="/login" />
        } />

        <Route path="/premade" element={
          user ? (
            <RestTimerProvider>
              <GlobalRestTimerProvider>
                <AppLayout>
                  <PremadeWorkoutPage />
                </AppLayout>
              </GlobalRestTimerProvider>
            </RestTimerProvider>
          ) : <Navigate to="/login" />
        } />
    
        <Route path="/teams" element={
          user ? (
            <RestTimerProvider>
              <GlobalRestTimerProvider>
                <AppLayout>
                  <TeamsTab />
                </AppLayout>
              </GlobalRestTimerProvider>
            </RestTimerProvider>
          ) : <Navigate to="/login" />
        } />
       
        <Route path="/feed" element={
          user ? (
            <RestTimerProvider>
              <GlobalRestTimerProvider>
                <AppLayout>
                  <FeedTab />
                </AppLayout>
              </GlobalRestTimerProvider>
            </RestTimerProvider>
          ) : <Navigate to="/login" />
        } />

        <Route path="/profile" element={
          user ? (
            <RestTimerProvider>
              <GlobalRestTimerProvider>
                <AppLayout>
                  <ProfileTab />
                </AppLayout>
              </GlobalRestTimerProvider>
            </RestTimerProvider>
          ) : <Navigate to="/login" />
        } />

        <Route path="/profile/:uid/*" element={
          user ? (
            <RestTimerProvider>
              <GlobalRestTimerProvider>
                <AppLayout>
                  <PublicProfile />
                </AppLayout>
              </GlobalRestTimerProvider>
            </RestTimerProvider>
          ) : <Navigate to="/login" />
        } />

        <Route path="/rankings" element={
          user ? (
            <RestTimerProvider>
              <GlobalRestTimerProvider>
                <AppLayout>
                  <SeasonalLeaderboard />
                </AppLayout>
              </GlobalRestTimerProvider>
            </RestTimerProvider>
          ) : <Navigate to="/login" />
        } />


        <Route path="/story/:userId" element={<StoryViewer />} />

        <Route path="/post/:postId" element={<SinglePost />} />

        <Route path="/workout/:userId" element={<ActiveWorkoutView />} />



      </Routes>


  );
}
