import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { api } from '../../api';
import { X } from 'lucide-react';

export const AppointmentModal = ({ onSuccess, onClose }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [visitors, setVisitors] = useState([]);

  // 获取常用联系人
  useEffect(() => {
    if (user?.id) {
      api.visitors.getAll(user.id).then(setVisitors).catch(console.error);
    }
  }, [user]);

  // 一键填充
  const quickFill = (v) => {
    document.getElementsByName('userName')[0].value = v.name;
    document.getElementsByName('userPhone')[0].value = v.phone;
  };

  // 删除联系人
  const handleDeleteVisitor = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this visitor?")) return;
    try {
      await api.visitors.delete(id);
      setVisitors(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 提交预约
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);

    // 1. 保存联系人逻辑
    if (data.saveVisitor && user) {
      try {
        await api.visitors.create({
          userId: user.id,
          name: data.userName,
          phone: data.userPhone
        });
      } catch (err) {
        console.warn("Visitor save failed", err);
      }
    }

    // 2. 提交预约
    try {
      await api.appointment.create({
        ...data,
        userId: user?.id || 'guest'
      });
      alert("Appointment Successful!");
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
       <button type="button" onClick={onClose} className="absolute -top-4 -right-4 text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>
      
      <h3 className="text-2xl font-bold mb-4 text-[#4a6741]">{t("modal.appt.title")}</h3>

      {/* 常用联系人区域 */}
      {visitors.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">{t("modal.appt.quick")}</p>
          <div className="flex flex-wrap gap-2">
            {visitors.map(v => (
              <div key={v.id} className="relative group">
                <button
                  type="button"
                  onClick={() => quickFill(v)}
                  className="text-xs border border-[#4a6741] text-[#4a6741] bg-white pl-3 pr-6 py-1 rounded-full hover:bg-[#4a6741] hover:text-white transition"
                >
                  {v.name}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteVisitor(e, v.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-500 hover:text-white transition"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input name="userName" placeholder="Name" className="w-full border p-2 rounded" required />
          <input name="userPhone" placeholder="Phone" className="w-full border p-2 rounded" required />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="saveVisitor" name="saveVisitor" className="accent-[#4a6741] w-4 h-4" />
          <label htmlFor="saveVisitor" className="text-xs text-gray-600 cursor-pointer">{t("modal.appt.save")}</label>
        </div>

        <input name="date" type="datetime-local" className="w-full border p-2 rounded" required />
        
        <select name="service" className="w-full border p-2 rounded bg-white">
          <option>Acupuncture (针灸)</option>
          <option>Massage (推拿)</option>
          <option>Herbal Therapy (草药)</option>
          <option>Cupping (拔罐)</option>
        </select>

        <textarea name="description" placeholder="Description of symptoms..." className="w-full border p-2 rounded h-24"></textarea>
        
        <button className="w-full bg-[#4a6741] hover:bg-[#3d5535] text-white py-3 rounded font-bold shadow-md transition transform hover:scale-[1.01]">
          {t("modal.appt.btn")}
        </button>
      </div>
    </form>
  );
};