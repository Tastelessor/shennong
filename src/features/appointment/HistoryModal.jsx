import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { api } from '../../api';
import { X, Calendar, Clock, User } from 'lucide-react';

export const HistoryModal = ({ onClose }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      api.appointment.getHistory(user.id)
        .then(data => {
          // ensure it's array
          setAppointments(Array.isArray(data) ? data.reverse() : []);
        })
        .catch(err => {
          console.error("Failed to fetch history:", err);
          setAppointments([]);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header: dark green */}
      <div className="p-6 border-b flex justify-between items-center bg-[#4a6741] text-white shrink-0">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-green-200"/>
          <h3 className="text-xl font-bold tracking-wide">{t("modal.history.title")}</h3>
        </div>
        <button 
          onClick={onClose} 
          className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* List: Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
            <span className="animate-pulse">Loading records...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <Calendar size={32} className="opacity-40" />
            </div>
            <p className="text-sm">No appointment records found.</p>
          </div>
        ) : (
          appointments.map((a) => (
            <div 
              key={a.id} 
              className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:border-[#4a6741] hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-[#4a6741] text-lg">{a.service}</span>
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                   <Clock size={10} />
                   {a.date.replace('T', ' ')}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={14} className="text-gray-400" />
                  <span>Visitor: <span className="font-medium text-gray-800">{a.userName}</span></span>
                  <span className="text-xs text-gray-400">({a.userPhone})</span>
                </div>
                
                {a.description && (
                  <div className="text-xs text-gray-500 bg-[#fdfbf7] p-2 rounded-lg mt-2 border border-[#4a6741]/10 italic">
                    Note: {a.description}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom */}
      <div className="p-3 bg-gray-50 border-t text-center text-xs text-gray-400 shrink-0">
        Total Records: {appointments.length}
      </div>
    </div>
  );
};