import React, { useState } from 'react';
import { useAuth, Role } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap, Briefcase, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<Role>('mentee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await signInWithGoogle(role);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMsg('');
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, role);
      } else {
        await signInWithEmail(email, password, rememberMe);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset password.');
      return;
    }
    try {
      setError('');
      await resetPassword(email);
      setMsg('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
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
          
          {isSignUp && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">I am joining as a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('mentee')}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all ${
                    role === 'mentee'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-neutral-200 hover:border-blue-300 text-neutral-500'
                  }`}
                >
                  <GraduationCap className="h-5 w-5 mb-1" />
                  <span className="font-medium text-sm">Mentee</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('mentor')}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all ${
                    role === 'mentor'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-neutral-200 hover:border-blue-300 text-neutral-500'
                  }`}
                >
                  <Briefcase className="h-5 w-5 mb-1" />
                  <span className="font-medium text-sm">Mentor</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          {msg && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@college.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-neutral-300 rounded-xl shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Google
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setMsg('');
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
