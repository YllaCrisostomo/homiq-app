import { Task } from '../types';

export const calculateNextDueDate = (task: Task): Date => {
  if (!task.isRecurring) return new Date(task.dueDate);

  const referenceDate = task.lastCompleted ? new Date(task.lastCompleted) : new Date(task.createdAt);
  const creationDate = new Date(task.createdAt);
  const now = new Date();

  switch (task.timeFrame) {
    case 'Daily': {
      const next = new Date(referenceDate);
      next.setDate(next.getDate() + 1);
      // Ensure next is at least today
      if (next < now) {
        next.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
      }
      return next;
    }
    case 'Weekly': {
      const next = new Date(creationDate);
      while (next <= now) {
        next.setDate(next.getDate() + 7);
      }
      return next;
    }
    case 'Monthly': {
      const next = new Date(creationDate);
      while (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      return next;
    }
    case 'Custom': {
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const selectedWeekDays = task.recurrenceDaysWeek || [];
      const selectedMonthDays = task.recurrenceDaysMonth || [];
      const selectedMonths = task.recurrenceMonths || [];

      // Custom - Week (Selected days of the week)
      if (selectedWeekDays.length > 0) {
        for (let i = 1; i <= 7; i++) {
          const testDate = new Date(now);
          testDate.setDate(now.getDate() + i);
          if (selectedWeekDays.includes(weekDays[testDate.getDay()])) {
            return testDate;
          }
        }
      }

      // Custom - Days of the month
      if (selectedMonthDays.length > 0) {
        for (let i = 1; i <= 31; i++) {
          const testDate = new Date(now);
          testDate.setDate(now.getDate() + i);
          if (selectedMonthDays.includes(testDate.getDate())) {
            return testDate;
          }
        }
      }

      // Custom - Months (First day of the month)
      if (selectedMonths.length > 0) {
        for (let i = 1; i <= 12; i++) {
          const testDate = new Date(now);
          testDate.setMonth(now.getMonth() + i);
          testDate.setDate(1);
          if (selectedMonths.includes(monthNames[testDate.getMonth()])) {
            return testDate;
          }
        }
      }

      // Default fallback
      const fallback = new Date(now);
      fallback.setDate(now.getDate() + 1);
      return fallback;
    }
    default:
      return new Date(now.getTime() + 86400000);
  }
};

export const getTaskStatus = (task: Task): Task['status'] => {
  if (task.status === 'Completed' && !task.isRecurring) return 'Completed';
  
  const nextDue = calculateNextDueDate(task);
  const now = new Date();
  
  if (nextDue < now) return 'Overdue';
  return 'Pending';
};

export const getTimeLeftLabel = (task: Task): string => {
  const nextDue = calculateNextDueDate(task);
  const now = new Date();
  
  // Set both to midnight for accurate day calculation
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d2 = new Date(nextDue.getFullYear(), nextDue.getMonth(), nextDue.getDate());
  
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  return `${diffDays}d left`;
};
