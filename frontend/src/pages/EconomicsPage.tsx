import React, { useEffect, useState } from 'react';
import { DollarSign, Activity, TrendingUp, AlertCircle, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { analyticsApi } from '../api/analytics';
import { EconomicsData } from '../types';
import { useData } from '../context/DataContext';

export const EconomicsPage: React.FC = () => {
  const [data, setData] = useState<EconomicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeDataset } = useData();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.getEconomics(activeDataset?.id);
        setData(res);
      } catch (err) {
        console.error("Error fetching economic impact:", err);
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
          <span>Calculating Economic Financial Impact...</span>
        </div>
      </div>
    );
  }

  const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#38bdf8'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-industrial-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span>Industrial Financial & Economic Cost Analysis</span>
        </h1>
        <p className="text-xs text-industrial-400 mt-1 font-mono">
          Estimate scrap costs, rework exposure, downtime financial losses, production losses, revenue, and profit margin.
        </p>
      </div>

      {/* Financial Summary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">Scrap Cost Loss</span>
          <p className="text-xl font-bold text-rose-400 mt-1">
            {data.scrap_cost ? `$${data.scrap_cost.toLocaleString()}` : 'N/A'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">Rework Cost Exposure</span>
          <p className="text-xl font-bold text-amber-400 mt-1">
            {data.rework_cost ? `$${data.rework_cost.toLocaleString()}` : 'N/A'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">Downtime Loss</span>
          <p className="text-xl font-bold text-purple-400 mt-1">
            {data.downtime_loss ? `$${data.downtime_loss.toLocaleString()}` : 'N/A'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">Production Rate Loss</span>
          <p className="text-xl font-bold text-blue-400 mt-1">
            {data.production_loss ? `$${data.production_loss.toLocaleString()}` : 'N/A'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">Estimated Line Revenue</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            {data.revenue ? `$${data.revenue.toLocaleString()}` : 'N/A'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-industrial-800">
          <span className="text-[11px] text-industrial-400">Estimated Profit Margin</span>
          <p className="text-xl font-bold text-brand-blue mt-1">
            {data.estimated_margin ? `$${data.estimated_margin.toLocaleString()}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Financial Breakdown Pie Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-industrial-800">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-brand-blue" />
            <span>Manufacturing Loss Allocation Breakdown</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.cost_breakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.cost_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Economic Impact Summary Table</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-industrial-950 text-industrial-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Cost Category</th>
                  <th className="p-3">Estimated Loss ($)</th>
                  <th className="p-3">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800/60 font-mono">
                {data.cost_breakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-industrial-800/40">
                    <td className="p-3 text-white font-semibold">{item.category}</td>
                    <td className="p-3 text-rose-400 font-bold">${item.amount.toLocaleString()}</td>
                    <td className="p-3 text-industrial-300">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg text-xs font-mono text-industrial-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Notice: Financial estimates are calculated based on available organizer dataset economic fields.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
