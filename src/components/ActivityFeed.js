'use client';

import React from 'react';
import { History, MessageSquare, Clock } from 'lucide-react';

export default function ActivityFeed({ logs }) {
  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 flex items-center mb-4">
        <History className="w-4 h-4 mr-1.5 text-blue-600" />
        Recent Activity
      </h3>

      <div className="space-y-3.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-[11px] text-slate-400">No activity logged yet.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="flex items-start text-xs border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
              <div className="mr-2.5 mt-0.5 text-blue-600 bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-600 leading-normal text-xs">
                  <span className="font-bold text-slate-800 mr-1">{log.performedBy}</span>
                  {log.details}
                </p>
                <div className="flex items-center text-[10px] text-slate-400 mt-1">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" />
                  <span>{formatTimeAgo(log.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
