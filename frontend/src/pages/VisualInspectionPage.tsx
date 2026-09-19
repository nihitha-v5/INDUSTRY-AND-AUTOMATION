import React, { useState } from 'react';
import { Eye, Upload, AlertCircle, ShieldAlert, CheckCircle2, Box, HelpCircle, Layers, FolderCheck, Sparkles } from 'lucide-react';
import { inspectionApi } from '../api/inspection';
import { InspectionResult, BatchInspectionResponse } from '../types';

export const VisualInspectionPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [inspecting, setInspecting] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchInspectionResponse | null>(null);
  const [stationId, setStationId] = useState('STATION_C (CNC Stamping)');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  const datasetCategories = [
    { key: 'scratches', label: 'Scratches', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    { key: 'rust', label: 'Rust Corrosion', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { key: 'normal', label: 'Normal / Acceptable', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { key: 'hole', label: 'Hole / Pinhole', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    { key: 'crack', label: 'Crack Fracture', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' }
  ];

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setBatchResult(null);
      setPreviewUrls(fileArray.map(f => URL.createObjectURL(f)));
    } else {
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  };

  const loadSampleCategory = async (categoryKey: string) => {
    try {
      setInspecting(true);
      setActiveCategoryFilter(categoryKey);
      
      // Fetch preset sample image blob for selected category
      const fileName = `${categoryKey}_sample.png`;
      const res = await fetch(`/api/inspection/upload/${fileName}`);
      if (!res.ok) throw new Error("Failed to fetch sample image");
      
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      
      setSelectedFiles([file]);
      setPreviewUrls([URL.createObjectURL(blob)]);
      
      // Run prediction directly
      const pred = await inspectionApi.predictSingle(file, stationId);
      setBatchResult({
        total_images: 1,
        processed_count: 1,
        acceptable_count: pred.prediction.includes('ACCEPTABLE') || pred.prediction.includes('NORMAL') ? 1 : 0,
        defective_count: pred.prediction.includes('ACCEPTABLE') || pred.prediction.includes('NORMAL') ? 0 : 1,
        uncertain_count: pred.is_novel ? 1 : 0,
        results: [pred]
      });
    } catch (err) {
      console.error("Error running sample category prediction:", err);
    } finally {
      setInspecting(false);
    }
  };

  const handleRunInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setInspecting(true);
    try {
      if (selectedFiles.length === 1) {
        const res = await inspectionApi.predictSingle(selectedFiles[0], stationId);
        setBatchResult({
          total_images: 1,
          processed_count: 1,
          acceptable_count: res.prediction.includes('ACCEPTABLE') || res.prediction.includes('NORMAL') ? 1 : 0,
          defective_count: res.prediction.includes('ACCEPTABLE') || res.prediction.includes('NORMAL') ? 0 : 1,
          uncertain_count: res.is_novel ? 1 : 0,
          results: [res]
        });
      } else {
        const res = await inspectionApi.predictBatch(selectedFiles);
        setBatchResult(res);
      }
    } catch (err) {
      console.error("Inspection prediction error:", err);
    } finally {
      setInspecting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-industrial-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Eye className="w-5 h-5 text-brand-emerald" />
            <span>Computer Vision Automated Inspection Studio</span>
          </h1>
          <p className="text-xs text-industrial-400 mt-1 font-mono">
            Trained Dataset Classes • 5 Target Categories: Normal, Scratches, Rust, Hole, Crack
          </p>
        </div>
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1 bg-brand-blue/10 border border-brand-blue/30 text-brand-blue rounded-xl font-bold">
            5 Defect Classes Loaded
          </span>
        </div>
      </div>

      {/* Dataset Category Quick Selection Bar */}
      <div className="glass-card rounded-2xl p-4 border border-industrial-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-industrial-300 font-mono tracking-wider uppercase flex items-center space-x-2">
            <FolderCheck className="w-4 h-4 text-brand-blue" />
            <span>Uploaded Defect Category Folders Stream</span>
          </h2>
          <span className="text-[10px] text-industrial-400 font-mono">Select category to inspect</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {datasetCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => loadSampleCategory(cat.key)}
              className={`p-3 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center space-y-1 transition-all ${cat.color} hover:scale-[1.02] active:scale-95 shadow-sm`}
            >
              <Layers className="w-4 h-4 opacity-80" />
              <span>{cat.label}</span>
              <span className="text-[9px] opacity-70">folder: /{cat.key}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inspection Controls & Upload */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card rounded-2xl p-6 border border-industrial-800/80 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2 font-mono">
              <Upload className="w-4 h-4 text-brand-blue" />
              <span>Upload Custom Images from Dataset Folders</span>
            </h2>

            <form onSubmit={handleRunInspection} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-industrial-300 mb-1">Target Inspection Station</label>
                <select
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-blue font-mono"
                >
                  <option value="STATION_A (Pre-Feeder)">STATION_A (Pre-Feeder)</option>
                  <option value="STATION_B (Thermal Press)">STATION_B (Thermal Press)</option>
                  <option value="STATION_C (CNC Stamping)">STATION_C (CNC Stamping)</option>
                  <option value="STATION_D (Surface Treatment)">STATION_D (Surface Treatment)</option>
                  <option value="STATION_E (Final QA)">STATION_E (Final QA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-industrial-300 mb-1">Select File(s) (scratches / rust / normal / hole / crack)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="block w-full text-xs text-industrial-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-industrial-800 file:text-brand-blue hover:file:bg-industrial-700 cursor-pointer bg-industrial-950 border border-industrial-800 rounded-xl p-2 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={selectedFiles.length === 0 || inspecting}
                className="w-full py-3 bg-gradient-to-r from-brand-emerald to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-industrial-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 font-mono tracking-wider active:scale-95"
              >
                {inspecting ? 'Executing Multi-Class Inference...' : `RUN AI DEFECT INSPECTION (${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'})`}
              </button>
            </form>
          </div>

          {/* Inference Output Card */}
          {batchResult && (
            <div className="glass-card rounded-2xl p-6 border border-industrial-800/80 space-y-4 font-mono">
              <h2 className="text-sm font-semibold text-white flex items-center justify-between border-b border-industrial-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <Box className="w-4 h-4 text-brand-cyan" />
                  <span>AI Classification Output ({batchResult.processed_count} images)</span>
                </div>
                {batchResult.results.length > 0 && (
                  <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] rounded font-bold">
                    {batchResult.results[0].model_used}
                  </span>
                )}
              </h2>

              {/* Exact Totals: Processed, Accepted, Defective */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-industrial-950 rounded-xl border border-industrial-800 text-center">
                  <div className="text-[10px] text-industrial-400 font-bold uppercase">Total Processed</div>
                  <div className="text-lg font-black text-white mt-0.5">{batchResult.processed_count}</div>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-center">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">Total Accepted</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">{batchResult.acceptable_count}</div>
                </div>
                <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/30 text-center">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Total Defective</div>
                  <div className="text-lg font-black text-rose-400 mt-0.5">{batchResult.defective_count}</div>
                </div>
              </div>

              {/* Realistic Confidence Legend */}
              <div className="p-2.5 bg-industrial-950/80 rounded-xl border border-industrial-800/70 text-[10px] space-y-1.5">
                <span className="text-industrial-400 font-bold uppercase block text-[9px]">Class Confidence Baselines:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">Normal: 98%</span>
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded">Scratch: 49%</span>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">Rust: 51%</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">Hole: 32%</span>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded">Crack: 25%</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {batchResult.results.map((result, idx) => {
                  const isAccepted = result.prediction.toUpperCase().includes('ACCEPTABLE') || result.prediction.toUpperCase().includes('NORMAL');
                  return (
                    <div key={idx} className="p-3 bg-industrial-950 rounded-xl border border-industrial-800/80 space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b border-industrial-800/50">
                        <span className="text-industrial-300 font-semibold truncate max-w-[160px]">{result.image_name}</span>
                        <span className={`px-2 py-1 rounded-lg font-black tracking-wider text-[10px] ${
                          isAccepted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-emerald'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 glow-rose'
                        }`}>
                          {result.prediction}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-industrial-500">Realistic Confidence Score:</span>
                        <span className="text-white font-bold text-xs">{result.confidence_percentage}</span>
                      </div>

                      {result.is_novel && (
                        <div className="flex items-center space-x-1 text-amber-400 text-[10px] mt-1 p-2 bg-amber-500/10 rounded-lg">
                          <AlertCircle className="w-3 h-3" />
                          <span>Novel / Out-Of-Distribution</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Visual Inspection Image Canvas & Localization Viewer */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-2xl p-6 border border-industrial-800/80 h-full flex flex-col">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center justify-between font-mono">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-brand-emerald" />
                <span>Defect Bounding Box Localization View</span>
              </div>
            </h2>

            <div className="flex-1 bg-industrial-950/90 bg-canvas-grid border border-industrial-800/80 rounded-2xl relative flex items-center justify-center min-h-[380px] overflow-hidden p-4 shadow-inner group">
              {/* Target Crosshair Corner Reticles */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-brand-blue/60 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-brand-blue/60 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-2 border-b-2 border-l-2 border-brand-blue/60 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-2 border-b-2 border-r-2 border-brand-blue/60 pointer-events-none" />

              {/* Scanning Ray Line Effect */}
              {inspecting && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent animate-scanline z-10 opacity-75 shadow-glow" />
              )}

              {previewUrls.length > 0 ? (
                <div className="relative w-full h-full flex flex-wrap gap-4 justify-center overflow-y-auto max-h-[500px] p-2">
                  {previewUrls.map((url, idx) => {
                    const result = batchResult?.results[idx];
                    return (
                      <div key={idx} className="relative inline-block m-2">
                        <img
                          src={url}
                          alt={`Preview ${idx}`}
                          className="max-h-[220px] w-auto rounded-xl object-contain border border-industrial-800 shadow-xl"
                        />
                        {/* Bounding Box Overlays */}
                        {result?.bounding_boxes?.map((box, bIdx) => (
                          <div
                            key={bIdx}
                            style={{
                              position: 'absolute',
                              left: `${box.x}px`,
                              top: `${box.y}px`,
                              width: `${box.w}px`,
                              height: `${box.h}px`,
                            }}
                            className="border-2 border-rose-500 bg-rose-500/20 rounded-md pointer-events-none glow-rose animate-pulse-subtle"
                          >
                            <span className="absolute -top-6 left-0 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg tracking-wider whitespace-nowrap">
                              {box.label} ({Math.round(box.confidence * 100)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-industrial-500 space-y-3 p-8 font-mono text-xs">
                  <div className="p-4 bg-industrial-900/80 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center border border-industrial-800/80 glow-blue">
                    <Upload className="w-7 h-7 text-brand-blue" />
                  </div>
                  <p className="text-industrial-300 font-semibold text-sm">Select or drag multiple images from your folders.</p>
                  <p className="text-[11px] text-industrial-400">Supports PNG, JPG, JPEG, WEBP multi-class defect datasets.</p>
                </div>
              )}
            </div>
            
            {/* Batch Helper Note */}
            {batchResult && (
              <div className="mt-4 p-3 bg-industrial-900 border border-industrial-800 rounded-xl text-xs font-mono text-industrial-400 flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-industrial-500 shrink-0" />
                <span>Hover over individual images to see precise bounding boxes.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
