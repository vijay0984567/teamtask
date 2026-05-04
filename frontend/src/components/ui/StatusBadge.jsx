import { Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const config = {
  'Todo': { cls: 'badge-todo', icon: Clock, label: 'Todo' },
  'In Progress': { cls: 'badge-progress', icon: Loader2, label: 'In Progress' },
  'Done': { cls: 'badge-done', icon: CheckCircle2, label: 'Done' },
  'Overdue': { cls: 'badge-overdue', icon: AlertCircle, label: 'Overdue' },
};

export default function StatusBadge({ status, overdue = false }) {
  const key = overdue && status !== 'Done' ? 'Overdue' : status;
  const { cls, icon: Icon, label } = config[key] || config['Todo'];
  return (
    <span className={cls}>
      <Icon size={11} />
      {label}
    </span>
  );
}
