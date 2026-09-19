import React, { useState, useEffect } from 'react';
import { Cpu, Upload, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { modelsApi } from '../api/models';
import { ModelEntry } from '../types';
import { useAuth } from '../context/AuthContext';

export const ModelManagementPage: React.FC = () => {
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [framework, setFramework] = useState('yolo');
  const [modelType, setModelType] = useState('detection');
  const [classesJson, setClassesJson] = useState('["ACCEPTABLE", "SURFACE_SCRATCH", "DIMENSIONAL_DEFECT", "POROSITY"]');
  const [inputDimensions, setInputDimensions] = useState('640x640');

  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const fetchModels = async () => {
    setLoading(true);
    try {
      const list = await modelsApi.list();
      setModels(list);
    } catch (err) {
      console.error("Error fetching models:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleUploadModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !name) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', name);
    formData.append('version', version);
    formData.append('framework', framework);
    formData.append('model_type', modelType);
    formData.append('classes_json', classesJson);
    formData.append('input_dimensions', inputDimensions);

    try {
      await modelsApi.upload(formData);
      await fetchModels();
      setSelectedFile(null);
      setName('');
    } catch (err) {
      console.error("Model upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await modelsApi.activate(id);
      await fetchModels();
    } catch (err) {
      console.error("Model activation error:", err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-industrial-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-brand-blue" />
          <span>Modular Computer Vision Model Management & Adapter Registry</span>
        </h1>
        <p className="text-xs text-industrial-400 mt-1 font-mono">
          Upload trained computer vision models (PyTorch, TensorFlow, YOLO, ONNX), configure adapter interfaces, and activate inference weights.
        </p>
      </div>

      {/* Model Upload Form (Admin Only) */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Upload className="w-4 h-4 text-brand-cyan" />
          <span>Upload Trained AI/ML Model Weights</span>
        </h2>

        {!isAdmin && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-mono flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Note: Role 'ADMIN' is required to upload or activate new model weights.</span>
          </div>
        )}

        <form onSubmit={handleUploadModel} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="block text-industrial-300 mb-1">Model Name</label>
            <input
              type="text"
              required
              placeholder="e.g. YOLOv8 Defect Inspector"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-white focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-industrial-300 mb-1">Framework</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-white focus:outline-none focus:border-brand-blue"
            >
              <option value="yolo">YOLO (v5/v8/v9/v11)</option>
              <option value="pytorch">PyTorch (.pt / .pth)</option>
              <option value="tensorflow">TensorFlow / Keras (.h5 / .pb)</option>
              <option value="onnx">ONNX (.onnx)</option>
              <option value="sklearn">Scikit-Learn (.joblib / .pkl)</option>
            </select>
          </div>

          <div>
            <label className="block text-industrial-300 mb-1">Model Adapter Type</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-white focus:outline-none focus:border-brand-blue"
            >
              <option value="detection">DetectionAdapter (Bounding Boxes)</option>
              <option value="classification">ClassificationAdapter (Defect Classes)</option>
              <option value="segmentation">SegmentationAdapter (Mask Contours)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-industrial-300 mb-1">Defect Classes JSON Array</label>
            <input
              type="text"
              value={classesJson}
              onChange={(e) => setClassesJson(e.target.value)}
              className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-white focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-industrial-300 mb-1">Input Dimensions</label>
            <input
              type="text"
              value={inputDimensions}
              onChange={(e) => setInputDimensions(e.target.value)}
              className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-white focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-4 pt-2">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-xs text-industrial-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-industrial-800 file:text-brand-blue hover:file:bg-industrial-700 cursor-pointer bg-industrial-950 border border-industrial-800 rounded-lg p-1.5"
            />
            <button
              type="submit"
              disabled={!selectedFile || !name || uploading || !isAdmin}
              className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-industrial-950 font-bold text-xs rounded-lg transition-all shrink-0 font-mono shadow"
            >
              {uploading ? 'Registering Model...' : 'Upload & Register Model'}
            </button>
          </div>
        </form>
      </div>

      {/* Model Registry List Table */}
      <div className="glass-card rounded-xl p-6 border border-industrial-800 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-brand-emerald" />
          <span>Registered Computer Vision Models</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-industrial-950 text-industrial-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Model Name</th>
                <th className="p-3">Version</th>
                <th className="p-3">Framework</th>
                <th className="p-3">Adapter Type</th>
                <th className="p-3">Classes</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60 font-mono">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-industrial-800/40">
                  <td className="p-3 text-white font-semibold flex items-center space-x-2">
                    <span>{m.name}</span>
                    {m.is_demo && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">DEMO</span>
                    )}
                  </td>
                  <td className="p-3 text-industrial-300">v{m.version}</td>
                  <td className="p-3 text-brand-cyan uppercase">{m.framework}</td>
                  <td className="p-3 text-industrial-200 capitalize">{m.model_type}</td>
                  <td className="p-3 text-industrial-400 text-[11px] font-sans">
                    {m.classes ? m.classes.join(', ') : 'N/A'}
                  </td>
                  <td className="p-3">
                    {m.is_active ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold text-[10px]">
                        ACTIVE INFERENCE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-industrial-800 text-industrial-400 rounded text-[10px]">
                        INACTIVE
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {!m.is_active && (
                      <button
                        onClick={() => handleActivate(m.id)}
                        disabled={!isAdmin}
                        className="px-3 py-1 bg-brand-blue/15 hover:bg-brand-blue/25 text-brand-blue border border-brand-blue/30 rounded text-[10px] font-bold"
                      >
                        Activate Weights
                      </button>
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
