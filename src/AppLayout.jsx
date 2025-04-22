// AppLayout.jsx
import { Outlet } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { House, Barbell, UsersThree, ChatCircleDots } from 'phosphor-react';
import { onSnapshot, collection } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useState, useEffect } from 'react';


export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasUnreadNotif, setHasUnreadNotif] = useState(false);


  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(
      collection(db, 'users', auth.currentUser.uid, 'notifications'),
      (snap) => {
        const unread = snap.docs.some(doc => !doc.data().read);
        setHasUnreadNotif(unread);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="p-4">{children || <Outlet />}</div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 flex justify-around items-center py-3 z-50">
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center text-sm ${location.pathname.includes('/dashboard') ? 'text-red-500' : 'text-gray-400'}`}
        >
          <Barbell size={24} />
          Workout
        </button>

        <button
          onClick={() => navigate('/teams')}
          className={`flex flex-col items-center text-sm ${location.pathname.includes('/teams') ? 'text-red-500' : 'text-gray-400'}`}
        >
          <UsersThree size={24} />
          Teams
        </button>

        <button
          onClick={() => navigate('/feed')}
          className={`flex flex-col items-center text-sm ${location.pathname.includes('/feed') ? 'text-red-500' : 'text-gray-400'}`}
        >
          <ChatCircleDots size={24} />
          Feed
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center text-sm relative ${location.pathname === '/profile' ? 'text-red-500' : 'text-gray-400'}`}
        >
          <div className="relative">
            <House size={24} />
            {hasUnreadNotif && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
          Home
        </button>

      </nav>
    </div>
  );
}
