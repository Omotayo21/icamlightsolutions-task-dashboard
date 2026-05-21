'use client';

import React, { useState } from 'react';
import { Megaphone, Plus, Calendar, User, Pin, Loader2 } from 'lucide-react';

export default function Announcements({ announcements, onAddAnnouncement }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddAnnouncement(title.trim(), content.trim());
      setTitle('');
      setContent('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <Megaphone className="w-4 h-4 mr-1.5 text-blue-600" />
          Announcements
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          disabled={isSubmitting}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center"
        >
          {isAdding ? 'Cancel' : 'Post Announcement'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
          <input
            type="text"
            placeholder="Announcement Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
            required
          />
          <textarea
            placeholder="Details (e.g. Call scheduled at 2pm)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            rows="2"
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500 resize-none disabled:bg-slate-100"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors flex items-center space-x-1"
            >
              {isSubmitting && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
              <span>Publish</span>
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      <div className="space-y-2.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
        {announcements.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-[11px] text-slate-400">No active announcements.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann._id} className="p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-2.5 right-2.5 text-blue-600/20">
                <Pin className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">{ann.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2 whitespace-pre-wrap">
                {ann.content}
              </p>
              <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-200/80 pt-2">
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1 text-slate-400" />
                  <span>{ann.createdBy}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                  <span>{formatDate(ann.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
