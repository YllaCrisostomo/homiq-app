import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#0A192F] text-white shadow-lg shadow-navy-900/20',
    secondary: 'bg-[#00695C] text-white shadow-lg shadow-teal-900/20',
    outline: 'border-2 border-gray-100 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-500 hover:bg-gray-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 rounded-2xl font-medium',
    lg: 'px-8 py-4 rounded-2xl text-lg font-semibold',
    icon: 'p-3 rounded-2xl',
  };

  return (
    <button 
      className={`flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 18 : 20} />}
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'red' | 'yellow' | 'green' | 'blue' | 'gray' }> = ({ 
  children, 
  color = 'gray' 
}) => {
  const colors = {
    red: 'bg-red-50 text-red-600 border-red-100',
    yellow: 'bg-amber-50 text-amber-600 border-amber-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color]}`}>
      {children}
    </span>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; color?: string; showLabel?: boolean }> = ({ value, max, color = 'bg-[#00695C]', showLabel }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
          <span>{value} / {max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${color}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const Sparkline: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const color = percentage <= 25 ? 'bg-red-500' : percentage <= 50 ? 'bg-amber-500' : 'bg-emerald-500';
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-[10px] font-bold ${percentage <= 25 ? 'text-red-500' : 'text-gray-400'}`}>
        {value}/{max}
      </span>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0A192F]">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-[#0A192F] mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>{cancelLabel}</Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            className="flex-1" 
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
