import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useI18n } from '../features/i18n/I18nProvider';
import { API_BASE_URL } from '../utils/request';
import { Users, Calendar, ShieldCheck, FileText, Check, ExternalLink, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const { t } = useI18n();
  const [data, setData] = useState({ users: [], appts: [], msgs: [] });
  const [loading, setLoading] = useState(true);
  const [partnerApps, setPartnerApps] = useState([]);

  useEffect(() => {
    Promise.all([
      api.admin.getAllData(),
      api.partner.getAllApplications()
    ]).then(([allData, apps]) => {
      setData(allData);
      setPartnerApps(apps);
    }).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    if(!window.confirm("确定通过该用户的合伙人资质申请吗？")) return;
    try {
      await api.partner.approve(id);
      setPartnerApps(prev => prev.filter(a => a.id !== id));
      alert("已成功批准合伙人资质");
    } catch (err) {
      alert("操作失败: " + err.message);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center flex-col gap-4 text-gray-400">
      <Activity className="animate-spin text-[#4a6741]" size={40} />
      <p>正在加载系统概览...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="text-blue-600"/>} title={t("admin.users")} count={data.users.length} color="blue" />
        <StatCard icon={<Calendar className="text-green-600"/>} title={t("admin.appts")} count={data.appts.length} color="green" />
        <StatCard icon={<ShieldCheck className="text-amber-600"/>} title="待审合伙人" count={partnerApps.length} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：合伙人审批列表 (重点) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-2">
              <ShieldCheck className="text-amber-600" size={20} />
              <h2 className="font-bold text-amber-900">合伙人资质审批队列</h2>
            </div>
            
            <div className="p-6">
              {partnerApps.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic">
                  目前没有待处理的申请
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {partnerApps.map(app => (
                    <div key={app.id} className="group border rounded-2xl p-4 hover:border-amber-400 transition-all bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-600 shrink-0">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{app.companyName}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            代码: <code className="bg-gray-200 px-1 rounded">{app.creditCode}</code>
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                             <span className="text-[10px] bg-white border px-2 py-0.5 rounded text-gray-400">UID: {app.id}</span>
                             <a 
                                href={`${API_BASE_URL}${app.licensePath}`} 
                                target="_blank" 
                                className="text-blue-600 text-[11px] font-bold flex items-center gap-1 hover:underline"
                             >
                               <ExternalLink size={12} /> 查看证照
                             </a>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleApprove(app.id)}
                        className="bg-[#4a6741] hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-900/10"
                      >
                        <Check size={18} /> 批准加入
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 预约记录 */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2"><Calendar size={18}/> 最近预约</h2>
             </div>
             <div className="p-6 overflow-x-auto overflow-y-auto max-h-80 custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b">
                      <th className="pb-3 font-medium">服务项目</th>
                      <th className="pb-3 font-medium">预约人</th>
                      <th className="pb-3 font-medium">日期时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.appts.map(a => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-4 font-bold text-[#4a6741]">{a.service}</td>
                        <td className="py-4">{a.userName} <span className="text-gray-400 text-xs">({a.userPhone})</span></td>
                        <td className="py-4 font-mono text-gray-500">{a.date.replace('T', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* 右侧：日志与系统状态 */}
        <div className="space-y-6">
           <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl h-[600px] flex flex-col">
              <div className="flex items-center gap-2 text-gray-400 mb-4 border-b border-gray-800 pb-4">
                <Activity size={18} className="text-green-500" />
                <h2 className="font-mono text-sm uppercase tracking-widest">System Live Logs</h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar-dark font-mono text-[10px] space-y-2">
                {data.msgs.map(m => (
                  <div key={m.id} className="text-gray-300">
                    <span className="text-gray-600">[{new Date(m.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-green-500 ml-2">{m.senderRole}</span>
                    <span className="text-white ml-2">{m.content}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// 辅助组件
const StatCard = ({ icon, title, count, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-black text-gray-800">{count}</p>
      </div>
    </div>
  );
};