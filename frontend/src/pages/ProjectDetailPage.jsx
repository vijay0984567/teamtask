import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import TaskModal from '../components/ui/TaskModal';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import {
  FolderKanban, Plus, Users, Trash2, Edit2, UserPlus, UserMinus,
  ChevronLeft, Calendar, User, Flag, CheckSquare, Filter
} from 'lucide-react';

const PRIORITY_BADGE = {
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [addingMember, setAddingMember] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          projectsAPI.getById(id),
          tasksAPI.getAll({ projectId: id }),
        ]);
        setProject(projRes.data);
        setTasks(taskRes.data);
      } catch (err) {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [id]);

  const isAdmin = project?.members?.some(
    m => m.user._id === user?._id && m.role === 'Admin'
  );

  const handleTaskSuccess = (task, action) => {
    if (action === 'create') setTasks(ts => [task, ...ts]);
    else setTasks(ts => ts.map(t => t._id === task._id ? task : t));
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      setTasks(ts => ts.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return toast.error('Email required');
    setAddingMember(true);
    try {
      const res = await projectsAPI.addMember(id, { email: memberEmail.trim(), role: memberRole });
      setProject(res.data);
      setMemberEmail('');
      toast.success('Member added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await projectsAPI.removeMember(id, userId);
      setProject(res.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const filteredTasks = statusFilter
    ? tasks.filter(t => t.status === statusFilter)
    : tasks;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!project) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4 transition-colors">
          <ChevronLeft size={16} /> Projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-700 text-xl shrink-0"
              style={{ backgroundColor: project.color || '#6366f1' }}
            >
              {project.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-display font-700 text-ink">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-ink-muted mt-0.5">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button onClick={() => setMemberModalOpen(true)} className="btn-secondary">
                <Users size={15} />
                Members ({project.members?.length})
              </button>
            )}
            {isAdmin && (
              <button onClick={() => { setEditTask(null); setTaskModalOpen(true); }} className="btn-primary">
                <Plus size={16} />
                New Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5">
        <Filter size={14} className="text-ink-subtle" />
        <span className="text-xs text-ink-subtle font-medium mr-1">Filter:</span>
        {['', 'Todo', 'In Progress', 'Done'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
              statusFilter === s
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-ink-muted border-surface-200 hover:border-surface-300'
            }`}
          >
            {s || 'All'} {!s && `(${tasks.length})`}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={statusFilter ? `No ${statusFilter} tasks.` : 'Create the first task for this project.'}
          action={isAdmin && !statusFilter
            ? <button onClick={() => setTaskModalOpen(true)} className="btn-primary"><Plus size={15} />Create Task</button>
            : null}
        />
      ) : (
        <div className="grid gap-3">
          {filteredTasks.map(task => {
            const overdue = task.dueDate && task.status !== 'Done' && new Date() > new Date(task.dueDate);
            return (
              <div key={task._id} className="card p-4 hover:shadow-card-hover transition-all duration-150 group">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-ink text-sm">{task.title}</h3>
                      <StatusBadge status={task.status} overdue={overdue} />
                      <span className={PRIORITY_BADGE[task.priority] || 'badge-low'}>
                        <Flag size={10} className="inline mr-0.5" />
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-ink-muted mb-2 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      {task.assignedTo && (
                        <div className="flex items-center gap-1.5 text-xs text-ink-subtle">
                          <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center">
                            <span className="text-[9px] font-semibold text-brand-700">
                              {task.assignedTo.name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          {task.assignedTo.name}
                        </div>
                      )}
                      {task.dueDate && isValid(new Date(task.dueDate)) && (
                        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500' : 'text-ink-subtle'}`}>
                          <Calendar size={11} />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => { setEditTask(task); setTaskModalOpen(true); }}
                      className="p-1.5 rounded-lg text-ink-subtle hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 rounded-lg text-ink-subtle hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditTask(null); }}
        task={editTask}
        projectId={id}
        members={project.members}
        onSuccess={handleTaskSuccess}
        isAdmin={isAdmin}
      />

      {/* Members Modal */}
      <Modal isOpen={memberModalOpen} onClose={() => setMemberModalOpen(false)} title="Team Members" size="md">
        <div className="space-y-4">
          {/* Member List */}
          <div className="space-y-2">
            {project.members?.map(m => (
              <div key={m.user._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-brand-700">
                    {m.user.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{m.user.name}</p>
                  <p className="text-xs text-ink-subtle truncate">{m.user.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  m.role === 'Admin' ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-ink-muted'
                }`}>{m.role}</span>
                {isAdmin && m.user._id !== project.createdBy._id && (
                  <button
                    onClick={() => handleRemoveMember(m.user._id)}
                    className="p-1 rounded text-ink-subtle hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Member Form */}
          {isAdmin && (
            <form onSubmit={handleAddMember} className="border-t border-surface-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Add Member</p>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="colleague@company.com"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" disabled={addingMember} className="btn-primary w-full justify-center">
                {addingMember ? <LoadingSpinner size="sm" /> : <><UserPlus size={15} /> Add Member</>}
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
