import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Factory, Lock, Mail, User as UserIcon, Shield } from 'lucide-react';
import { authApi } from '../api/auth';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ANALYST');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.register(email, fullName, password, role);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-industrial-900 border border-industrial-800 rounded-2xl p-8 glass-card shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-2xl text-brand-blue mb-3 glow-blue">
            <Factory className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Register User Account</h1>
          <p className="text-xs text-industrial-400 mt-1 font-mono">Role-Based Access Control System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1 font-mono">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1 font-mono">User Role Assignment</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-industrial-950 border border-industrial-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-blue cursor-pointer"
              >
                <option value="ADMIN">ADMIN (Upload models/datasets, activate models)</option>
                <option value="ANALYST">ANALYST (Analyze root-cause, run simulations)</option>
                <option value="VIEWER">VIEWER (Read-only dashboard view)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-industrial-950 font-semibold text-xs rounded-lg transition-all shadow-md"
          >
            {loading ? 'Creating User...' : 'Register Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-xs text-brand-blue hover:underline">
            Already registered? Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
