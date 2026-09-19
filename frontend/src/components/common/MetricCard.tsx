import React from 'react';
import { QualityMetricItem } from '../../types';
import { AlertCircle, TrendingUp, Sparkles } from 'lucide-react';

interface MetricCardProps {
  item: QualityMetricItem;
  icon: React.ElementType;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ item, icon: Icon, accentColor = 'brand-blue' }) => {
  if (!item.is_available) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-industrial-800/80 bg-industrial-950/40 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-industrial-400 font-mono tracking-wider uppercase text-[10px]">{item.label}</span>
          <div className="p-2.5 bg-industrial-900/80 rounded-xl text-industrial-500 border border-industrial-800">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-2 text-amber-400/90 text-xs font-medium bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate text-[11px] font-mono">{item.notice || "Not available in uploaded dataset"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-industrial-800/80 relative overflow-hidden group">
      {/* Subtle Background Radial Gradient Highlight */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-brand-blue/5 rounded-full blur-xl group-hover:bg-brand-blue/10 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between">
        <span className="text-[11px] font-bold text-industrial-400 font-mono tracking-wider uppercase">{item.label}</span>
        <div className="p-2.5 bg-gradient-to-br from-industrial-800 to-industrial-900 rounded-xl text-brand-blue border border-industrial-700/60 group-hover:border-brand-blue/40 transition-colors shadow-inner">
          <Icon className="w-4 h-4 text-brand-blue group-hover:scale-110 transition-transform" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-2xl font-black text-white tracking-tight font-mono group-hover:text-brand-blue transition-colors">
          {typeof item.value === 'number' ? item.value.toLocaleString() : (item.value ?? 'N/A')}
        </span>
        {item.unit && <span className="text-xs text-industrial-400 font-semibold font-mono">{item.unit}</span>}
      </div>

      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-industrial-800/60">
        <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
          <TrendingUp className="w-3 h-3" />
          <span>Active Stream</span>
        </span>
        <span className="text-[9px] font-mono px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded-md border border-brand-blue/20">
          LIVE
        </span>
      </div>
    </div>
  );
};
