"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Activity, Clock } from "lucide-react";

type LogEntry = {
  id: string;
  adminEmail: string;
  actionType: string;
  details: string | null;
  createdAt: string;
};

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/activity");
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
      } else {
        setError(data.error || "Failed to load logs");
      }
    } catch (err) {
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p className="font-sans">Loading activity logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
        <AlertCircle size={20} />
        <span className="font-sans">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-sans font-bold text-[#1A1A1A]">Admin Activity Log</h1>
        <p className="text-gray-500 font-sans text-sm mt-1">Audit trail of all administrative actions (Local Mode Only)</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin Email</th>
                <th className="px-6 py-4">Action Type</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={14} />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{log.adminEmail}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                      <Activity size={12} />
                      {log.actionType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{log.details || "-"}</span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
