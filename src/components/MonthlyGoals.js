'use client';

import React, { useState } from 'react';
import { Target, Plus, Square, CheckCircle2, Loader2 } from 'lucide-react';

export default function MonthlyGoals({ goals, onAddGoal, onToggleGoal }) {
  const [newGoal, setNewGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newGoal.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onAddGoal(newGoal.trim());
      setNewGoal('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      await onToggleGoal(id, currentStatus);
    } finally {
      setTogglingId(null);
    }
  };

  // Group goals
  const pendingGoals = goals.filter((g) => g.status !== 'Completed');
  const completedGoals = goals.filter((g) => g.status === 'Completed');

  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm relative">
      {/* Loading Overlay for the section if toggling */}
      {togglingId && (
        <div className="absolute inset-0 bg-white/60 rounded-[24px] flex items-center justify-center z-10 backdrop-blur-[1px]">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <Target className="w-4 h-4 mr-1.5 text-blue-600" />
          Monthly Goals
        </h3>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
          {completedGoals.length}/{goals.length} Done
        </span>
      </div>

      {/* Goal Add Form */}
      <form onSubmit={handleSubmit} className="flex space-x-1.5 mb-4">
        <input
          type="text"
          placeholder="New monthly milestone..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          disabled={isSubmitting}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-blue-400 flex items-center justify-center"
          title="Add Goal"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Goals List */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
        {goals.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-[11px] text-slate-400">No monthly objectives set yet.</p>
          </div>
        ) : (
          <>
            {/* Pending Goals */}
            {pendingGoals.map((goal) => (
              <div 
                key={goal._id}
                onClick={() => handleToggle(goal._id, 'Completed')}
                className="group flex items-start p-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl cursor-pointer transition-colors"
              >
                <div className="mr-2 mt-0.5 text-slate-400 group-hover:text-blue-600 transition-colors">
                  <Square className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 select-none group-hover:text-slate-900 transition-colors break-words">
                    {goal.title}
                  </p>
                  <span className="text-[9px] text-slate-400">By {goal.createdBy}</span>
                </div>
              </div>
            ))}

            {/* Completed Goals */}
            {completedGoals.map((goal) => (
              <div 
                key={goal._id}
                onClick={() => handleToggle(goal._id, 'Pending')}
                className="group flex items-start p-2.5 bg-slate-50/30 border border-slate-100 rounded-xl cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="mr-2 mt-0.5 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-450 text-slate-400 select-none line-through break-words">
                    {goal.title}
                  </p>
                  <span className="text-[9px] text-slate-400">Completed</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
