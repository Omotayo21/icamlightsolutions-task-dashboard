'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import DashboardLayout from '@/components/DashboardLayout';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import MonthlyGoals from '@/components/MonthlyGoals';
import Announcements from '@/components/Announcements';
//import ActivityFeed from '@/components/ActivityFeed';
import { Plus, ListFilter, ListTodo, Loader2 } from 'lucide-react';
import { WEEKS } from '@/lib/config';

export default function Dashboard() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  // State
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  //const [logs, setLogs] = useState([]);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState('All');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Loading indicators
  const [loadingData, setLoadingData] = useState(true);
  const [togglingTaskId, setTogglingTaskId] = useState(null);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isEditingTaskId, setIsEditingTaskId] = useState(null);

  // Redirection if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  // Fetch all dashboard data
  const fetchData = async (showLocalSpinner = false) => {
    if (!user) return;
    try {
      if (!showLocalSpinner) setLoadingData(true);
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      // Fetch active tasks
      const resActive = await fetch(`/api/tasks?month=${currentMonth}&isArchived=false`);
      const activeData = await resActive.json();

      // Fetch goals
      const resGoals = await fetch(`/api/goals?month=${currentMonth}`);
      const goalsData = await resGoals.json();

      // Fetch announcements
      const resAnn = await fetch('/api/announcements');
      const annData = await resAnn.json();

      // Fetch activity logs
     /* const resLogs = await fetch('/api/logs');
      const logsData = await resLogs.json(); */

      setTasks(Array.isArray(activeData) ? activeData : []);
      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setAnnouncements(Array.isArray(annData) ? annData : []);
      //setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Save Task
  const handleSaveTask = async (taskData) => {
    setIsSavingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        await fetchData(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingTask(false);
    }
  };

  // Update Task Status (toggle Completed / Pending)
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (togglingTaskId) return;
    setTogglingTaskId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchData(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingTaskId(null);
    }
  };

  // Edit Task (title and/or week)
  const handleEditTask = async (taskId, fields) => {
    setIsEditingTaskId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        await fetchData(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEditingTaskId(null);
    }
  };

  // Add Monthly Goal
  const handleAddGoal = async (title) => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, month: currentMonth, createdBy: user })
    });
    if (res.ok) {
      await fetchData(true);
    }
  };

  // Toggle Goal Status
  const handleToggleGoal = async (goalId, currentStatus) => {
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: goalId, status: currentStatus, updatedBy: user })
    });
    if (res.ok) {
      await fetchData(true);
    }
  };

  // Add Announcement
  const handleAddAnnouncement = async (title, content) => {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, createdBy: user })
    });
    if (res.ok) {
      await fetchData(true);
    }
  };

  // Calculate Metrics
  const pendingCount = tasks.filter((t) => t.status !== 'Completed').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const prospectsCount = tasks.filter((t) => t.category === 'Sales Prospect' && t.status !== 'Completed').length;
  const totalActive = tasks.length;
  const completionRate = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

  const stats = {
    pending: pendingCount,
    completed: completedCount,
    prospects: prospectsCount,
    completionRate: completionRate
  };

  // Filter active tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedWeekFilter === 'All') return true;
    if (selectedWeekFilter === 'General Monthly') return task.week === '' || task.week === 'None';
    return task.week === selectedWeekFilter;
  });

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout stats={stats}>
      {/* Global Saving Task Spinner Indicator overlay */}
      {isSavingTask && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-700">Creating task...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Side: Announcements first, then Monthly Goals, then Activity */}
        <div className="lg:col-span-4 space-y-6">
          <Announcements 
            announcements={announcements} 
            onAddAnnouncement={handleAddAnnouncement} 
          />
          <MonthlyGoals 
            goals={goals} 
            onAddGoal={handleAddGoal} 
            onToggleGoal={handleToggleGoal} 
          />
        {/*  <ActivityFeed logs={logs} /> */}
        </div>

        {/* Right Side: Main Task Workspace */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm relative">
            
            {/* Loading overlay during status updates or inline edits */}
            {(togglingTaskId || isEditingTaskId) && (
              <div className="absolute inset-0 bg-white/60 rounded-[24px] flex items-center justify-center z-20 backdrop-blur-[1px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}

            {/* Task Workspace Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center">
                <ListTodo className="w-4 h-4 mr-1.5 text-blue-600" />
                Operational Tasks
              </h2>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </button>
            </div>

            {/* Week Filter Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-3 custom-scrollbar mb-4 border-b border-slate-100">
              <div className="text-slate-400 pr-1 flex items-center flex-shrink-0 text-xs font-semibold uppercase tracking-wider">
                <ListFilter className="w-3.5 h-3.5 mr-1" />
                <span>Filter:</span>
              </div>
              <button
                onClick={() => setSelectedWeekFilter('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex-shrink-0 transition-colors ${
                  selectedWeekFilter === 'All'
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-transparent border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                All Tasks
              </button>
              {WEEKS.map((wk) => (
                <button
                  key={wk}
                  onClick={() => setSelectedWeekFilter(wk)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex-shrink-0 transition-colors ${
                    selectedWeekFilter === wk
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-transparent border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {wk}
                </button>
              ))}
              <button
                onClick={() => setSelectedWeekFilter('General Monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex-shrink-0 transition-colors ${
                  selectedWeekFilter === 'General Monthly'
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-transparent border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                General Monthly
              </button>
            </div>

            {/* Tasks List */}
            {loadingData ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400">No active tasks in this view.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onEditTask={handleEditTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        activeUser={user}
      />
    </DashboardLayout>
  );
}
