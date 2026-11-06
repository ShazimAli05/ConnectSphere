import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import Navbar from '../components/common/Navbar';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">404 - Page Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          The requested page route could not be found on the ConnectSphere platform.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-glow hover:bg-brand-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Safety</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
