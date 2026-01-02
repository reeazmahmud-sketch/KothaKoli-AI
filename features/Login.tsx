
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onLogin();
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-dark)] p-4">
      <div className="w-full max-w-md bg-[var(--bg-medium)] rounded-xl shadow-lg border border-[var(--border-color)] p-8 text-center">
        <h1 className="inline-block text-3xl font-bold font-orbitron text-white bg-gradient-to-r from-blue-500 to-purple-600 py-2 px-6 rounded-lg mb-4">
          {t('app.title')}
        </h1>
        
        {/* Welcome message - effectively hidden for EN based on previous request, visible for BN */}
        <p className="text-[var(--text-dark)] mb-8 min-h-[1.5rem]">{t('login.welcome')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              // Combine Bangla and English in the placeholder
              placeholder="আপনার ইমেল বা ফোন নম্বর লিখুন / Enter your email or phone number"
              className="w-full bg-gray-800 p-3 rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-gray-200 placeholder:text-gray-500 text-center"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-semibold text-white flex flex-col items-center justify-center gap-1"
          >
            <span className="text-base">সাইন ইন / সাইন আপ করুন</span>
            <span className="text-xs text-gray-400">Sign In / Sign Up</span>
          </button>
        </form>
      </div>
    </div>
  );
};
