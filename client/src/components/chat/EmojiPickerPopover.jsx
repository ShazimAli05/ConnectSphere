import React, { useRef, useEffect } from 'react';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '😮', '😢', '👏', '🚀', '💯'];

const EmojiPickerPopover = ({ isOpen, onClose, onSelectEmoji, position = 'top' }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`absolute z-30 flex items-center space-x-1 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-xl animate-fade-in ${
        position === 'top' ? '-top-10 right-0' : 'bottom-10 right-0'
      }`}
    >
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => {
            onSelectEmoji(emoji);
            onClose();
          }}
          className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPickerPopover;
