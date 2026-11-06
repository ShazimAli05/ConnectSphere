import React from 'react';

const Avatar = ({
  src,
  alt = 'User',
  size = 'md',
  isOnline = false,
  showStatus = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const statusSizeClasses = {
    sm: 'w-2.5 h-2.5 right-0 bottom-0',
    md: 'w-3 h-3 right-0 bottom-0',
    lg: 'w-3.5 h-3.5 right-0.5 bottom-0.5',
    xl: 'w-4 h-4 right-1 bottom-1',
    '2xl': 'w-5 h-5 right-1.5 bottom-1.5',
  };

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <img
        src={src || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
        alt={alt}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-800 bg-slate-200 dark:bg-slate-700`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(alt)}`;
        }}
      />
      {showStatus && (
        <span
          className={`absolute rounded-full border-2 border-white dark:border-slate-900 ${
            statusSizeClasses[size] || statusSizeClasses.md
          } ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default Avatar;
