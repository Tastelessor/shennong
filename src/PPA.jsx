import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Globe, X, Phone, Mail, ChevronDown, 
  ChevronUp, ArrowUp, MessageSquare, Facebook, Instagram, Linkedin, 
  HeartPulse, LogIn, UserPlus
} from 'lucide-react';
import { createPortal } from 'react-dom';

// --- 常量定义 ---
const SERVICES = [
  { title: "针灸 (Acupuncture)", desc: "疏通经络，调和阴阳" },
  { title: "草药 (Herbal Medicine)", desc: "个性化配方，标本兼治" },
  { title: "推拿 (Tui Na)", desc: "传统手法，缓解疼痛" },
  { title: "拔罐 (Cupping)", desc: "祛除湿气，促进循环" }
];
const API_URL = "http://localhost:3000/api"; // 后端地址

export default function App() {
  // --- 状态管理 ---
  const [currentUser, setCurrentUser] = useState(null); // 存储登录用户信息对象
  const [activeModal, setActiveModal] = useState(null); // 'login' | 'register' | 'appointment' | null
  const [activeQA, setActiveQA] = useState(null);
  
  // 表单状态
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [apptForm, setApptForm] = useState({ date: '', service: SERVICES[0].title, description: '', guestName: '', guestPhone: '' });
  const [history, setHistory] = useState([]); // 历史预约

  // --- API 交互逻辑 ---

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert("注册成功！请登录。");
        setActiveModal('login');
      } else {
        alert(data.message);
      }
    } catch (err) { alert("注册失败，无法连接服务器"); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setActiveModal(null);
        alert(`欢迎回来, ${data.user.name}`);
        fetchHistory(data.user.id); // 登录后拉取历史
      } else {
        alert(data.message);
      }
    } catch (err) { alert("登录失败，无法连接服务器"); }
  };

  const fetchHistory = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/appointments?userId=${userId}`);
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) { console.error(err); }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    
    // 构建提交数据
    const payload = {
      userId: currentUser ? currentUser.id : null,
      userName: currentUser ? currentUser.name : apptForm.guestName,
      userPhone: currentUser ? currentUser.phone : apptForm.guestPhone,
      date: apptForm.date,
      service: apptForm.service,
      description: apptForm.description
    };

    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("预约提交成功！我们将尽快联系您。");
        setActiveModal(null);
        // 如果已登录，刷新历史
        if(currentUser) fetchHistory(currentUser.id);
      }
    } catch (err) { alert("提交失败"); }
  };

  // 悬浮按钮 - 返回顶部
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-tcm-cream flex flex-col">
      <header className="sticky top-0 bg-white shadow-md z-40 w-full">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-tcm-primary rounded-full flex items-center justify-center text-white font-bold text-xl">神</div>
            <h1 className="text-2xl font-bold text-tcm-primary tracking-wider">SHEN NONG</h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-1 text-gray-600 mr-2 cursor-pointer hover:text-tcm-primary">
                <Globe size={18}/> <span>EN/中文</span>
             </div>

             <button 
               onClick={() => setActiveModal('appointment')}
               className="bg-tcm-secondary text-white px-4 py-2 rounded hover:bg-red-800 transition flex items-center gap-2"
             >
               <Calendar size={18}/> 预约
             </button>

             {/* 修复点2: 分离登录/注册状态 */}
             {currentUser ? (
               <div className="flex items-center gap-3 ml-2 border-l pl-4">
                  <div className="text-right leading-tight">
                    <p className="font-bold text-sm text-tcm-primary">{currentUser.name}</p>
                    <button onClick={() => setActiveModal('history')} className="text-xs text-gray-500 hover:underline">历史预约</button>
                  </div>
                  <button onClick={() => {setCurrentUser(null); setHistory([]);}} className="text-sm text-gray-400 hover:text-red-500">退出</button>
               </div>
             ) : (
               <div className="flex gap-2">
                 <button 
                   onClick={() => setActiveModal('login')}
                   className="flex items-center gap-1 text-tcm-primary hover:bg-green-50 px-3 py-2 rounded transition"
                 >
                   <LogIn size={18}/> 登录
                 </button>
                 <button 
                   onClick={() => setActiveModal('register')}
                   className="flex items-center gap-1 border border-tcm-primary text-tcm-primary px-3 py-2 rounded hover:bg-tcm-primary hover:text-white transition"
                 >
                   <UserPlus size={18}/> 注册
                 </button>
               </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Hero */}
        <section className="relative h-[500px] w-full">
           <img 
             src="https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=1600" 
             className="w-full h-full object-cover" 
           />
           <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center">
             <h2 className="text-5xl font-bold mb-4">SHEN NONG TCM</h2>
             <p className="text-xl">传承 · 创新 · 仁心</p>
           </div>
        </section>

        {/* About & Services placeholders... (保持原有布局结构，为节省篇幅简化) */}
        <section className="py-16 container mx-auto px-4 text-center">
             <h3 className="text-3xl font-bold text-tcm-primary mb-8">我们的服务</h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {SERVICES.map((s,i) => (
                    <div key={i} className="p-6 bg-white shadow rounded border-t-4 border-tcm-primary">
                        <h4 className="font-bold text-lg">{s.title}</h4>
                        <p className="text-gray-500 text-sm mt-2">{s.desc}</p>
                    </div>
                ))}
             </div>
        </section>
        
        {/* QA Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h3 className="text-3xl font-bold text-center text-tcm-primary mb-8">常见问题</h3>
            <div className="border rounded-lg p-4">
              <div onClick={() => setActiveQA(activeQA===1?null:1)} className="flex justify-between cursor-pointer font-bold p-2">
                初诊流程是怎样的？
                {activeQA===1 ? <ChevronUp/> : <ChevronDown/>}
              </div>
              {activeQA===1 && <div className="p-2 text-gray-600">请携带身份证件，并在前台填写基本健康调查表...</div>}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
             <h4 className="font-bold text-lg mb-4">联系方式</h4>
             <p className="flex items-center gap-2"><Phone size={16}/> 123-456-7890</p>
             <p className="flex items-center gap-2"><Mail size={16}/> info@shennong.com</p>
             <div className="flex gap-4 mt-4">
               <Facebook className="hover:text-tcm-primary cursor-pointer"/>
               <Instagram className="hover:text-tcm-primary cursor-pointer"/>
               <Linkedin className="hover:text-tcm-primary cursor-pointer"/>
             </div>
           </div>
           <div>
             <h4 className="font-bold text-lg mb-4">General</h4>
             <ul className="space-y-2 text-gray-400">
               <li><a href="#" className="hover:text-white">News</a></li>
               <li><a href="#" className="hover:text-white">Contact Us</a></li>
             </ul>
           </div>
        </div>
      </footer>

{typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {/* 返回顶部 */}
          <button 
            onClick={scrollToTop} 
            className="pointer-events-auto absolute left-6 bottom-10 bg-tcm-primary text-white p-3 rounded-full shadow-2xl hover:bg-green-700 transition"
          >
            <ArrowUp size={24} />
          </button>

          {/* Live Chat */}
          <button 
            onClick={() => alert("连接客服...")} 
            className="pointer-events-auto absolute right-6 bottom-10 bg-tcm-secondary text-white p-4 rounded-full shadow-2xl hover:bg-red-800 transition flex items-center gap-2"
          >
            <MessageSquare size={24} />
            <span className="hidden md:inline">Live Chat</span>
          </button>
        </div>,
        document.body
      )}

      {/* --- Modals --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden">
             <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X/></button>
             
             {/* 登录模态框 */}
             {activeModal === 'login' && (
               <div className="p-8">
                 <h2 className="text-2xl font-bold text-tcm-primary mb-6">用户登录</h2>
                 <form onSubmit={handleLogin} className="space-y-4">
                   <input 
                     type="email" placeholder="邮箱" required 
                     className="w-full border p-2 rounded"
                     value={loginForm.email} onChange={e=>setLoginForm({...loginForm, email:e.target.value})}
                   />
                   <input 
                     type="password" placeholder="密码" required 
                     className="w-full border p-2 rounded"
                     value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})}
                   />
                   <button className="w-full bg-tcm-primary text-white py-2 rounded font-bold hover:bg-green-700">立即登录</button>
                 </form>
                 <p className="mt-4 text-sm text-center">还没账号？ <span className="text-tcm-secondary cursor-pointer font-bold" onClick={()=>setActiveModal('register')}>去注册</span></p>
               </div>
             )}

             {/* 注册模态框 (独立) */}
             {activeModal === 'register' && (
               <div className="p-8">
                 <h2 className="text-2xl font-bold text-tcm-secondary mb-6">新用户注册</h2>
                 <form onSubmit={handleRegister} className="space-y-4">
                   <input 
                     type="text" placeholder="您的姓名" required 
                     className="w-full border p-2 rounded"
                     value={regForm.name} onChange={e=>setRegForm({...regForm, name:e.target.value})}
                   />
                   <input 
                     type="email" placeholder="电子邮箱" required 
                     className="w-full border p-2 rounded"
                     value={regForm.email} onChange={e=>setRegForm({...regForm, email:e.target.value})}
                   />
                   <input 
                     type="tel" placeholder="手机号码" required 
                     className="w-full border p-2 rounded"
                     value={regForm.phone} onChange={e=>setRegForm({...regForm, phone:e.target.value})}
                   />
                   <input 
                     type="password" placeholder="设置密码" required 
                     className="w-full border p-2 rounded"
                     value={regForm.password} onChange={e=>setRegForm({...regForm, password:e.target.value})}
                   />
                   <button className="w-full bg-tcm-secondary text-white py-2 rounded font-bold hover:bg-red-800">提交注册</button>
                 </form>
                 <p className="mt-4 text-sm text-center">已有账号？ <span className="text-tcm-primary cursor-pointer font-bold" onClick={()=>setActiveModal('login')}>去登录</span></p>
               </div>
             )}

             {/* 预约模态框 */}
             {activeModal === 'appointment' && (
                <div className="p-8 max-h-[90vh] overflow-y-auto">
                   <h2 className="text-2xl font-bold mb-4">预约就诊</h2>
                   {currentUser ? (
                     <div className="bg-green-50 text-green-800 p-3 rounded mb-4 text-sm">
                       正在为 <b>{currentUser.name}</b> ({currentUser.phone}) 预约
                     </div>
                   ) : (
                     <div className="space-y-3 mb-4 border-b pb-4">
                       <p className="text-sm text-gray-500">您目前是游客，请输入联系方式：</p>
                       <input placeholder="姓名" className="w-full border p-2 rounded" value={apptForm.guestName} onChange={e=>setApptForm({...apptForm, guestName:e.target.value})} />
                       <input placeholder="手机号" className="w-full border p-2 rounded" value={apptForm.guestPhone} onChange={e=>setApptForm({...apptForm, guestPhone:e.target.value})} />
                     </div>
                   )}
                   
                   <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                     <div>
                       <label className="block text-sm text-gray-600">日期</label>
                       <input type="date" required className="w-full border p-2 rounded" value={apptForm.date} onChange={e=>setApptForm({...apptForm, date:e.target.value})}/>
                     </div>
                     <div>
                       <label className="block text-sm text-gray-600">服务项目</label>
                       <select className="w-full border p-2 rounded" value={apptForm.service} onChange={e=>setApptForm({...apptForm, service:e.target.value})}>
                         {SERVICES.map(s=><option key={s.title} value={s.title}>{s.title}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm text-gray-600">病情描述</label>
                       <textarea className="w-full border p-2 rounded" rows="3" value={apptForm.description} onChange={e=>setApptForm({...apptForm, description:e.target.value})}></textarea>
                     </div>
                     <button className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800">确认预约</button>
                   </form>
                </div>
             )}

             {/* 历史记录模态框 */}
             {activeModal === 'history' && (
               <div className="p-8 max-h-[80vh] overflow-y-auto">
                 <h2 className="text-xl font-bold mb-4">我的预约记录</h2>
                 {history.length === 0 ? (
                   <p className="text-gray-500">暂无预约记录。</p>
                 ) : (
                   <ul className="space-y-3">
                     {history.map((item) => (
                       <li key={item.id} className="border p-3 rounded bg-gray-50">
                         <div className="flex justify-between font-bold text-tcm-primary">
                           <span>{item.service}</span>
                           <span>{item.date}</span>
                         </div>
                         <p className="text-sm text-gray-600 mt-1">备注: {item.description || "无"}</p>
                       </li>
                     ))}
                   </ul>
                 )}
               </div>
             )}

           </div>
        </div>
      )}
    </div>
  );
}