import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { API_BASE_URL } from '../utils/request';
import { 
  Users, Calendar, ShieldCheck, Activity, Search, RefreshCw, 
  MessageSquare, Eye, X, TrendingUp, Network, Trash2, 
  Filter, CheckCircle2, Clock, Check, ExternalLink, FileText
} from 'lucide-react';

// [新增] 引入 Recharts
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ current: {}, chart: [] });
  const [liveLogs, setLiveLogs] = useState([]);
  
  // 核心数据缓存 (用于各个子模块)
  const [allUsers, setAllUsers] = useState([]);
  const [allAppts, setAllAppts] = useState([]);
  const [partnerApps, setPartnerApps] = useState([]);

  // 模块状态: 'monitor' | 'users' | 'appts' | 'partners'
  const [activeTab, setActiveTab] = useState('monitor'); 

  const fetchGlobalData = () => {
    Promise.all([
      api.admin.getAllData(),         // 获取用户、预约、日志
      api.admin.getStats('hour'),     // 获取图表统计
      api.partner.getAllApplications() // 获取合伙人申请（含pending）
    ]).then(([allData, statsData, apps]) => {
      setLiveLogs(allData.msgs);
      setAllUsers(allData.users);
      setAllAppts(allData.appts);
      setStats(statsData);
      setPartnerApps(apps); // 注意：这里通常只包含 pending，如果后端接口没变
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchGlobalData();
    const timer = setInterval(fetchGlobalData, 10000);
    return () => clearInterval(timer);
  }, []);

  // 预约处理回调
  const handleProcessAppt = async (id) => {
    await api.appointment.process(id);
    setAllAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'processed' } : a));
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-gray-400 gap-2">
      <RefreshCw className="animate-spin" /> 初始化管理系统...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in">
      {/* 顶部导航 Tabs - [修复] 补全所有模块入口 */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        <TabButton active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} icon={<Activity size={18}/>} label="系统监控" />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18}/>} label={`用户管理 (${allUsers.length})`} />
        <TabButton active={activeTab === 'appts'} onClick={() => setActiveTab('appts')} icon={<Calendar size={18}/>} label={`预约中心 (${allAppts.filter(a => a.status !== 'processed').length})`} alert />
        <TabButton active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} icon={<ShieldCheck size={18}/>} label={`合伙人 (${partnerApps.length})`} />
      </div>

      {/* 内容区域 */}
      <div className="min-h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm p-1">
        
        {activeTab === 'monitor' && (
          <SystemMonitorModule stats={stats} logs={liveLogs} />
        )}

        {activeTab === 'users' && (
          <UserManagement users={allUsers} />
        )}

        {activeTab === 'appts' && (
          <AppointmentManagement appts={allAppts} onProcess={handleProcessAppt} />
        )}

        {activeTab === 'partners' && (
          <PartnerManagerModule initialApps={partnerApps} />
        )}

      </div>
    </div>
  );
};

