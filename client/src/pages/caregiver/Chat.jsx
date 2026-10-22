import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Stethoscope,
  User,
  CheckCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import AIChat from '../../components/AIChat';

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);

  const [messageText, setMessageText] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =========================================================
  // LOAD DOCTORS
  // =========================================================

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setError('');

      const response = await axios.get('/messages/doctors');

      const doctorList = Array.isArray(response.data)
        ? response.data
        : [];

      setDoctors(doctorList);

      if (doctorList.length > 0) {
        setSelectedDoctor((currentDoctor) => {
          if (!currentDoctor) {
            return doctorList[0];
          }

          const stillExists = doctorList.find(
            (doctor) => doctor._id === currentDoctor._id
          );

          return stillExists || doctorList[0];
        });
      } else {
        setSelectedDoctor(null);
      }
    } catch (err) {
      console.error('Load doctors error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load doctors. Please try again.'
      );
    } finally {
      setLoadingDoctors(false);
    }
  };

  // =========================================================
  // LOAD MESSAGES
  // =========================================================

  const loadMessages = async (doctorId, showLoader = true) => {
    if (!doctorId) return;

    try {
      if (showLoader) {
        setLoadingMessages(true);
      }

      setError('');

      const response = await axios.get(`/messages/${doctorId}`);

      const messageList = Array.isArray(response.data)
        ? response.data
        : [];

      setMessages(messageList);

      try {
        await axios.put(`/messages/${doctorId}/read`);
      } catch (readError) {
        console.warn(
          'Unable to mark messages as read:',
          readError
        );
      }
    } catch (err) {
      console.error('Load messages error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load messages. Please try again.'
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDoctors();
  }, []);

  // =========================================================
  // LOAD SELECTED DOCTOR MESSAGES
  // =========================================================

  useEffect(() => {
    if (!selectedDoctor?._id) {
      setMessages([]);
      return;
    }

    loadMessages(selectedDoctor._id);
  }, [selectedDoctor?._id]);

  // =========================================================
  // AUTO REFRESH
  // =========================================================

  useEffect(() => {
    if (!selectedDoctor?._id) return;

    const interval = setInterval(() => {
      loadMessages(selectedDoctor._id, false);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedDoctor?._id]);

  // =========================================================
  // SORT MESSAGES
  // =========================================================

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }, [messages]);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatMessageDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (
      !trimmedMessage ||
      !selectedDoctor?._id ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/messages', {
        receiver: selectedDoctor._id,
        message: trimmedMessage,
      });

      setMessages((previous) => [
        ...previous,
        response.data,
      ]);

      setMessageText('');
    } catch (err) {
      console.error('Send message error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to send message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  // =========================================================
  // ENTER TO SEND
  // =========================================================

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (!sending) {
        sendMessage(event);
      }
    }
  };

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (name = '') => {
    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
          part.charAt(0).toUpperCase()
        )
        .join('') || 'DR'
    );
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setSuccess('');
    setError('');

    await loadDoctors();

    if (selectedDoctor?._id) {
      await loadMessages(selectedDoctor._id);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                navigate('/caregiver/dashboard')
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              title="Back to Dashboard"
            >
              <ArrowLeft size={19} />
            </button>

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                CAREMATE
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Care Team Chat
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Communicate securely with the patient's doctor.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>

        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8">

        {/* ERROR */}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">

            <AlertCircle size={19} />

            <span>{error}</span>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        )}

        {/* CHAT CONTAINER */}

        <div className="grid min-h-[calc(100vh-190px)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">

          {/* DOCTOR LIST */}

          <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">

            <div className="border-b border-slate-200 bg-white px-5 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Stethoscope size={21} />
                </div>

                <div>

                  <h2 className="font-extrabold text-slate-900">
                    Doctors
                  </h2>

                  <p className="text-xs text-slate-500">
                    Care team members
                  </p>

                </div>

              </div>

            </div>

            <div className="max-h-[300px] overflow-y-auto p-3 lg:max-h-[calc(100vh-270px)]">

              {loadingDoctors ? (

                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">

                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    Loading doctors...
                  </p>

                </div>

              ) : doctors.length === 0 ? (

                <div className="px-4 py-10 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Stethoscope size={25} />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    No doctors available
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Registered doctors will appear here
                    when they are available for communication.
                  </p>

                </div>

              ) : (

                <div className="space-y-2">

                  {doctors.map((doctor) => {

                    const isSelected =
                      selectedDoctor?._id === doctor._id;

                    return (
                      <button
                        key={doctor._id}
                        type="button"
                        onClick={() =>
                          setSelectedDoctor(doctor)
                        }
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? 'border-blue-200 bg-blue-50 shadow-sm'
                            : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-cyan-50 text-cyan-700'
                            }`}
                          >
                            {getInitials(doctor.name)}
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-extrabold text-slate-900">
                              Dr. {doctor.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {doctor.email}
                            </p>

                          </div>

                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              isSelected
                                ? 'bg-blue-500'
                                : 'bg-emerald-400'
                            }`}
                          />

                        </div>

                      </button>
                    );

                  })}

                </div>

              )}

            </div>

          </aside>

          {/* CHAT AREA */}

          <section className="flex min-h-[650px] flex-col bg-slate-50">

            {selectedDoctor ? (

              <>

                {/* CHAT HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-extrabold text-white">
                      {getInitials(selectedDoctor.name)}
                    </div>

                    <div className="min-w-0">

                      <h2 className="truncate font-extrabold text-slate-900">
                        Dr. {selectedDoctor.name}
                      </h2>

                      <div className="mt-1 flex items-center gap-2">

                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        <span className="text-xs font-semibold text-slate-500">
                          Doctor · Care Team
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="hidden items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 sm:flex">

                    <MessageCircle size={15} />

                    Secure Chat

                  </div>

                </div>

                {/* MESSAGES */}

                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-7">

                  {loadingMessages ? (

                    <div className="flex h-full min-h-[450px] items-center justify-center">

                      <div className="text-center">

                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                        <p className="mt-4 text-sm font-semibold text-slate-500">
                          Loading conversation...
                        </p>

                      </div>

                    </div>

                  ) : sortedMessages.length === 0 ? (

                    <div className="flex min-h-[450px] items-center justify-center">

                      <div className="max-w-md text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                          <MessageCircle size={30} />
                        </div>

                        <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                          Start a conversation
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Send a message to Dr.{' '}
                          {selectedDoctor.name}{' '}
                          about the patient's care,
                          appointments, medicines or
                          other important concerns.
                        </p>

                      </div>

                    </div>

                  ) : (

                    <div className="mx-auto max-w-3xl space-y-5">

                      {sortedMessages.map((item, index) => {

                        const senderId =
                          item.sender?._id ||
                          item.sender?.id ||
                          item.sender;

                        const currentUserId =
                          user?.id || user?._id;

                        const isMine =
                          String(senderId) ===
                          String(currentUserId);

                        const previousMessage =
                          sortedMessages[index - 1];

                        const currentDate =
                          formatMessageDate(
                            item.createdAt
                          );

                        const previousDate =
                          previousMessage
                            ? formatMessageDate(
                                previousMessage.createdAt
                              )
                            : null;

                        return (
                          <React.Fragment
                            key={
                              item._id ||
                              `${item.createdAt}-${index}`
                            }
                          >

                            {currentDate !==
                              previousDate && (

                              <div className="flex items-center justify-center py-2">

                                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-400 shadow-sm">
                                  {currentDate}
                                </span>

                              </div>

                            )}

                            <div
                              className={`flex ${
                                isMine
                                  ? 'justify-end'
                                  : 'justify-start'
                              }`}
                            >

                              <div
                                className={`flex max-w-[85%] items-end gap-2 sm:max-w-[70%] ${
                                  isMine
                                    ? 'flex-row-reverse'
                                    : 'flex-row'
                                }`}
                              >

                                {!isMine && (

                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-extrabold text-blue-700">

                                    {getInitials(
                                      item.sender?.name ||
                                        selectedDoctor.name
                                    )}

                                  </div>

                                )}

                                <div>

                                  <div
                                    className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                      isMine
                                        ? 'rounded-br-md bg-blue-600 text-white'
                                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                                    }`}
                                  >
                                    {item.message}
                                  </div>

                                  <div
                                    className={`mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400 ${
                                      isMine
                                        ? 'justify-end'
                                        : 'justify-start'
                                    }`}
                                  >

                                    <span>
                                      {formatMessageTime(
                                        item.createdAt
                                      )}
                                    </span>

                                    {isMine && (
                                      <CheckCheck
                                        size={13}
                                        className="text-blue-500"
                                      />
                                    )}

                                  </div>

                                </div>

                              </div>

                            </div>

                          </React.Fragment>
                        );
                      })}

                    </div>

                  )}

                </div>

                {/* MESSAGE INPUT */}

                <div className="border-t border-slate-200 bg-white p-4 sm:p-5">

                  <form
                    onSubmit={sendMessage}
                    className="mx-auto flex max-w-3xl items-end gap-3"
                  >

                    <textarea
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(event.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder={`Message Dr. ${selectedDoctor.name}...`}
                      className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="submit"
                      disabled={
                        !messageText.trim() || sending
                      }
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Send message"
                    >

                      {sending ? (

                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      ) : (

                        <Send size={19} />

                      )}

                    </button>

                  </form>

                  <p className="mx-auto mt-2 max-w-3xl text-[11px] font-medium text-slate-400">
                    Press Enter to send · Shift + Enter for a new line
                  </p>

                </div>

              </>

            ) : (

              <div className="flex flex-1 items-center justify-center p-8">

                <div className="max-w-md text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                    <User size={34} />
                  </div>

                  <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
                    Select a doctor
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose a doctor from the care team to
                    start a secure conversation.
                  </p>

                </div>

              </div>

            )}

          </section>

        </div>

      </main>
      <AIChat />
    </div>
  );
};

export default Chat;