import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, AlertTriangle, UploadCloud, CheckCircle2, ServerOff,
  Loader2, Activity, Video, Image as ImageIcon, X, Zap,
  MapPin, Navigation, Gauge, ScanEye
} from 'lucide-react';
import { SurveillanceScreen } from './SurveillanceScreen';

const ML_BACKEND_URL = 'http://localhost:8000';
const WS_BACKEND_URL = 'ws://localhost:8000';

interface Telemetry {
  lat: number;
  lng: number;
  altitude_m: number;
  timestamp: string;
  drone_id: string;
}

interface DemoFiles { images: string[]; videos: string[]; }
interface PredictionResult {
  status: string;
  counts: Record<string, number>;
  prediction_text: string;
  latency_ms: number;
  latency_sec: number;
  image_base64: string;
  telemetry?: Telemetry;
}
interface VideoFrame {
  frame: number;
  total_frames: number;
  progress: number;
  counts: Record<string, number>;
  latency_ms: number;
  fps: number;
  image: string;
}

type InputMode = 'image' | 'video';

// ── Hazard identification helper ──────────────────────────────────────────────
const isHazardThreat = (cls: string) => [
  'fire', 'smoke', 'wildfire',
  'flood', 'water_zone',
  'collapsed_building', 'structural_hazard'
].includes(cls.toLowerCase());

