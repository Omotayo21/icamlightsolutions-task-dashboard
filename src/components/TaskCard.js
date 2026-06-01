'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, User, CheckSquare, Square, Pencil, Check, X, ChevronDown } from 'lucide-react';
import { WEEKS } from '@/lib/config';

export default function TaskCard({ task, onUpdateStatus, onEditTask }) {
  const isCompleted = task.status === 'Completed';

  // Inline edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editWeek, setEditWeek] = useState(task.week || '');
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  // Toggle completion status
  const handleToggle = () => {
    if (isEditing) return;
    const nextStatus = isCompleted ? 'Pending' : 'Completed';
    onUpdateStatus(task._id, nextStatus);
  };

  const handleStartEdit = (e) => {
    e.stopPropagation();
    setEditTitle(task.title);
    setEditWeek(task.week || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (e) => {
    e?.stopPropagation();
    if (!editTitle.trim()) return;
    onEditTask(task._id, { title: editTitle.trim(), week: editWeek });
    setIsEditing(false);
  };

  const handleCancelEdit = (e) => {
    e?.stopPropagation();
    setEditTitle(task.title);
    setEditWeek(task.week || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') handleCancelEdit();
  };

  // Category styling
  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Marketing':      return 'bg-pink-50 text-pink-600 border border-pink-100';
      case 'Client Work':    return 'bg-cyan-50 text-cyan-600 border border-cyan-100';
      case 'Sales Prospect': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Partnership':    return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'Design':         return 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100';
      case 'Development':    return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Internal':       return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:               return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div className={`p-3.5 bg-white border rounded-2xl flex items-start space-x-3 transition-all group ${
      isCompleted
        ? 'border-slate-100 bg-slate-50/50 opacity-60'
        : 'border-slate-200 shadow-sm hover:border-slate-300'
    }`}>

      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
        title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
      >
        {isCompleted
          ? <CheckSquare className="w-5 h-5 text-blue-600" />
          : <Square className="w-5 h-5 text-slate-300 hover:text-blue-500" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getCategoryStyle(task.category)}`}>
            {task.category}
          </span>

          {/* Week — editable dropdown when in edit mode, else badge */}
          {isEditing ? (
            <div className="relative inline-flex items-center">
              <select
                value={editWeek}
                onChange={(e) => setEditWeek(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] font-semibold pl-2 pr-5 py-0.5 bg-white border border-blue-400 text-blue-600 rounded-md outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">No week</option>
                {WEEKS.map((wk) => (
                  <option key={wk} value={wk}>{wk}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-blue-400 absolute right-1 pointer-events-none" />
            </div>
          ) : (
            task.week && (
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                {task.week}
              </span>
            )
          )}
        </div>

        {/* Title — inline input when editing */}
        {isEditing ? (
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm font-bold text-slate-800 border border-blue-400 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            placeholder="Task title..."
          />
        ) : (
          <h4 className={`text-sm font-bold text-slate-800 break-words leading-snug ${
            isCompleted ? 'line-through text-slate-400' : ''
          }`}>
            {task.title}
          </h4>
        )}

        {/* Description (not editable, just displayed) */}
        {!isEditing && task.description && (
          <p className={`text-xs text-slate-500 break-words leading-normal  ${
            isCompleted ? 'line-through' : ''
          }`}>
            {task.description}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
          <div className="flex items-center space-x-3 text-[10px] text-slate-400">
            {task.dueDate && (
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            <div className="flex items-center" title={`Created by ${task.createdBy}`}>
              <User className="w-3.5 h-3.5 mr-1" />
              <span className="truncate max-w-[80px]">{task.createdBy}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Assignee avatars (hidden while editing) */}
            {!isEditing && (
              <div className="flex -space-x-1 overflow-hidden">
                {task.assignedStaff && task.assignedStaff.map((staffName) => (
                  <div
                    key={staffName}
                    title={staffName}
                    className="w-15 h-10 rounded-full border border-white bg-blue-600 flex items-center justify-center text-[8px] font-extrabold text-white uppercase shadow-sm select-none"
                  >
                    {staffName}
                  </div>
                ))}
              </div>
            )}

            {/* Edit / Save / Cancel buttons */}
            {!isCompleted && (
              isEditing ? (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleSaveEdit}
                    title="Save changes"
                    className="p-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    title="Cancel"
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartEdit}
                  title="Edit task"
                  className=" flex p-1 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 opacity-100 group-hover:opacity-100 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
