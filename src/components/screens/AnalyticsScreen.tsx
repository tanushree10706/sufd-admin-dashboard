import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BarChart3, Flame, Activity, Clock, Plane, AlertTriangle, Shield, History } from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  const { incidents, drones, stations, forestZones, auditLogs, setActiveScreen } = useCommandCenter();

  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled');
  const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;
  const activeDrones = drones.filter(d => d.status === 'en_route' || d.status === 'on_site').length;
  
  const incidentsWithContainment = activeIncidents.filter(i => i.containmentPercent !== undefined);
  const avgContainment = incidentsWithContainment.length > 0 
    ? incidentsWithContainment.reduce((acc, i) => acc + (i.containmentPercent || 0), 0) / incidentsWithContainment.length 
    : 0;
    
  const avgResponseTimeSec = stations.length > 0 
    ? stations.reduce((acc, s) => acc + s.avgResponseTimeSec, 0) / stations.length 
    : 0;
  
  const dueZones = forestZones.filter(z => z.surveillanceStatus !== 'up_to_date').length;

  const resolvedCount = auditLogs.filter(a => a.finalStatus === 'resolved').length;
  const onSiteCount = activeIncidents.filter(i => i.status === 'on_site').length;
  const enRouteCount = activeIncidents.filter(i => i.status === 'en_route').length;
  const alertCount = activeIncidents.length - onSiteCount - enRouteCount;

  const forestCount = activeIncidents.filter(i => i.terrainType === 'forest').length;
  const shrublandCount = activeIncidents.filter(i => i.terrainType === 'shrubland').length;
  const grasslandCount = activeIncidents.filter(i => i.terrainType === 'grassland').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Sub-navigation tabs for Intelligence & History */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveScreen('analytics')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-teal-600 text-white shadow-xs"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Performance & Response Metrics</span>
        </button>
        <button
          onClick={() => setActiveScreen('history')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>Incident History & Audit Archive</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            Analytics & Wildfire Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Operational response efficiency, dispatch SLA compliance, and fleet utilization metrics.</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Reporting Period</span>
          <p className="text-sm font-mono font-bold text-slate-800">Q3 2026 Live</p>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Active Wildfires</p>
            <p className="text-2xl font-mono font-bold text-slate-900">{activeIncidents.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Drones Deployed</p>
            <p className="text-2xl font-mono font-bold text-slate-900">{activeDrones}/{drones.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Avg Containment</p>
            <p className="text-2xl font-mono font-bold text-slate-900">{avgContainment.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Avg Response Time</p>
            <p className="text-2xl font-mono font-bold text-amber-700">
              {Math.floor(avgResponseTimeSec/60)}m {Math.floor(avgResponseTimeSec%60)}s
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Critical & High Incidents</p>
            <p className="text-2xl font-mono font-bold text-rose-600">
              {criticalCount + activeIncidents.filter(i=>i.priority==='high').length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${dueZones > 0 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-teal-50 border-teal-100 text-teal-600'}`}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Patrol Surveillance Due</p>
            <p className={`text-2xl font-mono font-bold ${dueZones > 0 ? 'text-amber-700' : 'text-teal-700'}`}>{dueZones} zones</p>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-12 gap-6">
        {/* Line Chart */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 shadow-xs rounded-xl p-6">
          <h3 className="font-bold text-sm text-slate-900 mb-6">Daily Average Response Time (Minutes)</h3>
          <div className="h-48 w-full">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              {[0, 50, 100, 150].map(y => (
                <line key={y} x1="40" y1={y} x2="700" y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
              ))}
              {/* Y Axis labels */}
              {['10', '7.5', '5', '2.5'].map((lbl, i) => (
                <text key={i} x="30" y={i * 50 + 4} fill="#64748b" fontSize="10" textAnchor="end" className="font-mono">{lbl}</text>
              ))}
              
              {/* Path and Fill */}
              <path d="M40 36 L150 72 L260 18 L370 44 L480 90 L590 64 L700 56 L700 200 L40 200 Z" fill="url(#lineFill)" />
              <path d="M40 36 L150 72 L260 18 L370 44 L480 90 L590 64 L700 56" fill="none" stroke="#0d9488" strokeWidth="3" />
              
              {/* Data points */}
              {[
                {x: 40, y: 36}, {x: 150, y: 72}, {x: 260, y: 18}, {x: 370, y: 44}, 
                {x: 480, y: 90}, {x: 590, y: 64}, {x: 700, y: 56}
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
              ))}

              {/* X Axis labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <text key={i} x={40 + i * 110} y="220" fill="#64748b" fontSize="10" textAnchor="middle" className="uppercase font-bold">{day}</text>
              ))}
            </svg>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200 shadow-xs rounded-xl p-6 flex flex-col items-center">
          <h3 className="font-bold text-sm text-slate-900 mb-6 w-full text-left">Incident Breakdown by Status</h3>
          
          <div className="relative w-48 h-48 mb-6">
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: `conic-gradient(
                  #ef4444 0% 15%, 
                  #f59e0b 15% 35%, 
                  #0d9488 35% 65%, 
                  #0284c7 65% 100%
                )`
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-xs">
              <div className="text-center">
                <p className="text-3xl font-mono font-bold text-slate-900">{activeIncidents.length + resolvedCount}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full" /><span className="text-xs text-slate-600 font-medium">On Site</span></div>
              <span className="font-mono text-sm font-bold text-slate-800">{onSiteCount}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-amber-500 rounded-full" /><span className="text-xs text-slate-600 font-medium">En Route</span></div>
              <span className="font-mono text-sm font-bold text-slate-800">{enRouteCount}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-teal-600 rounded-full" /><span className="text-xs text-slate-600 font-medium">Alert Stage</span></div>
              <span className="font-mono text-sm font-bold text-slate-800">{alertCount}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-sky-600 rounded-full" /><span className="text-xs text-slate-600 font-medium">Resolved</span></div>
              <span className="font-mono text-sm font-bold text-slate-800">{resolvedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TERRAIN BAR CHART */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-6">
        <h3 className="font-bold text-sm text-slate-900 mb-4">Active Incidents by Terrain Type</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 text-right text-xs text-slate-500 uppercase font-bold">Forest</div>
            <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.max((forestCount / Math.max(activeIncidents.length, 1)) * 100, 2)}%` }} />
            </div>
            <div className="w-8 font-mono text-sm font-bold text-slate-800">{forestCount}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 text-right text-xs text-slate-500 uppercase font-bold">Shrubland</div>
            <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max((shrublandCount / Math.max(activeIncidents.length, 1)) * 100, 2)}%` }} />
            </div>
            <div className="w-8 font-mono text-sm font-bold text-slate-800">{shrublandCount}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 text-right text-xs text-slate-500 uppercase font-bold">Grassland</div>
            <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.max((grasslandCount / Math.max(activeIncidents.length, 1)) * 100, 2)}%` }} />
            </div>
            <div className="w-8 font-mono text-sm font-bold text-slate-800">{grasslandCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

