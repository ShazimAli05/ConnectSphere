import React, { useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  Info,
  ArrowLeft,
  MessageSquare,
  Shield,
  Users,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatArea = ({ onToggleDetails, onBackToSidebar, showDetails }) => {
  const { user } = useAuth();
  const { activeConversation, messages, loadingMessages, typingUsers } = useChat();
  const { isUserOnline } = useSocket();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new message or conversation change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  if (!activeConversation) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-[#070b14] text-center p-8 select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center shadow-glow mb-4 text-white">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome to ConnectSphere
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          Select an ongoing conversation from the sidebar or start a new direct chat with a teammate.
        </p>
      </div>
    );
  }

  const isGroup = activeConversation.isGroup;
  const otherUser = !isGroup
    ? activeConversation.participants?.find((p) => p._id !== user?._id)
    : null;

  const title = isGroup ? activeConversation.groupName : otherUser?.name;
  const avatar = isGroup ? activeConversation.groupImage : otherUser?.avatar;
  const isOnline = otherUser ? isUserOnline(otherUser._id) : false;

  // Group messages by date
  const renderMessagesWithDateDividers = () => {
    let lastDateString = null;

    return messages.map((msg, index) => {
      const msgDate = new Date(msg.createdAt || Date.now());
      let dateLabel = format(msgDate, 'MMMM d, yyyy');
      if (isToday(msgDate)) dateLabel = 'Today';
      else if (isYesterday(msgDate)) dateLabel = 'Yesterday';

      const showDateDivider = dateLabel !== lastDateString;
      lastDateString = dateLabel;

      return (
        <React.Fragment key={msg._id || index}>
          {showDateDivider && (
            <div className="flex items-center justify-center my-4">
              <span className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/80 rounded-full border border-slate-300/40 dark:border-slate-700/50">
                {dateLabel}
              </span>
            </div>
          )}
          <MessageBubble message={msg} isGroup={isGroup} />
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#070b14] overflow-hidden">
      {/* 1. Header */}
      <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b101b]/80 backdrop-blur-md flex items-center justify-between select-none">
        <div className="flex items-center space-x-3">
          {/* Mobile Back Button */}
          <button
            onClick={onBackToSidebar}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Avatar
            src={avatar}
            alt={title}
            size="md"
            isOnline={isOnline}
            showStatus={!isGroup}
          />

          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                {title}
              </h3>
              {isGroup && (
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full">
                  Group
                </span>
              )}
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isGroup
                ? `${activeConversation.participants?.length || 0} participants`
                : isOnline
                ? 'Online'
                : 'Offline'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-slate-500 dark:text-slate-400">
          <button
            onClick={() => alert('Audio call capability will be connected in next iteration.')}
            className="p-2 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Start voice call"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => alert('Video call capability will be connected in next iteration.')}
            className="p-2 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Start video call"
          >
            <Video className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleDetails}
            className={`p-2 rounded-xl transition ${
              showDetails
                ? 'text-brand-600 bg-brand-50 dark:bg-brand-950/40'
                : 'hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Conversation details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mb-2 stroke-1 opacity-50" />
            <p className="text-sm font-semibold">No messages in this chat yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Say hello or share an update to start the conversation!
            </p>
          </div>
        ) : (
          <>
            {renderMessagesWithDateDividers()}

            {/* Typing Indicator Bubble */}
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2 my-2 text-xs text-slate-500 dark:text-slate-400 animate-fade-in">
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  {typingUsers.map((u) => u.name).join(', ')}
                </span>
                <span>is typing</span>
                <div className="flex items-center space-x-1 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 typing-dot"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 typing-dot"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 typing-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 3. Input Bar Dock */}
      <MessageInput />
    </div>
  );
};

export default ChatArea;
