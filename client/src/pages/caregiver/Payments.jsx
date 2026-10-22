import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import PaymentReceiptModal from '../../components/PaymentReceiptModal';
import AIChat from '../../components/AIChat';
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  User,
  Stethoscope,
  Printer,
  ChevronRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react';

const CaregiverPayments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [historyPayments, setHistoryPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [config, setConfig] = useState(null);

  // Pay Now Modal State
  const [selectedPaymentForPay, setSelectedPaymentForPay] = useState(null);
  const [payModalTab, setPayModalTab] = useState('qr'); // 'qr' | 'intent'
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [payError, setPayError] = useState('');

  // Receipt Modal
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);

  // 1. Fetch Gateway Public Config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('/payments/config');
        setConfig(res.data);
      } catch (err) {
        console.warn('Could not load payment configuration:', err);
      }
    };
    fetchConfig();
  }, []);

  // 2. Fetch Caregiver Payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/payments/caregiver');
      const all = res.data?.payments || [];
      const pending = res.data?.pending || all.filter((p) => p.status === 'PENDING');
      const hist = res.data?.history || all.filter((p) => p.status !== 'PENDING');

      setPayments(all);
      setPendingPayments(pending);
      setHistoryPayments(hist);

      // Auto switch to history if no pending payments
      if (pending.length === 0 && hist.length > 0) {
        setActiveTab('history');
      }
    } catch (err) {
      console.error('Failed to load caregiver payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // 3. Poll payment status while Pay Modal is open (in case user paid on mobile app)
  useEffect(() => {
    if (!selectedPaymentForPay || paymentSuccessData) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/payments/${selectedPaymentForPay._id}`);
        const current = res.data?.payment;
        if (
          current &&
          (current.status === 'SUCCESSFUL' || current.status === 'DEMO_SUCCESSFUL')
        ) {
          setPaymentSuccessData(current);
          fetchPayments();
        }
      } catch (e) {
        // Ignore background polling errors
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedPaymentForPay, paymentSuccessData, fetchPayments]);

  // Open Payment Screen
  const handleOpenPayModal = (payment) => {
    setSelectedPaymentForPay(payment);
    setPaymentSuccessData(null);
    setPayError('');
    setPayModalTab('qr');
  };

  // Close Payment Screen
  const handleClosePayModal = () => {
    setSelectedPaymentForPay(null);
    setPaymentSuccessData(null);
    setPayError('');
    fetchPayments();
  };

  // Simulate Demo Payment (Sandbox Mode)
  const handleSimulateDemoPayment = async () => {
    if (!selectedPaymentForPay) return;
    try {
      setPaymentProcessing(true);
      setPayError('');

      const res = await axios.post(`/payments/${selectedPaymentForPay._id}/verify`, {
        isDemoSimulation: true,
        paymentMethod: 'DEMO_UPI',
        payerVpa: 'caregiver.demo@upi',
      });

      if (res.data?.success) {
        setPaymentSuccessData(res.data.payment);
        fetchPayments();
      } else {
        setPayError(res.data?.message || 'Payment simulation failed');
      }
    } catch (err) {
      console.error('Demo payment error:', err);
      setPayError(err.response?.data?.message || 'Failed to simulate demo payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Initiate Real Gateway / Razorpay Flow
  const handleRealGatewayPayment = async () => {
    if (!selectedPaymentForPay) return;

    try {
      setPaymentProcessing(true);
      setPayError('');

      // 1. Prepare Order
      const orderRes = await axios.post(
        `/payments/${selectedPaymentForPay._id}/create-order`
      );
      const orderData = orderRes.data;

      // Check if Razorpay checkout script is available or load it
      if (typeof window.Razorpay === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
          script.onerror = () => resolve();
        });
      }

      if (typeof window.Razorpay !== 'undefined' && orderData.keyId) {
        const options = {
          key: orderData.keyId,
          amount: Math.round(Number(orderData.amount) * 100),
          currency: orderData.currency || 'INR',
          name: 'CareMate Health',
          description: selectedPaymentForPay.purpose,
          order_id: orderData.gatewayOrderId,
          prefill: {
            name: user?.name || 'Caregiver',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: {
            color: '#4f46e5',
          },
          handler: async (response) => {
            try {
              const verifyRes = await axios.post(
                `/payments/${selectedPaymentForPay._id}/verify`,
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  paymentMethod: 'UPI',
                }
              );

              if (verifyRes.data?.success) {
                setPaymentSuccessData(verifyRes.data.payment);
                fetchPayments();
              } else {
                setPayError(verifyRes.data?.message || 'Signature verification failed');
              }
            } catch (vErr) {
              setPayError(vErr.response?.data?.message || 'Verification failed');
            }
          },
          modal: {
            ondismiss: () => {
              setPaymentProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback to UPI Intent directly
        if (orderData.qrPayload) {
          window.location.href = orderData.qrPayload;
        } else {
          setPayError('UPI Intent URI is unavailable. Please use the QR code.');
        }
      }
    } catch (err) {
      console.error('Payment checkout initiation failed:', err);
      setPayError(err.response?.data?.message || 'Could not initialize payment gateway');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Launch Specific UPI Deep Link
  const handleLaunchUPIApp = (appType) => {
    if (!selectedPaymentForPay?.qrPayload) return;
    const rawPayload = selectedPaymentForPay.qrPayload;

    let targetUri = rawPayload;
    if (appType === 'gpay') {
      targetUri = rawPayload.replace('upi://pay', 'gpay://upi/pay');
    } else if (appType === 'phonepe') {
      targetUri = rawPayload.replace('upi://pay', 'phonepe://upi/pay');
    } else if (appType === 'paytm') {
      targetUri = rawPayload.replace('upi://pay', 'paytmmp://upi/pay');
    }

    // Try opening deep link
    window.location.href = targetUri;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/caregiver/dashboard')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              title="Back to Dashboard"
            >
              <ArrowLeft size={19} />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                CAREMATE
              </p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight sm:text-3xl text-slate-900">
                Payments & Billing
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Review consultation invoices and pay securely via Unified Payments Interface (UPI).
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {config?.isDemo ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-800 border border-amber-200">
                <AlertTriangle size={14} className="text-amber-600" />
                <span>Sandbox / Demo Mode</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 border border-emerald-200">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Gateway Active</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 space-y-6">
        
        {/* DEMO BANNER IF ACTIVE */}
        {config?.isDemo && (
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-amber-900 font-black">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900">
                  Payment Gateway: Sandbox / Demo Mode
                </p>
                <p className="text-xs text-amber-700">
                  No payment gateway keys configured on the server. You can simulate test payments safely without real funds.
                </p>
              </div>
            </div>
            <span className="rounded-xl bg-amber-200/80 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-900 shrink-0">
              DEMO MODE
            </span>
          </div>
        )}

        {/* TABS SWITCHER */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-black transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock size={16} />
            <span>Pending Payment Requests</span>
            {pendingPayments.length > 0 && (
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-extrabold text-white">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-black transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>Payment History & Receipts</span>
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-extrabold text-slate-600">
              {historyPayments.length}
            </span>
          </button>
        </div>

        {/* --------------------------------------------------
            TAB 1: PENDING PAYMENTS SECTION
        -------------------------------------------------- */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm font-semibold">
                Loading pending payment requests...
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
                <h3 className="text-lg font-black text-slate-800">
                  No Pending Invoices!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All clinical consultation and medical care requests have been settled. Any new requests from the attending doctor will appear here.
                </p>
                {historyPayments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 pt-2"
                  >
                    <span>View settled payment history</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pendingPayments.map((p) => {
                  const dateStr = new Date(p.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={p._id}
                      className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* CARD BADGES */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700 border border-blue-100">
                            <Clock size={13} /> Payment Request
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {dateStr}
                          </span>
                        </div>

                        {/* DOCTOR & PATIENT DETAILS */}
                        <div className="space-y-2 mb-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              Attending Doctor
                            </span>
                            <p className="text-base font-black text-slate-900 flex items-center gap-1.5">
                              <Stethoscope size={16} className="text-blue-600" />
                              Dr. {p.doctor?.name || 'Practitioner'}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              For Patient
                            </span>
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <User size={14} className="text-slate-400" />
                              {p.patient?.name || 'Patient'}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              Purpose
                            </span>
                            <p className="text-xs font-extrabold text-blue-900 bg-blue-50/70 p-2 rounded-xl border border-blue-100/60">
                              {p.purpose}
                            </p>
                          </div>
                        </div>

                        {/* AMOUNT DISPLAY */}
                        <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 p-4 border border-slate-100 mb-5">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                            Payable Amount
                          </span>
                          <span className="text-3xl font-black text-blue-600">
                            ₹{Number(p.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* PAY NOW BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleOpenPayModal(p)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-4 text-xs font-black text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 transition active:scale-95"
                      >
                        <CreditCard size={16} />
                        <span>Pay Now via UPI</span>
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------
            TAB 2: PAYMENT HISTORY & RECEIPTS
        -------------------------------------------------- */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm font-semibold">
                Loading payment history...
              </div>
            ) : historyPayments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText size={40} className="mx-auto text-slate-300" />
                <h3 className="text-base font-black text-slate-800">
                  No Past Payments Recorded
                </h3>
                <p className="text-xs text-slate-400">
                  Completed payments, receipts, and invoices will appear in this ledger.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Doctor & Patient</th>
                      <th className="py-3.5 px-4">Purpose</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Transaction ID</th>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4 text-right pr-6">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {historyPayments.map((p) => {
                      const dateStr = new Date(p.paidAt || p.createdAt).toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      );
                      const timeStr = new Date(p.paidAt || p.createdAt).toLocaleTimeString(
                        'en-IN',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }
                      );

                      return (
                        <tr key={p._id} className="hover:bg-slate-50/70 transition">
                          
                          {/* DOCTOR & PATIENT */}
                          <td className="py-4 px-4 sm:px-6">
                            <p className="font-extrabold text-slate-900">
                              Dr. {p.doctor?.name || 'Doctor'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              For: {p.patient?.name || 'Patient'}
                            </p>
                          </td>

                          {/* PURPOSE */}
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-800 block">
                              {p.purpose}
                            </span>
                          </td>

                          {/* AMOUNT */}
                          <td className="py-4 px-4">
                            <span className="font-black text-blue-600 text-sm">
                              ₹{Number(p.amount).toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td className="py-4 px-4">
                            {p.status === 'SUCCESSFUL' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                                <CheckCircle2 size={13} /> Paid
                              </span>
                            ) : p.status === 'DEMO_SUCCESSFUL' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                                <AlertTriangle size={13} className="text-amber-600" /> Demo Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                {p.status}
                              </span>
                            )}
                          </td>

                          {/* TRANSACTION ID */}
                          <td className="py-4 px-4">
                            <span className="font-mono text-[11px] text-slate-600 block truncate max-w-[140px]">
                              {p.transactionId || 'N/A'}
                            </span>
                          </td>

                          {/* DATE */}
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-700 block">{dateStr}</span>
                            <span className="text-[10px] text-slate-400 block">{timeStr}</span>
                          </td>

                          {/* RECEIPT BUTTON */}
                          <td className="py-4 px-4 text-right pr-6">
                            {(p.status === 'SUCCESSFUL' || p.status === 'DEMO_SUCCESSFUL') && (
                              <button
                                type="button"
                                onClick={() => setSelectedPaymentForReceipt(p)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition shadow-xs"
                              >
                                <Printer size={13} />
                                <span>Receipt</span>
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ==================================================
          MODAL: CAREGIVER PAYMENT FLOW (QR / UPI INTENT)
      ================================================== */}
      {selectedPaymentForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            
            <button
              type="button"
              onClick={handleClosePayModal}
              className="absolute top-5 right-5 rounded-2xl p-2 text-slate-400 hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            {/* IF PAYMENT ALREADY COMPLETED (SUCCESS VIEW) */}
            {paymentSuccessData ? (
              <div className="text-center py-4 space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-md shadow-emerald-50">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Payment Successful!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your clinical consultation payment has been verified and settled.
                  </p>
                </div>

                {/* DEMO NOTICE IF APPLICABLE */}
                {(paymentSuccessData.status === 'DEMO_SUCCESSFUL' ||
                  paymentSuccessData.isDemo) && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-800 flex items-center justify-center gap-2">
                    <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                    <span>DEMO PAYMENT — NOT A REAL TRANSACTION</span>
                  </div>
                )}

                {/* RECEIPT SUMMARY CARD */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Amount Paid:</span>
                    <span className="text-lg font-black text-emerald-700">
                      ₹{Number(paymentSuccessData.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Doctor:</span>
                    <span className="font-extrabold text-slate-900">
                      Dr. {paymentSuccessData.doctor?.name || 'Doctor'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Patient:</span>
                    <span className="font-bold text-slate-800">
                      {paymentSuccessData.patient?.name || 'Patient'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Purpose:</span>
                    <span className="font-bold text-slate-800">{paymentSuccessData.purpose}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-bold">Transaction ID:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {paymentSuccessData.transactionId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentForReceipt(paymentSuccessData);
                      handleClosePayModal();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 px-4 text-xs font-black text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition"
                  >
                    <Printer size={15} />
                    <span>View Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClosePayModal}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 text-xs font-black text-slate-700 hover:bg-slate-50 transition"
                  >
                    Back to Payments
                  </button>
                </div>
              </div>
            ) : (
              // --------------------------------------------------
              // IN-PROGRESS PAYMENT OPTIONS MODAL
              // --------------------------------------------------
              <div>
                
                {/* HEADER */}
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                    UPI Secure Checkout
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Consultation Payment
                  </h3>
                  <div className="mt-2.5 flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900">
                        Dr. {selectedPaymentForPay.doctor?.name || 'Doctor'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Patient: {selectedPaymentForPay.patient?.name || 'Patient'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-bold">Payable</span>
                      <span className="text-lg font-black text-blue-600">
                        ₹{Number(selectedPaymentForPay.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {payError && (
                  <div className="mt-4 rounded-2xl bg-red-50 p-3.5 text-xs font-bold text-red-700 border border-red-100 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{payError}</span>
                  </div>
                )}

                {/* TABS: SCAN QR vs PAY USING UPI APPS */}
                <div className="mt-4 flex rounded-2xl bg-slate-100 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPayModalTab('qr')}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                      payModalTab === 'qr'
                        ? 'bg-white text-blue-600 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode size={15} />
                    <span>Scan UPI QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayModalTab('intent')}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                      payModalTab === 'intent'
                        ? 'bg-white text-blue-600 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone size={15} />
                    <span>Pay using UPI</span>
                  </button>
                </div>

                {/* TAB 1: QR CODE DISPLAY */}
                {payModalTab === 'qr' && (
                  <div className="mt-4">
                    <QRCodeDisplay
                      qrPayload={selectedPaymentForPay.qrPayload}
                      amount={selectedPaymentForPay.amount}
                      purpose={selectedPaymentForPay.purpose}
                    />

                    <div className="mt-4 text-center">
                      <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin text-blue-600" />
                        Listening for live payment confirmation...
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 2: PAY USING UPI APPS & INTENTS */}
                {payModalTab === 'intent' && (
                  <div className="mt-5 space-y-4">
                    
                    <p className="text-xs font-bold text-slate-600 text-center">
                      Choose your preferred UPI application to pay on this device:
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* GOOGLE PAY */}
                      <button
                        type="button"
                        onClick={() => handleLaunchUPIApp('gpay')}
                        className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition active:scale-95 text-center group"
                      >
                        <span className="font-extrabold text-xs text-slate-800 group-hover:text-blue-600">
                          Google Pay
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">UPI App</span>
                      </button>

                      {/* PHONEPE */}
                      <button
                        type="button"
                        onClick={() => handleLaunchUPIApp('phonepe')}
                        className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50/30 transition active:scale-95 text-center group"
                      >
                        <span className="font-extrabold text-xs text-slate-800 group-hover:text-purple-600">
                          PhonePe
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">UPI App</span>
                      </button>

                      {/* PAYTM */}
                      <button
                        type="button"
                        onClick={() => handleLaunchUPIApp('paytm')}
                        className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-cyan-400 hover:bg-cyan-50/30 transition active:scale-95 text-center group"
                      >
                        <span className="font-extrabold text-xs text-slate-800 group-hover:text-cyan-600">
                          Paytm
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">UPI App</span>
                      </button>

                      {/* GENERIC / OTHER UPI */}
                      <button
                        type="button"
                        onClick={() => handleLaunchUPIApp('generic')}
                        className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition active:scale-95 text-center group"
                      >
                        <span className="font-extrabold text-xs text-slate-800 group-hover:text-blue-600">
                          Other UPI App
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">BHIM / Bank UPI</span>
                      </button>

                    </div>

                    {/* GATEWAY CHECKOUT IF AVAILABLE */}
                    {config?.isConfigured && (
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={paymentProcessing}
                          onClick={handleRealGatewayPayment}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-black text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50"
                        >
                          <CreditCard size={15} />
                          <span>Launch Payment Gateway Checkout</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* DEMO SANDBOX TEST SIMULATION BUTTON */}
                {(selectedPaymentForPay.isDemo || config?.isDemo) && (
                  <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      <Sparkles size={12} className="text-amber-600" />
                      <span>Sandbox Simulation Available</span>
                    </div>

                    <button
                      type="button"
                      disabled={paymentProcessing}
                      onClick={handleSimulateDemoPayment}
                      className="w-full rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/70 py-3 px-4 text-xs font-black text-amber-900 hover:bg-amber-100/70 transition active:scale-95 disabled:opacity-50"
                    >
                      {paymentProcessing
                        ? 'Simulating Sandbox Payment...'
                        : '🧪 Simulate Demo Payment (Sandbox Test)'}
                    </button>
                    <p className="text-[10px] text-amber-700 font-semibold">
                      This will test the verification flow and mark status as DEMO_SUCCESSFUL.
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================================================
          RECEIPT MODAL
      ================================================== */}
      {selectedPaymentForReceipt && (
        <PaymentReceiptModal
          payment={selectedPaymentForReceipt}
          onClose={() => setSelectedPaymentForReceipt(null)}
        />
      )}

      {/* FLOATING AI CHAT */}
      <AIChat />

    </div>
  );
};

export default CaregiverPayments;
