import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { api } from '../../api';
import { User, UserPlus, ShieldCheck, Settings, Loader, BarChart3, Clock } from 'lucide-react';

export const UserCenter = ({ onOpenPartnerForm }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState(null);
  const [inviterId, setInviterId] = useState("");
  const [inviteStats, setInviteStats] = useState(null);

  // 1. 获取最新资料
  useEffect(() => {
    if (user) {
      // 这里的 profile 包含了从数据库实时查询的 partnerStatus
      api.user.getProfile(user.id).then(res => {
        setProfile(res);
        // 如果已经是合伙人，顺便获取统计数据
        if (res.partnerStatus === 'approved') {
          api.user.getInviteStats(user.id).then(setInviteStats);
        }
      });
    }
  }, [user]);

  const handleBind = async () => {
    if (!inviterId) return;
    try {
      await api.user.bindInviter(user.id, inviterId);
      alert("绑定成功！");
      // 重新拉取资料更新界面，而不是 reload 整个页面，体验更好
      api.user.getProfile(user.id).then(setProfile);
    } catch (err) {
      alert(err.message || "绑定失败");
    }
  };

  if (!profile) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4 text-gray-400">
      <Loader className="animate-spin text-[#4a6741]" size={32} />
      <p className="text-sm font-medium">正在同步个人状态...</p>
    </div>
  );

  // 2. 按钮状态逻辑封装
  const getPartnerButtonConfig = () => {
    const status = profile.partnerStatus;
    
    if (status === 'approved') {
      return {
        text: "您已成为合伙人",
        icon: <ShieldCheck size={18} className="text-amber-600" />,
        className: "bg-amber-50 border-2 border-amber-400 text-amber-700 cursor-default",
        disabled: true
      };
    }
    
    if (status === 'pending') {
      return {
        text: "审核中，请稍候",
        icon: <Clock size={18} className="animate-pulse" />,
        className: "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed",
        disabled: true
      };
    }
    
    // 默认：none 或者 null
    return {
      text: "注册成为合伙人",
      icon: <UserPlus size={18} />,
      className: "bg-gray-800 text-white hover:bg-black active:scale-95",
      disabled: false
    };
  };

  const btnConfig = getPartnerButtonConfig();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 头部信息 */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-16 h-16 bg-[#4a6741] rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-green-900/20">
          {profile.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">ID: {profile.id}</span>
            {profile.partnerStatus === 'approved' && (
               <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Partner</span>
            )}
          </div>
        </div>
      </div>

      {/* 邀请人绑定：逻辑保持不变，但样式稍微优化 */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-tight">
          <UserPlus size={14} /> {t("user.inviter")}
        </h3>
        {profile.inviterId ? (
          <div className="text-sm font-medium text-green-700 bg-green-50/50 p-3 rounded-xl border border-green-100 flex items-center justify-between">
            <span>已绑定邀请人</span>
            <span className="font-mono text-xs opacity-60">{profile.inviterId}</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input 
              value={inviterId} 
              onChange={e => setInviterId(e.target.value)}
              placeholder="请输入邀请人ID" 
              className="flex-1 text-sm bg-white border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#4a6741]/20 outline-none transition-all" 
            />
            <button onClick={handleBind} className="bg-[#4a6741] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors">绑定</button>
          </div>
        )}
      </div>

      {/* 合伙人统计：这里使用了递归查询后返回的 teamACount / teamBCount */}
      {profile.partnerStatus === 'approved' && inviteStats && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/50 shadow-sm shadow-amber-900/5">
          <h3 className="text-xs font-bold text-amber-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <BarChart3 size={16} /> 团队分销实时统计
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100">
              <p className="text-[10px] text-amber-900/40 font-bold uppercase">分支 A 团队</p>
              <p className="text-2xl font-black text-amber-700 mt-1">
                {inviteStats.teamACount} <span className="text-xs font-normal opacity-40">人</span>
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100">
              <p className="text-[10px] text-amber-900/40 font-bold uppercase">分支 B 团队</p>
              <p className="text-2xl font-black text-amber-700 mt-1">
                {inviteStats.teamBCount} <span className="text-xs font-normal opacity-40">人</span>
              </p>
            </div>
          </div>
          <p className="text-[9px] text-amber-800/40 mt-3 text-center italic">* 数据基于您直接邀请的两名下级及其所属支队自动计算</p>
        </div>
      )}

      {/* 功能按钮区：根据状态动态渲染 */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        <button 
          onClick={!btnConfig.disabled ? onOpenPartnerForm : undefined}
          disabled={btnConfig.disabled}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${btnConfig.className}`}
        >
          {btnConfig.icon}
          {btnConfig.text}
        </button>

        <button className="w-full py-4 border border-gray-200 rounded-2xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          <Settings size={18} /> 修改账户设置
        </button>
      </div>
    </div>
  );
};