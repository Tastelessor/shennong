import React, { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useI18n } from '../features/i18n/I18nProvider';
import { Send, MessageSquare, Clock } from 'lucide-react';
import { useSocket } from '../providers/SocketProvider';
import { api } from '../api';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const socket = useSocket();

  const [sessions, setSessions] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  /* --------- 拉取会话 & 轮询 --------- */
  useEffect(() => {
    const fetchSessions = () =>
      api.agent
        .getSession()
        .then(data => setSessions(data.sort((a, b) => new Date(b.lastMsgTime) - new Date(a.lastMsgTime))));

    fetchSessions();
    const timer = setInterval(fetchSessions, 5000);

    return () => clearInterval(timer);
  }, []);

  /* --------- 监听新消息 --------- */
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (msg.roomId === activeRoom) setMessages(prev => [...prev, msg]);
      api.agent.getSession().then(setSessions);
    };

    socket.on('receive_message', handler);
    return () => socket.off('receive_message', handler);
  }, [socket, activeRoom]);

  const selectRoom = (roomId) => {
    setActiveRoom(roomId);
    socket.emit('join_room', roomId);
api.chat.getHistory(roomId).then(data => {
      setMessages(data);
    });
api.chat.markRead(roomId).then(() => {
      fetchSessions();
    });
  };

  const sendReply = () => {
    if (!input.trim() || !activeRoom) return;
    const msg = { roomId: activeRoom, senderName: user.name, senderRole: 'agent', content: input };
    socket.emit('send_message', msg);
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  return (
    <>
      {/* 左侧会话列表 */}
      <div className="w-80 bg-white border-r overflow-y-auto custom-scrollbar flex-shrink-0">
        <div className="p-4 font-bold border-b bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
          {t('agent.waiting')}
        </div>
        {sessions.map(s => (
          <div
            key={s.roomId}
            onClick={() => selectRoom(s.roomId)}
            className={`p-4 border-b cursor-pointer transition relative flex gap-3 ${activeRoom === s.roomId ? 'bg-green-50' : 'hover:bg-gray-50'
              }`}
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                {s.senderName[0]}
              </div>
              {s.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {s.unreadCount > 99 ? '99+' : s.unreadCount}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-800 truncate">{s.senderName}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(s.lastMsgTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{s.content}</p>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="p-10 text-center text-gray-400 italic">{t('agent.empty')}</p>
        )}
      </div>

      {/* 右侧聊天窗口 */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5]">
        {activeRoom ? (
          <>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderRole === 'agent' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${m.senderRole === 'agent'
                        ? 'bg-[#4a6741] text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border'
                      }`}
                  >
                    {m.senderRole !== 'agent' && (
                      <p className="text-[10px] opacity-50 mb-1">{m.senderName}</p>
                    )}
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
              <button
                onClick={sendReply}
                className="bg-[#4a6741] hover:bg-[#3d5535] text-white p-3 rounded-full transition shadow-lg"
              >
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