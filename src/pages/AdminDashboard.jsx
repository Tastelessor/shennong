import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useI18n } from '../features/i18n/I18nProvider';

export const AdminDashboard = () => {
  const { t } = useI18n();
  const [data, setData] = useState({ users: [], appts: [], msgs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getAllData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Users Card */}
      <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
        <h2 className="text-xl font-bold mb-4 flex justify-between">
          {t("admin.users")} 
          <span className="text-indigo-600 bg-indigo-50 px-2 rounded">{data.users.length}</span>
        </h2>
        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
          {data.users.map(u => (
            <div key={u.id} className="border-b pb-2 text-sm flex justify-between">
              <div>
                <span className="font-bold">{u.name}</span>
                <span className="text-xs text-gray-400 ml-2">({u.role})</span>
              </div>
              <div className="text-right text-xs text-gray-500">
                {u.email}<br/>{u.phone}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments Card */}
      <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
        <h2 className="text-xl font-bold mb-4 flex justify-between">
          {t("admin.appts")}
          <span className="text-green-600 bg-green-50 px-2 rounded">{data.appts.length}</span>
        </h2>
        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-3">
          {data.appts.map(a => (
            <div key={a.id} className="text-sm bg-gray-50 p-2 rounded">
              <div className="font-medium text-[#4a6741]">{a.service} - {a.date.replace('T', ' ')}</div>
              <div className="text-gray-600 mt-1">{a.userName} ({a.userPhone})</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Card (Full Width) */}
      <div className="bg-white p-6 rounded shadow border-l-4 border-gray-500 col-span-1 md:col-span-2">
        <h2 className="text-xl font-bold mb-4">{t("admin.logs")}</h2>
        <div className="max-h-60 overflow-y-auto custom-scrollbar text-xs font-mono bg-gray-900 text-gray-300 p-4 rounded">
          {data.msgs.map(m => (
            <div key={m.id} className="mb-1 border-b border-gray-700 pb-1">
              <span className="text-gray-500">[{m.timestamp}]</span> 
              <span className="text-yellow-400 ml-2">{m.senderName} ({m.senderRole}):</span> 
              <span className="text-white ml-2">{m.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};