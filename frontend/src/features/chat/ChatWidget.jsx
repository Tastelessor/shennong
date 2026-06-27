import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useSocket } from '../../providers/SocketProvider'; // Import the hook
import { useI18n } from '../i18n/I18nProvider';
import { MessageSquare, X, Send } from 'lucide-react';

export const ChatWidget = () => {
  const { user } = useAuth();
  const socket = useSocket(); // Get global socket instance
  const { t } = useI18n();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Listen for messages
  useEffect(() => {
    if (!socket) return;

    const handleMsg = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('receive_message', handleMsg);

    return () => {
      socket.off('receive_message', handleMsg);
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMsg = () => {
    if (!input.trim() || !socket) return;

    const msg = {
      roomId: user?.id || "guest_room",
      senderName: user?.name || "Guest",
      senderRole: 'user',
      content: input.trim()
    };
    
    setInput("");
    socket.emit('send_message', msg);
    // Manually add to local list for immediate feedback
    setMessages(prev => [...prev, msg]);
  };

  return (
    <div className="fixed right-6 bottom-10 z-50 flex flex-col items-end gap-4 pointer-events-none">
      {/* Container is pointer-events-none to let clicks pass through, children enable it back */}
      
      {isOpen && (
        <div className="bg-white w-80 h-96 shadow-2xl rounded-xl flex flex-col overflow-hidden border border-gray-200 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto">
          {/* Header */}
          <div className="bg-[#4a6741] p-4 text-white flex justify-between items-center shadow-sm">
            <span className="font-bold">{t("chat.title")}</span>
            <X onClick={() => setIsOpen(false)} className="cursor-pointer hover:bg-white/20 rounded p-1" size={24} />
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 max-w-[85%] rounded-2xl text-sm shadow-sm ${
                  m.senderRole === 'user' 
                    ? 'bg-[#4a6741] text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  sendMsg();
                }
              }}
              className="flex-1 border-gray-200 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#4a6741]" 
              placeholder={t("chat.placeholder")} 
            />
            <button onClick={sendMsg} className="bg-[#4a6741] hover:bg-[#3d5535] text-white p-2 rounded-full transition">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-[#8c4b37] hover:bg-[#7a4130] text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 pointer-events-auto"
      >
        <MessageSquare /> 
        <span className="font-bold">{t("chat.btn")}</span>
      </button>
    </div>
  );
};