import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Factory, Lock, Mail, ShieldCheck } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@neurax.ai');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authApi.login(email, password);
      login(data.access_token, {
        id: 1,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        is_active: true
      });
      navigate('/overview');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-industrial-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-industrial-900 border border-industrial-800 rounded-2xl p-8 glass-card shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-2xl text-brand-blue mb-3 glow-blue">
            <Factory className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">NeuraX Hackathon 3.0</h1>
          <p className="text-xs text-industrial-400 mt-1 font-mono">Visual Inspection & Defect Root-Cause Assistant</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1 font-mono">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1 font-mono">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-industrial-950 font-semibold text-xs rounded-lg transition-all shadow-md"
          >
            {loading ? 'Authenticating...' : 'Sign In to Industrial Dashboard'}
          </button>
        </form>

        {/* Demo Quick Role Selector */}
        <div className="mt-6 pt-6 border-t border-industrial-800">
          <p className="text-[11px] text-industrial-400 font-mono mb-2 text-center">Quick Hackathon Role Credentials:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setDemoCredentials('admin@neurax.ai', 'admin123')}
              className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded text-[10px] font-semibold text-rose-400"
            >
              ADMIN
            </button>
            <button
              onClick={() => setDemoCredentials('analyst@neurax.ai', 'analyst123')}
              className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded text-[10px] font-semibold text-amber-400"
            >
              ANALYST
            </button>
            <button
              onClick={() => setDemoCredentials('viewer@neurax.ai', 'viewer123')}
              className="py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded text-[10px] font-semibold text-blue-400"
            >
              VIEWER
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/register" className="text-xs text-brand-blue hover:underline">
            Create new industrial user account
          </Link>
        </div>
      </div>
    </div>
  );
};
