import React, { useState, useEffect } from 'react';
import { Download, AlertTriangle, Database, LogOut, CheckCircle2, Clock, Sparkles, ChevronDown, FileCode2, FileText, File as FileIcon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { recommendationsApi } from '../../api/recommendations';

export const Navbar: React.FC = () => {
  const { activeDataset, isDemoMode, datasets, selectDataset } = useData();
  const { logout } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExportReport = (format: string) => {
    setShowExportMenu(false);
    recommendationsApi.downloadReport(format, activeDataset?.id);
  };

  return (
    <header className="h-16 bg-industrial-950/80 border-b border-industrial-800/80 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
      {/* Active Dataset Selector & Status Banner */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-industrial-900/90 border border-industrial-700/80 px-3.5 py-1.5 rounded-xl text-xs shadow-inner">
          <Database className="w-4 h-4 text-brand-blue" />
          <span className="text-industrial-400 font-mono text-[11px]">ACTIVE DATASET:</span>
          <select
            value={activeDataset?.id || ''}
            onChange={(e) => {
              const selected = datasets.find(d => d.id === Number(e.target.value));
              if (selected) selectDataset(selected);
            }}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id} className="bg-industrial-900 text-white">
                {d.name} {d.is_demo ? '(Demo)' : ''}
              </option>
            ))}
          </select>
        </div>


      </div>

      {/* Clock, Action Buttons & User Controls */}
      <div className="flex items-center space-x-4">
        {/* Live Clock Display */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-industrial-900/60 border border-industrial-800 rounded-lg text-industrial-300 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-brand-blue" />
          <span>{timeStr || '00:00:00'} UTC</span>
        </div>

        {/* Export Report Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className={`group relative flex items-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-brand-blue/20 via-brand-cyan/20 to-brand-indigo/20 hover:from-brand-blue/30 hover:to-brand-indigo/30 text-white border ${showExportMenu ? 'border-brand-cyan shadow-brand-cyan/20' : 'border-brand-blue/40 shadow-brand-blue/10'} rounded-xl text-xs font-semibold transition-all duration-300 shadow-lg glow-blue active:scale-95`}
          >
            <Sparkles className={`w-3.5 h-3.5 text-brand-blue transition-transform duration-300 ${showExportMenu ? 'rotate-180 scale-110' : 'group-hover:rotate-12'}`} />
            <span>Export Audit Report</span>
            <ChevronDown className={`w-3.5 h-3.5 text-industrial-400 transition-transform duration-300 ${showExportMenu ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-industrial-900/95 backdrop-blur-xl border border-industrial-700 rounded-xl shadow-2xl overflow-hidden z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => handleExportReport('html')}
                className="w-full flex items-center space-x-2 text-left px-4 py-2.5 text-xs text-industrial-300 hover:text-white hover:bg-brand-blue/20 transition-all hover:pl-5"
              >
                <FileCode2 className="w-4 h-4 text-brand-cyan" />
                <span>Export as HTML (Default)</span>
              </button>
              <button 
                onClick={() => handleExportReport('pdf')}
                className="w-full flex items-center space-x-2 text-left px-4 py-2.5 text-xs text-industrial-300 hover:text-white hover:bg-rose-500/20 transition-all hover:pl-5"
              >
                <FileIcon className="w-4 h-4 text-rose-400" />
                <span>Export as PDF Document</span>
              </button>
              <button 
                onClick={() => handleExportReport('docx')}
                className="w-full flex items-center space-x-2 text-left px-4 py-2.5 text-xs text-industrial-300 hover:text-white hover:bg-brand-indigo/20 transition-all hover:pl-5"
              >
                <FileText className="w-4 h-4 text-brand-indigo" />
                <span>Export as Word (DOCX)</span>
              </button>
            </div>
          )}
        </div>

        {/* Signout Button */}
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 text-industrial-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
