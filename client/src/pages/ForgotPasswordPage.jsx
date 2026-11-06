import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import Navbar from '../components/common/Navbar';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        setMessage(res.message);
        if (res.resetToken) {
          setResetToken(res.resetToken);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch reset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reset your password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your account email to receive recovery instructions.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{message}</span>
                </div>
                {resetToken && (
                  <div className="pt-2 border-t border-emerald-500/20">
                    <p className="text-[11px] text-slate-400 mb-1">Demo direct reset token generated:</p>
                    <Link
                      to={`/reset-password?token=${resetToken}`}
                      className="inline-block py-1.5 px-3 bg-emerald-600 text-white rounded-lg font-bold text-xs"
                    >
                      Click here to enter new password
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-glow hover:bg-brand-500 disabled:opacity-50 transition flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Send Reset Link</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
