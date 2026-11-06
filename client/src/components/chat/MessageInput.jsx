import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, Loader2, Image, FileText } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { uploadService } from '../../services/uploadService';
import EmojiPickerPopover from './EmojiPickerPopover';

const MessageInput = () => {
  const { sendMessage, replyMessage, setReplyMessage, emitTyping } = useChat();

  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [content]);

  const handleTyping = (e) => {
    setContent(e.target.value);

    // Emit typing indicator with debounce
    emitTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitTyping(false);
    }, 1500);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await uploadService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      if (res.success && res.file) {
        setAttachments((prev) => [...prev, res.file]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!content.trim() && attachments.length === 0) || uploading) return;

    try {
      emitTyping(false);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

      await sendMessage({
        content: content.trim(),
        attachments,
        replyTo: replyMessage?._id,
        messageType: attachments.length > 0 ? attachments[0].category : 'text',
      });

      setContent('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-[#0b101b] border-t border-slate-200 dark:border-slate-800/80">
      {/* Reply Banner */}
      {replyMessage && (
        <div className="flex items-center justify-between p-2 mb-2 bg-brand-500/10 border-l-4 border-brand-500 rounded-r-xl text-xs">
          <div className="truncate">
            <span className="font-semibold text-brand-600 dark:text-brand-400">
              Replying to {replyMessage.sender?.name}:
            </span>
            <span className="text-slate-600 dark:text-slate-300 ml-2 truncate">
              {replyMessage.content || 'Attachment'}
            </span>
          </div>
          <button
            onClick={() => setReplyMessage(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex items-center space-x-2 mb-2 overflow-x-auto pb-1">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="relative flex items-center space-x-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
            >
              {att.category === 'image' ? (
                <img src={att.url} alt="preview" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <FileText className="w-6 h-6 text-brand-500" />
              )}
              <span className="truncate max-w-[100px] text-slate-700 dark:text-slate-300">
                {att.name}
              </span>
              <button
                onClick={() => handleRemoveAttachment(idx)}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploading progress indicator */}
      {uploading && (
        <div className="flex items-center space-x-2 mb-2 text-xs text-brand-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Uploading media... {uploadProgress}%</span>
        </div>
      )}

      {/* Main Input Row */}
      <div className="flex items-end space-x-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex-shrink-0"
          title="Attach file or photo"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input & Emoji Container */}
        <div className="relative flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center focus-within:ring-2 focus-within:ring-brand-500 transition">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift + Enter for new line)"
            className="w-full pl-4 pr-10 py-2.5 bg-transparent resize-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none max-h-36"
          />

          {/* Emoji Picker Trigger */}
          <div className="absolute right-2 bottom-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-1.5 text-slate-400 hover:text-amber-500 transition"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <EmojiPickerPopover
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              onSelectEmoji={(emoji) => setContent((prev) => prev + emoji)}
              position="top"
            />
          </div>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!content.trim() && attachments.length === 0) || uploading}
          className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${
            (content.trim() || attachments.length > 0) && !uploading
              ? 'bg-gradient-to-tr from-brand-600 to-blue-600 text-white shadow-glow hover:scale-105 active:scale-95'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
