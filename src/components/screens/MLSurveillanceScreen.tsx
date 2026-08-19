import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, AlertTriangle, UploadCloud, CheckCircle2, ServerOff,
  Loader2, Activity, Video, Image as ImageIcon, X, Zap,
  MapPin, Navigation, Gauge
} from 'lucide-react';

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

// ── Detection count badges ────────────────────────────────────────────────────
const DetectionTags = ({ counts }: { counts: Record<string, number> }) => (
  <div className="flex flex-wrap gap-2">
    {Object.entries(counts).map(([cls, count]) => (
      <span key={cls} className={`px-2.5 py-1 rounded text-xs font-bold shadow-lg flex items-center gap-1 ${
        ['fire','smoke','wildfire'].includes(cls.toLowerCase())
          ? 'bg-[#93000a] text-[#ffb4ab] border border-[#ffb4ab]/50'
          : 'bg-[#1c2b3c] text-[#d4e4fa] border border-[#3d4947]'
      }`}>{count} {cls.toUpperCase()}</span>
    ))}
    {Object.keys(counts).length === 0 && (
      <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#1c2b3c] text-[#bcc9c6] border border-[#3d4947]">NO DETECTIONS</span>
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
  const hasThreat = Object.keys(counts).some(k => ['fire','smoke','wildfire'].includes(k.toLowerCase()));

  return (
    <div className="absolute top-3 left-3 right-3 flex flex-col gap-2 pointer-events-none">
      {/* Top row: drone info */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: drone ID + coords */}
        <div className="bg-[#051424]/90 backdrop-blur border border-[#3d4947] rounded-lg px-3 py-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-[#6bd8cb]" />
            <span className="text-[10px] font-bold text-[#6bd8cb] uppercase tracking-widest">{telemetry.drone_id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#bcc9c6]" />
            <span className="text-[10px] text-[#d4e4fa] font-mono">
              {telemetry.lat.toFixed(4)}° N, {telemetry.lng.toFixed(4)}° E
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-[#bcc9c6]" />
              <span className="text-[10px] text-[#bcc9c6] font-mono">Alt: {telemetry.altitude_m}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#6bd8cb]" />
              <span className="text-[10px] text-[#6bd8cb] font-mono">{latencyMs}ms</span>
            </div>
          </div>
        </div>

        {/* Right: sync badge */}
        {synced && hasThreat && (
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold border shadow-lg ${
            hasThreat
              ? 'bg-[#93000a]/90 border-[#ffb4ab]/60 text-[#ffb4ab] shadow-[0_0_12px_rgba(255,180,171,0.3)]'
              : 'bg-[#051424]/90 border-[#3d4947] text-[#6bd8cb]'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            🚨 Pinned to Live Map via Supabase
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const MLSurveillanceScreen: React.FC = () => {
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

      const hasThreat = Object.keys(data.counts).some(k =>
        ['fire','smoke','wildfire'].includes(k.toLowerCase())
      );
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
        if (!toastFired && Object.keys(msg.counts).some((k: string) => ['fire','smoke','wildfire'].includes(k.toLowerCase()))) {
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

  // ── Render ────────────────────────────────────────────────────────────────
  if (isChecking) return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="w-8 h-8 text-[#6bd8cb] animate-spin mb-4" />
      <p className="text-[#bcc9c6]">Connecting to ML Backend...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-5 max-w-7xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#d4e4fa] flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#6bd8cb]" />
            AI Aerial Surveillance Feed
          </h1>
          <p className="text-[#bcc9c6] text-sm mt-1">Live YOLO inference with simulated drone telemetry.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isConnected ? 'bg-[#6bd8cb] shadow-[0_0_8px_#6bd8cb]' : 'bg-[#ffb4ab] shadow-[0_0_8px_#ffb4ab]'}`} />
          <span className={`text-sm font-medium ${isConnected ? 'text-[#6bd8cb]' : 'text-[#ffb4ab]'}`}>
            {isConnected ? 'Backend Connected' : 'Backend Offline'}
          </span>
        </div>
      </div>

      {!isConnected ? (
        <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-xl p-8 flex flex-col items-center text-center">
          <ServerOff className="w-12 h-12 text-[#ffb4ab] mb-4" />
          <h2 className="text-lg font-bold text-[#ffb4ab] mb-2">FastAPI Backend is Offline</h2>
          <p className="text-[#ffb4ab]/80 max-w-md">
            Start the ML backend on <code className="text-xs bg-[#1c2b3c] px-1 py-0.5 rounded">http://localhost:8000</code> then refresh.
          </p>
        </div>
      ) : (
        <>
          {/* ── TOOLBAR ── */}
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-4 flex flex-wrap items-center gap-5">
            {/* Mode toggle */}
            <div className="flex bg-[#051424] border border-[#3d4947] rounded-lg p-1 gap-1">
              {(['image', 'video'] as InputMode[]).map(mode => (
                <button key={mode} onClick={() => setInputMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    inputMode === mode ? 'bg-[#6bd8cb] text-[#051424]' : 'text-[#bcc9c6] hover:text-[#d4e4fa]'
                  }`}>
                  {mode === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#bcc9c6] uppercase tracking-wider">Model Type</label>
              <select value={modelType} onChange={e => setModelType(e.target.value)}
                className="bg-[#051424] border border-[#3d4947] rounded-md px-3 py-1.5 text-sm text-[#d4e4fa] focus:outline-none focus:border-[#6bd8cb]">
                <option value="Fire Detection">Fire Detection</option>
                <option value="General">General Objects</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#bcc9c6] uppercase tracking-wider">Model Size</label>
              <select value={modelSize} onChange={e => setModelSize(e.target.value)}
                className="bg-[#051424] border border-[#3d4947] rounded-md px-3 py-1.5 text-sm text-[#d4e4fa] focus:outline-none focus:border-[#6bd8cb]">
                <option value="n">Nano (Fastest)</option>
                <option value="s">Small</option>
                <option value="m">Medium (Balanced)</option>
                <option value="l">Large (High Accuracy)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <div className="flex justify-between">
                <label className="text-[10px] font-semibold text-[#bcc9c6] uppercase tracking-wider">Confidence</label>
                <span className="text-[10px] text-[#6bd8cb] font-mono">{confThreshold.toFixed(2)}</span>
              </div>
              <input type="range" min="0.1" max="0.9" step="0.05" value={confThreshold}
                onChange={e => setConfThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#6bd8cb] mt-1" />
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[440px]">

            {/* LEFT: Input panel */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-4 flex flex-col flex-1">
                <h3 className="text-[10px] font-semibold text-[#bcc9c6] uppercase tracking-wider mb-3 border-b border-[#3d4947] pb-2">
                  {inputMode === 'image' ? 'Image Input' : 'Video Input'}
                </h3>

                {inputMode === 'image' ? (
                  <>
                    <div onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#3d4947] hover:border-[#6bd8cb] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors mb-4 bg-[#051424]/50 group">
                      <UploadCloud className="w-7 h-7 text-[#bcc9c6] group-hover:text-[#6bd8cb] mb-2 transition-colors" />
                      <p className="text-sm text-[#d4e4fa] font-medium">Upload Image</p>
                      <p className="text-xs text-[#bcc9c6] mt-0.5">JPEG · PNG</p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { if (e.target.files?.[0]) handleImagePredict(e.target.files[0]); }} />
                    </div>

                    <h4 className="text-[10px] font-semibold text-[#bcc9c6] uppercase tracking-wider mb-2">Quick-Select Demo</h4>
                    <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                      {demos.images.slice(0, 12).map((img, i) => (
                        <div key={i} onClick={() => handleImagePredict(img)}
                          className="relative group cursor-pointer aspect-video rounded-md overflow-hidden border border-[#3d4947] hover:border-[#6bd8cb] transition-colors">
                          <img src={`${ML_BACKEND_URL}${img}`} alt="Demo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          <div className="absolute inset-0 bg-[#051424]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] font-bold text-[#6bd8cb] border border-[#6bd8cb] rounded px-2 py-0.5">INFER</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-[#3d4947] hover:border-[#6bd8cb] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors mb-3 bg-[#051424]/50 group">
                      <Video className="w-7 h-7 text-[#bcc9c6] group-hover:text-[#6bd8cb] mb-2 transition-colors" />
                      <p className="text-sm text-[#d4e4fa] font-medium">Upload Video</p>
                      <p className="text-xs text-[#bcc9c6] mt-0.5">MP4 · MOV · AVI</p>
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
                      <div className="bg-[#051424] border border-[#3d4947] rounded-lg p-2.5 mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Video className="w-3.5 h-3.5 text-[#6bd8cb] flex-shrink-0" />
                          <span className="text-xs text-[#d4e4fa] truncate">{videoFileName}</span>
                        </div>
                        <button onClick={() => { setVideoFile(null); setVideoFileName(null); setCurrentFrame(null); setVideoProgress(0); setVideoComplete(false); }}
                          className="text-[#bcc9c6] hover:text-[#ffb4ab] flex-shrink-0"><X className="w-4 h-4" /></button>
                      </div>
                    )}

                    {demos.videos.length > 0 && (
                      <>
                        <h4 className="text-[10px] font-semibold text-[#bcc9c6] uppercase tracking-wider mb-2">Demo Videos</h4>
                        <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar flex-1 mb-3">
                          {demos.videos.map((vid, i) => (
                            <div key={i} onClick={async () => {
                              const name = vid.split('/').pop() || 'demo.mp4';
                              setVideoFileName(name);
                              const blob = await fetch(`${ML_BACKEND_URL}${vid}`).then(r => r.blob()).catch(() => null);
                              if (!blob) { setVideoError('Could not load demo video.'); return; }
                              const file = new File([blob], name, { type: 'video/mp4' });
                              setVideoFile(file); setCurrentFrame(null); setVideoComplete(false); setVideoProgress(0); setVideoError(null);
                            }}
                              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#3d4947] hover:border-[#6bd8cb] cursor-pointer bg-[#051424]/50 transition-colors">
                              <Video className="w-3.5 h-3.5 text-[#6bd8cb] flex-shrink-0" />
                              <span className="text-xs text-[#d4e4fa] truncate">{vid.split('/').pop()}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {videoFile && (
                      !isStreaming ? (
                        <button onClick={() => startVideoStream(videoFile)}
                          className="w-full py-2.5 rounded-lg bg-[#6bd8cb] text-[#051424] text-sm font-bold hover:bg-[#5bc4b8] transition-colors flex items-center justify-center gap-2 mt-auto">
                          <Zap className="w-4 h-4" /> Start Inference
                        </button>
                      ) : (
                        <button onClick={stopVideoStream}
                          className="w-full py-2.5 rounded-lg bg-[#93000a]/80 text-[#ffb4ab] border border-[#ffb4ab]/30 text-sm font-bold hover:bg-[#93000a] transition-colors flex items-center justify-center gap-2 mt-auto">
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
              <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-4 flex flex-col flex-1">
                {/* Output header bar */}
                <div className="flex justify-between items-center mb-3 border-b border-[#3d4947] pb-2">
                  <h3 className="text-[10px] font-semibold text-[#bcc9c6] uppercase tracking-wider">Output Viewport</h3>
                  <div className="flex items-center gap-2">
                    {inputMode === 'image' && prediction?.telemetry && (
                      <>
                        <span className="flex items-center gap-1 text-[10px] bg-[#051424] border border-[#3d4947] px-2 py-1 rounded font-mono text-[#6bd8cb]">
                          <Activity className="w-2.5 h-2.5" /> {prediction.latency_ms}ms
                        </span>
                        <span className="text-[10px] text-[#bcc9c6]">{prediction.telemetry.drone_id}</span>
                      </>
                    )}
                    {inputMode === 'video' && currentFrame && (
                      <>
                        <span className="flex items-center gap-1 text-[10px] bg-[#051424] border border-[#3d4947] px-2 py-1 rounded font-mono text-[#6bd8cb]">
                          <Activity className="w-2.5 h-2.5" /> {currentFrame.latency_ms}ms
                        </span>
                        <span className="flex items-center gap-1 text-[10px] bg-[#051424] border border-[#3d4947] px-2 py-1 rounded font-mono text-[#ffb95f]">
                          <Zap className="w-2.5 h-2.5" /> {currentFrame.fps} FPS
                        </span>
                        <span className="text-[10px] text-[#bcc9c6]">{currentFrame.frame}/{currentFrame.total_frames}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Video progress bar */}
                {inputMode === 'video' && (isStreaming || videoComplete) && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-[#bcc9c6] mb-1">
                      <span>{videoComplete ? '✓ Completed' : 'Streaming frames...'}</span>
                      <span className="font-mono">{videoProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-[#051424] rounded-full overflow-hidden border border-[#3d4947]/50">
                      <div className={`h-full rounded-full transition-all duration-150 ${videoComplete ? 'bg-[#6bd8cb]' : 'bg-[#ffb95f]'}`}
                        style={{ width: `${videoProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Main canvas */}
                <div className="flex-1 bg-[#051424] rounded-lg border border-[#3d4947] relative flex items-center justify-center overflow-hidden min-h-[320px]">

                  {/* IMAGE MODE */}
                  {inputMode === 'image' && (
                    isInferring ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-[#6bd8cb] animate-spin mb-3" />
                        <p className="text-[#6bd8cb] font-medium text-sm animate-pulse">Running YOLO Inference...</p>
                        <p className="text-[#bcc9c6] text-xs mt-1">Generating telemetry...</p>
                      </div>
                    ) : inferenceError ? (
                      <div className="flex flex-col items-center text-center p-6">
                        <AlertTriangle className="w-10 h-10 text-[#ffb4ab] mb-3" />
                        <p className="text-[#ffb4ab] text-sm">{inferenceError}</p>
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
                      <div className="flex flex-col items-center text-[#bcc9c6] gap-2 opacity-50">
                        <ImageIcon className="w-10 h-10" />
                        <p className="text-sm">Upload or select a demo image</p>
                      </div>
                    )
                  )}

                  {/* VIDEO MODE */}
                  {inputMode === 'video' && (
                    videoError ? (
                      <div className="flex flex-col items-center text-center p-6">
                        <AlertTriangle className="w-10 h-10 text-[#ffb4ab] mb-3" />
                        <p className="text-[#ffb4ab] text-sm">{videoError}</p>
                      </div>
                    ) : currentFrame ? (
                      <>
                        <img src={currentFrame.image} alt={`Frame ${currentFrame.frame}`} className="w-full h-full object-contain" />
                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                          <DetectionTags counts={currentFrame.counts} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-[#bcc9c6] gap-2 opacity-50">
                        <Video className="w-10 h-10" />
                        <p className="text-sm">{videoFile ? 'Click "Start Inference" to stream' : 'Select or upload a video'}</p>
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
          <div className="bg-[#122131] border border-[#ffb4ab] shadow-[0_0_24px_rgba(255,180,171,0.3)] rounded-xl p-4 flex items-start gap-3 max-w-sm">
            <div className="bg-[#93000a]/60 p-1.5 rounded-full mt-0.5 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#ffb4ab]" />
            </div>
            <div>
              <h4 className="text-[#ffb4ab] font-bold text-sm">🚨 Threat Detected</h4>
              <p className="text-[#d4e4fa] text-xs mt-1 leading-relaxed">
                Positive detection synced to Live Incident Map.<br />
                <span className="text-[#bcc9c6]">Incident logged via Supabase bridge.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
