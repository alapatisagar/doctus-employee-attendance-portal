import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Lock } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { dbService } from '../../services/db';
import { AuditLog } from '../../types';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    const list = await dbService.getAuditLogs();
    setLogs(list);
  };

  const filteredLogs = logs.filter(l => 
    l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GlassCard className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-doctus-red" />
            Security & Administrative Audit Trail
          </h2>
          <p className="text-xs text-neutral-500">
            Immutable, read-only audit records of account provisioning, status changes, and approvals.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
          <Lock className="w-3.5 h-3.5" /> Immutable Audit Protocol Active
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by actor, action (e.g., CREATE_EMPLOYEE, APPROVE_LEAVE), or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs text-neutral-900 dark:text-white"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-extrabold uppercase">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y font-medium">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-doctus-yellow/10 transition-colors">
                <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">{log.actorName}</td>
                <td className="py-3 px-4 uppercase font-bold text-[10px] text-doctus-red">{log.actorRole}</td>
                <td className="py-3 px-4 font-mono font-bold text-xs">{log.action}</td>
                <td className="py-3 px-4 font-bold">{log.targetName || '—'}</td>
                <td className="py-3 px-4 text-[11px] text-neutral-600 dark:text-neutral-300">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
