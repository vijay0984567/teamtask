import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { LayoutDashboard, CheckSquare, Clock, AlertTriangle, FolderKanban, ArrowRight } from 'lucide-react';
import { format, isValid } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-2xl font-display font-700 text-ink">{value}</p>
    <p className="text-sm text-ink-muted mt-0.5">{label}</p>
    {sub && <p className="text-xs text-ink-subtle mt-1">{sub}</p>}
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksAPI.dashboard()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 text-ink-subtle text-sm mb-1">
          <LayoutDashboard size={14} />
          <span>Overview</span>
        </div>
        <h1 className="text-2xl font-display font-700 text-ink">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-ink-muted mt-1">Here's what's happening with your projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FolderKanban} label="Projects" value={stats?.totalProjects ?? 0} color="bg-brand-50 text-brand-600" />
        <StatCard icon={CheckSquare} label="Total Tasks" value={stats?.totalTasks ?? 0} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Clock} label="My Tasks" value={stats?.myTasks ?? 0} color="bg-amber-50 text-amber-600" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats?.overdueTasks ?? 0} color="bg-red-50 text-red-500" />
      </div>

      {/* Status Breakdown */}
      {stats?.byStatus && (
        <div className="card p-5 mb-8">
          <h2 className="text-sm font-semibold text-ink mb-4">Task Status Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const total = stats.totalTasks || 1;
              const pct = Math.round((count / total) * 100);
              const colors = {
                'Todo': 'bg-slate-200',
                'In Progress': 'bg-amber-400',
                'Done': 'bg-emerald-500',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <StatusBadge status={status} />
                    <span className="text-sm font-semibold text-ink">{count}</span>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors[status]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-subtle mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold text-ink">Recent Tasks</h2>
            <Link to="/projects" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-100">
            {stats?.recentTasks?.length > 0 ? stats.recentTasks.map(task => (
              <div key={task._id} className="px-5 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{task.title}</p>
                  <p className="text-xs text-ink-subtle mt-0.5 truncate">
                    {task.projectId?.name} {task.assignedTo ? `· ${task.assignedTo.name}` : ''}
                  </p>
                </div>
                <StatusBadge status={task.status} overdue={task.isOverdue} />
              </div>
            )) : (
              <div className="px-5 py-8 text-center text-sm text-ink-subtle">No tasks yet</div>
            )}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" />
              Overdue Tasks
            </h2>
          </div>
          <div className="divide-y divide-surface-100">
            {stats?.overdueList?.length > 0 ? stats.overdueList.map(task => (
              <div key={task._id} className="px-5 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{task.title}</p>
                  <p className="text-xs text-red-500 mt-0.5">
                    Due {task.dueDate && isValid(new Date(task.dueDate))
                      ? format(new Date(task.dueDate), 'MMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <StatusBadge status={task.status} overdue={true} />
              </div>
            )) : (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-emerald-600 font-medium">🎉 No overdue tasks!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
