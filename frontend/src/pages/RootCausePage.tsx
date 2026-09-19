import React, { useEffect, useState } from 'react';
import { GitCommit, Activity, BarChart2, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { analyticsApi } from '../api/analytics';
import { RootCauseData } from '../types';
import { useData } from '../context/DataContext';

export const RootCausePage: React.FC = () => {
  const [data, setData] = useState<RootCauseData | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeDataset } = useData();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.getRootCause(activeDataset?.id);
        setData(res);
      } catch (err) {
        console.error("Error fetching root cause analysis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeDataset]);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-brand-blue font-mono">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Computing Process Statistical Correlations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-industrial-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <GitCommit className="w-5 h-5 text-brand-blue" />
          <span>Defect Root-Cause & Process Correlation Engine</span>
        </h1>
        <p className="text-xs text-industrial-400 mt-1 font-mono">
          Correlate visual inspection defect rates with station parameters, cycle times, utilization %, and batch process conditions.
        </p>
      </div>

      {/* Key Evidence & Association Findings Banner */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Identified Potential Process Associations & Evidence</span>
        </h2>
        <div className="space-y-2 font-mono text-xs text-industrial-200">
          {data.key_findings.map((finding, idx) => (
            <div key={idx} className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
              <span>{finding}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Station Defect Rates & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Station Defect Rate Comparison Chart */}
        <div className="glass-card rounded-xl p-6 border border-industrial-800">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-rose-400" />
            <span>Defect Rate (%) by Manufacturing Station</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.station_defect_rates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="station" stroke="#94a3b8" fontSize={9} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="defect_rate_pct" name="Defect Rate (%)" radius={[4, 4, 0, 0]}>
                  {data.station_defect_rates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.defect_rate_pct > 10 ? '#ef4444' : '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance Rank */}
        <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-cyan" />
            <span>Process Feature Importance Ranking</span>
          </h2>
          <div className="space-y-3 font-mono text-xs">
            {data.feature_importance.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-industrial-300">
                  <span>{item.feature} ({item.category})</span>
                  <span className="font-bold text-white">{Math.round(item.importance_score * 100)}%</span>
                </div>
                <div className="w-full bg-industrial-950 rounded-full h-2 overflow-hidden border border-industrial-800">
                  <div
                    className="bg-brand-blue h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.importance_score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Correlation Matrix Table */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
          <GitCommit className="w-4 h-4 text-brand-blue" />
          <span>Statistical Correlation Metrics</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-industrial-950 text-industrial-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Process Variable 1</th>
                <th className="p-3">Process Variable 2</th>
                <th className="p-3">Pearson r</th>
                <th className="p-3">Observed Evidence Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60 font-mono">
              {data.correlations.map((corr, idx) => (
                <tr key={idx} className="hover:bg-industrial-800/40">
                  <td className="p-3 text-white font-semibold">{corr.feature1}</td>
                  <td className="p-3 text-white font-semibold">{corr.feature2}</td>
                  <td className="p-3 text-brand-blue font-bold">{corr.coefficient}</td>
                  <td className="p-3 text-industrial-300 font-sans text-xs">{corr.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg text-xs font-mono text-industrial-400 flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-industrial-500 shrink-0" />
          <span>IMPORTANT: Statistical correlation indicates observed association in data, not guaranteed physical causation.</span>
        </div>
      </div>
    </div>
  );
};
