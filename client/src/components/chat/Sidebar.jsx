import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, Users, MessageSquare, Settings, LogOut, X, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { userService } from '../../services/userService';
import ConversationItem from './ConversationItem';
import Avatar from '../common/Avatar';

const Sidebar = ({ onOpenCreateGroup, onSelectMobileChat }) => {
  const { user, logout, isAdmin } = useAuth();
  const { conversations, activeConversation, selectConversation, startDirectChat, loadingConversations } = useChat();
  const { isConnected, isUserOnline } = useSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'direct', 'groups', 'unread'
  const [globalUsers, setGlobalUsers] = useState([]);
  const [searchingGlobal, setSearchingGlobal] = useState(false);

  // Search users globally when query has characters
  useEffect(() => {
    if (!searchQuery.trim()) {
      setGlobalUsers([]);
      setSearchingGlobal(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingGlobal(true);
      try {
        const res = await userService.searchUsers(searchQuery);
        if (res.success) {
          setGlobalUsers(res.users);
        }
      } catch (err) {
        console.error('User search failed:', err.message);
      } finally {
        setSearchingGlobal(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter conversations based on tab and query
  const filteredConversations = conversations.filter((conv) => {
    // Tab filter
    if (activeTab === 'direct' && conv.isGroup) return false;
    if (activeTab === 'groups' && !conv.isGroup) return false;
    if (activeTab === 'unread') {
      const unread = conv.unreadCounts?.[user?._id] || 0;
      if (unread === 0) return false;
    }

    // Query filter
    if (!searchQuery.trim()) return true;

    const lowerQuery = searchQuery.toLowerCase();
    if (conv.isGroup) {
      return conv.groupName?.toLowerCase().includes(lowerQuery);
    } else {
      const other = conv.participants?.find((p) => p._id !== user?._id);
      return (
        other?.name?.toLowerCase().includes(lowerQuery) ||
        other?.username?.toLowerCase().includes(lowerQuery)
      );
    }
  });

  const handleStartChatWithUser = async (targetUserId) => {
    try {
      await startDirectChat(targetUserId);
      setSearchQuery('');
      setGlobalUsers([]);
      if (onSelectMobileChat) onSelectMobileChat();
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleSelectConv = (conv) => {
    selectConversation(conv);
    if (onSelectMobileChat) onSelectMobileChat();
  };

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-white dark:bg-[#0b101b] border-r border-slate-200 dark:border-slate-800/80 select-none">
      {/* 1. Header: User Info & Action Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/profile" className="relative group" title="View Profile">
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              size="md"
              isOnline={isConnected}
              showStatus={true}
            />
          </Link>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
              {user?.name}
            </h3>
            <span className="text-[11px] text-emerald-500 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{user?.status || 'Online'}</span>
            </span>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center space-x-1">
          {isAdmin && (
            <Link
              to="/admin"
              className="p-2 text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Admin Panel"
            >
              <Shield className="w-4 h-4" />
            </Link>
          )}

          <button
            onClick={onOpenCreateGroup}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Create New Group"
          >
            <Users className="w-4 h-4" />
          </button>

          <Link
            to="/profile"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Settings & Profile"
          >
            <Settings className="w-4 h-4" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/40">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats, contacts, or users..."
            className="w-full pl-10 pr-9 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Filter Navigation Tabs */}
      <div className="flex items-center space-x-1 px-4 py-2 border-b border-slate-100 dark:border-slate-800/40 text-xs font-semibold">
        {[
          { key: 'all', label: 'All' },
          { key: 'direct', label: 'Direct' },
          { key: 'groups', label: 'Groups' },
          { key: 'unread', label: 'Unread' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Scrollable Conversations or Global Search Results List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Global Directory Search Matches (when typing search query) */}
        {searchQuery.trim() && (
          <div className="mb-4">
            <div className="px-3 py-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              {searchingGlobal ? 'Searching user network...' : 'Global User Network'}
            </div>
            {globalUsers.length > 0 ? (
              <div className="space-y-1 mt-1">
                {globalUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleStartChatWithUser(u._id)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Avatar
                        src={u.avatar}
                        alt={u.name}
                        size="sm"
                        isOnline={isUserOnline(u._id)}
                        showStatus={true}
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">@{u.username}</p>
                      </div>
                    </div>
                    <button
                      className="px-2.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 rounded-lg flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !searchingGlobal && (
                <p className="px-3 py-1 text-xs text-slate-400">No new users matching "{searchQuery}"</p>
              )
            )}
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800/40 mt-2">
              Existing Conversations
            </div>
          </div>
        )}

        {/* Existing Conversations */}
        {loadingConversations ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              isActive={activeConversation?._id === conv._id}
              onClick={() => handleSelectConv(conv)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mb-2 stroke-1 opacity-50" />
            <p className="text-sm font-medium">No conversations found</p>
            <p className="text-xs text-slate-500 mt-1">
              Search for team members or create a group to start collaborating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
