/**
 * TaskSummary Component
 * 
 * Displays a summary of today's tasks with status badges and a task list.
 */
import React from 'react';
import { Task } from '../../types';
import { Card, Badge } from '../UI';
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';

interface TaskSummaryProps {
  tasks: Task[];
  stats: {
    overdueCount: number;
    pendingCount: number;
    doneCount: number;
  };
  onSeeAll: () => void;
}

export const TaskSummary: React.FC<TaskSummaryProps> = ({ tasks, stats, onSeeAll }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <CheckCircle2 size={18} />
          </div>
          <h3 className="font-bold text-lg text-[#0A192F]">Today's tasks</h3>
        </div>
        <button onClick={onSeeAll} className="text-xs font-bold text-[#00695C]">See all</button>
      </div>

      <div className="flex gap-2">
        <Badge color="red">
          <AlertTriangle size={12} className="inline mr-1" />
          {stats.overdueCount} overdue
        </Badge>
        <Badge color="yellow">
          <Clock size={12} className="inline mr-1" />
          {stats.pendingCount} pending
        </Badge>
        <Badge color="green">
          <CheckCircle2 size={12} className="inline mr-1" />
          {stats.doneCount} done
        </Badge>
      </div>

      <div className="space-y-3">
        {tasks.map(task => {
          const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
          const isDone = task.status === 'Completed';

          return (
            <Card key={task.id} className="p-4 border-none shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDone ? 'bg-emerald-50 text-emerald-500' : 
                  isOverdue ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                }`}>
                  {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm ${isDone ? 'text-gray-400 line-through' : 'text-[#0A192F]'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {isOverdue && <Badge color="red">Overdue</Badge>}
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      {task.assigneeId}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">
                  {isDone ? 'Done' : isOverdue ? 'Yesterday' : 'Today'}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
