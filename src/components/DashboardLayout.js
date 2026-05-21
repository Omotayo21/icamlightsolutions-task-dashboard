'use client';

import React from 'react';
import { useUser } from './UserContext';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Layers 
} from 'lucide-react';

export default function DashboardLayout({ children, stats }) {
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer space-x-2" 
            onClick={() => router.push('/dashboard')}
          >
            <span className="text-xl font-black tracking-tight text-blue-600 hover:opacity-90 transition-opacity">
              icamlightsolutions
            </span>
          </div>

          {/* User Profile / Switch */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {user}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Switch User"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 border border-slate-200 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content & Stats */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Stat 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="w-16 h-16 text-blue-500" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-extrabold tracking-tight text-blue-600">{stats.pending || 0}</span>
                <span className="text-xs text-slate-500 font-medium ml-2">needs action</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Focus</p>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-extrabold tracking-tight text-emerald-600">{stats.completed || 0}</span>
                <span className="text-xs text-slate-500 font-medium ml-2">done</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign className="w-16 h-16 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Prospects</p>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-extrabold tracking-tight text-amber-500">{stats.prospects || 0}</span>
                <span className="text-xs text-slate-500 font-medium ml-2">leads</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-16 h-16 text-purple-500" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</p>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-extrabold tracking-tight text-purple-600">{stats.completionRate || 0}%</span>
                <span className="text-xs text-slate-500 font-medium ml-2">efficiency</span>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>&copy; 2026 icamlightsolutions operational workspace. Built for accountability.</p>
      </footer>
    </div>
  );
}
