import React, { useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../providers/AuthProvider';
import { FileText, CheckCircle2, Clock } from 'lucide-react';

export const PartnerForm = ({ status, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    formData.append('userId', user.id);

    try {
      await api.partner.apply(formData);
      alert("Application submitted!");
      onClose();
      window.location.reload(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'pending') {
    return (
      <div className="text-center py-8">
        <Clock size={48} className="mx-auto text-blue-500 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold mb-2">审核中</h3>
        <p className="text-gray-500 text-sm px-6">您的合伙人申请已提交，管理员正在核验营业执照信息，请耐心等待 1-3 个工作日。</p>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="text-center py-8">
        <CheckCircle2 size={48} className="mx-auto text-amber-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">认证成功</h3>
        <p className="text-gray-500 text-sm">您已获得合伙人资质，现在可以查看您的邀请网络统计数据。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="text-[#4a6741]" /> 申请合伙人资质
      </h3>
      
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">公司名称</label>
        <input name="companyName" className="w-full border p-2.5 rounded-lg outline-none focus:border-[#4a6741]" required />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">社会信用代码</label>
        <input name="creditCode" className="w-full border p-2.5 rounded-lg outline-none focus:border-[#4a6741]" required />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">营业执照 (JPG/PDF)</label>
        <input name="license" type="file" accept=".jpg,.jpeg,.png,.pdf" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-[#4a6741] hover:file:bg-green-100" required />
      </div>

      <button 
        disabled={loading}
        className="w-full bg-[#4a6741] text-white py-3 rounded-xl font-bold mt-4 disabled:opacity-50"
      >
        {loading ? "提交中..." : "立即提交申请"}
      </button>
    </form>
  );
};