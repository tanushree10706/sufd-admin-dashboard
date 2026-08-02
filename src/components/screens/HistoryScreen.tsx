import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import {
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  FileText,
  Printer
} from 'lucide-react';

export const HistoryScreen: React.FC = () => {
  const { auditLogs, exportAuditLogsCSV } = useCommandCenter();

  const [expandedRowId, setExpandedRowId] = useState<string | null>('aud-8829');
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
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#d4e4fa] tracking-tight">Incident History & Audit Log</h2>
          <p className="text-xs text-[#bcc9c6] mt-1">Compliance-grade audit log for all resolved and cancelled aerial response missions.</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#122131] border border-[#3d4947] rounded-lg p-1">
            {(['all', 'resolved', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  filterStatus === st
                    ? 'bg-[#29a195] text-white'
                    : 'text-[#bcc9c6] hover:text-[#d4e4fa]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={exportAuditLogsCSV}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV LOG</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-[#122131] border border-[#3d4947] p-4 rounded-xl flex items-center justify-between">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter History by Incident ID (#SF-8829) or Address..."
          className="w-96 bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-4 py-2 text-xs text-[#d4e4fa] focus:border-[#6bd8cb]"
        />

        <div className="text-xs font-mono text-[#bcc9c6]">
          Total Compliance Records: <strong className="text-[#6bd8cb]">{filteredLogs.length}</strong>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0d1c2d] border border-[#3d4947] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#122131] text-[#bcc9c6] border-b border-[#3d4947] text-[11px] font-bold uppercase">
            <tr>
              <th className="px-6 py-4">Incident ID</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assigned Unit</th>
              <th className="px-6 py-4">Response Time</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3d4947]">
            {filteredLogs.map((log) => {
              const isExpanded = expandedRowId === log.id;

              return (
                <React.Fragment key={log.id}>
                  <tr
                    onClick={() => toggleRow(log.id)}
                    className="hover:bg-[#1c2b3c] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-[#6bd8cb]">{log.incidentId}</td>
                    <td className="px-6 py-4 text-xs text-[#d4e4fa]">
                      {log.date} <span className="text-[#bcc9c6] opacity-60 ml-2">{log.time}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#d4e4fa]">{log.address}</td>
                    <td className="px-6 py-4">
                      {log.finalStatus === 'resolved' ? (
                        <span className="inline-flex items-center space-x-1 bg-[#29a195]/20 text-[#6bd8cb] border border-[#6bd8cb]/30 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase">
                          <XCircle className="w-3 h-3" />
                          <span>Cancelled</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#d4e4fa]">{log.assignedDrone}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#d4e4fa]">
                      {log.responseTimeFormatted} <small className="text-[#bcc9c6]">min</small>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#6bd8cb]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#bcc9c6]" />
                      )}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[#010f1f]">
                      <td colSpan={7} className="p-6">
                        <div className="border-l-4 border-[#6bd8cb] pl-6 grid grid-cols-12 gap-8">
                          <div className="col-span-5 space-y-3">
                            <h4 className="text-xs font-bold uppercase text-[#bcc9c6]">Mission Audit Trail</h4>
                            <div className="space-y-3 border-l border-[#3d4947] pl-4">
                              {log.timeline.map((step, idx) => (
                                <div key={idx} className="relative">
                                  <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#6bd8cb]" />
                                  <p className="text-xs text-[#d4e4fa] font-bold">{step.time} - {step.action}</p>
                                  <p className="text-[11px] text-[#bcc9c6]">{step.details}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="col-span-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase text-[#bcc9c6]">Post-Mission Operator Notes</h4>
                            <p className="text-xs italic text-[#d4e4fa] bg-[#122131] p-3 border border-[#3d4947] rounded-lg">
                              "{log.postMissionNote || 'Mission concluded cleanly under standard SOP parameters.'}"
                            </p>
                            <p className="text-[10px] text-[#bcc9c6]">Authorized Operator: <span className="text-[#6bd8cb] font-bold">{log.operatorId}</span></p>
                          </div>

                          <div className="col-span-3 flex flex-col justify-end space-y-2">
                            <button
                              onClick={() => setShowPdfModal(true)}
                              className="w-full py-2 bg-[#1c2b3c] border border-[#3d4947] text-xs font-bold text-[#6bd8cb] hover:bg-[#6bd8cb] hover:text-[#003732] rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>PRINT PDF AUDIT SUMMARY</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showPdfModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 select-none">
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-8 max-w-lg w-full space-y-6">
            <div className="flex justify-between items-center border-b border-[#3d4947] pb-4">
              <h3 className="text-lg font-bold text-[#6bd8cb] flex items-center gap-2">
                <FileText className="w-5 h-5" /> Official Incident Compliance Summary
              </h3>
              <button onClick={() => setShowPdfModal(false)} className="text-[#bcc9c6] hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#d4e4fa] font-mono">
              <p>SUFD COMMAND CENTER REPORT — #SF-8829-X</p>
              <p>DISPATCH TIMESTAMP: 2026-08-02 14:22:10 UTC</p>
              <p>RESPONSE UNITS: Drone DR-402, Station Alpha</p>
              <p>FINAL OUTCOME: THREAT CONTAINED & RESOLVED</p>
              <p>AUDIT VERIFICATION: 100% ISO-9001 COMPLIANT</p>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-[#3d4947]">
              <button
                onClick={() => {
                  window.print();
                  setShowPdfModal(false);
                }}
                className="flex-1 py-2.5 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110"
              >
                PRINT DOCUMENT NOW
              </button>
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2.5 bg-[#0d1c2d] border border-[#3d4947] text-xs font-bold text-[#bcc9c6] rounded-lg"
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
