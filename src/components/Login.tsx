import React, { useState } from 'react';
import { useAuth, Role } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap, Briefcase } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle, user, profile } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('mentee');
  const [error, setError] = useState('');

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && profile) {
      if (!profile.isProfileComplete) {
        navigate('/setup');
      } else {
        navigate(profile.role === 'mentor' ? '/mentor' : '/mentee');
      }
    }
  }, [user, profile, navigate]);

  const handleLogin = async () => {
    try {
      setError('');
      await signInWithGoogle(role);
    } catch (err) {
      setError('Failed to sign in with Google.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
          Mentor Match
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Connect with mentors and mentees in your college club
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-neutral-100">
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('mentee')}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  role === 'mentee'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-neutral-200 hover:border-blue-300 text-neutral-500'
                }`}
              >
                <GraduationCap className="h-6 w-6 mb-2" />
                <span className="font-medium">Mentee</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('mentor')}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  role === 'mentor'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-neutral-200 hover:border-blue-300 text-neutral-500'
                }`}
              >
                <Briefcase className="h-6 w-6 mb-2" />
                <span className="font-medium">Mentor</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <button
              onClick={handleLogin}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
