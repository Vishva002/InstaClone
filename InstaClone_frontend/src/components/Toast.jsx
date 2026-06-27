import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: 'bg-emerald-500 text-white border-emerald-600',
    error: 'bg-rose-500 text-white border-rose-600',
    info: 'bg-zinc-800 text-zinc-100 border-zinc-900',
  };

  const icons = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill',
  };

  return (
    <div 
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm transition-all duration-300 animate-slide-in ${typeStyles[type]} w-fit ml-auto`}
      style={{
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div className="flex items-center gap-2.5">
        <i className={`bi ${icons[type]} text-lg`}></i>
        <span className="font-medium">{message}</span>
      </div>
      <button 
        onClick={onClose} 
        className="text-white/80 hover:text-white transition bg-transparent border-0 cursor-pointer p-0 text-base flex items-center"
      >
        <i className="bi bi-x"></i>
      </button>
    </div>
  );
};

export default Toast;
