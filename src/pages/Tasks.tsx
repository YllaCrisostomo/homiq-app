/**
 * Tasks Page
 * 
 * Manages household tasks with status tracking,
 * assignee management, and recurrence support.
 */

import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Circle, Clock, Calendar, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TaskForm } from '../components/forms/TaskForm';
import { Task } from '../types';
import { getTimeLeftLabel, calculateNextDueDate } from '../utils/taskUtils';

export default function Tasks() {
  const { state, completeTask, deleteTask, deleteCompletedTasks, addTask, updateTask } = useAppState();
  const [statusTab, setStatusTab] = useState<Task['status'] | 'All'>('Pending');
  const [scheduleTab, setScheduleTab] = useState<Task['timeFrame'] | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const groupedTasks = useMemo(() => {
    const filtered = state.tasks.filter(task => {
      const matchesStatus = statusTab === 'All' || task.status === statusTab;
      const matchesSchedule = scheduleTab === 'All' || task.timeFrame === scheduleTab;
      return matchesStatus && matchesSchedule;
    });

    const groups: { [key: string]: Task[] } = {};
    filtered.forEach(task => {
      const memberName = state.masterData.find(m => m.id === task.assigneeId)?.name || 'UNASSIGNED';
      if (!groups[memberName]) groups[memberName] = [];
      groups[memberName].push(task);
    });
    return groups;
  }, [state.tasks, statusTab, scheduleTab, state.masterData]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    if (task.status === 'Completed') return;
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSetInProgress = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({ ...task, status: 'In Progress' });
    }
  };

  const handleFormSubmit = (data: Partial<Task>) => {
    if (editingTask) {
      updateTask({ ...editingTask, ...data } as Task);
    } else {
      const newTask = {
        ...data,
        id: `task-${Math.random().toString(36).substr(2, 9)}`,
        status: 'Pending',
      } as Task;
      addTask(newTask);
    }
    setIsModalOpen(false);
  };

  const handleDeleteFromForm = (id: string) => {
    deleteTask(id);
    setIsModalOpen(false);
  };

  const getDaysRemaining = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d left` : 'Due today';
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-[#0A192F] tracking-tight">Tasks</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={deleteCompletedTasks} className="rounded-2xl px-4 border-gray-100 shadow-sm">
            <Trash2 className="w-5 h-5 mr-2" />
            Clear Completed
          </Button>
          <Button onClick={handleAddTask} className="rounded-2xl px-6 bg-[#0A192F] text-white hover:bg-[#1A293F]">
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
        {(['Pending', 'In Progress', 'Completed', 'All'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`flex-1 py-3 px-4 text-[10px] font-black rounded-xl transition-all whitespace-nowrap ${
              statusTab === tab 
                ? 'bg-white text-[#0A192F] shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Schedule Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {(['All', 'Daily', 'Weekly', 'Monthly', 'Custom'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setScheduleTab(tab)}
            className={`px-4 py-2 rounded-full text-[10px] font-black transition-all whitespace-nowrap border ${
              scheduleTab === tab 
                ? 'bg-[#0A192F] text-white border-[#0A192F]' 
                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-8">
        {Object.keys(groupedTasks).length > 0 ? (Object.entries(groupedTasks) as [string, Task[]][]).map(([memberName, tasks]) => (
          <div key={memberName} className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">{memberName}</h4>
            <div className="space-y-4">
              {tasks.map(task => (
                <Card key={task.id} className="space-y-6 bg-white border-none shadow-sm p-6 rounded-[32px]">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => completeTask(task.id)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all mt-1 ${
                        task.status === 'Completed' 
                          ? 'bg-teal-500 border-teal-500 text-white' 
                          : 'bg-white border-gray-100 text-gray-200 hover:border-teal-500 hover:text-teal-500'
                      }`}
                    >
                      {task.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-xl font-black tracking-tight truncate ${
                          task.status === 'Completed' ? 'text-gray-300 line-through' : 'text-[#0A192F]'
                        }`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {task.status === 'Pending' && (
                            <Button variant="ghost" size="icon" onClick={() => handleSetInProgress(task.id)} className="text-gray-300 hover:text-amber-500">
                              <Clock className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditTask(task)} 
                            className="text-gray-300 hover:text-teal-600 disabled:opacity-30"
                            disabled={task.status === 'Completed'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          task.status === 'Completed' ? 'success' : 
                          task.status === 'In Progress' ? 'warning' : 'neutral'
                        }>
                          {task.status.toUpperCase()}
                        </Badge>
                        {task.isRecurring && (
                          <Badge variant="info" className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            {task.timeFrame?.toUpperCase()}
                          </Badge>
                        )}
                        {task.isRecurring && task.status !== 'Completed' && (
                          <Badge variant="neutral" className="bg-gray-50 text-gray-400 border-none">
                            {getTimeLeftLabel(task)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 mt-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Category / Sub / Sub-Sub</p>
                          <p className="text-[10px] font-black text-[#0A192F] uppercase tracking-tight truncate">
                            {state.masterData.find(m => m.id === task.categoryId)?.name || 'UNCATEGORIZED'}
                            {task.subCategoryId && ` / ${state.masterData.find(m => m.id === task.subCategoryId)?.name}`}
                            {task.subSubCategoryId && ` / ${state.masterData.find(m => m.id === task.subSubCategoryId)?.name}`}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Assigned To</p>
                          <p className="text-[10px] font-black text-[#0A192F] uppercase tracking-tight">
                            {state.masterData.find(m => m.id === task.assigneeId)?.name || 'UNASSIGNED'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {task.isRecurring ? 'RECURRING' : 'ONE-TIME'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {task.isRecurring ? `NEXT: ${calculateNextDueDate(task).toLocaleDateString()}` : new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold">No tasks found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          initialData={editingTask || {}}
          masterData={state.masterData}
          onSubmit={handleFormSubmit}
          onDelete={handleDeleteFromForm}
        />
      </Modal>
    </div>
  );
}
