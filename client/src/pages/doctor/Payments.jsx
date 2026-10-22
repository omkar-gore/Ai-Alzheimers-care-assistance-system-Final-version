import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../services/axios';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import PaymentReceiptModal from '../../components/PaymentReceiptModal';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  QrCode,
  FileText,
  Printer,
  Calendar,
  User,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const DoctorPayments = () => {
  const { patients, selectedPatientId, selectedPatient } = useDoctor();

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    successfulCount: 0,
    pendingCount: 0,
    totalCollected: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdPayment, setCreatedPayment] = useState(null);
  const [selectedPaymentForView, setSelectedPaymentForView] = useState(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);

  // Form State
  const [formPatientId, setFormPatientId] = useState('');
  const [formCaregiverId, setFormCaregiverId] = useState('');
  const [formCaregiverName, setFormCaregiverName] = useState('');
  const [formAmount, setFormAmount] = useState('1500');
  const [formPurpose, setFormPurpose] = useState('Consultation Fee');
  const [formDescription, setFormDescription] = useState('Online video consultation and clinical care plan');
  const [formAppointmentId, setFormAppointmentId] = useState('');
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 1. Load Gateway Config
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

  // 2. Fetch Doctor Payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/payments/doctor');
      setPayments(res.data?.payments || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Sync selected patient with create modal default
  useEffect(() => {
    if (selectedPatientId) {
      setFormPatientId(selectedPatientId);
    } else if (patients.length > 0) {
      setFormPatientId(patients[0]._id);
    }
  }, [selectedPatientId, patients]);

  // When patient changes in form, find linked caregiver and appointments
  useEffect(() => {
    if (!formPatientId) {
      setFormCaregiverId('');
      setFormCaregiverName('');
      setPatientAppointments([]);
      return;
    }

    const resolveCaregiver = async () => {
      const targetPatient = patients.find((p) => p._id === formPatientId);
      const foundCaregiver = targetPatient?.caregiver || targetPatient?.profile?.caregiver;

      if (foundCaregiver && typeof foundCaregiver === 'object' && foundCaregiver.name) {
        setFormCaregiverId(foundCaregiver._id || '');
        setFormCaregiverName(foundCaregiver.name);
      } else if (foundCaregiver && typeof foundCaregiver === 'string') {
        setFormCaregiverId(foundCaregiver);
        // If only ID is present, fetch patient profile to resolve caregiver's name
        try {
          const detailRes = await axios.get(`/doctor/patients/${formPatientId}`);
          const cg =
            detailRes.data?.caregiver?.user ||
            (detailRes.data?.caregiver?.name ? detailRes.data.caregiver : null) ||
            detailRes.data?.profile?.caregiver;
          setFormCaregiverName(cg?.name || 'Assigned Caregiver');
        } catch {
          setFormCaregiverName('Assigned Caregiver');
        }
      } else {
        // Fallback: check patient detail API directly
        try {
          const detailRes = await axios.get(`/doctor/patients/${formPatientId}`);
          const cg =
            detailRes.data?.caregiver?.user ||
            (detailRes.data?.caregiver?.name ? detailRes.data.caregiver : null) ||
            detailRes.data?.profile?.caregiver;
          if (cg && (cg.name || cg.email)) {
            setFormCaregiverId(cg._id || '');
            setFormCaregiverName(cg.name || cg.email);
          } else {
            setFormCaregiverId('');
            setFormCaregiverName('');
          }
        } catch {
          setFormCaregiverId('');
          setFormCaregiverName('');
        }
      }
    };

    resolveCaregiver();

    // Fetch patient appointments for optional link
    const fetchAppts = async () => {
      try {
        const res = await axios.get(`/doctor/patients/${formPatientId}/appointments`);
        setPatientAppointments(res.data?.upcomingAppointments || res.data || []);
      } catch (e) {
        setPatientAppointments([]);
      }
    };
    fetchAppts();
  }, [formPatientId, patients]);

  // Handle Create Payment Submit
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formPatientId) {
      setFormError('Please select a patient');
      return;
    }
    if (!formAmount || Number(formAmount) <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }
    if (!formPurpose.trim()) {
      setFormError('Please enter the payment purpose');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        patientId: formPatientId,
        caregiverId: formCaregiverId || undefined,
        amount: Number(formAmount),
        purpose: formPurpose.trim(),
        description: formDescription.trim(),
        appointmentId: formAppointmentId || undefined,
      };

      const res = await axios.post('/payments', payload);
      setCreatedPayment(res.data?.payment);
      setShowCreateModal(false);
      fetchPayments();
    } catch (err) {
      console.error('Create payment failed:', err);
      setFormError(
        err.response?.data?.message || 'Failed to create payment request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Payment Handler
  const handleCancelPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to cancel this pending payment request?')) {
      return;
    }
    try {
      await axios.post(`/payments/${paymentId}/cancel`);
      fetchPayments();
      if (createdPayment && createdPayment._id === paymentId) {
        setCreatedPayment(null);
      }
      if (selectedPaymentForView && selectedPaymentForView._id === paymentId) {
        setSelectedPaymentForView(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel payment');
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    if (filterStatus === 'PENDING' && p.status !== 'PENDING') return false;
    if (
      filterStatus === 'SUCCESSFUL' &&
      p.status !== 'SUCCESSFUL' &&
      p.status !== 'DEMO_SUCCESSFUL'
    )
      return false;
    if (filterStatus === 'CANCELLED' && p.status !== 'CANCELLED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patientName = p.patient?.name?.toLowerCase() || '';
      const caregiverName = p.caregiver?.name?.toLowerCase() || '';
      const purpose = p.purpose?.toLowerCase() || '';
      const txnId = (p.transactionId || '').toLowerCase();
      return (
        patientName.includes(q) ||
        caregiverName.includes(q) ||
        purpose.includes(q) ||
        txnId.includes(q)
      );
    }
    return true;
  });

  // Render Status Badge
  const renderStatusBadge = (status, isDemo) => {
    switch (status) {
      case 'SUCCESSFUL':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={13} />
            Paid
          </span>
        );
      case 'DEMO_SUCCESSFUL':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            <AlertTriangle size={13} className="text-amber-600" />
            Demo Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100 animate-pulse">
            <Clock size={13} />
            Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-200">
            <XCircle size={13} />
            Cancelled
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-100">
            <AlertCircle size={13} />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* PATIENT CONTEXT BAR */}
      <PatientContextHeader />

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Payments & Billing
            </h1>
            {config?.isDemo ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-800 border border-amber-200">
                <AlertTriangle size={12} className="text-amber-600" /> Sandbox / Demo Mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 border border-emerald-200">
                <ShieldCheck size={12} className="text-emerald-600" /> Gateway Active
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Generate UPI payment requests for patient consultations, review transactions, and issue receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError('');
            setShowCreateModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-indigo-100 hover:from-indigo-700 hover:to-blue-700 transition active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>Create Payment Request</span>
        </button>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* TOTAL COLLECTED */}
        <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Total Revenue
          </span>
          <p className="mt-2 text-2xl font-black text-indigo-700">
            ₹{stats.totalCollected.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>{stats.successfulCount} settled payments</span>
          </div>
        </div>

        {/* PENDING AMOUNT */}
        <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Pending Collection
          </span>
          <p className="mt-2 text-2xl font-black text-amber-600">
            ₹{stats.pendingAmount.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Clock size={13} className="text-amber-500" />
            <span>{stats.pendingCount} awaiting approval</span>
          </div>
        </div>

        {/* SETTLED COUNT */}
        <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Completed Invoices
          </span>
          <p className="mt-2 text-2xl font-black text-slate-800">
            {stats.successfulCount}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <CreditCard size={13} className="text-indigo-600" />
            <span>UPI & Online settlements</span>
          </div>
        </div>

        {/* TOTAL CREATED */}
        <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Total Requests
          </span>
          <p className="mt-2 text-2xl font-black text-slate-800">
            {stats.totalCount}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <FileText size={13} className="text-slate-400" />
            <span>Generated till date</span>
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        
        {/* STATUS PILLS */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { label: 'All Invoices', value: 'ALL' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Paid / Completed', value: 'SUCCESSFUL' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStatus(tab.value)}
              className={`rounded-2xl px-3.5 py-1.5 text-xs font-black transition ${
                filterStatus === tab.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, purpose, txn ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white transition"
          />
        </div>

      </div>

      {/* PAYMENT HISTORY TABLE / LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold">
            Loading payment ledger...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard size={40} className="mx-auto text-slate-300" />
            <p className="text-base font-extrabold text-slate-700">No payment records found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a payment request to collect consultation fees from assigned patient caregivers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Patient & Caregiver</th>
                  <th className="py-3.5 px-4">Purpose / Service</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Method & Txn ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredPayments.map((p) => {
                  const dateStr = new Date(p.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const timeStr = new Date(p.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition">
                      
                      {/* PATIENT & CAREGIVER */}
                      <td className="py-4 px-4 sm:px-6">
                        <p className="font-extrabold text-slate-900 text-sm">
                          {p.patient?.name || 'Patient'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Caregiver: {p.caregiver?.name || 'Not assigned'}
                        </p>
                      </td>

                      {/* PURPOSE */}
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-800 block truncate max-w-xs">
                          {p.purpose}
                        </span>
                        {p.appointment && (
                          <span className="text-[10px] text-indigo-600 font-bold block">
                            Appt: {p.appointment.title || 'Consultation'}
                          </span>
                        )}
                      </td>

                      {/* AMOUNT */}
                      <td className="py-4 px-4">
                        <span className="text-sm font-black text-indigo-700">
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* METHOD & TXN ID */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800 block">
                          {p.paymentMethod || 'UPI'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate block max-w-[120px]">
                          {p.transactionId || 'Awaiting Payment'}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-4">
                        {renderStatusBadge(p.status, p.isDemo)}
                      </td>

                      {/* DATE */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-700 block">{dateStr}</span>
                        <span className="text-[10px] text-slate-400 block">{timeStr}</span>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-4 text-right pr-6 space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForView(p)}
                          className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-black text-indigo-700 hover:bg-indigo-100 transition"
                          title="View QR & Details"
                        >
                          <QrCode size={13} />
                          <span>View</span>
                        </button>

                        {(p.status === 'SUCCESSFUL' || p.status === 'DEMO_SUCCESSFUL') && (
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentForReceipt(p)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition"
                            title="Print Receipt"
                          >
                            <Printer size={13} />
                            <span>Receipt</span>
                          </button>
                        )}

                        {p.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleCancelPayment(p._id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-xs font-black text-red-600 hover:bg-red-100 transition"
                            title="Cancel Request"
                          >
                            <XCircle size={13} />
                            <span>Cancel</span>
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

      {/* ==================================================
          MODAL A: CREATE PAYMENT REQUEST
      ================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Create Payment Request
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Request consultation or care fee with instant UPI QR generation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-2xl bg-red-50 p-3.5 text-xs font-bold text-red-700 border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePayment} className="mt-5 space-y-4">
              
              {/* PATIENT SELECTION */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Select Patient <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                  required
                >
                  <option value="">-- Choose Assigned Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.age}y, {p.gender})
                    </option>
                  ))}
                </select>
              </div>

              {/* CAREGIVER (READ-ONLY CONFIRMATION) */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Associated Caregiver (Payer)
                </label>
                {formCaregiverName ? (
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Caregiver:
                      </span>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        {formCaregiverName}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-800">
                      ✓ Automatically linked as payer
                    </span>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                    <p className="font-extrabold text-amber-900">
                      No caregiver linked to this patient.
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-amber-700">
                      The caregiver assigned to the selected patient will automatically become the payer.
                    </p>
                  </div>
                )}
              </div>

              {/* AMOUNT IN RUPEES */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Amount in ₹ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-8 pr-4 py-3 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="1500"
                    required
                  />
                </div>
              </div>

              {/* PURPOSE */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Payment Purpose <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Consultation Fee">Consultation Fee</option>
                  <option value="Online Video Consultation">Online Video Consultation</option>
                  <option value="Cognitive Health Review">Cognitive Health Review</option>
                  <option value="Medication & Treatment Review">Medication & Treatment Review</option>
                  <option value="Comprehensive Care Plan">Comprehensive Care Plan</option>
                  <option value="Follow-up Clinical Visit">Follow-up Clinical Visit</option>
                </select>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Description / Clinical Note
                </label>
                <textarea
                  rows="2"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional details or instructions for caregiver..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* LINKED APPOINTMENT (OPTIONAL) */}
              {patientAppointments.length > 0 && (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                    Link with Appointment (Optional)
                  </label>
                  <select
                    value={formAppointmentId}
                    onChange={(e) => setFormAppointmentId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="">-- None (Standalone Payment) --</option>
                    {patientAppointments.map((appt) => (
                      <option key={appt._id} value={appt._id}>
                        {appt.date} at {appt.time} - {appt.title} ({appt.appointmentMode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-indigo-100 hover:from-indigo-700 hover:to-blue-700 transition active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Generating Payment Request & QR...' : 'Generate Payment Request'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================================================
          MODAL B: PAYMENT CREATED SUCCESS MODAL (WITH QR)
      ================================================== */}
      {createdPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 text-center">
            
            <button
              type="button"
              onClick={() => setCreatedPayment(null)}
              className="absolute top-5 right-5 rounded-2xl p-2 text-slate-400 hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
              <CheckCircle2 size={30} />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              Payment Request Created
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Caregiver can now scan the UPI QR or approve in CareMate.
            </p>

            {/* SUMMARY CHIP */}
            <div className="my-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Amount:</span>
                <span className="text-sm font-black text-indigo-700">
                  ₹{Number(createdPayment.amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Purpose:</span>
                <span className="font-extrabold text-slate-900">{createdPayment.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Patient:</span>
                <span className="font-bold text-slate-800">{createdPayment.patient?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Caregiver:</span>
                <span className="font-bold text-slate-800">{createdPayment.caregiver?.name}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-bold">Status:</span>
                {renderStatusBadge(createdPayment.status, createdPayment.isDemo)}
              </div>
            </div>

            {/* QR CODE DISPLAY */}
            <QRCodeDisplay
              qrPayload={createdPayment.qrPayload}
              amount={createdPayment.amount}
              purpose={createdPayment.purpose}
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCreatedPayment(null)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => handleCancelPayment(createdPayment._id)}
                className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 text-xs font-black text-red-600 hover:bg-red-100 transition"
              >
                Cancel Request
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          MODAL C: VIEW PAYMENT DETAILS & QR
      ================================================== */}
      {selectedPaymentForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 text-center">
            
            <button
              type="button"
              onClick={() => setSelectedPaymentForView(null)}
              className="absolute top-5 right-5 rounded-2xl p-2 text-slate-400 hover:bg-slate-100"
            >
              ✕
            </button>

            <h3 className="text-lg font-black text-slate-900">
              Payment Details & UPI QR
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ref: {selectedPaymentForView.receiptNumber || selectedPaymentForView._id}
            </p>

            {/* QR CODE IF PENDING */}
            {selectedPaymentForView.status === 'PENDING' ? (
              <div className="my-4">
                <QRCodeDisplay
                  qrPayload={selectedPaymentForView.qrPayload}
                  amount={selectedPaymentForView.amount}
                  purpose={selectedPaymentForView.purpose}
                />
              </div>
            ) : (
              <div className="my-6 p-6 rounded-3xl bg-emerald-50 border border-emerald-100 text-center space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                <h4 className="text-base font-black text-emerald-800">Payment Completed</h4>
                <p className="text-xs text-emerald-700 font-semibold">
                  Transaction settled via {selectedPaymentForView.paymentMethod || 'UPI'}.
                </p>
                <p className="text-[11px] font-mono text-emerald-600 pt-1">
                  ID: {selectedPaymentForView.transactionId}
                </p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentForView(null)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>

              {(selectedPaymentForView.status === 'SUCCESSFUL' ||
                selectedPaymentForView.status === 'DEMO_SUCCESSFUL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentForReceipt(selectedPaymentForView);
                    setSelectedPaymentForView(null);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 text-xs font-black text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition"
                >
                  <Printer size={14} />
                  <span>View Receipt</span>
                </button>
              )}

              {selectedPaymentForView.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => handleCancelPayment(selectedPaymentForView._id)}
                  className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 text-xs font-black text-red-600 hover:bg-red-100 transition"
                >
                  Cancel Request
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          MODAL D: PAYMENT RECEIPT
      ================================================== */}
      {selectedPaymentForReceipt && (
        <PaymentReceiptModal
          payment={selectedPaymentForReceipt}
          onClose={() => setSelectedPaymentForReceipt(null)}
        />
      )}

    </div>
  );
};

export default DoctorPayments;
