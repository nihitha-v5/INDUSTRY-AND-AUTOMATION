import React, { useState } from 'react';
import { BarChart3, ShieldCheck, AlertTriangle, Sliders, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export const ModelPerformancePage: React.FC = () => {
  const [threshold, setThreshold] = useState(0.50);
  const { isDemoMode } = useData();

  // Calculate metrics dynamically based on threshold slider
  const total = 400;
  const trueAccept = Math.round(310 * (1 - (threshold - 0.5) * 0.2));
  const falseReject = 330 - trueAccept; // Acceptable classified as defective
  const trueDefect = Math.round(60 * (1 + (threshold - 0.5) * 0.1));
  const falseAccept = 70 - trueDefect; // Defective classified as acceptable

  const precision = ((trueDefect / Math.max(1, trueDefect + falseReject)) * 100).toFixed(1);
  const recall = ((trueDefect / Math.max(1, trueDefect + falseAccept)) * 100).toFixed(1);
  const f1 = ((2 * Number(precision) * Number(recall)) / (Number(precision) + Number(recall))).toFixed(1);
  const accuracy = (((trueAccept + trueDefect) / total) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-industrial-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-brand-blue" />
          <span>Model Performance & False Accept / False Reject Trade-off Studio</span>
        </h1>
        <p className="text-xs text-industrial-400 mt-1 font-mono">
          Evaluate validation confusion matrix, precision, recall, F1 score, and operational decision threshold tuning.
        </p>
      </div>

      {/* Threshold Slider Control */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-brand-cyan" />
            <span>Operational Confidence Classification Threshold</span>
          </h2>
          <span className="text-brand-blue font-bold text-sm">{Math.round(threshold * 100)}% Confidence Threshold</span>
        </div>
        <input
          type="range"
          min="0.30"
          max="0.85"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full accent-brand-blue bg-industrial-950 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-industrial-400">
          <span>Lower Threshold (Higher Recall, Higher False Rejects)</span>
          <span>Higher Threshold (Higher Precision, Higher False Accepts)</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">Accuracy</span>
          <p className="text-2xl font-bold text-white mt-1">{accuracy}%</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">Precision</span>
          <p className="text-2xl font-bold text-brand-blue mt-1">{precision}%</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">Recall</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{recall}%</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">F1 Score</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{f1}%</p>
        </div>
      </div>

      {/* Confusion Matrix & Trade-off Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Table */}
        <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <span>Validation Confusion Matrix</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">True Accept (Correct)</span>
              <p className="text-2xl font-bold text-white">{trueAccept}</p>
              <p className="text-[10px] text-industrial-400">Acceptable unit correctly classified</p>
            </div>

            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase">False Reject (Risk)</span>
              <p className="text-2xl font-bold text-white">{falseReject}</p>
              <p className="text-[10px] text-industrial-400">Acceptable unit misclassified as defective</p>
            </div>

            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase">False Accept (Critical)</span>
              <p className="text-2xl font-bold text-white">{falseAccept}</p>
              <p className="text-[10px] text-industrial-400">Defective unit misclassified as acceptable</p>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">True Defect (Correct)</span>
              <p className="text-2xl font-bold text-white">{trueDefect}</p>
              <p className="text-[10px] text-industrial-400">Defective unit correctly identified</p>
            </div>
          </div>
        </div>

        {/* Trade-off Definitions */}
        <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Industrial Operational Impact Trade-off</span>
          </h2>
          <div className="space-y-3 font-mono text-xs text-industrial-300">
            <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg space-y-1">
              <span className="text-rose-400 font-bold">FALSE ACCEPT IMPACT:</span>
              <p className="font-sans text-industrial-300">
                A defective unit escapes inspection and is delivered to customers or downstream stations, causing potential warranty claims, product failure, or line disruption.
              </p>
            </div>

            <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg space-y-1">
              <span className="text-amber-400 font-bold">FALSE REJECT IMPACT:</span>
              <p className="font-sans text-industrial-300">
                A good acceptable unit is mistakenly flagged as defective, resulting in unnecessary rework processing or unnecessary unit scrap cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
