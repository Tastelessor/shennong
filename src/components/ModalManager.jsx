import React from 'react';
import { X } from 'lucide-react';
import { LoginForm } from '../features/auth/LoginForm';
import { RegisterForm } from '../features/auth/RegisterForm';
import { AppointmentModal } from '../features/appointment/AppointmentModal';
import { HistoryModal } from '../features/appointment/HistoryModal';

export const ModalManager = ({ type, onClose }) => {
  if (!type) return null;

  // Render logic based on type
  const renderContent = () => {
    switch (type) {
      case 'login':
        return <LoginForm onSuccess={onClose} />;
      case 'reg':
        return <RegisterForm onSuccess={onClose} />;
      case 'appt':
        return <AppointmentModal onSuccess={onClose} onClose={onClose} />;
      case 'history':
        // HistoryModal handles its own header/structure, so we return it directly
        // But we wrap it in specific styles if needed, or let it handle itself.
        // In this case, HistoryModal has its own close button and header.
        return <HistoryModal onClose={onClose} />;
      default:
        return null;
    }
  };

  // Special case for HistoryModal which has full custom styling (no default padding wrapper)
  if (type === 'history') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
        {renderContent()}
      </div>
    );
  }

  // Default Modal Wrapper for Forms (Login/Reg/Appt)
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button (ApptModal handles its own close button inside for layout reasons, others use this) */}
        {type !== 'appt' && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        )}
        
        {renderContent()}
      </div>
    </div>
  );
};