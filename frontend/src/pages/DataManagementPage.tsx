import React, { useState, useEffect } from 'react';
import { Upload, Database, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { datasetsApi } from '../api/datasets';
import { Dataset, DataQualityReport } from '../types';
import { useData } from '../context/DataContext';

export const DataManagementPage: React.FC = () => {
  const { activeDataset, refreshDatasets } = useData();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [validating, setValidating] = useState(false);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [savingMapping, setSavingMapping] = useState(false);

  const SEMANTIC_ROLES = [
    { value: '', label: '-- Unmapped --' },
    { value: 'INSPECTION_IMAGE', label: 'Inspection: Image Path / Filename' },
    { value: 'LABEL', label: 'Inspection: Quality Ground Truth Label' },
    { value: 'DEFECT_CLASS', label: 'Inspection: Defect Category / Class' },
    { value: 'STATION', label: 'Production: Station / Machine ID' },
    { value: 'BATCH', label: 'Production: Batch / Lot Number' },
    { value: 'CYCLE_TIME', label: 'Production: Cycle Time (sec)' },
    { value: 'UTILIZATION', label: 'Production: Station Utilization (%)' },
    { value: 'DOWNTIME', label: 'Production: Stoppage / Downtime (min)' },
    { value: 'WIP', label: 'Production: Work-In-Progress (WIP)' },
    { value: 'THROUGHPUT', label: 'Production: Line Throughput (UPH)' },
    { value: 'PROCESS_PARAM', label: 'Production: Process Parameter (Temp/Pressure)' },
    { value: 'SCRAP_COST', label: 'Economic: Scrap Cost ($)' },
    { value: 'REWORK_COST', label: 'Economic: Rework Cost ($)' },
    { value: 'DOWNTIME_COST', label: 'Economic: Downtime Loss ($)' },
    { value: 'REVENUE', label: 'Economic: Revenue ($)' },
    { value: 'MARGIN', label: 'Economic: Profit Margin ($)' }
  ];

  useEffect(() => {
    if (activeDataset?.columns) {
      const initialMap: Record<string, string> = {};
      activeDataset.columns.forEach(col => {
        if (col.semantic_role) {
          initialMap[col.column_name] = col.semantic_role;
        }
      });
      setMappings(initialMap);
    }
  }, [activeDataset]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await datasetsApi.upload(formData);
      await refreshDatasets();
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRunValidation = async () => {
    if (!activeDataset) return;
    setValidating(true);
    try {
      const report = await datasetsApi.validate(activeDataset.id);
      setQualityReport(report);
    } catch (err) {
      console.error("Validation error:", err);
    } finally {
      setValidating(false);
    }
  };

  const handleSaveMappings = async () => {
    if (!activeDataset) return;
    setSavingMapping(true);
    try {
      const list = Object.entries(mappings).map(([col_name, role]) => ({
        column_name: col_name,
        semantic_role: role
      }));
      await datasetsApi.mapColumns(activeDataset.id, list);
      await refreshDatasets();
    } catch (err) {
      console.error("Error saving mapping:", err);
    } finally {
      setSavingMapping(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-industrial-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Database className="w-5 h-5 text-brand-blue" />
          <span>Data Management & Dynamic Pipeline Profiling</span>
        </h1>
        <p className="text-xs text-industrial-400 mt-1 font-mono">
          Upload multi-stage datasets, map semantic column definitions, and execute data quality engine checks.
        </p>
      </div>

      {/* File Upload Dropzone */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
          <Upload className="w-4 h-4 text-brand-blue" />
          <span>Upload Dataset File (CSV, XLSX, JSON, ZIP, Images)</span>
        </h2>
        <form onSubmit={handleFileUpload} className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
            className="block w-full text-xs text-industrial-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-industrial-800 file:text-brand-blue hover:file:bg-industrial-700 cursor-pointer bg-industrial-950 border border-industrial-800 rounded-lg p-1.5"
          />
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-industrial-950 font-semibold text-xs rounded-lg transition-all shrink-0 font-mono shadow"
          >
            {uploading ? 'Processing File...' : 'Upload & Auto-Profile'}
          </button>
        </form>
      </div>

      {/* Dataset Schema Profiling Table */}
      {activeDataset && (
        <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-brand-cyan" />
                <span>Active Dataset Profile: {activeDataset.name}</span>
              </h2>
              <p className="text-xs text-industrial-400 font-mono mt-0.5">
                Rows: {activeDataset.row_count} | Columns: {activeDataset.column_count} | Format: .{activeDataset.file_type}
              </p>
            </div>
            <button
              onClick={handleSaveMappings}
              disabled={savingMapping}
              className="px-4 py-2 bg-brand-emerald hover:bg-brand-emerald/90 text-industrial-950 font-semibold text-xs rounded-lg transition-all font-mono shadow self-start md:self-auto"
            >
              {savingMapping ? 'Saving...' : 'Save Interactive Column Mapping'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-industrial-950 text-industrial-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Detected Column</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Missing Values</th>
                  <th className="p-3">Unique Values</th>
                  <th className="p-3">Sample Values</th>
                  <th className="p-3">Mapped Semantic Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800/60 font-mono">
                {activeDataset.columns?.map((col) => (
                  <tr key={col.id} className="hover:bg-industrial-800/40">
                    <td className="p-3 text-white font-semibold">{col.column_name}</td>
                    <td className="p-3 text-industrial-300">{col.data_type}</td>
                    <td className="p-3 text-amber-400">{col.missing_count}</td>
                    <td className="p-3 text-industrial-200">{col.unique_count}</td>
                    <td className="p-3 text-industrial-400 font-sans text-[11px]">
                      {col.sample_values ? JSON.stringify(col.sample_values) : 'N/A'}
                    </td>
                    <td className="p-3">
                      <select
                        value={mappings[col.column_name] || ''}
                        onChange={(e) => setMappings({ ...mappings, [col.column_name]: e.target.value })}
                        className="bg-industrial-950 text-brand-blue border border-industrial-700/80 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-brand-blue cursor-pointer"
                      >
                        {SEMANTIC_ROLES.map(role => (
                          <option key={role.value} value={role.value} className="bg-industrial-900 text-white">
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Quality Report Engine Output */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <span>Data Quality Engine Validation Report</span>
          </h2>
          <button
            onClick={handleRunValidation}
            disabled={validating}
            className="px-4 py-1.5 bg-industrial-800 hover:bg-industrial-700 text-brand-blue border border-brand-blue/30 rounded-lg text-xs font-semibold font-mono flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${validating ? 'animate-spin' : ''}`} />
            <span>Run Quality Check</span>
          </button>
        </div>

        {qualityReport && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
                <span className="text-industrial-400">Total Rows:</span>
                <p className="text-base font-bold text-white mt-1">{qualityReport.row_count}</p>
              </div>
              <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
                <span className="text-industrial-400">Missing Cell Values:</span>
                <p className="text-base font-bold text-amber-400 mt-1">{qualityReport.missing_values_total}</p>
              </div>
              <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
                <span className="text-industrial-400">Duplicate Rows:</span>
                <p className="text-base font-bold text-rose-400 mt-1">{qualityReport.duplicate_rows}</p>
              </div>
              <div className="p-3 bg-industrial-950 border border-industrial-800 rounded-lg">
                <span className="text-industrial-400">Valid Images Found:</span>
                <p className="text-base font-bold text-emerald-400 mt-1">{qualityReport.images_available}</p>
              </div>
            </div>

            {qualityReport.warnings?.length > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <h3 className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Quality Warnings & Outlier Indicators:</span>
                </h3>
                <ul className="list-disc list-inside text-xs text-amber-300 space-y-1 font-mono">
                  {qualityReport.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
