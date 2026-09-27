import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-lg bg-[#1b2132] border border-[#e2583e] text-white shadow-2xl animate-bounce text-sm font-semibold">
      <span>🚀</span>
      <span>{message}</span>
    </div>
  );
};
