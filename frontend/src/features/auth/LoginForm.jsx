import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../api';
import { useI18n } from '../i18n/I18nProvider';
import { useNavigate } from 'react-router-dom';

export const LoginForm = ({ onSuccess }) => {
    const { login } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const res = await api.auth.login(data);
            login(res.user);
            if (onSuccess) onSuccess();
            if (res.user.role === 'admin') {
                navigate('/admin');
            } else if (res.user.role === 'agent') {
                navigate('/agent');
            } else {
                navigate('/');
            }
        } catch (err) {
            alert(err.message || "Login failed");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">{t("modal.login.title")}</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#4a6741] outline-none" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input name="password" type="password" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#4a6741] outline-none" required />
            </div>
            <button className="w-full bg-[#4a6741] hover:bg-[#3d5535] text-white py-2 rounded font-bold transition">
                {t("modal.login.btn")}
            </button>
        </form>
    );
};