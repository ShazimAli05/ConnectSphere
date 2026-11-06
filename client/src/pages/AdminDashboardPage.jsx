import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Shield,
  Activity,
  AlertTriangle,
  UserX,
  UserCheck,
  Search,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import Navbar from '../components/common/Navbar';
import Avatar from '../components/common/Avatar';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'reports'
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, reportsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getUsers({ limit: 50 }),
        adminService.getReports(),
      ]);

      if (dashRes.success) setStats(dashRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (reportsRes.success) setReports(reportsRes.reports);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleSuspend = async (userId, currentStatus) => {
    try {
      const res = await adminService.toggleUserStatus(userId, !currentStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isSuspended: !currentStatus } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      const res = await adminService.updateReport(reportId, {
        status,
        resolutionNotes: `Moderated by admin on ${new Date().toLocaleDateString()}`,
      });
      if (res.success) {
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      alert('Failed to update report status');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchUser.trim()) return true;
    return (
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
              <Shield className="w-4 h-4" />
              <span>Administrative Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              ConnectSphere Command Center
            </h1>
          </div>
          <button
            onClick={fetchDashboardData}
            className="mt-4 sm:mt-0 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Refresh Metrics
          </button>
        </div>

        {/* 1. Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Registered Users
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalUsers ?? '...'}
            </div>
            <p className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats?.activeUsers ?? 0} active now</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Messages Sent
              </span>
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalMessages ?? '...'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Real-time WebSocket throughput</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Collaborative Groups
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalGroups ?? '...'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats?.totalDirectChats ?? 0} 1-on-1 direct channels
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Moderation Reports
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.pendingReports ?? 0}
            </div>
            <p className="text-[11px] text-amber-500 font-semibold mt-1">Pending review</p>
          </div>
        </div>

        {/* 2. Management Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 text-sm font-semibold transition ${
              activeTab === 'users'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            User Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-4 text-sm font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'reports'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <span>Moderation Reports</span>
            {reports.filter((r) => r.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-white font-bold">
                {reports.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* 3. User Management View */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Table Search */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="relative w-full max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Filter by name, username, or email..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
                Showing {filteredUsers.length} users
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Presence</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar src={u.avatar} alt={u.name} size="sm" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-slate-400 text-[11px]">@{u.username} • {u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-slate-800 dark:text-slate-200 text-xs"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            u.isSuspended
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize text-slate-500 dark:text-slate-400 font-medium">
                          {u.status || 'Offline'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleSuspend(u._id, u.isSuspended)}
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-semibold transition ${
                            u.isSuspended
                              ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                          }`}
                        >
                          {u.isSuspended ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Reactivate</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Moderation Reports View */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div
                  key={report._id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-500 uppercase">
                        {report.reason}
                      </span>
                      <span className="text-xs text-slate-400">
                        Status: <strong className="capitalize">{report.status}</strong>
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Reported User: {report.reportedUser?.name} (@{report.reportedUser?.username})
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Reason: {report.description || 'No detailed note provided.'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Reported by {report.reporter?.name}
                    </p>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleResolveReport(report._id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(report._id, 'resolved')}
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-500 shadow-glow-sm"
                      >
                        Resolve Report
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
                No moderation reports currently queued.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
