import React, { useState, useRef, useEffect } from 'react';
import axios from '../services/axios';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  X,
  Trash2,
  Bot,
  User as UserIcon,
  Loader2,
  ChevronDown,
  RefreshCw,
  Heart,
  Stethoscope,
  Users,
} from 'lucide-react';

const roleConfig = {
  patient: {
    title: 'CareMate Companion',
    badge: 'Patient Assistant',
    badgeColor: 'bg-blue-100 text-blue-700',
    headerBg: 'bg-gradient-to-r from-blue-600 to-cyan-500',
    btnBg: 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600',
    userBubble: 'bg-blue-600 text-white',
    icon: Heart,
    suggestions: [
      'What are my medicines today?',
      'What is my daily schedule?',
      'What tasks do I have today?',
      'How do I view my Memory Book?',
    ],
  },
  caregiver: {
    title: 'Caregiver Advisor',
    badge: 'Caregiver AI',
    badgeColor: 'bg-teal-100 text-teal-800',
    headerBg: 'bg-gradient-to-r from-teal-600 to-cyan-600',
    btnBg: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700',
    userBubble: 'bg-teal-600 text-white',
    icon: Users,
    suggestions: [
      'Overview of patient medications',
      'Today\'s task completion progress',
      'Upcoming doctor appointments',
      'Tips for handling sundowning agitation',
    ],
  },
  doctor: {
    title: 'Clinical AI Assistant',
    badge: 'Clinical Insights',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    headerBg: 'bg-gradient-to-r from-indigo-700 to-blue-600',
    btnBg: 'bg-gradient-to-r from-indigo-700 to-blue-600 hover:from-indigo-800 hover:to-blue-700',
    userBubble: 'bg-indigo-600 text-white',
    icon: Stethoscope,
    suggestions: [
      'Summarize active medications for this patient',
      'Show routine schedule adherence',
      'Review upcoming appointments',
      'List all my assigned patients',
    ],
  },
};

const AIChat = ({ patientId, patientName }) => {
  const { user } = useAuth();
  const role = user?.role || 'patient';
  const config = roleConfig[role] || roleConfig.patient;
  const RoleIcon = config.icon;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    return [
      {
        id: 'init-1',
        sender: 'bot',
        text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your ${config.title}. How can I assist you right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/ai/chat', {
        question: query,
        patientId: patientId || undefined,
      });

      const reply = res.data?.answer || 'I am here to assist you.';
      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Could not reach the assistant. Please try again.');
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, I had trouble processing that. Please check your connection or try again.',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Conversation cleared. How can I help you today, ${user?.name ? user.name.split(' ')[0] : ''}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError('');
  };

  return (
    <>
      {/* =====================================================
          CHAT WINDOW MODAL / POPUP
      ====================================================== */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[580px] w-[92vw] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 sm:right-8 sm:w-[420px]">
          
          {/* HEADER */}
          <div className={`${config.headerBg} p-4 text-white shadow-md`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <RoleIcon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {config.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[11px] font-semibold text-white/80">
                      {patientName ? `Context: ${patientName}` : 'Online & Active'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear Conversation"
                  className="rounded-xl p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className="rounded-xl p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* MESSAGES CONTAINER */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm border border-slate-100 mt-1">
                    <Bot size={17} />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? `${config.userBubble} rounded-br-none`
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line font-medium">
                    {msg.text}
                  </div>
                  <div
                    className={`mt-1 text-[10px] ${
                      msg.sender === 'user' ? 'text-white/70 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 shadow-sm mt-1">
                    <UserIcon size={16} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 text-slate-500">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm border border-slate-100">
                  <Bot size={17} />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-xs font-semibold shadow-sm text-slate-500">
                  <Loader2 size={15} className="animate-spin text-blue-600" />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTION CHIPS */}
          <div className="border-t border-slate-100 bg-white px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              Suggestions
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {config.suggestions.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-slate-100 bg-white p-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${config.title}...`}
              disabled={loading}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 ${config.btnBg}`}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* =====================================================
          FLOATING TRIGGER BUTTON
      ====================================================== */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full px-5 py-3.5 text-white shadow-2xl transition duration-300 hover:scale-105 active:scale-95 ${config.btnBg}`}
        aria-label="Toggle AI Assistant"
      >
        <Sparkles size={20} className="animate-spin-slow" />
        <span className="font-extrabold text-sm tracking-wide hidden sm:inline">
          {config.badge}
        </span>
      </button>
    </>
  );
};

export default AIChat;