// ==========================================
// 模块 1: 系统监控 (集成 Recharts)
// ==========================================
const SystemMonitorModule = ({ stats, logs }) => {
  const [period, setPeriod] = useState('hour');
  const [chartData, setChartData] = useState([]);
  const [viewingRoom, setViewingRoom] = useState(null);

  useEffect(() => {
    api.admin.getStats(period).then(res => setChartData(res.chart));
  }, [period]);

  useEffect(() => {
    if (stats.chart) setChartData(stats.chart);
  }, [stats]);

  const roomMessages = viewingRoom ? logs.filter(m => m.roomId === viewingRoom) : [];

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧：数据可视化 */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <MetricCard title="当前活跃用户" value={stats.current.activeUsers} icon={<Users className="text-blue-500" />} />
          <MetricCard title="在线客服" value={stats.current.activeAgents} icon={<Activity className="text-green-500" />} />
          <MetricCard title="1小时内消息" value={stats.current.msgLastHour} icon={<MessageSquare className="text-purple-500" />} />
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2"><TrendingUp size={18}/> 流量趋势分析</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['hour', 'day', 'month'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 text-xs font-bold rounded-md transition ${period === p ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {/* [改进] 使用 Recharts */}
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" fontSize={12} stroke="#9ca3af" />
                <YAxis fontSize={12} stroke="#9ca3af" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend />
                <Area type="monotone" dataKey="users" name="活跃用户" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="messages" name="消息总数" stroke="#a855f7" fillOpacity={1} fill="url(#colorMsgs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 右侧：日志 (代码复用之前，略作调整适应布局) */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 flex flex-col h-[520px]">
        {/* ... 日志头部 ... */}
        <div className="p-3 border-b flex justify-between items-center bg-white rounded-t-xl">
           <span className="font-bold text-sm text-gray-600">实时日志</span>
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          <table className="w-full text-left text-xs">
             {/* ... 日志内容 ... */}
             <tbody className="divide-y divide-gray-100">
              {logs.map((m, i) => (
                <tr key={i} className="hover:bg-white transition">
                  <td className="p-2 text-gray-400 font-mono w-20">{new Date(m.timestamp).toLocaleTimeString()}</td>
                  <td className="p-2 w-20">
                     <span className={`px-1 rounded text-[10px] font-bold ${m.senderRole==='admin'?'text-red-500':m.senderRole==='agent'?'text-green-500':'text-blue-500'}`}>{m.senderRole}</span>
                  </td>
                  <td className="p-2 text-gray-700 truncate max-w-[100px]">{m.content}</td>
                  <td className="p-2 text-right">
                    <button onClick={() => setViewingRoom(m.roomId)} className="hover:bg-gray-200 p-1 rounded"><Eye size={12}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 只读会话弹窗逻辑 (复用之前) */}
      {viewingRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           {/* ... 保持之前代码 ... */}
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl h-[600px] flex flex-col">
             <div className="p-4 border-b flex justify-between">
                <h3 className="font-bold">监控: {viewingRoom}</h3>
                <button onClick={() => setViewingRoom(null)}><X/></button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {roomMessages.map((m, i) => (
                   <div key={i} className={`flex ${m.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`p-2 px-3 rounded-lg text-sm max-w-[80%] ${m.senderRole==='user'?'bg-blue-600 text-white':'bg-white border'}`}>
                        {m.content}
                     </div>
                   </div>
                ))}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 模块 2: 用户管理 (支持搜索)
// ==========================================
const UserManagement = ({ users }) => {
  const [search, setSearch] = useState("");
  const filtered = users.filter(u => 
    u.name?.includes(search) || u.phone?.includes(search) || u.email?.includes(search)
  );

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-4 border-b flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索用户名 / 手机号 / 邮箱..." 
            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:border-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500">共 {users.length} 位用户</div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-gray-500 font-medium">基本信息</th>
              <th className="p-4 text-gray-500 font-medium">联系方式</th>
              <th className="p-4 text-gray-500 font-medium">角色 & 状态</th>
              <th className="p-4 text-gray-500 font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-gray-600">{u.phone}<br/><span className="text-xs text-gray-400">{u.email}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  {u.partnerStatus === 'approved' && <span className="ml-2 bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold">合伙人</span>}
                </td>
                <td className="p-4 text-gray-400 text-xs font-mono">{new Date().toLocaleDateString()}</td> {/* 模拟注册时间 */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 模块 3: 预约管理 (含筛选与处理)
// ==========================================
const AppointmentManagement = ({ appts, onProcess }) => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

  const filtered = appts.filter(a => {
    const matchText = a.userName?.includes(search) || a.userPhone?.includes(search);
    const matchDate = dateFilter ? a.date.startsWith(dateFilter) : true;
    const matchStatus = pendingOnly ? (!a.status || a.status === 'pending') : true;
    return matchText && matchDate && matchStatus;
  });

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-gray-50/50">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索姓名或手机..." 
            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:border-green-500"
          />
        </div>
        <input 
          type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="border px-3 py-2 rounded-xl outline-none focus:border-green-500 text-sm text-gray-600"
        />
        <button 
          onClick={() => setPendingOnly(!pendingOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition border ${pendingOnly ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600'}`}
        >
          <Filter size={16} /> {pendingOnly ? "显示全部" : "只看待处理"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-gray-500 font-medium">服务项目</th>
              <th className="p-4 text-gray-500 font-medium">预约人</th>
              <th className="p-4 text-gray-500 font-medium">时间</th>
              <th className="p-4 text-gray-500 font-medium">状态</th>
              <th className="p-4 text-gray-500 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 group">
                <td className="p-4 font-bold text-[#4a6741]">{a.service}</td>
                <td className="p-4">{a.userName} <br/><span className="text-xs text-gray-400">{a.userPhone}</span></td>
                <td className="p-4 font-mono text-gray-600">{a.date.replace('T', ' ')}</td>
                <td className="p-4">
                  {a.status === 'processed' ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded w-fit">
                      <CheckCircle2 size={12} /> 已处理
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded w-fit">
                      <Clock size={12} /> 待处理
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {a.status !== 'processed' && (
                    <button 
                      onClick={() => onProcess(a.id)}
                      className="bg-[#4a6741] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#3d5535] shadow-sm transition"
                    >
                      标记处理
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 模块 4: 合伙人管理 (含审批与列表)
// ==========================================
const PartnerManagerModule = ({ initialApps }) => {
  const [partners, setPartners] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'pending'
  const [treeData, setTreeData] = useState(null);

  const loadPartners = () => {
    api.admin.getPartnersDetailed().then(data => {
      setPartners(data);
    });
  };

  useEffect(() => {
    if (view === 'list') loadPartners();
  }, [view]);

  const handleRevoke = async (id, name) => {
    if (!window.confirm(`确认撤销 [${name}] 的资格？\n\n警告：这将同时释放其上级的邀请名额，并解绑其所有下级。`)) return;
    try {
      await api.partner.revoke(id);
      loadPartners();
      alert("撤销成功");
    } catch {
      alert("操作失败");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("批准该申请？")) return;
    await api.partner.approve(id);
    // 简单刷新页面或回调父组件刷新（这里为了简单直接刷新当前视图）
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
        <div className="flex gap-2">
           <button 
             onClick={() => setView('list')}
             className={`px-4 py-2 rounded-xl text-sm font-bold transition ${view === 'list' ? 'bg-amber-100 text-amber-800' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             已批准合伙人
           </button>
           <button 
             onClick={() => setView('pending')}
             className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${view === 'pending' ? 'bg-red-100 text-red-800' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             待审批申请 {initialApps.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{initialApps.length}</span>}
           </button>
        </div>
        <button onClick={loadPartners} className="p-2 hover:bg-gray-200 rounded-full"><RefreshCw size={16}/></button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {view === 'list' ? (
          // 已批准列表
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
               <tr>
                 <th className="p-3">姓名</th>
                 <th className="p-3">公司信息</th>
                 <th className="p-3 text-center">A团队</th>
                 <th className="p-3 text-center">B团队</th>
                 <th className="p-3 text-center">总计</th>
                 <th className="p-3 text-right">操作</th>
               </tr>
            </thead>
            <tbody className="divide-y">
               {partners.map(p => (
                 <tr key={p.id} className="hover:bg-gray-50">
                   <td className="p-3 font-bold">{p.name}</td>
                   <td className="p-3 text-gray-600">
                      <div>{p.companyName}</div>
                      <div className="text-xs text-gray-400">{p.creditCode}</div>
                   </td>
                   <td className="p-3 text-center font-mono text-blue-600 font-bold">{p.teamACount}</td>
                   <td className="p-3 text-center font-mono text-green-600 font-bold">{p.teamBCount}</td>
                   <td className="p-3 text-center">
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">{p.totalCount}</span>
                   </td>
                   <td className="p-3 text-right flex justify-end gap-2">
                      <button onClick={async () => {
                          const tree = await api.partner.getTree(p.id);
                          setTreeData(tree);
                      }} className="p-1.5 border rounded hover:bg-gray-50 text-gray-600" title="拓扑图"><Network size={14}/></button>
                      <button onClick={() => handleRevoke(p.id, p.name)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="撤销"><Trash2 size={14}/></button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        ) : (
          // 待审批列表
          <div className="space-y-4">
             {initialApps.length === 0 && <div className="text-center text-gray-400 py-10">无待处理申请</div>}
             {initialApps.map(app => (
               <div key={app.id} className="bg-white p-4 border rounded-xl flex justify-between items-center shadow-sm">
                  <div>
                     <h4 className="font-bold text-gray-800">{app.companyName}</h4>
                     <p className="text-sm text-gray-500">申请人: {app.name} | ID: {app.id}</p>
                     <a href={`${API_BASE_URL}${app.licensePath}`} target="_blank" className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-1 hover:underline">
                        <ExternalLink size={12}/> 查看执照
                     </a>
                  </div>
                  <button onClick={() => handleApprove(app.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-green-700">批准</button>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* 拓扑图弹窗 (复用之前的 TreeModal, 这里不再重复代码) */}
      {treeData && <TreeModal data={treeData} onClose={() => setTreeData(null)} />}
    </div>
  );
};

// 简单的 UI 组件
const TabButton = ({ active, onClick, icon, label, alert }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all font-medium whitespace-nowrap ${active ? 'border-[#4a6741] text-[#4a6741] bg-gray-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
  >
    {icon} {label}
    {alert && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>}
  </button>
);

const MetricCard = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <p className="text-3xl font-black text-gray-800">{value}</p>
    </div>
    <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
  </div>
);

// 此时还需要补充 TreeModal 组件代码 (同上一次提供的一致，这里为了完整性建议保留)
const TreeModal = ({ data, onClose }) => {
    // ... (保持上一次提供的 TreeModal 代码)
    const renderNode = (node) => {
        if (!node) return null;
        return (
            <div className="flex flex-col items-center">
                <div className="bg-white border-2 border-amber-400 px-4 py-2 rounded-xl shadow-md mb-8 z-10">
                    <div className="font-bold text-center">{node.name}</div>
                    <div className="text-xs text-gray-400 text-center">{node.id.slice(0,4)}</div>
                </div>
                {node.children && node.children.length > 0 && (
                    <div className="relative flex gap-8">
                        <div className="absolute -top-8 left-1/2 w-px h-8 bg-gray-300"></div>
                        <div className="absolute -top-4 left-1/4 right-1/4 h-px bg-gray-300"></div>
                        {node.children.map(child => (
                            <div key={child.id} className="relative pt-4">
                                <div className="absolute -top-4 left-1/2 w-px h-4 bg-gray-300"></div>
                                {renderNode(child)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center overflow-auto p-10">
             <div className="bg-gray-50 min-w-[50vw] min-h-[50vh] rounded-2xl p-10 relative flex justify-center">
                 <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow"><X/></button>
                 {renderNode(data)}
             </div>
        </div>
    )
}