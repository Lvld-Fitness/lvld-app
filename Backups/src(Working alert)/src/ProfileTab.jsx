
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

export default function ProfileTab() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
        Log out
      </button>
    </div>
  );
}
