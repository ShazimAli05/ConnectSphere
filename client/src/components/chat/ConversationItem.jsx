import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Image, FileText, Check, CheckCheck, Users } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ConversationItem = ({ conversation, isActive, onClick }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();

  // If direct conversation, get the other participant
  const otherUser = !conversation.isGroup
    ? conversation.participants?.find((p) => p._id !== user?._id)
    : null;

  const title = conversation.isGroup
    ? conversation.groupName || 'Group Chat'
    : otherUser?.name || 'Direct Conversation';

  const avatarSrc = conversation.isGroup
    ? conversation.groupImage
    : otherUser?.avatar;

  const isOnline = otherUser ? isUserOnline(otherUser._id) : false;

  const unreadCount = conversation.unreadCounts?.[user?._id] || 0;

  // Format last message timestamp
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isToday(date)) return format(date, 'h:mm a');
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMM d');
    } catch {
      return '';
    }
  };

  const lastMessage = conversation.lastMessage;
  const isSender = lastMessage?.sender?._id === user?._id;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`w-full flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 text-left select-none ${
        isActive
          ? 'bg-brand-500/10 dark:bg-brand-900/30 border border-brand-500/30'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
      }`}
    >
      <div className="relative">
        <Avatar
          src={avatarSrc}
          alt={title}
          size="md"
          isOnline={isOnline}
          showStatus={!conversation.isGroup}
        />
        {conversation.isGroup && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 text-brand-400 flex items-center justify-center border-2 border-white dark:border-slate-900">
            <Users className="w-3 h-3" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4
            className={`text-sm font-semibold truncate ${
              isActive
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {title}
          </h4>
          {lastMessage?.createdAt && (
            <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1 truncate max-w-[190px]">
            {isSender && (
              <span className="text-slate-400 flex-shrink-0">
                {lastMessage?.readBy?.length > 1 ? (
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" />
                ) : (
                  <Check className="w-3.5 h-3.5 inline" />
                )}
              </span>
            )}

            {lastMessage?.messageType === 'image' && (
              <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                <Image className="w-3 h-3 text-brand-400" />
                <span>Photo</span>
              </span>
            )}

            {lastMessage?.messageType === 'file' && (
              <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                <FileText className="w-3 h-3 text-amber-400" />
                <span>Attachment</span>
              </span>
            )}

            {lastMessage?.messageType === 'text' && (
              <span className="truncate">
                {isSender ? 'You: ' : ''}
                {lastMessage?.content}
              </span>
            )}

            {lastMessage?.messageType === 'system' && (
              <span className="truncate italic text-slate-400">
                {lastMessage?.content}
              </span>
            )}

            {!lastMessage && (
              <span className="italic text-slate-400">No messages yet</span>
            )}
          </div>

          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-[11px] font-bold rounded-full bg-brand-600 text-white min-w-[20px] text-center shadow-glow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
