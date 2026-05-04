import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { FolderKanban, Plus, Users, ArrowRight, Trash2, Edit2 } from 'lucide-react';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#ef4444',
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    projectsAPI.getAll()
      .then(res => setProjects(res.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: '', description: '', color: PROJECT_COLORS[0] });
    setEditProject(null);
    setCreateOpen(true);
  };

  const openEdit = (e, project) => {
    e.preventDefault();
    setForm({ name: project.name, description: project.description, color: project.color });
    setEditProject(project);
    setCreateOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name required');
    setSaving(true);
    try {
      if (editProject) {
        const res = await projectsAPI.update(editProject._id, form);
        setProjects(ps => ps.map(p => p._id === editProject._id ? res.data : p));
        toast.success('Project updated');
      } else {
        const res = await projectsAPI.create(form);
        setProjects(ps => [res.data, ...ps]);
        toast.success('Project created');
      }
      setCreateOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await projectsAPI.delete(id);
      setProjects(ps => ps.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const isAdmin = (project) => {
    return project.members?.some(m => m.user._id === user?._id && m.role === 'Admin');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 text-ink-subtle text-sm mb-1">
            <FolderKanban size={14} />
            <span>Projects</span>
          </div>
          <h1 className="text-2xl font-display font-700 text-ink">All Projects</h1>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks for your team."
          action={<button onClick={openCreate} className="btn-primary">Create Project</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="card p-5 hover:shadow-card-hover transition-all duration-200 group block"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-700 text-lg"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                >
                  {project.name[0].toUpperCase()}
                </div>
                {isAdmin(project) && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEdit(e, project)}
                      className="p-1.5 rounded-lg text-ink-subtle hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, project._id)}
                      className="p-1.5 rounded-lg text-ink-subtle hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-ink mb-1 group-hover:text-brand-700 transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-ink-muted line-clamp-2 mb-3">{project.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-ink-subtle">
                  <Users size={12} />
                  {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1 text-xs text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Open <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={editProject ? 'Edit Project' : 'New Project'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Marketing Campaign"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="What's this project about?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${form.color === color ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <LoadingSpinner size="sm" /> : editProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
