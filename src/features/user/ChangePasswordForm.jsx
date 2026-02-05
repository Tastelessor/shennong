import React, { useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../providers/AuthProvider';
import { Lock, Save } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export const ChangePasswordForm = ({ onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("✖️两次输入的新密码不一致");
    }
    if (formData.newPassword.length < 6) {
      return alert("✖️新密码长度不能少于6位");
    }

    setLoading(true);
    try {
      await api.user.updatePassword({
        userId: user.id,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      alert("☑️密码修改成功，请妥善保管新密码");
      onClose();
    } catch (err) {
      alert("✖️修改失败: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-4 border-b pb-4">
        <Lock className="text-[#4a6741]" />
        <h3 className="text-xl font-bold">{ t("user.center.passwd") }</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{ t("user.center.passwd.now") }</label>
        <input 
          type="password" name="oldPassword" required
          value={formData.oldPassword} onChange={handleChange}
          className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#4a6741] outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{ t("user.center.passwd.new") }</label>
        <input 
          type="password" name="newPassword" required
          value={formData.newPassword} onChange={handleChange}
          className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#4a6741] outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{ t("user.center.passwd.confirm") }</label>
        <input 
          type="password" name="confirmPassword" required
          value={formData.confirmPassword} onChange={handleChange}
          className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#4a6741] outline-none"
        />
      </div>

      <button 
        disabled={loading}
        className="w-full bg-[#4a6741] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
      >
        <Save size={18} /> {loading ? "Loading..." : t("user.center.passwd")}
      </button>
    </form>
  );
};