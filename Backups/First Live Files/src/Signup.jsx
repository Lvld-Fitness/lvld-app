
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agree) {
      setError('You must agree to the terms to continue.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative">
      <button
        onClick={() => navigate('/login')}
        className="absolute top-4 right-4 text-white text-xl"
        title="Back to Login"
      >
        ✕
      </button>

      <form
        onSubmit={handleSignup}
        className="bg-gray-800 p-6 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Create Account</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />

        <label className="text-sm flex items-center space-x-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="accent-purple-600"
          />
          <span>I am at least 16 years old and agree to the terms of use. </span>
          <button type="button" onClick={() => setShowTerms(true)} className="text-blue-400 underline ml-1">Read Terms</button>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold"
        >
          Sign Up
        </button>
      </form>
    
        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white text-black p-6 rounded max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Terms of Service</h2>
              <p className="text-sm mb-4">
                By using LVLD, you agree to abide by our community standards. You must be at least 16 years old.
                Do not impersonate others, post harmful or illegal content, or abuse the platform. Your data is
                stored securely and is not sold to third parties. We may update our terms at any time, and continued
                use of the platform implies your acceptance of those changes.
              </p>
              <button
                onClick={() => setShowTerms(false)}
                className="bg-purple-600 text-white px-4 py-2 rounded mt-2"
              >
                Close
              </button>
            </div>
          </div>
        )}

    </div>
  );
}
