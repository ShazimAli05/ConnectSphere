import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Shield, User, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-blue-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-brand-600 to-blue-600 dark:from-white dark:via-brand-300 dark:to-blue-400 bg-clip-text text-transparent">
                ConnectSphere
              </span>
              <span className="text-[10px] tracking-wider font-semibold text-brand-600 dark:text-brand-400 uppercase -mt-1">
                Real-Time Messaging
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
            >
              Overview
            </Link>
            {isAuthenticated && (
              <Link
                to="/chat"
                className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                Chat Hub
              </Link>
            )}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-500 transition"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-3 p-1 rounded-full hover:ring-2 hover:ring-brand-500 transition focus:outline-none"
                >
                  <Avatar src={user?.avatar} alt={user?.name} size="sm" isOnline={true} showStatus={true} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden lg:inline-block">
                    {user?.name}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-fade-in"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        @{user?.username}
                      </p>
                    </div>

                    <Link
                      to="/chat"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <MessageSquare className="w-4 h-4 text-brand-500" />
                      <span>Chat Dashboard</span>
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <User className="w-4 h-4 text-brand-500" />
                      <span>Account Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 text-white shadow-glow hover:opacity-95 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Overview
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Chat Hub
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Profile & Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg font-semibold bg-brand-600 text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
