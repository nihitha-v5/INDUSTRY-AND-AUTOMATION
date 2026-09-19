import React, { useEffect, useState } from 'react';
import { Sparkles, Download, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { recommendationsApi } from '../api/recommendations';
import { RecommendationCard } from '../types';
import { useData } from '../context/DataContext';

export const RecommendationsPage: React.FC = () => {
  const [items, setItems] = useState<RecommendationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeDataset } = useData();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await recommendationsApi.getRecommendations(activeDataset?.id);
        setItems(res.items);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeDataset]);

  const handleDownload = () => {
    recommendationsApi.downloadReport();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-industrial-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-blue" />
            <span>Advisory Recommendation & Decision Support Engine</span>
          </h1>
          <p className="text-xs text-industrial-400 mt-1 font-mono">
            Evidence-based industrial decision support synthesizing defect findings, process correlations, bottlenecks, economics, and simulations.
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-industrial-950 font-bold text-xs rounded-lg transition-all shadow shrink-0 font-mono"
        >
          <Download className="w-4 h-4" />
          <span>Download Formal Audit Report (HTML)</span>
        </button>
      </div>

      {/* Advisory Cards List */}
      <div className="space-y-6">
        {items.map((card) => (
          <div key={card.id} className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
            <div className="flex items-center justify-between border-b border-industrial-800/80 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
                <span>{card.title}</span>
              </h2>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                card.confidence === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                card.confidence === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                CONFIDENCE: {card.confidence}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-industrial-950 border border-industrial-800 rounded-lg space-y-1">
                <span className="text-brand-blue font-bold text-[11px]">OBSERVATION:</span>
                <p className="text-industrial-200 font-sans">{card.observation}</p>
              </div>

              <div className="p-3.5 bg-industrial-950 border border-industrial-800 rounded-lg space-y-1">
                <span className="text-brand-cyan font-bold text-[11px]">EVIDENCE:</span>
                <p className="text-industrial-200 font-sans">{card.evidence}</p>
              </div>

              <div className="p-3.5 bg-industrial-950 border border-industrial-800 rounded-lg space-y-1">
                <span className="text-amber-400 font-bold text-[11px]">POTENTIAL PROCESS ASSOCIATION:</span>
                <p className="text-industrial-200 font-sans">{card.potential_association}</p>
              </div>

              <div className="p-3.5 bg-industrial-950 border border-industrial-800 rounded-lg space-y-1">
                <span className="text-rose-400 font-bold text-[11px]">ESTIMATED IMPACT:</span>
                <p className="text-industrial-200 font-sans">{card.impact}</p>
              </div>

              <div className="p-3.5 bg-industrial-950 border border-industrial-800 rounded-lg space-y-1">
                <span className="text-emerald-400 font-bold text-[11px]">SUGGESTED ACTION:</span>
                <p className="text-industrial-200 font-sans">{card.suggested_action}</p>
              </div>

              <div className="p-3.5 bg-industrial-950 border border-industrial-800 rounded-lg space-y-1">
                <span className="text-purple-400 font-bold text-[11px]">SIMULATION RESULT:</span>
                <p className="text-industrial-200 font-sans">{card.simulation_result || 'N/A'}</p>
              </div>
            </div>

            {/* Limitations Notice */}
            <div className="p-3 bg-industrial-950/80 border border-industrial-800 rounded-lg text-xs font-mono text-industrial-400 flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-industrial-500 shrink-0 mt-0.5" />
              <span><strong>LIMITATIONS & ASSUMPTIONS:</strong> {card.limitations}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
