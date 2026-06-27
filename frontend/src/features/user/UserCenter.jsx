import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { api } from '../../api';
import { User, UserPlus, ShieldCheck, Settings, Loader, BarChart3, Clock } from 'lucide-react';

export const UserCenter = ({ onOpenPartnerForm, onOpenChangePassword }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState(null);
  const [inviterId, setInviterId] = useState("");
  const [inviteStats, setInviteStats] = useState(null);

  useEffect(() => {
    if (user) {
      // 获取用户详细信息（包含邀请人、合伙人状态）
      api.user.getProfile(user.id).then(res => {
        setProfile(res);
        // 如果是合伙人，获取统计数据
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
      alert("☑️绑定成功！");
      // 刷新数据
      api.user.getProfile(user.id).then(setProfile);
    } catch (err) {
      alert(err.message || "✖️绑定失败");
    }
  };

  if (!profile) return (
    <div className="p-10 flex flex-col items-center justify-center gap-3 text-gray-400">
      <Loader className="animate-spin text-[#4a6741]" />
      <p className="text-xs">加载用户信息...</p>
    </div>
  );

  // 动态计算合伙人按钮的状态配置
  const getPartnerBtnConfig = () => {
    const status = profile.partnerStatus;
    
    if (status === 'approved') {
      return {
        disabled: true,
        text: t("user.center.partner.already"),
        icon: <ShieldCheck size={18} className="text-amber-700" />,
        className: "bg-amber-100 text-amber-800 border border-amber-200 cursor-default"
      };
    }
    
    if (status === 'pending') {
      return {
        disabled: true,
        text: t("user.center.partner.pending"),
        icon: <Clock size={18} className="animate-pulse" />,
        className: "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
      };
    }

    // 默认状态 (none)
    return {
      disabled: false,
      text: t("user.center.partner.apply"),
      icon: <ShieldCheck size={18} />,
      className: "bg-gray-800 text-white hover:bg-black transition-colors"
    };
  };

  const btnConfig = getPartnerBtnConfig();

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-16 h-16 bg-[#4a6741] rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {profile.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">ID: {profile.id}</span>
            {profile.partnerStatus === 'approved' && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">Partner</span>
            )}
          </div>
        </div>
      </div>

      {/* 邀请人绑定 */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <UserPlus size={16} /> {t("user.inviter")}
        </h3>
        {profile.inviterId ? (
          <div className="text-sm text-[#4a6741] bg-green-50 p-2 rounded border border-green-100 flex justify-between items-center">
            <span>{ t("user.center.bind.already") }</span>
            <span className="font-mono font-bold">{profile.inviterId}</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input 
              value={inviterId} 
              onChange={e => setInviterId(e.target.value)}
              placeholder="Enter the inviter's user ID" 
              className="flex-1 text-sm border p-2 rounded focus:ring-1 focus:ring-[#4a6741] outline-none" 
            />
            <button onClick={handleBind} className="bg-[#4a6741] text-white px-4 py-2 rounded text-sm font-bold">{ t("user.center.bind.button") }</button>
          </div>
        )}
      </div>

      {/* 合伙人统计 (仅限已通过合伙人) */}
      {profile.partnerStatus === 'approved' && inviteStats && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
          <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
            <BarChart3 size={16} /> { t("user.center.team.stat") }
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 p-3 rounded shadow-sm border border-amber-100">
              <p className="text-[10px] text-amber-900/50 uppercase font-bold">A { t("user.center.team.scale") }</p>
              <p className="text-xl font-black text-amber-700">{inviteStats.teamACount} <span className="text-xs font-normal opacity-60"></span></p>
            </div>
            <div className="bg-white/60 p-3 rounded shadow-sm border border-amber-100">
              <p className="text-[10px] text-amber-900/50 uppercase font-bold">B { t("user.center.team.scale") }</p>
              <p className="text-xl font-black text-amber-700">{inviteStats.teamBCount} <span className="text-xs font-normal opacity-60"></span></p>
            </div>
          </div>
        </div>
      )}

      {/* 功能按钮区 */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        {/* 合伙人申请按钮 (根据状态动态渲染) */}
        <button 
          onClick={!btnConfig.disabled ? onOpenPartnerForm : undefined}
          disabled={btnConfig.disabled}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${btnConfig.className}`}
        >
          {btnConfig.icon}
          {btnConfig.text}
        </button>

        {/* 修改密码按钮 (已修复：绑定 onClick 事件) */}
        <button 
          onClick={onOpenChangePassword}
          className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Settings size={18} /> { t("user.center.passwd") }
        </button>
      </div>
    </div>
  );
};