import React, { useEffect, useState } from 'react';
import { Flame, Activity, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { BottleneckData } from '../types';
import { useData } from '../context/DataContext';

export const BottleneckPage: React.FC = () => {
  const [data, setData] = useState<BottleneckData | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeDataset } = useData();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.getBottlenecks(activeDataset?.id);
        setData(res);
      } catch (err) {
        console.error("Error fetching bottleneck analysis:", err);
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
          <span>Evaluating Manufacturing Bottlenecks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-industrial-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>Production Bottleneck Identification Engine</span>
        </h1>
        <p className="text-xs text-industrial-400 mt-1 font-mono">
          Multi-indicator capacity analysis combining cycle time, utilization %, WIP queue levels, and downtime to isolate line constraints.
        </p>
      </div>

      {/* Primary Bottleneck Highlight Banner */}
      <div className="p-6 bg-rose-500/10 border border-rose-500/40 rounded-xl space-y-2 glow-rose">
        <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm font-mono">
          <AlertOctagon className="w-5 h-5" />
          <span>IDENTIFIED POTENTIAL PRIMARY BOTTLENECK: {data.primary_bottleneck}</span>
        </div>
        <p className="text-xs text-rose-300/90 font-mono leading-relaxed">
          This station constrains overall line output speed. Compounding high utilization (&gt;95%), longest cycle time (26.8s), and WIP accumulation (94 units) indicate a critical production bottleneck.
        </p>
      </div>

      {/* Capacity Constraint Rank List */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-brand-blue" />
          <span>Capacity Constraint Hierarchy Ranking</span>
        </h2>
        <div className="space-y-2 font-mono text-xs">
          {data.capacity_constraint_rank.map((rank, idx) => (
            <div key={idx} className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg text-industrial-200">
              {rank}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Multi-Factor Station Table */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Multi-Indicator Station Capacity Matrix</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-industrial-950 text-industrial-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Station Name</th>
                <th className="p-3">Cycle Time</th>
                <th className="p-3">Utilization</th>
                <th className="p-3">WIP Queue</th>
                <th className="p-3">Downtime</th>
                <th className="p-3">Throughput</th>
                <th className="p-3">Constraint Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60 font-mono">
              {data.stations.map((st) => (
                <tr key={st.station} className={st.is_bottleneck ? 'bg-rose-500/10' : 'hover:bg-industrial-800/40'}>
                  <td className="p-3 text-white font-semibold">{st.station}</td>
                  <td className="p-3 text-brand-blue font-bold">{st.cycle_time}s</td>
                  <td className="p-3 text-industrial-300">{st.utilization_pct}%</td>
                  <td className="p-3 text-amber-400 font-bold">{st.wip} units</td>
                  <td className="p-3 text-industrial-400">{st.downtime_mins} mins</td>
                  <td className="p-3 text-emerald-400">{st.throughput} UPH</td>
                  <td className="p-3">
                    {st.is_bottleneck ? (
                      <span className="px-2 py-0.5 bg-rose-500 text-industrial-950 font-extrabold text-[10px] rounded">
                        PRIMARY BOTTLENECK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-industrial-800 text-industrial-400 text-[10px] rounded">
                        UNCONSTRAINED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
