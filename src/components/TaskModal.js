'use client';

import React, { useState } from 'react';
import { X, Calendar, Users, AlertCircle } from 'lucide-react';
import { STAFF_MEMBERS, CATEGORIES, WEEKS } from '../lib/config';

export default function TaskModal({ isOpen, onClose, onSave, activeUser }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [category, setCategory] = useState('General');
  const [week, setWeek] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleToggleStaff = (staff) => {
    if (assignedStaff.includes(staff)) {
      setAssignedStaff(assignedStaff.filter((s) => s !== staff));
    } else {
      setAssignedStaff([...assignedStaff, staff]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }

    const todayObj = new Date();
    const month = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}`;

    onSave({
      title: title.trim(),
      description: description.trim(),
      assignedStaff,
      category,
      week,
      dueDate: dueDate || undefined,
      month,
      createdBy: activeUser
    });

    // Reset state
    setTitle('');
    setDescription('');
    setAssignedStaff([]);
    setCategory('General');
    setWeek('');
    setDueDate('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Container */}
      <div className="relative bg-white border border-slate-200 rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2" />
            Add New Operational Task
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Call Client and review sales quote"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Description / Notes
            </label>
            <textarea
              placeholder="Provide extra details or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1" />
              Assign Staff Members
            </label>
            <div className="flex flex-wrap gap-2">
              {STAFF_MEMBERS.map((staff) => {
                const isSelected = assignedStaff.includes(staff);
                return (
                  <button
                    type="button"
                    key={staff}
                    onClick={() => handleToggleStaff(staff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200 text-blue-600' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {staff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Category, Week, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Week */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Weekly Grouping
              </label>
              <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">General Monthly</option>
                {WEEKS.map((wk) => (
                  <option key={wk} value={wk}>{wk}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
            />
          </div>

          {/* Footer Save */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-end space-x-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 bg-transparent hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