// ── Detection count badges ────────────────────────────────────────────────────
const DetectionTags = ({ counts }: { counts: Record<string, number> }) => (
  <div className="flex flex-wrap gap-2">
    {Object.entries(counts).map(([cls, count]) => {
      const lower = cls.toLowerCase();
      let colorStyle = 'bg-slate-800 text-white border border-slate-700';
      if (['fire', 'smoke', 'wildfire'].includes(lower)) {
        colorStyle = 'bg-rose-600 text-white border border-rose-400';
      } else if (['flood', 'water_zone'].includes(lower)) {
        colorStyle = 'bg-sky-600 text-white border border-sky-400';
      } else if (['collapsed_building', 'structural_hazard'].includes(lower)) {
        colorStyle = 'bg-amber-600 text-white border border-amber-400';
      }
      return (
        <span key={cls} className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-md flex items-center gap-1 ${colorStyle}`}>
          {count} {cls.toUpperCase().replace('_', ' ')}
        </span>
      );
    })}
    {Object.keys(counts).length === 0 && (
      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800/90 text-slate-300 border border-slate-700">NO HAZARDS DETECTED</span>
    )}
  </div>
);

// ── Telemetry HUD overlay ─────────────────────────────────────────────────────
const TelemetryHUD = ({
  telemetry,
  latencyMs,
  counts,
  synced,
}: {
  telemetry: Telemetry;
  latencyMs: number;
  counts: Record<string, number>;
  synced: boolean;
}) => {
  const hasThreat = Object.keys(counts).some(isHazardThreat);

  return (
    <div className="absolute top-3 left-3 right-3 flex flex-col gap-2 pointer-events-none">
      {/* Top row: drone info */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: drone ID + coords */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-2 flex flex-col gap-1.5 shadow-lg">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-teal-400" />
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">{telemetry.drone_id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-200 font-mono">
              {telemetry.lat.toFixed(4)}° N, {telemetry.lng.toFixed(4)}° E
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-300 font-mono">Alt: {telemetry.altitude_m}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-teal-400" />
              <span className="text-[10px] text-teal-400 font-mono">{latencyMs}ms</span>
            </div>
          </div>
        </div>

        {/* Right: sync badge */}
        {synced && hasThreat && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold border shadow-lg bg-rose-900/90 border-rose-500/60 text-rose-200 shadow-rose-900/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-300" />
            🚨 Threat Logged to Dispatch Map
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const MLSurveillanceScreen: React.FC = () => {
  const [surveillanceTab, setSurveillanceTab] = useState<'live_ml' | 'zone_patrol'>('live_ml');

  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [demos, setDemos] = useState<DemoFiles>({ images: [], videos: [] });

  const [modelType, setModelType] = useState('Fire Detection');
  const [modelSize, setModelSize] = useState('m');
  const [confThreshold, setConfThreshold] = useState(0.40);
  const [inputMode, setInputMode] = useState<InputMode>('image');

  // Image inference state
  const [isInferring, setIsInferring] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [inferenceError, setInferenceError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  // Video streaming state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<VideoFrame | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoComplete, setVideoComplete] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Connection check ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const [mRes, dRes] = await Promise.all([
          fetch(`${ML_BACKEND_URL}/api/models`),
          fetch(`${ML_BACKEND_URL}/api/demos`),
        ]);
        if (mRes.ok && dRes.ok) {
          setIsConnected(true);
          setDemos(await dRes.json());
        } else setIsConnected(false);
      } catch { setIsConnected(false); }
      finally { setIsChecking(false); }
    };
    check();
  }, []);

  // ── Image inference ───────────────────────────────────────────────────────
  const handleImagePredict = async (source: File | string) => {
    setIsInferring(true);
    setInferenceError(null);
    setPrediction(null);
    setSynced(false);
    setShowToast(false);

    try {
      const fd = new FormData();
      fd.append('model_type', modelType);
      fd.append('model_size', modelSize);
      fd.append('conf_threshold', confThreshold.toString());
      fd.append('iou_threshold', '0.50');
      if (typeof source === 'string') {
        fd.append('image_url', `${ML_BACKEND_URL}${source}`);
      } else {
        fd.append('file', source);
      }

      const res = await fetch(`${ML_BACKEND_URL}/api/predict/image`, { method: 'POST', body: fd });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || 'Inference failed');
      }

      const data: PredictionResult = await res.json();
      setPrediction(data);

      const hasThreat = Object.keys(data.counts).some(isHazardThreat);
      if (hasThreat) {
        setSynced(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4500);
      }
    } catch (e: any) {
      setInferenceError(e.message || 'Unknown error');
    } finally {
      setIsInferring(false);
    }
  };

  // ── Video WebSocket stream ────────────────────────────────────────────────
  const startVideoStream = useCallback((file: File) => {
    if (wsRef.current) wsRef.current.close();
    setIsStreaming(true);
    setCurrentFrame(null);
    setVideoProgress(0);
    setVideoComplete(false);
    setVideoError(null);
    setShowToast(false);

    const ws = new WebSocket(`${WS_BACKEND_URL}/ws/predict/video`);
    wsRef.current = ws;
    let toastFired = false;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        model_type: modelType, model_size: modelSize,
        conf_threshold: confThreshold, iou_threshold: 0.50,
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.status === 'ready_for_video') {
        const reader = new FileReader();
        reader.onload = (e) => { if (e.target?.result) ws.send(e.target.result as ArrayBuffer); };
        reader.readAsArrayBuffer(file);
      } else if (msg.type === 'frame') {
        setCurrentFrame(msg as VideoFrame);
        setVideoProgress(msg.progress);
        if (!toastFired && Object.keys(msg.counts).some(isHazardThreat)) {
          toastFired = true;
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4500);
        }
      } else if (msg.type === 'completed') {
        setIsStreaming(false); setVideoComplete(true); setVideoProgress(100);
      } else if (msg.type === 'error') {
        setIsStreaming(false); setVideoError(msg.message);
      }
    };

    ws.onerror = () => { setIsStreaming(false); setVideoError('WebSocket connection failed.'); };
    ws.onclose = () => setIsStreaming(false);
  }, [modelType, modelSize, confThreshold]);

  const stopVideoStream = () => { wsRef.current?.close(); setIsStreaming(false); };

  useEffect(() => () => { wsRef.current?.close(); }, []);

  // ── Sub-navigation pills ──
  const renderSubTabs = () => (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 mb-2">
      <button
        onClick={() => setSurveillanceTab('live_ml')}
        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
          surveillanceTab === 'live_ml'
            ? 'bg-teal-600 text-white shadow-xs'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Camera className="w-3.5 h-3.5" />
        <span>Live Multi-Hazard AI Stream</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${surveillanceTab === 'live_ml' ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
          ACTIVE ML
        </span>
      </button>
      <button
        onClick={() => setSurveillanceTab('zone_patrol')}
        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
          surveillanceTab === 'zone_patrol'
            ? 'bg-teal-600 text-white shadow-xs'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
      >
        <ScanEye className="w-3.5 h-3.5" />
        <span>Forest Zone Patrol Logs</span>
      </button>
    </div>
  );

  if (surveillanceTab === 'zone_patrol') {
    return (
      <div className="space-y-6 pb-12">
        {renderSubTabs()}
        <SurveillanceScreen />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (isChecking) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
      <p className="text-slate-600 font-medium">Connecting to AI Inference Engine...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-5 pb-12">
      {renderSubTabs()}

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Camera className="w-5 h-5" />
            </div>
            AI Aerial Multi-Hazard Surveillance
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Real-time computer vision inference with simulated aerial drone telemetry.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className={`text-xs font-bold ${isConnected ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isConnected ? 'Inference Engine Online' : 'Engine Offline'}
          </span>
        </div>
      </div>


      {!isConnected ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 flex flex-col items-center text-center">
          <ServerOff className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-lg font-bold text-rose-800 mb-2">FastAPI Backend is Offline</h2>
          <p className="text-rose-700 max-w-md text-sm">
            Start the ML backend on <code className="text-xs bg-white px-2 py-0.5 rounded border border-rose-300 font-mono">http://localhost:8000</code> then refresh.
          </p>
        </div>
      ) : (
        <>
          {/* ── TOOLBAR ── */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex flex-wrap items-center gap-5">
            {/* Mode toggle */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1 gap-1">
              {(['image', 'video'] as InputMode[]).map(mode => (
                <button key={mode} onClick={() => setInputMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    inputMode === mode ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}>
                  {mode === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Model Type</label>
              <select value={modelType} onChange={e => {
                const nextType = e.target.value;
                setModelType(nextType);
                if (nextType === 'Human Detection') {
                  setModelSize('aranyak-human');
                } else if (nextType === 'Flood Detection') {
                  setModelSize('cascade');
                } else if (nextType === 'Collapsed Building') {
                  setModelSize('mobilenetv2');
                } else if (['aranyak-human', 'cascade', 'mobilenetv2'].includes(modelSize)) {
                  setModelSize('m');
                }
              }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-teal-600 focus:bg-white">
                <option value="Fire Detection">Fire & Smoke Detection (YOLO)</option>
                <option value="Human Detection">Human Aerial (SAR VisDrone)</option>
                <option value="Flood Detection">Flood Detection Cascade (MobileNetV2 + U-Net)</option>
                <option value="Collapsed Building">Collapsed Building / Damage (MobileNetV2)</option>
                <option value="General">General Objects (YOLOv8)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Model Architecture</label>
              <select value={modelSize} onChange={e => setModelSize(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-teal-600 focus:bg-white">
                {modelType === 'Human Detection' ? (
                  <option value="aranyak-human">Aranyak Human (YOLO11n VisDrone)</option>
                ) : modelType === 'Flood Detection' ? (
                  <option value="cascade">Two-Stage Cascade (MobileNetV2 + U-Net)</option>
                ) : modelType === 'Collapsed Building' ? (
                  <option value="mobilenetv2">MobileNetV2 Structural Damage Classifier</option>
                ) : (
                  <>
                    <option value="n">Nano (Fastest)</option>
                    <option value="s">Small</option>
                    <option value="m">Medium (Balanced)</option>
                    <option value="l">Large (High Accuracy)</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detection Confidence</label>
                <span className="text-[10px] text-teal-700 font-mono font-bold">{confThreshold.toFixed(2)}</span>
              </div>
              <input type="range" min="0.1" max="0.9" step="0.05" value={confThreshold}
                onChange={e => setConfThreshold(parseFloat(e.target.value))}
                className="w-full accent-teal-600 mt-1" />
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[440px]">

            {/* LEFT: Input panel */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex flex-col flex-1">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                  {inputMode === 'image' ? 'Image Input Source' : 'Video Stream Source'}
                </h3>

                {inputMode === 'image' ? (
                  <>
                    <div onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors mb-4 bg-slate-50/70 hover:bg-teal-50/20 group">
                      <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-teal-600 mb-2 transition-colors" />
                      <p className="text-sm text-slate-800 font-semibold">Upload Image</p>
                      <p className="text-xs text-slate-500 mt-0.5">JPEG · PNG · WebP</p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { if (e.target.files?.[0]) handleImagePredict(e.target.files[0]); }} />
                    </div>

                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quick-Select Aerial Demos</h4>
                    <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-72">
                      {demos.images.slice(0, 12).map((img, i) => (
                        <div key={i} onClick={() => handleImagePredict(img)}
                          className="relative group cursor-pointer aspect-video rounded-lg overflow-hidden border border-slate-200 hover:border-teal-500 transition-all shadow-xs">
                          <img src={`${ML_BACKEND_URL}${img}`} alt="Demo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] font-bold text-white bg-teal-600 rounded px-2 py-0.5 shadow-xs">RUN INFERENCE</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors mb-3 bg-slate-50/70 hover:bg-teal-50/20 group">
                      <Video className="w-7 h-7 text-slate-400 group-hover:text-teal-600 mb-2 transition-colors" />
                      <p className="text-sm text-slate-800 font-semibold">Upload Drone Video</p>
                      <p className="text-xs text-slate-500 mt-0.5">MP4 · MOV · AVI</p>
                      <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) {
                            const f = e.target.files[0];
                            setVideoFile(f); setVideoFileName(f.name);
                            setCurrentFrame(null); setVideoComplete(false); setVideoProgress(0); setVideoError(null);
                          }
                        }} />
                    </div>

                    {videoFileName && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Video className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="text-xs text-slate-800 font-medium truncate">{videoFileName}</span>
                        </div>
                        <button onClick={() => { setVideoFile(null); setVideoFileName(null); setCurrentFrame(null); setVideoProgress(0); setVideoComplete(false); }}
                          className="text-slate-400 hover:text-rose-600 shrink-0"><X className="w-4 h-4" /></button>
                      </div>
                    )}

                    {demos.videos.length > 0 && (
                      <>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Preset Video Feeds</h4>
                        <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar flex-1 mb-3 max-h-56">
                          {demos.videos.map((vid, i) => (
                            <div key={i} onClick={async () => {
                              const name = vid.split('/').pop() || 'demo.mp4';
                              setVideoFileName(name);
                              const blob = await fetch(`${ML_BACKEND_URL}${vid}`).then(r => r.blob()).catch(() => null);
                              if (!blob) { setVideoError('Could not load demo video.'); return; }
                              const file = new File([blob], name, { type: 'video/mp4' });
                              setVideoFile(file); setCurrentFrame(null); setVideoComplete(false); setVideoProgress(0); setVideoError(null);
                            }}
                              className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:border-teal-500 cursor-pointer bg-slate-50 hover:bg-teal-50/30 transition-colors">
                              <Video className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span className="text-xs text-slate-700 font-medium truncate">{vid.split('/').pop()}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {videoFile && (
                      !isStreaming ? (
                        <button onClick={() => startVideoStream(videoFile)}
                          className="w-full py-2.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs transition-colors flex items-center justify-center gap-2 mt-auto">
                          <Zap className="w-4 h-4" /> Start Live Inference
                        </button>
                      ) : (
                        <button onClick={stopVideoStream}
                          className="w-full py-2.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs transition-colors flex items-center justify-center gap-2 mt-auto">
                          <X className="w-4 h-4" /> Stop Stream
                        </button>
                      )
                    )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Output viewport */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex flex-col flex-1">
                {/* Output header bar */}
                <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Video / HUD Viewport</h3>
                  <div className="flex items-center gap-2">
                    {inputMode === 'image' && prediction?.telemetry && (
                      <>
                        <span className="flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-teal-700 font-semibold">
                          <Activity className="w-2.5 h-2.5" /> {prediction.latency_ms}ms
                        </span>
                        <span className="text-[10px] font-mono text-slate-600 font-bold">{prediction.telemetry.drone_id}</span>
                      </>
                    )}
                    {inputMode === 'video' && currentFrame && (
                      <>
                        <span className="flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-teal-700 font-semibold">
                          <Activity className="w-2.5 h-2.5" /> {currentFrame.latency_ms}ms
                        </span>
                        <span className="flex items-center gap-1 text-[10px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono text-amber-700 font-bold">
                          <Zap className="w-2.5 h-2.5" /> {currentFrame.fps} FPS
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{currentFrame.frame}/{currentFrame.total_frames}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Video progress bar */}
                {inputMode === 'video' && (isStreaming || videoComplete) && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>{videoComplete ? '✓ Stream Analysis Completed' : 'Streaming frames to YOLO worker...'}</span>
                      <span className="font-mono font-bold text-teal-700">{videoProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className={`h-full rounded-full transition-all duration-150 ${videoComplete ? 'bg-emerald-500' : 'bg-teal-600'}`}
                        style={{ width: `${videoProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Main canvas */}
                <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden min-h-[340px] shadow-inner">

                  {/* IMAGE MODE */}
                  {inputMode === 'image' && (
                    isInferring ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-3" />
                        <p className="text-teal-400 font-medium text-sm animate-pulse">Running Neural Inference...</p>
                        <p className="text-slate-400 text-xs mt-1">Calculating bounding boxes & hazard coordinates...</p>
                      </div>
                    ) : inferenceError ? (
                      <div className="flex flex-col items-center text-center p-6">
                        <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
                        <p className="text-rose-400 text-sm">{inferenceError}</p>
                      </div>
                    ) : prediction ? (
                      <>
                        <img src={prediction.image_base64} alt="Inference Output" className="w-full h-full object-contain" />
                        {/* Telemetry HUD */}
                        {prediction.telemetry && (
                          <TelemetryHUD
                            telemetry={prediction.telemetry}
                            latencyMs={prediction.latency_ms}
                            counts={prediction.counts}
                            synced={synced}
                          />
                        )}
                        {/* Bottom detection tags */}
                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                          <DetectionTags counts={prediction.counts} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-slate-500 gap-2 opacity-70">
                        <ImageIcon className="w-10 h-10 text-slate-600" />
                        <p className="text-sm">Upload an image or pick a demo from the left panel</p>
                      </div>
                    )
                  )}

                  {/* VIDEO MODE */}
                  {inputMode === 'video' && (
                    videoError ? (
                      <div className="flex flex-col items-center text-center p-6">
                        <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
                        <p className="text-rose-400 text-sm">{videoError}</p>
                      </div>
                    ) : currentFrame ? (
                      <>
                        <img src={currentFrame.image} alt={`Frame ${currentFrame.frame}`} className="w-full h-full object-contain" />
                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                          <DetectionTags counts={currentFrame.counts} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-slate-500 gap-2 opacity-70">
                        <Video className="w-10 h-10 text-slate-600" />
                        <p className="text-sm">{videoFile ? 'Click "Start Live Inference" to stream' : 'Select or upload a drone video stream'}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TOAST ── */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-once">
          <div className="bg-white border-2 border-rose-300 shadow-2xl rounded-xl p-4 flex items-start gap-3 max-w-sm">
            <div className="bg-rose-100 p-1.5 rounded-full mt-0.5 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 className="text-rose-800 font-bold text-sm">🚨 Hazard Threat Confirmed</h4>
              <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">
                Positive visual detection pinned to Live Incident Map. Incident logged to dispatch queue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

