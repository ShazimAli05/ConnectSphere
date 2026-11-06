import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Check,
  CheckCheck,
  MoreVertical,
  Reply,
  Edit2,
  Trash2,
  Smile,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import EmojiPickerPopover from './EmojiPickerPopover';

const MessageBubble = ({ message, isGroup = false }) => {
  const { user, isAdmin } = useAuth();
  const { setReplyMessage, setEditingMessage, deleteMessage, toggleReaction } = useChat();

  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const isSender = message.sender?._id === user?._id;
  const isDeleted = message.isDeleted;

  const handleReply = () => {
    setReplyMessage(message);
    setShowMenu(false);
  };

  const handleEdit = () => {
    setEditingMessage(message);
    setShowMenu(false);
  };

  const handleDeleteForMe = async () => {
    await deleteMessage(message._id, false);
    setShowMenu(false);
  };

  const handleDeleteForEveryone = async () => {
    if (window.confirm('Are you sure you want to delete this message for everyone?')) {
      await deleteMessage(message._id, true);
    }
    setShowMenu(false);
  };

  // Group reactions by emoji
  const groupedReactions = (message.reactions || []).reduce((acc, curr) => {
    if (!acc[curr.emoji]) {
      acc[curr.emoji] = {
        count: 0,
        hasReacted: false,
      };
    }
    acc[curr.emoji].count += 1;
    if (curr.user?._id === user?._id || curr.user === user?._id) {
      acc[curr.emoji].hasReacted = true;
    }
    return acc;
  }, {});

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/60 rounded-full border border-slate-300/40 dark:border-slate-700/40">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-end space-x-2 my-2.5 relative ${
        isSender ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Sender Avatar for incoming group messages */}
      {!isSender && (
        <Avatar
          src={message.sender?.avatar}
          alt={message.sender?.name}
          size="sm"
          className="mb-1 hidden sm:inline-block"
        />
      )}

      {/* Bubble Container */}
      <div className="relative max-w-[85%] sm:max-w-md lg:max-w-lg">
        {/* Sender Name in Group Chat */}
        {!isSender && isGroup && (
          <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mb-1 ml-1">
            {message.sender?.name}
          </p>
        )}

        {/* Hover Action Bar */}
        <div
          className={`absolute top-0 -translate-y-8 z-20 hidden group-hover:flex items-center space-x-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md ${
            isSender ? 'right-0' : 'left-0'
          }`}
        >
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-amber-500 transition rounded"
            title="React"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReply}
            className="p-1 text-slate-400 hover:text-brand-500 transition rounded"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded"
              title="More"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-30 text-xs font-medium">
                {isSender && !isDeleted && (
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Edit message</span>
                  </button>
                )}
                <button
                  onClick={handleDeleteForMe}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Delete for me</span>
                </button>
                {(isSender || isAdmin) && !isDeleted && (
                  <button
                    onClick={handleDeleteForEveryone}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete for everyone</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Emoji Picker Popover */}
        <EmojiPickerPopover
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelectEmoji={(emoji) => toggleReaction(message._id, emoji)}
          position="top"
        />

        {/* Bubble Body */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words transition-all ${
            isSender
              ? 'bg-gradient-to-tr from-brand-600 to-blue-600 text-white rounded-br-xs'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 rounded-bl-xs'
          } ${isDeleted ? 'italic text-slate-400 dark:text-slate-400' : ''}`}
        >
          {/* Reply Preview Quote Header */}
          {message.replyTo && !isDeleted && (
            <div
              className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${
                isSender
                  ? 'bg-black/20 border-white/60 text-blue-100'
                  : 'bg-slate-100 dark:bg-slate-700/60 border-brand-500 text-slate-600 dark:text-slate-300'
              }`}
            >
              <p className="font-semibold">{message.replyTo?.sender?.name || 'User'}</p>
              <p className="truncate line-clamp-1">{message.replyTo?.content || 'Attachment'}</p>
            </div>
          )}

          {/* Media Attachments */}
          {message.attachments && message.attachments.length > 0 && !isDeleted && (
            <div className="space-y-2 mb-2">
              {message.attachments.map((file, idx) => {
                const isImage = file.type?.startsWith('image/') || file.category === 'image';
                if (isImage) {
                  return (
                    <div key={idx} className="relative rounded-xl overflow-hidden cursor-pointer group/img">
                      <img
                        src={file.url}
                        alt={file.name}
                        onClick={() => {
                          setSelectedImage(file.url);
                          setShowImageModal(true);
                        }}
                        className="max-h-60 w-full object-cover rounded-xl hover:opacity-95 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center space-x-2 text-white">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </div>
                  );
                }

                // File Attachment (PDF, Zip, Doc)
                return (
                  <a
                    key={idx}
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center space-x-3 p-3 rounded-xl transition ${
                      isSender
                        ? 'bg-black/20 hover:bg-black/30 text-white'
                        : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{file.name}</p>
                      <p className="text-[10px] opacity-75">{formatFileSize(file.size)}</p>
                    </div>
                    <Download className="w-4 h-4 opacity-75 hover:opacity-100" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Message Text Content */}
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
            {message.isEdited && !isDeleted && (
              <span className="text-[10px] opacity-70 ml-1.5 italic">(edited)</span>
            )}
          </div>

          {/* Metadata: Time and Delivery Status */}
          <div
            className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${
              isSender ? 'text-blue-100' : 'text-slate-400'
            }`}
          >
            <span>{format(new Date(message.createdAt || Date.now()), 'h:mm a')}</span>
            {isSender && (
              <span>
                {message.readBy?.length > 1 ? (
                  <CheckCheck className="w-3.5 h-3.5 text-blue-200" title="Read" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-blue-200" title="Sent" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges on bottom */}
        {Object.keys(groupedReactions).length > 0 && (
          <div
            className={`flex items-center flex-wrap gap-1 mt-1 ${
              isSender ? 'justify-end' : 'justify-start'
            }`}
          >
            {Object.entries(groupedReactions).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(message._id, emoji)}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition ${
                  data.hasReacted
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-400 text-brand-600 dark:text-brand-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{emoji}</span>
                <span>{data.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Expanded preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
