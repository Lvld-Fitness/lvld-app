import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo.png'; // adjust path if needed


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if ('vibrate' in navigator) navigator.vibrate(100);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white px-4">
  <img src={logo} alt="LVLD Logo" className="h-66" />

      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-6 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Login to LVLD</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 bg-gray-800 rounded text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 bg-gray-800 rounded text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}
