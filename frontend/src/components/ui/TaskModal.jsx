import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { tasksAPI } from '../../api';
import toast from 'react-hot-toast';
import { Calendar } from 'lucide-react';

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export default function TaskModal({ isOpen, onClose, task, projectId, members, onSuccess, isAdmin }) {
  const [form, setForm] = useState({
    title: '', description: '', assignedTo: '', status: 'Todo', priority: 'Medium', dueDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo?._id || '',
        status: task.status || 'Todo',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setForm({ title: '', description: '', assignedTo: '', status: 'Todo', priority: 'Medium', dueDate: '' });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        projectId,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      };
      if (task) {
        const res = await tasksAPI.update(task._id, payload);
        onSuccess(res.data, 'update');
        toast.success('Task updated');
      } else {
        const res = await tasksAPI.create(payload);
        onSuccess(res.data, 'create');
        toast.success('Task created');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input
            type="text"
            className="input"
            placeholder="Task title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            autoFocus
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="What needs to be done?"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              >
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
        </div>
        {isAdmin && (
          <>
            <div>
              <label className="label">Assign To</label>
              <select
                className="input"
                value={form.assignedTo}
                onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {members?.map(m => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                <input
                  type="date"
                  className="input pl-9"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </>
        )}
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <LoadingSpinner size="sm" /> : task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
