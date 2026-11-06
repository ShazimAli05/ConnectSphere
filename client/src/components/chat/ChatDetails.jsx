import React, { useState } from 'react';
import {
  X,
  Users,
  Image,
  FileText,
  Search,
  LogOut,
  Trash2,
  UserPlus,
  Shield,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';

const ChatDetails = ({ isOpen, onClose, onOpenAddMember }) => {
  const { user } = useAuth();
  const { activeConversation, messages, leaveGroup, deleteConversation } = useChat();
  const { isUserOnline } = useSocket();

  const [activeTab, setActiveTab] = useState('media'); // 'media', 'files', 'members'
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !activeConversation) return null;

  const isGroup = activeConversation.isGroup;
  const otherUser = !isGroup
    ? activeConversation.participants?.find((p) => p._id !== user?._id)
    : null;

  const title = isGroup ? activeConversation.groupName : otherUser?.name;
  const avatar = isGroup ? activeConversation.groupImage : otherUser?.avatar;
  const isOnline = otherUser ? isUserOnline(otherUser._id) : false;

  // Filter all media and attachments in conversation messages
  const sharedMedia = messages
    .flatMap((m) => m.attachments || [])
    .filter((a) => a.type?.startsWith('image/') || a.category === 'image');

  const sharedFiles = messages
    .flatMap((m) => m.attachments || [])
    .filter((a) => !a.type?.startsWith('image/') && a.category !== 'image');

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      await leaveGroup(activeConversation._id);
      onClose();
    }
  };

  const handleDeleteConversation = async () => {
    if (window.confirm('Are you sure you want to delete this conversation? All messages will be permanently deleted.')) {
      await deleteConversation(activeConversation._id);
      onClose();
    }
  };

  return (
    <div className="w-80 lg:w-96 flex flex-col h-full bg-white dark:bg-[#0b101b] border-l border-slate-200 dark:border-slate-800/80 animate-fade-in select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conversation Info</h3>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <Avatar
            src={avatar}
            alt={title}
            size="2xl"
            isOnline={isOnline}
            showStatus={!isGroup}
            className="mb-3"
          />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
          {!isGroup && otherUser?.username && (
            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
              @{otherUser.username}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs leading-relaxed">
            {isGroup
              ? activeConversation.groupDescription || 'No description provided'
              : otherUser?.bio || 'Hey there! I am using ConnectSphere.'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-around border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center space-x-1.5 pb-2 transition ${
              activeTab === 'media'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Media ({sharedMedia.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center space-x-1.5 pb-2 transition ${
              activeTab === 'files'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Files ({sharedFiles.length})</span>
          </button>

          {isGroup && (
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center space-x-1.5 pb-2 transition ${
                activeTab === 'members'
                  ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members ({activeConversation.participants?.length || 0})</span>
            </button>
          )}
        </div>

        {/* Tab 1: Shared Media Gallery */}
        {activeTab === 'media' && (
          <div>
            {sharedMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {sharedMedia.map((m, idx) => (
                  <a
                    key={idx}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-xl overflow-hidden group relative bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={m.url}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">No shared photos yet</p>
            )}
          </div>
        )}

        {/* Tab 2: Shared Documents */}
        {activeTab === 'files' && (
          <div className="space-y-2">
            {sharedFiles.length > 0 ? (
              sharedFiles.map((f, idx) => (
                <a
                  key={idx}
                  href={f.url}
                  download={f.name}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 transition text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                      {f.name}
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                </a>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">No documents shared yet</p>
            )}
          </div>
        )}

        {/* Tab 3: Group Members */}
        {activeTab === 'members' && isGroup && (
          <div className="space-y-3">
            {/* Add Member button if admin */}
            {(activeConversation.groupAdmin?._id === user?._id || user?.role === 'admin') && (
              <button
                onClick={onOpenAddMember}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-brand-500/50 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Members</span>
              </button>
            )}

            <div className="space-y-1.5">
              {activeConversation.participants?.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Avatar
                      src={member.avatar}
                      alt={member.name}
                      size="sm"
                      isOnline={isUserOnline(member._id)}
                      showStatus={true}
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">@{member.username}</p>
                    </div>
                  </div>

                  {activeConversation.groupAdmin?._id === member._id && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Shield className="w-3 h-3" />
                      <span>Admin</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Destructive Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          {isGroup ? (
            <button
              onClick={handleLeaveGroup}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Group</span>
            </button>
          ) : (
            <button
              onClick={handleDeleteConversation}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Conversation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDetails;
