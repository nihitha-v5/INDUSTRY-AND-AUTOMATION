import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Eye,
  GitCommit,
  GitBranch,
  Flame,
  DollarSign,
  Sliders,
  Sparkles,
  Cpu,
  BarChart3,
  Settings,
  ShieldCheck,
  Factory,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { role, user } = useAuth();

  const navGroups = [
    {
      title: 'Executive & Overview',
      items: [
        { name: 'Overview', path: '/overview', icon: LayoutDashboard },
        { name: 'Production Flow', path: '/production-flow', icon: GitBranch },
      ]
    },
    {
      title: 'Quality & Defect Intelligence',
      items: [
        { name: 'Visual Inspection', path: '/visual-inspection', icon: Eye },
        { name: 'Root-Cause Analysis', path: '/root-cause', icon: GitCommit },
        { name: 'Bottleneck Analysis', path: '/bottlenecks', icon: Flame },
      ]
    },
    {
      title: 'Optimization & Simulation',
      items: [
        { name: 'Economics', path: '/economics', icon: DollarSign },
        { name: 'What-If Simulation', path: '/simulation', icon: Sliders },
        { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
      ]
    },
    {
      title: 'AI Operations & Config',
      items: [
        { name: 'Data Management', path: '/data-management', icon: Database },
        { name: 'Model Registry', path: '/models', icon: Cpu },
        { name: 'Model Performance', path: '/model-performance', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-industrial-950/90 border-r border-industrial-800/80 flex flex-col h-screen sticky top-0 z-30 select-none backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-industrial-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-brand-blue/20 to-brand-indigo/20 border border-brand-blue/40 rounded-xl text-brand-blue glow-blue">
            <Factory className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-sm leading-tight text-white tracking-wider">
                NEURAX AI
              </h1>
              <span className="px-1.5 py-0.2 bg-brand-blue/20 text-brand-blue text-[9px] font-mono font-bold rounded">
                v3.0
              </span>
            </div>
            <p className="text-[10px] text-industrial-400 font-mono tracking-tight">Industrial Analytics OS</p>
          </div>
        </div>
      </div>

      {/* Live System Status Bar */}
      <div className="px-4 py-2 bg-industrial-900/60 border-b border-industrial-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wide uppercase">SYSTEM ONLINE</span>
        </div>
        <Radio className="w-3 h-3 text-industrial-500 animate-pulse" />
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pb-1 text-[9px] font-bold tracking-widest text-industrial-400 uppercase font-mono">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-blue/20 to-brand-cyan/10 text-white border border-brand-blue/40 font-semibold shadow-lg shadow-brand-blue/5'
                        : 'text-industrial-300 hover:bg-industrial-800/60 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-brand-blue rounded-r-full shadow-glow" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brand-blue' : 'text-industrial-400 group-hover:text-industrial-200'}`} />
                      <span className="truncate">{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User & Role Badge Footer */}
      <div className="p-3.5 border-t border-industrial-800/80 bg-industrial-950/90">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-industrial-900 border border-industrial-800 rounded-lg text-industrial-300">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Industrial User'}</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`inline-block px-2 py-0.2 text-[9px] font-bold tracking-wider uppercase rounded-md ${
                role === 'ADMIN' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                role === 'ANALYST' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                ROLE: {role || 'ANALYST'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
