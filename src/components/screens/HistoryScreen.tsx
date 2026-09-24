import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import {
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  BarChart3,
  History,
  Search,
  Calendar,
  UserCheck
} from 'lucide-react';

export const HistoryScreen: React.FC = () => {
  const { auditLogs, exportAuditLogsCSV, setActiveScreen } = useCommandCenter();

  const [expandedRowId, setExpandedRowId] = useState<string | null>('aud-wf-001');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  const filteredLogs = auditLogs.filter((log) => {
    if (filterStatus !== 'all' && log.finalStatus !== filterStatus) return false;
    if (
      searchQuery &&
      !log.incidentId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Sub-navigation tabs for Intelligence & History */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveScreen('analytics')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
          <span>Performance & Response Metrics</span>
        </button>
        <button
          onClick={() => setActiveScreen('history')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-teal-600 text-white shadow-xs"
        >
          <History className="w-3.5 h-3.5" />
          <span>Incident History & Audit Archive</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-700/60 text-white">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <History className="w-5 h-5" />
            </div>
            Incident History & Audit Log
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compliance-grade audit log for all resolved and cancelled wildfire response missions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
            {(['all', 'resolved', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={exportAuditLogsCSV}
            className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV LOG</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter History by Incident ID (INC-IND-) or Address..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="text-xs font-mono text-slate-500">
          Total Compliance Records: <strong className="text-teal-700 font-bold">{filteredLogs.length}</strong>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-bold uppercase">
            <tr>
              <th className="px-6 py-3.5">Incident ID</th>
              <th className="px-6 py-3.5">Date & Time</th>
              <th className="px-6 py-3.5">Address</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Assigned Unit</th>
              <th className="px-6 py-3.5">Response Time</th>
              <th className="px-6 py-3.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-xs">
                  No compliance records match your search criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedRowId === log.id;

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => toggleRow(log.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-teal-700">{log.incidentId}</td>
                      <td className="px-6 py-4 text-xs text-slate-800">
                        {log.date} <span className="text-slate-400 ml-1">{log.time}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700">{log.address}</td>
                      <td className="px-6 py-4">
                        {log.finalStatus === 'resolved' ? (
                          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800">{log.assignedDrone}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {log.responseTimeFormatted} <span className="text-slate-400 text-[10px]">min</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-teal-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50/80 border-y border-slate-200">
                        <td colSpan={7} className="p-6">
                          <div className="border-l-4 border-teal-600 pl-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-5 space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                                Mission Audit Trail
                              </h4>
                              <div className="space-y-3 border-l-2 border-slate-200 pl-4">
                                {log.timeline.map((step, idx) => (
                                  <div key={idx} className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
                                    <p className="text-xs text-slate-900 font-bold">{step.time} — {step.action}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{step.details}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="md:col-span-4 space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                                Post-Mission Operator Notes
                              </h4>
                              <p className="text-xs italic text-slate-700 bg-white p-3.5 border border-slate-200 rounded-lg shadow-xs leading-relaxed">
                                &quot;{log.postMissionNote || 'Mission concluded cleanly under standard SOP parameters.'}&quot;
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Authorized Operator: <span className="text-slate-900 font-bold">{log.operatorId}</span>
                              </p>
                            </div>

                            <div className="md:col-span-3 flex flex-col justify-end space-y-2">
                              <button
                                onClick={() => setShowPdfModal(true)}
                                className="w-full py-2.5 bg-white border border-slate-200 text-xs font-bold text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                              >
                                <Printer className="w-3.5 h-3.5 text-teal-600" />
                                <span>PRINT AUDIT SUMMARY</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PDF Modal */}
      {showPdfModal && (
        <div 
          onClick={() => setShowPdfModal(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-6 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full space-y-6"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-teal-50 text-teal-600">
                  <FileText className="w-5 h-5" />
                </div>
                Official Incident Compliance Summary
              </h3>
              <button 
                onClick={() => setShowPdfModal(false)} 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-700 font-mono">
              <p className="font-bold text-teal-800">ARANYAK INCIDENT COMPLIANCE REPORT — INC-IND-999-X</p>
              <p>DISPATCH TIMESTAMP: 2026-08-15 11:34:10 UTC</p>
              <p>RESPONSE UNITS: DRONE-GARUDA-01, Gir Command Station</p>
              <p>FINAL OUTCOME: WILDFIRE CONTAINED &amp; RESOLVED</p>
              <p className="text-emerald-700 font-bold">AUDIT VERIFICATION: 100% ARANYAK COMPLIANCE VERIFIED</p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                  setShowPdfModal(false);
                }}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                PRINT DOCUMENT NOW
              </button>
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-lg transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
