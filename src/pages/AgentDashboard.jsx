import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useI18n } from '../features/i18n/I18nProvider';
import { Send, MessageSquare, Clock } from 'lucide-react';
import { useSocket } from '../providers/SocketProvider';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const socket = useSocket();

  const [sessions, setSessions] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchSessions = () => {
      fetch("http://localhost:3000/api/agent/sessions")
        .then(res => res.json())
        .then(setSessions);
    };

    fetchSessions();
    const timer = setInterval(fetchSessions, 5000);

    socket.on('receive_message', (msg) => {
      if (activeRoom && msg.roomId === activeRoom) {
        setMessages(prev => [...prev, msg]);
      }
      fetchSessions();
    });

    return () => {
      clearInterval(timer);
      socket.disconnect();
    };
  }, [activeRoom]);

  const selectRoom = (roomId) => {
    setActiveRoom(roomId);
    socket.emit('join_room', roomId);
    fetch(`http://localhost:3000/api/chat/history?roomId=${roomId}`)
      .then(res => res.json())
      .then(setMessages);
  };

  const sendReply = () => {
    if (!input.trim() || !activeRoom) return;
    const msg = {
      roomId: activeRoom,
      senderName: user.name,
      senderRole: 'agent',
      content: input
    };
    socket.emit('send_message', msg);
    setMessages(prev => [...prev, msg]);
    setInput("");
  };

  return (
    <>
      {/* Left Sidebar: Session List */}
      <div className="w-80 bg-white border-r overflow-y-auto custom-scrollbar flex-shrink-0">
        <div className="p-4 font-bold border-b bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
          {t("agent.waiting")}
        </div>
        {sessions.map(s => (
          <div 
            key={s.roomId} 
            onClick={() => selectRoom(s.roomId)}
            className={`p-4 border-b cursor-pointer transition relative group ${activeRoom === s.roomId ? 'bg-green-50' : 'hover:bg-gray-50'}`}
          >
            {activeRoom === s.roomId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4a6741]" />}
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-gray-800">{s.senderName}</span>
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Clock size={10} /> {new Date(s.lastMsgTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">{s.content}</p>
          </div>
        ))}
        {sessions.length === 0 && <p className="p-10 text-center text-gray-400 italic">{t("agent.empty")}</p>}
      </div>

      {/* Right Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5]">
        {activeRoom ? (
          <>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderRole === 'agent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${
                    m.senderRole === 'agent' 
                      ? 'bg-[#4a6741] text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border'
                  }`}>
                    {m.senderRole !== 'agent' && <p className="text-[10px] opacity-50 mb-1">{m.senderName}</p>}
                    <p>{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-white border-t flex gap-3 items-center">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendReply()}
                placeholder="Type a reply..."
                className="flex-1 bg-gray-100 border-0 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#4a6741]" 
              />
              <button onClick={sendReply} className="bg-[#4a6741] hover:bg-[#3d5535] text-white p-3 rounded-full transition shadow-lg">
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={64} className="mb-4 opacity-10" />
            <p>Select a chat from the sidebar to start assisting.</p>
          </div>
        )}
      </div>
    </>
  );
};