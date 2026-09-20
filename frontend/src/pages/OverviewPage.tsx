import React, { useEffect, useState } from 'react';
import {
  Package, CheckCircle, AlertTriangle, Activity, Gauge, Flame,
  Clock, DollarSign, TrendingUp, AlertCircle, Eye, ShieldAlert, Sparkles, Layers, PieChart as PieIcon, Filter, ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import { analyticsApi } from '../api/analytics';
import { DashboardSummary } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { useData } from '../context/DataContext';

export const OverviewPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'QUALITY' | 'PRODUCTION' | 'FINANCIAL'>('ALL');
  const { activeDataset } = useData();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const summary = await analyticsApi.getDashboardSummary(activeDataset?.id);
        setData(summary);
      } catch (err) {
        console.error("Error loading dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeDataset]);

  if (loading || !data) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-96 space-y-4">
        <div className="p-4 bg-brand-blue/10 border border-brand-blue/30 rounded-2xl glow-blue animate-pulse">
          <Activity className="w-8 h-8 text-brand-blue animate-spin" />
        </div>
        <div className="text-center font-mono">
          <p className="text-sm font-bold text-white tracking-wide">Initializing Industrial Decision Support Telemetry...</p>
          <p className="text-xs text-industrial-400 mt-1">Aggregating Inspection, Production, and Economic data streams</p>
        </div>
      </div>
    );
  }

  // Defect Distribution Donut Chart Data
  const defectPieData = data.defect_distribution || [
    { name: 'Surface Scratches', value: 42, color: '#ef4444' },
    { name: 'Thermal Rust', value: 28, color: '#f59e0b' },
    { name: 'Dimensional Defect', value: 18, color: '#3b82f6' },
    { name: 'Porosity Cavities', value: 12, color: '#8b5cf6' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-industrial-800/80 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Executive Overview Dashboard</span>
            </h1>

          </div>
          <p className="text-xs text-industrial-400 mt-1 font-mono leading-relaxed">
            Multi-Source Industrial Decision Support Platform • Real-Time Operations Telemetry & Financial Health
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 bg-industrial-900 border border-industrial-800 rounded-xl text-xs font-mono text-industrial-300 flex items-center space-x-2 shadow-inner">
            <Layers className="w-4 h-4 text-brand-blue" />
            <span className="font-semibold text-white">Line Alpha • Multi-Station OS</span>
          </div>
        </div>
      </div>

      {/* Telemetry Stream Filter Tabs Bar */}
      <div className="flex items-center justify-between bg-industrial-900/60 p-1.5 border border-industrial-800/80 rounded-2xl">
        <div className="flex items-center space-x-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-brand-blue text-industrial-950 shadow-lg shadow-brand-blue/20'
                : 'text-industrial-400 hover:text-white hover:bg-industrial-800/60'
            }`}
          >
            ALL TELEMETRY (16 KPIs)
          </button>
          <button
            onClick={() => setActiveTab('QUALITY')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'QUALITY'
                ? 'bg-brand-blue text-industrial-950 shadow-lg shadow-brand-blue/20'
                : 'text-industrial-400 hover:text-white hover:bg-industrial-800/60'
            }`}
          >
            QUALITY & DEFECTS
          </button>
          <button
            onClick={() => setActiveTab('PRODUCTION')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'PRODUCTION'
                ? 'bg-brand-blue text-industrial-950 shadow-lg shadow-brand-blue/20'
                : 'text-industrial-400 hover:text-white hover:bg-industrial-800/60'
            }`}
          >
            PRODUCTION & BOTTLENECKS
          </button>
          <button
            onClick={() => setActiveTab('FINANCIAL')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'FINANCIAL'
                ? 'bg-brand-blue text-industrial-950 shadow-lg shadow-brand-blue/20'
                : 'text-industrial-400 hover:text-white hover:bg-industrial-800/60'
            }`}
          >
            FINANCIAL IMPACT & MARGIN
          </button>
        </div>
        <span className="hidden lg:flex items-center space-x-1 text-[11px] font-mono text-industrial-400 px-3">
          <Filter className="w-3.5 h-3.5 text-brand-blue" />
          <span>Filter View</span>
        </span>
      </div>

      {/* Dynamic KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(activeTab === 'ALL' || activeTab === 'QUALITY') && (
          <>
            <MetricCard item={data.total_units} icon={Package} />
            <MetricCard item={data.inspected_units} icon={Eye} />
            <MetricCard item={data.accepted_units} icon={CheckCircle} />
            <MetricCard item={data.defective_units} icon={AlertTriangle} />
            <MetricCard item={data.defect_rate} icon={ShieldAlert} />
          </>
        )}

        {(activeTab === 'ALL' || activeTab === 'PRODUCTION') && (
          <>
            <MetricCard item={data.current_throughput} icon={Activity} />
            <MetricCard item={data.wip} icon={Gauge} />
            <MetricCard item={data.bottleneck_station} icon={Flame} />
            <MetricCard item={data.avg_cycle_time} icon={Clock} />
            <MetricCard item={data.utilization} icon={Gauge} />
            <MetricCard item={data.downtime} icon={Clock} />
          </>
        )}

        {(activeTab === 'ALL' || activeTab === 'FINANCIAL') && (
          <>
            <MetricCard item={data.scrap_cost} icon={DollarSign} />
            <MetricCard item={data.rework_cost} icon={DollarSign} />
            <MetricCard item={data.downtime_loss} icon={DollarSign} />
            <MetricCard item={data.revenue} icon={TrendingUp} />
            <MetricCard item={data.estimated_margin} icon={TrendingUp} />
          </>
        )}
      </div>

      {/* Visual Charts Row 1: Hourly Area Chart & Defect Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Defect Rate & Throughput Gradient Area Chart */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-industrial-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2 font-mono tracking-tight">
                <Activity className="w-4 h-4 text-brand-blue" />
                <span>Hourly Defect Rate (%) vs. Operational Throughput (UPH)</span>
              </h2>
              <p className="text-[11px] text-industrial-400 font-mono mt-0.5">Real-time correlated trend stream</p>
            </div>
            <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-mono font-bold rounded-lg border border-brand-blue/20 flex items-center space-x-1">
              <span>OBSERVED TELEMETRY</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.quality_trend}>
                <defs>
                  <linearGradient id="defectGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="throughputGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} fontStyle="mono" />
                <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} unit="%" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} unit=" UPH" />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Area yAxisId="left" type="monotone" dataKey="defect_rate" name="Defect Rate (%)" stroke="#3b82f6" fill="url(#defectGlow)" strokeWidth={3} />
                <Area yAxisId="right" type="monotone" dataKey="throughput" name="Throughput (UPH)" stroke="#10b981" fill="url(#throughputGlow)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defect Category Breakdown Donut Pie Chart */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-industrial-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2 font-mono tracking-tight">
                <PieIcon className="w-4 h-4 text-brand-cyan" />
                <span>Defect Category Distribution</span>
              </h2>
            </div>

            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defectPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {defectPieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} stroke="#070b14" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-industrial-800/80 font-mono text-[11px]">
            {defectPieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-industrial-300">{d.name}</span>
                </div>
                <span className="font-bold text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Charts Row 2: Station Capacity Matrix & Workload Indicators */}
      <div className="glass-card rounded-2xl p-6 border border-industrial-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2 font-mono tracking-tight">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Multi-Station Capacity & Workload Heatmap Matrix</span>
          </h2>
          <span className="text-[10px] font-mono text-industrial-400">Live Station Telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {data.station_performance.map((st, idx) => {
            const isBottleneck = st.station.includes('Bottleneck') || st.cycle_time > 20;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border font-mono space-y-3 transition-all ${
                  isBottleneck
                    ? 'bg-rose-500/10 border-rose-500/40 glow-rose'
                    : 'bg-industrial-950/80 border-industrial-800 hover:border-industrial-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[110px]">{st.station}</span>
                  {isBottleneck ? (
                    <span className="px-1.5 py-0.5 bg-rose-500 text-industrial-950 font-black text-[9px] rounded">
                      BOTTLENECK
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                      NORMAL
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-industrial-400">
                    <span>Cycle Time:</span>
                    <span className="text-white font-bold">{st.cycle_time}s</span>
                  </div>
                  <div className="flex justify-between text-industrial-400">
                    <span>Utilization:</span>
                    <span className="text-brand-blue font-bold">{st.utilization}%</span>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="w-full bg-industrial-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, st.utilization)}%` }}
                    className={`h-full rounded-full ${isBottleneck ? 'bg-rose-500' : 'bg-brand-blue'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Inspection Stream Table */}
      <div className="glass-card rounded-2xl p-6 border border-industrial-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2 font-mono tracking-tight">
            <Eye className="w-4 h-4 text-brand-emerald" />
            <span>Automated Visual Inspection Real-Time Stream</span>
          </h2>
          <span className="text-[10px] font-mono text-industrial-400">Live Inferences</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-industrial-950/90 text-industrial-400 font-mono uppercase text-[10px] border-b border-industrial-800">
              <tr>
                <th className="p-3.5">Sample ID</th>
                <th className="p-3.5">Station</th>
                <th className="p-3.5">AI Classification</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Uncertainty State</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60 font-mono">
              {data.recent_inspections.map((item) => (
                <tr key={item.id} className="hover:bg-industrial-800/30 transition-colors">
                  <td className="p-3.5 text-white font-semibold flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                    <span>{item.image_name}</span>
                  </td>
                  <td className="p-3.5 text-industrial-300">{item.station}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider ${
                      item.prediction === 'ACCEPTABLE' || item.prediction === 'NORMAL'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.prediction}
                    </span>
                  </td>
                  <td className="p-3.5 text-white font-bold">{item.confidence}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      item.is_novel ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 glow-amber' : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                    }`}>
                      {item.uncertainty_level} {item.is_novel ? '• NOVEL PATTERN' : ''}
                    </span>
                  </td>
                  <td className="p-3.5 text-industrial-400 text-[11px]">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
