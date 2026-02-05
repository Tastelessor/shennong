import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { LoginForm } from '../features/auth/LoginForm';
import { RegisterForm } from '../features/auth/RegisterForm';
import { AppointmentModal } from '../features/appointment/AppointmentModal';
import { HistoryModal } from '../features/appointment/HistoryModal';
import { UserCenter } from '../features/user/UserCenter';
import { PartnerForm } from '../features/user/PartnerForm';
import { ChangePasswordForm } from '../features/user/ChangePasswordForm'; // [新增导入]

export const ModalManager = ({ type, onClose, onSwitch }) => {
  const { user } = useAuth();
  
  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'login': return <LoginForm onSuccess={onClose} />;
      case 'reg': return <RegisterForm onSuccess={onClose} />;
      case 'appt': return <AppointmentModal onSuccess={onClose} onClose={onClose} />;
      case 'history': return <HistoryModal onClose={onClose} />;
      case 'userCenter': 
        return <UserCenter onOpenPartnerForm={() => onSwitch('partnerReg')} onOpenChangePassword={() => onSwitch('changePassword')} />;
      case 'partnerReg': return <PartnerForm status={user?.partnerStatus} onClose={onClose} />;
      case 'changePassword': return <ChangePasswordForm onClose={onClose} />;
      default: return null;
    }
  };

  if (type === 'history') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200">
        {type !== 'appt' && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
};