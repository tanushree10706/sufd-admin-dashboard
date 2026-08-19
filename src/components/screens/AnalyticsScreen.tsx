import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BarChart3, Flame, Activity, Clock, Plane, AlertTriangle, Shield } from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  const { incidents, drones, stations, forestZones, auditLogs } = useCommandCenter();

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
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#d4e4fa] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#6bd8cb]" /> Analytics & Wildfire Intelligence
          </h2>
          <p className="text-xs text-[#bcc9c6] mt-1">Operational performance metrics for the current reporting period.</p>
        </div>
        <div className="bg-[#122131] border border-[#3d4947] px-4 py-2 rounded-lg">
          <span className="text-[10px] font-bold text-[#bcc9c6] uppercase">Period</span>
          <p className="text-sm font-mono font-bold text-[#d4e4fa]">August 2026</p>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-[#0d1c2d] rounded-lg border border-[#3d4947]">
            <Flame className="w-6 h-6 text-[#ffb4ab]" />
          </div>
          <div>
            <p className="text-[10px] text-[#bcc9c6] uppercase font-bold">Active Wildfires</p>
            <p className="text-2xl font-mono font-bold text-[#d4e4fa]">{activeIncidents.length}</p>
          </div>
        </div>
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-[#0d1c2d] rounded-lg border border-[#3d4947]">
            <Plane className="w-6 h-6 text-[#6bd8cb]" />
          </div>
          <div>
            <p className="text-[10px] text-[#bcc9c6] uppercase font-bold">Drones Deployed</p>
            <p className="text-2xl font-mono font-bold text-[#d4e4fa]">{activeDrones}/{drones.length}</p>
          </div>
        </div>
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-[#0d1c2d] rounded-lg border border-[#3d4947]">
            <Shield className="w-6 h-6 text-[#6bd8cb]" />
          </div>
          <div>
            <p className="text-[10px] text-[#bcc9c6] uppercase font-bold">Avg Containment</p>
            <p className="text-2xl font-mono font-bold text-[#d4e4fa]">{avgContainment.toFixed(1)}%</p>
          </div>
        </div>
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-[#0d1c2d] rounded-lg border border-[#3d4947]">
            <Clock className="w-6 h-6 text-[#ffb95f]" />
          </div>
          <div>
            <p className="text-[10px] text-[#bcc9c6] uppercase font-bold">Avg Response Time</p>
            <p className="text-2xl font-mono font-bold text-[#d4e4fa]">{Math.floor(avgResponseTimeSec/60)}m {Math.floor(avgResponseTimeSec%60)}s</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-[#93000a]/20 rounded-lg border border-[#ffb4ab]/30">
            <AlertTriangle className="w-6 h-6 text-[#ffb4ab]" />
          </div>
          <div>
            <p className="text-[10px] text-[#bcc9c6] uppercase font-bold">High/Critical Incidents</p>
            <p className="text-2xl font-mono font-bold text-[#ffb4ab]">{criticalCount + activeIncidents.filter(i=>i.priority==='high').length}</p>
          </div>
        </div>
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 flex items-center gap-4">
          <div className={`p-3 rounded-lg border ${dueZones > 0 ? 'bg-[#ca8100]/20 border-[#ca8100]/30' : 'bg-[#29a195]/20 border-[#6bd8cb]/30'}`}>
            <Activity className={`w-6 h-6 ${dueZones > 0 ? 'text-[#ffb95f]' : 'text-[#6bd8cb]'}`} />
          </div>
          <div>
            <p className="text-[10px] text-[#bcc9c6] uppercase font-bold">Surveillance Due</p>
            <p className={`text-2xl font-mono font-bold ${dueZones > 0 ? 'text-[#ffb95f]' : 'text-[#6bd8cb]'}`}>{dueZones} zones</p>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-12 gap-6">
        {/* Line Chart */}
        <div className="col-span-12 lg:col-span-7 bg-[#122131] border border-[#3d4947] rounded-xl p-6">
          <h3 className="font-bold text-sm text-[#d4e4fa] mb-6">Daily Average Response Time (Minutes)</h3>
          <div className="h-48 w-full">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6bd8cb" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6bd8cb" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              {[0, 50, 100, 150].map(y => (
                <line key={y} x1="40" y1={y} x2="700" y2={y} stroke="#3d4947" strokeDasharray="4 4" />
              ))}
              {/* Y Axis labels */}
              {['10', '7.5', '5', '2.5'].map((lbl, i) => (
                <text key={i} x="30" y={i * 50 + 4} fill="#bcc9c6" fontSize="10" textAnchor="end" className="font-mono">{lbl}</text>
              ))}
              
              {/* Path and Fill */}
              {/* Data: [8.2, 6.4, 9.1, 7.8, 5.5, 6.8, 7.2] */}
              {/* Max value ~10 -> 0y, 0 value -> 200y */}
              <path d="M40 36 L150 72 L260 18 L370 44 L480 90 L590 64 L700 56 L700 200 L40 200 Z" fill="url(#lineFill)" />
              <path d="M40 36 L150 72 L260 18 L370 44 L480 90 L590 64 L700 56" fill="none" stroke="#6bd8cb" strokeWidth="3" />
              
              {/* Data points */}
              {[
                {x: 40, y: 36}, {x: 150, y: 72}, {x: 260, y: 18}, {x: 370, y: 44}, 
                {x: 480, y: 90}, {x: 590, y: 64}, {x: 700, y: 56}
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#122131" stroke="#6bd8cb" strokeWidth="2" />
              ))}

              {/* X Axis labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <text key={i} x={40 + i * 110} y="220" fill="#bcc9c6" fontSize="10" textAnchor="middle" className="uppercase font-bold">{day}</text>
              ))}
            </svg>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="col-span-12 lg:col-span-5 bg-[#122131] border border-[#3d4947] rounded-xl p-6 flex flex-col items-center">
          <h3 className="font-bold text-sm text-[#d4e4fa] mb-6 w-full text-left">Incident Breakdown by Status</h3>
          
          <div className="relative w-48 h-48 mb-6">
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: `conic-gradient(
                  #ffb4ab 0% 15%, 
                  #ffb95f 15% 35%, 
                  #6bd8cb 35% 65%, 
                  #29a195 65% 100%
                )`
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#122131] rounded-full flex items-center justify-center border border-[#3d4947]">
              <div className="text-center">
                <p className="text-3xl font-mono font-bold text-[#d4e4fa]">{activeIncidents.length + resolvedCount}</p>
                <p className="text-[10px] text-[#bcc9c6] uppercase font-bold">Total</p>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-[#0d1c2d] p-2 rounded">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#ffb4ab] rounded" /><span className="text-xs text-[#bcc9c6]">On Site</span></div>
              <span className="font-mono text-sm font-bold text-[#d4e4fa]">{onSiteCount}</span>
            </div>
            <div className="flex items-center justify-between bg-[#0d1c2d] p-2 rounded">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#ffb95f] rounded" /><span className="text-xs text-[#bcc9c6]">En Route</span></div>
              <span className="font-mono text-sm font-bold text-[#d4e4fa]">{enRouteCount}</span>
            </div>
            <div className="flex items-center justify-between bg-[#0d1c2d] p-2 rounded">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#6bd8cb] rounded" /><span className="text-xs text-[#bcc9c6]">Alert/Other</span></div>
              <span className="font-mono text-sm font-bold text-[#d4e4fa]">{alertCount}</span>
            </div>
            <div className="flex items-center justify-between bg-[#0d1c2d] p-2 rounded">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#29a195] rounded" /><span className="text-xs text-[#bcc9c6]">Resolved</span></div>
              <span className="font-mono text-sm font-bold text-[#d4e4fa]">{resolvedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TERRAIN BAR CHART */}
      <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-6">
        <h3 className="font-bold text-sm text-[#d4e4fa] mb-4">Active Incidents by Terrain Type</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 text-right text-xs text-[#bcc9c6] uppercase font-bold">Forest</div>
            <div className="flex-1 bg-[#0d1c2d] h-4 rounded-full overflow-hidden">
              <div className="h-full bg-[#29a195]" style={{ width: `${Math.max((forestCount / Math.max(activeIncidents.length, 1)) * 100, 2)}%` }} />
            </div>
            <div className="w-8 font-mono text-sm font-bold text-[#d4e4fa]">{forestCount}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 text-right text-xs text-[#bcc9c6] uppercase font-bold">Shrubland</div>
            <div className="flex-1 bg-[#0d1c2d] h-4 rounded-full overflow-hidden">
              <div className="h-full bg-[#ca8100]" style={{ width: `${Math.max((shrublandCount / Math.max(activeIncidents.length, 1)) * 100, 2)}%` }} />
            </div>
            <div className="w-8 font-mono text-sm font-bold text-[#d4e4fa]">{shrublandCount}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 text-right text-xs text-[#bcc9c6] uppercase font-bold">Grassland</div>
            <div className="flex-1 bg-[#0d1c2d] h-4 rounded-full overflow-hidden">
              <div className="h-full bg-[#6bd8cb]" style={{ width: `${Math.max((grasslandCount / Math.max(activeIncidents.length, 1)) * 100, 2)}%` }} />
            </div>
            <div className="w-8 font-mono text-sm font-bold text-[#d4e4fa]">{grasslandCount}</div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#0d1c2d] border border-[#3d4947] text-xs text-[#bcc9c6] flex items-start gap-2 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-[#6bd8cb] shrink-0" />
        <p><strong>NOTE:</strong> ML confidence metrics will be available here once the AI detection pipeline is active. Currently showing field-reported and citizen-report data only.</p>
      </div>
    </div>
  );
};
