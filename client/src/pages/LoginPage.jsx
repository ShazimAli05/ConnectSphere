import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Lock, Mail, Eye, EyeOff, Loader2, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!identifier || !password) {
      setError('Please provide email/username and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await login(identifier, password, rememberMe);
      if (result.success) {
        navigate('/chat');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setLoading(true);
    setError('');
    try {
      const result = await login(email, pass, true);
      if (result.success) {
        navigate('/chat');
      } else {
        setError(result.message || 'Demo login failed');
      }
    } catch (err) {
      setError('An error occurred during demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-glow mx-auto mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sign in to ConnectSphere
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials or choose a quick demo role below.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="alex@connectsphere.com or alexm"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Remember my session for 7 days
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-600 text-white font-semibold text-sm shadow-glow hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                Quick 1-Click Demo Logins
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@connectsphere.com', 'AdminPass123!')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin User</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('alex@connectsphere.com', 'UserPass123!')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Alex (Architect)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('sarah@connectsphere.com', 'UserPass123!')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sarah (UI/UX)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('marcus@connectsphere.com', 'UserPass123!')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Marcus (DevOps)</span>
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
