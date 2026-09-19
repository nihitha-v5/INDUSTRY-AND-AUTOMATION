import React, { useEffect, useState } from 'react';
import { GitBranch, Activity, Clock, Gauge, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { analyticsApi } from '../api/analytics';
import { BottleneckData } from '../types';
import { useData } from '../context/DataContext';

export const ProductionFlowPage: React.FC = () => {
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
        console.error("Error fetching production flow:", err);
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
          <span>Mapping Multi-Stage Production Flow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-industrial-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-brand-blue" />
          <span>Multi-Stage Manufacturing Production Flow</span>
        </h1>
        <p className="text-xs text-industrial-400 mt-1 font-mono">
          Visualize sequential line stage performance, station cycle times, utilization %, WIP queues, and downtime.
        </p>
      </div>

      {/* Sequential Flow Diagram Cards */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-brand-cyan" />
          <span>Sequential Manufacturing Process Flow</span>
        </h2>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 overflow-x-auto pb-2">
          {data.stations.map((st, idx) => (
            <React.Fragment key={st.station}>
              <div className={`p-4 rounded-xl border flex-1 min-w-[180px] w-full ${
                st.is_bottleneck
                  ? 'bg-rose-500/10 border-rose-500/50 glow-rose'
                  : 'bg-industrial-950 border-industrial-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white font-mono truncate">{st.station}</span>
                  {st.is_bottleneck && (
                    <span className="px-1.5 py-0.5 bg-rose-500 text-industrial-950 font-extrabold text-[9px] rounded">
                      BOTTLENECK
                    </span>
                  )}
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-industrial-400">
                    <span>Cycle Time:</span>
                    <span className="text-white font-bold">{st.cycle_time}s</span>
                  </div>
                  <div className="flex justify-between text-industrial-400">
                    <span>Utilization:</span>
                    <span className="text-white">{st.utilization_pct}%</span>
                  </div>
                  <div className="flex justify-between text-industrial-400">
                    <span>WIP Queue:</span>
                    <span className="text-amber-400 font-bold">{st.wip}</span>
                  </div>
                </div>
              </div>
              {idx < data.stations.length - 1 && (
                <ArrowRight className="w-5 h-5 text-industrial-600 shrink-0 hidden lg:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Charts: WIP Queue vs Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-industrial-800">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>Work-In-Progress (WIP) Accumulation by Station</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="station" stroke="#94a3b8" fontSize={9} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" units" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="wip" name="WIP Queue (units)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-industrial-800">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-emerald" />
            <span>Station Output Throughput (UPH)</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="station" stroke="#94a3b8" fontSize={9} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" UPH" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="throughput" name="Throughput (UPH)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
