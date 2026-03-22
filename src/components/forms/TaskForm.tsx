/**
 * Task Form Component
 * 
 * Handles adding and updating tasks with
 * fields for assignment, status, and recurrence.
 */

import React, { useState } from 'react';
import { Task, MasterDataItem } from '../../types';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmit: (data: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  masterData: MasterDataItem[];
}

export const TaskForm = ({ initialData, onSubmit, onDelete, masterData }: TaskFormProps) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    subSubCategoryId: '',
    assigneeId: '',
    status: 'Pending',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    timeFrame: 'Daily',
    recurrenceDaysWeek: [],
    recurrenceDaysMonth: [],
    recurrenceMonths: [],
    instructions: [],
    ...initialData
  });

  const [instruction, setInstruction] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const toggleWeekDay = (day: string) => {
    setFormData(prev => {
      const current = prev.recurrenceDaysWeek || [];
      const next = current.includes(day) 
        ? current.filter(d => d !== day)
        : [...current, day];
      return { ...prev, recurrenceDaysWeek: next };
    });
  };

  const toggleMonthDay = (day: number) => {
    setFormData(prev => {
      const current = prev.recurrenceDaysMonth || [];
      const next = current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day];
      return { ...prev, recurrenceDaysMonth: next };
    });
  };

  const toggleMonth = (month: string) => {
    setFormData(prev => {
      const current = prev.recurrenceMonths || [];
      const next = current.includes(month)
        ? current.filter(m => m !== month)
        : [...current, month];
      return { ...prev, recurrenceMonths: next };
    });
  };

  const addInstruction = () => {
    if (instruction.trim()) {
      setFormData(prev => ({
        ...prev,
        instructions: [...(prev.instructions || []), instruction.trim()]
      }));
      setInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: (prev.instructions || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const taskCategories = masterData.filter(m => m.type === 'TaskCategory' && !m.parentId);
  const taskSubCategories = masterData.filter(m => m.type === 'TaskCategory' && m.parentId === formData.categoryId);
  const taskSubSubCategories = masterData.filter(m => m.type === 'TaskCategory' && m.parentId === formData.subCategoryId);
  const members = masterData.filter(m => m.type === 'HouseholdMember');

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* TASK DETAILS */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-gray-50 pb-2">
          Task Details
        </h4>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Title *</label>
          <input
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            placeholder="Enter task title"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] resize-none"
            placeholder="Describe the task"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {taskCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Category</label>
            <select
              name="subCategoryId"
              value={formData.subCategoryId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {taskSubCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Sub-Category</label>
            <select
              name="subSubCategoryId"
              value={formData.subSubCategoryId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">None</option>
              {taskSubSubCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignee</label>
            <select
              name="assigneeId"
              value={formData.assigneeId}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-gray-50 pb-2">
          Schedule
        </h4>
        
        {!formData.isRecurring && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            />
          </div>
        )}

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="w-5 h-5 rounded-lg border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="isRecurring" className="text-sm font-black text-[#0A192F] uppercase tracking-widest">
            Recurring Task
          </label>
        </div>

        {formData.isRecurring && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Frame</label>
              <select
                name="timeFrame"
                value={formData.timeFrame}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F] appearance-none"
              >
                <option value="Daily">Daily (Every Day)</option>
                <option value="Weekly">Weekly (Every 7 Days)</option>
                <option value="Monthly">Monthly (Every 30 Days)</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {formData.timeFrame === 'Custom' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recurrence Days (Week)</label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekDay(day)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                          formData.recurrenceDaysWeek?.includes(day)
                            ? 'bg-[#0A192F] text-white border-[#0A192F]'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {day.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recurrence Days (Month)</label>
                  <div className="grid grid-cols-7 gap-2">
                    {monthDays.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleMonthDay(day)}
                        className={`w-full aspect-square flex items-center justify-center rounded-xl text-[10px] font-black transition-all border ${
                          formData.recurrenceDaysMonth?.includes(day)
                            ? 'bg-[#0A192F] text-white border-[#0A192F]'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recurrence Months</label>
                  <div className="grid grid-cols-4 gap-2">
                    {months.map(month => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => toggleMonth(month)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                          formData.recurrenceMonths?.includes(month)
                            ? 'bg-[#0A192F] text-white border-[#0A192F]'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {month.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* INSTRUCTIONS */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-gray-50 pb-2">
          Instructions
        </h4>
        
        <div className="flex gap-2">
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="flex-1 p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/20 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold text-[#0A192F]"
            placeholder="Add a step..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
          />
          <Button type="button" onClick={addInstruction} className="rounded-2xl bg-teal-500 text-white p-4">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-2">
          {formData.instructions?.map((inst, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group">
              <span className="text-sm font-bold text-[#0A192F]">{index + 1}. {inst}</span>
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-3">
        <Button type="submit" className="w-full py-6 rounded-2xl bg-[#0A192F] text-white hover:bg-[#1A293F] font-black uppercase tracking-widest">
          {initialData?.id ? 'Update Task' : 'Save Task'}
        </Button>
        
        {initialData?.id && onDelete && (
          <Button 
            type="button" 
            onClick={() => onDelete(initialData.id!)}
            variant="outline"
            className="w-full py-6 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 font-black uppercase tracking-widest"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Task
          </Button>
        )}
      </div>
    </form>
  );
};
