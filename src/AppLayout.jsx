// AppLayout.jsx
import { Outlet } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { House, Barbell, UsersThree, ChatCircleDots } from 'phosphor-react';

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

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
          className={`flex flex-col items-center text-sm ${location.pathname === '/profile' ? 'text-red-500' : 'text-gray-400'}`}
        >
          <House size={24} />
          Home
        </button>
      </nav>
    </div>
  );
}
