import React from 'react';
import { TicketCategory, TicketPriority, TicketStatus } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, Info, ShieldAlert } from 'lucide-react';

export const StatusPill: React.FC<{ status: TicketStatus }> = ({ status }) => {
  let className = 'badge-status-open';
  let icon = <Clock size={12} />;

  switch (status) {
    case 'In Progress':
      className = 'badge-status-inprogress';
      icon = <AlertTriangle size={12} />;
      break;
    case 'Resolved':
      className = 'badge-status-resolved';
      icon = <CheckCircle2 size={12} />;
      break;
    case 'Closed':
      className = 'badge-status-closed';
      icon = <Info size={12} />;
      break;
    case 'Open':
    default:
      className = 'badge-status-open';
      icon = <Clock size={12} />;
      break;
  }

  return (
    <span className={`badge ${className}`}>
      {icon}
      {status}
    </span>
  );
};

export const PriorityPill: React.FC<{ priority: TicketPriority; overridden?: boolean }> = ({
  priority,
  overridden,
}) => {
  let className = 'badge-priority-medium';
  let icon = <Info size={12} />;

  switch (priority) {
    case 'Critical':
      className = 'badge-priority-critical animate-pulse-subtle';
      icon = <ShieldAlert size={12} />;
      break;
    case 'High':
      className = 'badge-priority-high';
      icon = <AlertCircle size={12} />;
      break;
    case 'Medium':
      className = 'badge-priority-medium';
      icon = <Info size={12} />;
      break;
    case 'Low':
      className = 'badge-priority-low';
      icon = <CheckCircle2 size={12} />;
      break;
  }

  return (
    <span className={`badge ${className}`} title={overridden ? 'Admin overridden priority' : 'AI priority score'}>
      {icon}
      {priority}
      {overridden && <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>(override)</span>}
    </span>
  );
};

export const CategoryPill: React.FC<{ category: TicketCategory; overridden?: boolean }> = ({
  category,
  overridden,
}) => {
  return (
    <span className="badge badge-category" title={overridden ? 'Admin overridden category' : 'AI auto-classified'}>
      {category}
      {overridden && <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>(override)</span>}
    </span>
  );
};
