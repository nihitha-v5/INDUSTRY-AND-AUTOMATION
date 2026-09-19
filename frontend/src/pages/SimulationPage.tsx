import React, { useState } from 'react';
import { Sliders, Activity, TrendingUp, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { simulationApi } from '../api/simulation';
import { SimulationResult } from '../types';

export const SimulationPage: React.FC = () => {
  const [targetStation, setTargetStation] = useState('STATION_C (CNC Stamping)');
  const [simulatedCycleTime, setSimulatedCycleTime] = useState(20.0);
  const [downtimeReductionPct, setDowntimeReductionPct] = useState(25.0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await simulationApi.runSimulation({
        target_station: targetStation,
        simulated_cycle_time: Number(simulatedCycleTime),
        downtime_reduction_pct: Number(downtimeReductionPct)
      });
      setResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-industrial-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-brand-blue" />
          <span>What-If Process Scenario Simulation Studio</span>
        </h1>
        <p className="text-xs text-industrial-400 mt-1 font-mono">
          Simulate hypothetical process improvements (cycle time reduction, downtime prevention) and evaluate line output gains.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulation Parameter Sliders Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2 border-b border-industrial-800 pb-2">
              <Sliders className="w-4 h-4 text-brand-cyan" />
              <span>Simulated Parameters Control Panel</span>
            </h2>

            <form onSubmit={handleRunSimulation} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-industrial-300 mb-1">Target Station Bottleneck</label>
                <select
                  value={targetStation}
                  onChange={(e) => setTargetStation(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-white focus:outline-none focus:border-brand-blue"
                >
                  <option value="STATION_C (CNC Stamping)">STATION_C (CNC Stamping)</option>
                  <option value="STATION_B (Thermal Press)">STATION_B (Thermal Press)</option>
                  <option value="STATION_D (Surface Treatment)">STATION_D (Surface Treatment)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-industrial-300">Simulated Cycle Time:</span>
                  <span className="text-brand-blue font-bold">{simulatedCycleTime} seconds</span>
                </div>
                <input
                  type="range"
                  min="10.0"
                  max="30.0"
                  step="0.5"
                  value={simulatedCycleTime}
                  onChange={(e) => setSimulatedCycleTime(parseFloat(e.target.value))}
                  className="w-full accent-brand-blue bg-industrial-950 cursor-pointer"
                />
                <span className="text-[10px] text-industrial-500">Baseline Current: 26.8 seconds</span>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-industrial-300">Target Downtime Reduction:</span>
                  <span className="text-emerald-400 font-bold">{downtimeReductionPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={downtimeReductionPct}
                  onChange={(e) => setDowntimeReductionPct(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 bg-industrial-950 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-industrial-950 font-bold text-xs rounded-lg transition-all shadow flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Evaluating Scenario...' : 'Execute What-If Simulation'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Before vs. After Simulation Results Output */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Baseline vs Simulated Metric Comparison Cards */}
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="glass-card rounded-xl p-4 border border-industrial-800 space-y-1">
                  <span className="text-industrial-400">Baseline Throughput:</span>
                  <p className="text-lg font-bold text-white">{result.baseline.throughput_uph} UPH</p>
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1 mt-1">
                    <ArrowRight className="w-3 h-3" />
                    <span>Simulated: {result.simulated.throughput_uph} UPH (+{result.delta.throughput_gain_uph})</span>
                  </span>
                </div>

                <div className="glass-card rounded-xl p-4 border border-industrial-800 space-y-1">
                  <span className="text-industrial-400">Estimated Monthly Scrap:</span>
                  <p className="text-lg font-bold text-rose-400">${result.baseline.scrap_cost.toLocaleString()}</p>
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1 mt-1">
                    <ArrowRight className="w-3 h-3" />
                    <span>Simulated: ${result.simulated.scrap_cost.toLocaleString()} (-${result.delta.scrap_cost_savings.toLocaleString()})</span>
                  </span>
                </div>
              </div>

              {/* Comparison Chart */}
              <div className="glass-card rounded-xl p-6 border border-industrial-800">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-brand-emerald" />
                  <span>Baseline vs. Simulated Performance Metrics</span>
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="metric" stroke="#94a3b8" fontSize={10} interval={0} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Advisory Disclaimer Banner */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>ADVISORY SIMULATION DISCLAIMER</span>
                </div>
                <p className="text-[11px] text-amber-300/90 font-mono leading-relaxed">
                  {result.advisory_disclaimer}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
