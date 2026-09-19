import React, { useState } from 'react';
import { Settings, Sliders, ShieldCheck, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { role, user } = useAuth();
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.50);
  const [enableRootCause, setEnableRootCause] = useState(true);
  const [enableBottlenecks, setEnableBottlenecks] = useState(true);
  const [enableEconomics, setEnableEconomics] = useState(true);
  const [enableSimulation, setEnableSimulation] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-industrial-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-brand-blue" />
          <span>Application Settings & Engine Configuration</span>
        </h1>
        <p className="text-xs text-industrial-400 mt-1 font-mono">
          Configure default confidence thresholds, enable/disable decision support engines, and review environment parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Confidence Threshold Setting */}
        <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4 font-mono text-xs">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-brand-cyan" />
            <span>Default Confidence Threshold</span>
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-industrial-300">
              <span>Novelty & Anomaly Detection Cutoff:</span>
              <span className="text-brand-blue font-bold">{Math.round(confidenceThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.90"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-brand-blue bg-industrial-950 cursor-pointer"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4 font-mono text-xs">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <span>Industrial Analytical Engine Toggles</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
              <div>
                <p className="text-white font-semibold">Defect Root-Cause Correlation Engine</p>
                <p className="text-[11px] text-industrial-400 font-sans">Correlate quality defects with station parameters and cycle times.</p>
              </div>
              <button
                type="button"
                onClick={() => setEnableRootCause(!enableRootCause)}
                className="text-brand-blue focus:outline-none"
              >
                {enableRootCause ? <ToggleRight className="w-7 h-7 text-brand-emerald" /> : <ToggleLeft className="w-7 h-7 text-industrial-600" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
              <div>
                <p className="text-white font-semibold">Production Bottleneck Analysis Engine</p>
                <p className="text-[11px] text-industrial-400 font-sans">Identify station capacity constraints, WIP queues, and downtime.</p>
              </div>
              <button
                type="button"
                onClick={() => setEnableBottlenecks(!enableBottlenecks)}
                className="text-brand-blue focus:outline-none"
              >
                {enableBottlenecks ? <ToggleRight className="w-7 h-7 text-brand-emerald" /> : <ToggleLeft className="w-7 h-7 text-industrial-600" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
              <div>
                <p className="text-white font-semibold">Financial Economic Impact Engine</p>
                <p className="text-[11px] text-industrial-400 font-sans">Estimate scrap costs, rework exposure, downtime losses, revenue, and margin.</p>
              </div>
              <button
                type="button"
                onClick={() => setEnableEconomics(!enableEconomics)}
                className="text-brand-blue focus:outline-none"
              >
                {enableEconomics ? <ToggleRight className="w-7 h-7 text-brand-emerald" /> : <ToggleLeft className="w-7 h-7 text-industrial-600" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
              <div>
                <p className="text-white font-semibold">What-If Scenario Simulation Studio</p>
                <p className="text-[11px] text-industrial-400 font-sans">Simulate parameter adjustments and compare baseline vs simulated output.</p>
              </div>
              <button
                type="button"
                onClick={() => setEnableSimulation(!enableSimulation)}
                className="text-brand-blue focus:outline-none"
              >
                {enableSimulation ? <ToggleRight className="w-7 h-7 text-brand-emerald" /> : <ToggleLeft className="w-7 h-7 text-industrial-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* User Account Info */}
        <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-3 font-mono text-xs">
          <h2 className="text-sm font-semibold text-white">Active System Environment</h2>
          <div className="grid grid-cols-2 gap-3 text-industrial-300">
            <div>
              <span className="text-industrial-400">Current User:</span> {user?.full_name} ({user?.email})
            </div>
            <div>
              <span className="text-industrial-400">Assigned Role:</span> {role}
            </div>
            <div>
              <span className="text-industrial-400">Backend API URL:</span> http://localhost:8000/api
            </div>
            <div>
              <span className="text-industrial-400">Database Engine:</span> SQLite (PostgreSQL Compatible)
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-industrial-950 font-bold text-xs rounded-lg transition-all font-mono shadow flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Settings</span>
          </button>
          {saved && (
            <span className="text-xs text-brand-emerald font-mono font-semibold animate-fade-in">
              Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
