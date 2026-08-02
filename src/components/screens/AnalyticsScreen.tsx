import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import {
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Calendar,
  Download,
  Activity
} from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  const { exportAuditLogsCSV } = useCommandCenter();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#d4e4fa]">Analytics & Fleet Performance</h2>
          <p className="text-xs text-[#bcc9c6] mt-1">Aggregate response metrics and operational efficiency for the current period.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#122131] border border-[#3d4947] rounded-lg px-3 py-1.5 text-xs text-[#d4e4fa] font-medium">
            <Calendar className="w-4 h-4 text-[#6bd8cb] mr-2" />
            <span>Oct 01 - Oct 31, 2026</span>
          </div>

          <button
            onClick={exportAuditLogsCSV}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT SUMMARY REPORT</span>
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#122131] border border-[#3d4947] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase text-[#bcc9c6] tracking-wider">Avg Response Time</span>
            <Activity className="w-5 h-5 text-[#6bd8cb]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-mono text-[#6bd8cb] font-bold">04:12</div>
            <div className="flex items-center text-xs text-[#6bd8cb] mt-1 font-medium">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              <span>-12s improvement from last month</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#122131] border border-[#3d4947] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase text-[#bcc9c6] tracking-wider">Resolution Rate</span>
            <CheckCircle2 className="w-5 h-5 text-[#ffb3ad]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-mono text-[#d4e4fa] font-bold">98.4%</div>
            <div className="flex items-center text-xs text-[#ffb3ad] mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+0.2% improvement</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#122131] border border-[#3d4947] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase text-[#bcc9c6] tracking-wider">Total Incidents</span>
            <AlertTriangle className="w-5 h-5 text-[#ffb95f]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-mono text-[#d4e4fa] font-bold">1,842</div>
            <div className="text-xs text-[#bcc9c6] mt-1">Stabilized against forecast</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#122131] border border-[#3d4947] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase text-[#bcc9c6] tracking-wider">Fleet Health</span>
            <Heart className="w-5 h-5 text-[#6bd8cb]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-mono text-[#d4e4fa] font-bold">92%</div>
            <div className="text-xs text-[#bcc9c6] mt-1">4 drones requiring maintenance</div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-[#122131] border border-[#3d4947] p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#d4e4fa]">Response Time Trend & Operational Capacity</h3>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#6bd8cb]"><span className="w-2.5 h-2.5 rounded-full bg-[#6bd8cb]" /> Response Time</span>
              <span className="flex items-center gap-1.5 text-[#bcc9c6]"><span className="w-2.5 h-2.5 rounded-full bg-[#3d4947]" /> Fleet Capacity</span>
            </div>
          </div>

          <div className="h-64 relative w-full flex items-end">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6bd8cb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6bd8cb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="50" x2="800" y2="50" stroke="#3d4947" strokeDasharray="4" />
              <line x1="0" y1="100" x2="800" y2="100" stroke="#3d4947" strokeDasharray="4" />
              <line x1="0" y1="150" x2="800" y2="150" stroke="#3d4947" strokeDasharray="4" />

              <path d="M0,150 Q100,140 200,160 T400,100 T600,120 T800,80 L800,200 L0,200 Z" fill="url(#chartGrad)" />
              <path d="M0,150 Q100,140 200,160 T400,100 T600,120 T800,80" fill="none" stroke="#6bd8cb" strokeWidth="3" />
            </svg>
          </div>

          <div className="flex justify-between text-xs font-mono text-[#bcc9c6]">
            <span>OCT 01</span><span>OCT 07</span><span>OCT 14</span><span>OCT 21</span><span>OCT 28</span><span>OCT 31</span>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-[#122131] border border-[#3d4947] p-6 rounded-xl flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#d4e4fa]">Incident Resolution Ratio</h3>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-44 h-44 rounded-full border-[16px] border-[#273647] relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[16px] border-[#6bd8cb] border-b-transparent border-l-transparent rotate-45" />
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-[#d4e4fa]">92%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#bcc9c6]">Success</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-[#d4e4fa]"><span className="w-2 h-2 rounded-full bg-[#6bd8cb]" /> Resolved by Units</span>
              <span className="font-mono font-bold">1,695</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-[#d4e4fa]"><span className="w-2 h-2 rounded-full bg-[#ffb3ad]" /> Cancelled / False Alarm</span>
              <span className="font-mono font-bold">147</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 bg-[#122131] border border-[#3d4947] p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#d4e4fa]">24-Hour Drone Fleet Utilization Hourly Aggregate</h3>
            <span className="text-xs font-mono text-[#6bd8cb]">PEAK HOURS: 14:00 - 18:00</span>
          </div>

          <div className="grid grid-cols-24 gap-1 h-28 items-end">
            {[20, 15, 12, 10, 25, 40, 60, 85, 100, 95, 80, 70, 65, 50, 85, 90, 70, 50, 40, 30, 25, 20, 15, 10].map((val, idx) => (
              <div
                key={idx}
                className="bg-[#6bd8cb]/30 hover:bg-[#6bd8cb] rounded-t transition-colors cursor-pointer"
                style={{ height: `${val}%` }}
                title={`${idx}:00 - ${val}% utilization`}
              />
            ))}
          </div>

          <div className="flex justify-between text-[10px] font-mono text-[#bcc9c6]">
            <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>23:59</span>
          </div>
        </div>
      </div>
    </div>
  );
};
