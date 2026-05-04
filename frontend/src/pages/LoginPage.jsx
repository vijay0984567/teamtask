import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckSquare, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('All fields required');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@demo.com', password: 'demo123' });
    else setForm({ email: 'member@demo.com', password: 'demo123' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-surface-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg">
            <CheckSquare size={20} className="text-white" />
          </div>
          <span className="font-display font-700 text-2xl text-ink">TeamTask</span>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-700 text-ink mb-1">Welcome back</h1>
            <p className="text-sm text-ink-muted">Sign in to your account</p>
          </div>

          {/* Demo credentials */}
          <div className="mb-6 p-3 bg-brand-50 border border-brand-100 rounded-lg">
            <p className="text-xs font-semibold text-brand-700 mb-2">Demo Accounts</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo('admin')} className="text-xs px-3 py-1.5 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors">
                Admin Demo
              </button>
              <button onClick={() => fillDemo('member')} className="text-xs px-3 py-1.5 bg-white border border-brand-200 text-brand-700 rounded-md hover:bg-brand-50 transition-colors">
                Member Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="email"
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-muted"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-medium hover:text-brand-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
