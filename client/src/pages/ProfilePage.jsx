import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Upload,
  Check,
  AlertCircle,
  Shield,
  Clock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { uploadService } from '../services/uploadService';
import Navbar from '../components/common/Navbar';
import Avatar from '../components/common/Avatar';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [status, setStatus] = useState(user?.status || 'available');
  const [customStatus, setCustomStatus] = useState(user?.customStatus || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const res = await uploadService.uploadFile(file);
      if (res.success && res.file) {
        setAvatar(res.file.url);
      }
    } catch (err) {
      alert('Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await updateUserProfile({
        name,
        username,
        bio,
        avatar,
        status,
        customStatus,
      });

      if (res.success) {
        setProfileSuccess('Profile updated successfully!');
      } else {
        setProfileError(res.message || 'Profile update failed');
      }
    } catch (err) {
      setProfileError('Failed to save profile changes');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    try {
      const res = await userService.updatePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Link */}
        <button
          onClick={() => navigate('/chat')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Chat Dashboard</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Profile Card Overview */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
              <div className="relative inline-block mb-4 group cursor-pointer">
                <Avatar src={avatar} alt={name} size="2xl" isOnline={true} showStatus={true} />
                <label className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-semibold">Change</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>

              {uploadingAvatar && (
                <p className="text-xs text-brand-500 mb-2 animate-pulse">Uploading new avatar...</p>
              )}

              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{name}</h2>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-2">@{username}</p>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === 'available'
                      ? 'bg-emerald-500'
                      : status === 'busy'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="capitalize">{status}</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                {bio || 'No bio specified.'}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-brand-500" />
                    <span>Role</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white uppercase">
                    {user?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-500" />
                    <span>Email</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                    {user?.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>Joined</span>
                  </span>
                  <span>{user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recent'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Edit & Password Change */}
          <div className="md:col-span-2 space-y-6">
            {/* 1. Edit Profile Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Personal Information
              </h3>

              {profileSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Online Presence Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="available">Available (Online)</option>
                      <option value="busy">Busy (Do Not Disturb)</option>
                      <option value="away">Away</option>
                      <option value="offline">Invisible (Appear Offline)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Custom Status Message
                    </label>
                    <input
                      type="text"
                      value={customStatus}
                      onChange={(e) => setCustomStatus(e.target.value)}
                      placeholder="e.g. In architecture sprint"
                      className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your team about yourself..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-glow hover:bg-brand-500 disabled:opacity-50 transition"
                  >
                    {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Change Password Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Update Password
              </h3>

              {passwordSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-semibold text-xs hover:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 transition"
                  >
                    {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
