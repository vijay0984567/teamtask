import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckSquare, Mail, Lock, User, Eye, EyeOff, Shield } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-surface-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg">
            <CheckSquare size={20} className="text-white" />
          </div>
          <span className="font-display font-700 text-2xl text-ink">TeamTask</span>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-700 text-ink mb-1">Create account</h1>
            <p className="text-sm text-ink-muted">Get started for free today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                <input
                  type="text"
                  className="input pl-9"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-9 pr-9"
                  placeholder="min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-muted">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {['Admin', 'Member'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.role === role
                        ? 'bg-brand-50 border-brand-400 text-brand-700'
                        : 'bg-white border-surface-200 text-ink-muted hover:border-surface-300'
                    }`}
                  >
                    <Shield size={14} />
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
