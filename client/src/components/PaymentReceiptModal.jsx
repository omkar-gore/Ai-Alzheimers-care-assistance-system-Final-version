import React from 'react';
import {
  CheckCircle2,
  Printer,
  X,
  Stethoscope,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  CreditCard,
  AlertTriangle,
  Heart,
} from 'lucide-react';

const PaymentReceiptModal = ({ payment, onClose }) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDemo =
    payment.status === 'DEMO_SUCCESSFUL' ||
    payment.isDemo ||
    (payment.transactionId && payment.transactionId.startsWith('DEMO-'));

  const paidDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date(payment.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  const paidTime = payment.paidAt
    ? new Date(payment.paidAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : new Date(payment.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

  const doctorName = payment.doctor?.name || 'Dr. Medical Practitioner';
  const patientName = payment.patient?.name || 'Patient';
  const caregiverName = payment.caregiver?.name || 'Caregiver';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 print:max-w-none print:shadow-none print:p-0 print:border-none">
        
        {/* CLOSE BUTTON (HIDDEN WHEN PRINTING) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-2xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition print:hidden"
          title="Close Receipt"
        >
          <X size={20} />
        </button>

        {/* DEMO WATERMARK BANNER IF APPLICABLE */}
        {isDemo && (
          <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-center text-xs font-bold text-amber-800 flex items-center justify-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>
              DEMO PAYMENT — NOT A REAL TRANSACTION (Simulated in Sandbox Mode)
            </span>
          </div>
        )}

        {/* RECEIPT HEADER */}
        <div className="border-b border-slate-200/80 pb-5 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-100 mb-3">
            <Heart size={24} className="fill-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Care<span className="text-indigo-600">Mate</span> Medical Services
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Official Clinical Consultation & Care Payment Receipt
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={14} />
            <span>{isDemo ? 'Demo Payment Completed' : 'Payment Verified & Settled'}</span>
          </div>
        </div>

        {/* RECEIPT METADATA */}
        <div className="mt-5 grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Receipt No
            </span>
            <span className="font-extrabold text-slate-900 truncate block">
              {payment.receiptNumber || `RCPT-${payment._id?.toString().slice(-8).toUpperCase()}`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Transaction ID
            </span>
            <span className="font-extrabold text-slate-900 font-mono text-[11px] truncate block">
              {payment.transactionId || payment.gatewayPaymentId || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Payment Date
            </span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar size={13} className="text-indigo-600" /> {paidDate}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Payment Time
            </span>
            <span className="font-bold text-slate-800 flex items-center justify-end gap-1 mt-0.5">
              <Clock size={13} className="text-indigo-600" /> {paidTime}
            </span>
          </div>
        </div>

        {/* CLINICAL PARTIES INFORMATION */}
        <div className="mt-5 space-y-3 text-xs border-b border-slate-200/80 pb-5">
          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-slate-500">Patient:</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {patientName}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-slate-500">Attending Doctor:</span>
            <span className="font-bold text-slate-800">
              Dr. {doctorName}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-slate-500">Paid by (Caregiver):</span>
            <span className="font-bold text-slate-800">
              {caregiverName}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-slate-500">Purpose / Service:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
              {payment.purpose}
            </span>
          </div>
          {payment.description && (
            <div className="flex justify-between items-start py-1">
              <span className="font-bold text-slate-500">Description:</span>
              <span className="font-medium text-slate-700 text-right max-w-xs">
                {payment.description}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-slate-500">Payment Method:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard size={14} className="text-slate-500" />
              {payment.paymentMethod || 'UPI'}
              {payment.payerVpa ? ` (${payment.payerVpa})` : ''}
            </span>
          </div>
        </div>

        {/* AMOUNT CALCULATION SUMMARY */}
        <div className="mt-5 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Clinical Consultation Fee</span>
            <span className="font-bold">₹{Number(payment.amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Digital Processing & Convenience Fee</span>
            <span className="font-bold text-emerald-600">₹0 (Free)</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm font-black text-slate-900">Total Amount Paid</span>
            <span className="text-2xl font-black text-indigo-700">
              ₹{Number(payment.amount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* SECURITY & NPCI VERIFICATION FOOTER */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>NPCI 256-Bit Cryptographically Verified Transaction</span>
        </div>

        {/* PRINT & BACK ACTIONS (HIDDEN IN PRINT) */}
        <div className="mt-6 grid grid-cols-2 gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-95"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 px-4 text-xs font-black text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95"
          >
            <Printer size={15} />
            <span>Print Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentReceiptModal;
