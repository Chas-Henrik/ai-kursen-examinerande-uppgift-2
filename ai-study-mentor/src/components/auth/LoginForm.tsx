"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose?: () => void;
}

export default function LoginForm({ onSwitchToRegister, onClose }: LoginFormProps) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Alla fält måste fyllas i');
      return;
    }

    try {
      await login(email, password);
      if (onClose) onClose();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ett oväntat fel uppstod');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Logga in
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Välkommen tillbaka till AI Studie Mentor
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* E-post fält */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            E-postadress
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="din@email.se"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Lösenord fält */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lösenord
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Ditt lösenord"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Logga in knapp */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium py-2 px-4 rounded-md transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {loading ? 'Loggar in...' : 'Logga in'}
        </button>
      </form>

      {/* Växla till registrering */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Har du inget konto?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary hover:text-primary/80 font-medium"
            disabled={loading}
          >
            Registrera dig här
          </button>
        </p>
      </div>
    </div>
  );
}