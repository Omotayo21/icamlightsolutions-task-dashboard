'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import { STAFF_MEMBERS } from '@/lib/config';
import { LogIn, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, login, loading } = useUser();
  const router = useRouter();
  const [selectedName, setSelectedName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedName) {
      setError('Please select your name to proceed');
      return;
    }
    login(selectedName);
    router.push('/dashboard');
  };

  if (loading || user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center px-4">
      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[28px] p-8 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full inline-block mb-3">
            Internal Operations Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 mb-2">
            icamlightsolutions
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Welcome to the shared activity workspace. Choose your profile to begin tracking team goals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Your Name
            </label>
            <select
              value={selectedName}
              onChange={(e) => {
                setSelectedName(e.target.value);
                setError('');
              }}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="" className="text-slate-400">Who is accessing the workspace?</option>
              {STAFF_MEMBERS.map((name) => (
                <option key={name} value={name} className="text-slate-900 bg-white">
                  {name}
                </option>
              ))}
            </select>
            {error && (
              <p className="text-rose-600 text-xs mt-2 pl-1 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-100 transition-all duration-200 group"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Enter Workspace
            <ArrowRight className="w-4 h-4 ml-1.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        <p>&copy; 2026 icamlightsolutions.</p>
      </div>
    </div>
  );
}
