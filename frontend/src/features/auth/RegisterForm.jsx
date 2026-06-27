import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../api';
import { useI18n } from '../i18n/I18nProvider';

export const RegisterForm = ({ onSuccess }) => {
  const { login } = useAuth();
  const { t } = useI18n();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const res = await api.auth.register(data);
      login(res); // 注册接口返回的直接是 user 对象
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">{t("modal.reg.title")}</h3>
      <input name="name" placeholder="Full Name" className="w-full border p-2 rounded" required />
      <input name="email" type="email" placeholder="Email" className="w-full border p-2 rounded" required />
      <input name="phone" placeholder="Phone Number" className="w-full border p-2 rounded" required />
      <input name="password" type="password" placeholder="Password" className="w-full border p-2 rounded" required />
      <button className="w-full bg-[#8c4b37] hover:bg-[#7a4130] text-white py-2 rounded font-bold transition">
        {t("modal.reg.btn")}
      </button>
    </form>
  );
};