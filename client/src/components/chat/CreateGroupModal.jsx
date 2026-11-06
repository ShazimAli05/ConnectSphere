import React, { useState, useEffect } from 'react';
import { Users, Search, Check, X, Loader2 } from 'lucide-react';
import { userService } from '../../services/userService';
import { useChat } from '../../context/ChatContext';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createGroup } = useChat();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const res = await userService.getAllUsers();
          if (res.success) {
            setAllUsers(res.users);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
      setGroupName('');
      setDescription('');
      setSelectedUserIds([]);
      setError('');
    }
  }, [isOpen]);

  const toggleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please provide a group name.');
      return;
    }

    if (selectedUserIds.length === 0) {
      setError('Please select at least 1 other member for the group.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createGroup({
        groupName: groupName.trim(),
        groupDescription: description.trim(),
        memberIds: selectedUserIds,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    if (!search.trim()) return true;
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group" maxWidth="max-w-lg">
      <form onSubmit={handleCreate} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl">
            {error}
          </div>
        )}

        {/* Group Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            required
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Design Systems Guild"
            className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Group Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this channel about?"
            className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white resize-none"
          />
        </div>

        {/* Member Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Members ({selectedUserIds.length} selected)
          </label>

          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter teammates..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading directory...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => toggleSelectUser(u._id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-brand-500/10 dark:bg-brand-900/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Avatar src={u.avatar} alt={u.name} size="sm" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">@{u.username}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border ${
                        isSelected
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">No members found.</div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2 px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 text-white shadow-glow hover:opacity-95 disabled:opacity-50 transition"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Create Group</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
