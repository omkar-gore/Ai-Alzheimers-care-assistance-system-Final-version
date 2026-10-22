import React, { useState } from 'react';
import {
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Info,
} from 'lucide-react';

const QRCodeDisplay = ({ qrPayload, amount, purpose, payeeName = 'CareMate Medical' }) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const qrImageUrl = qrPayload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(
        qrPayload
      )}`
    : null;

  const handleCopyUPI = () => {
    if (!qrPayload) return;
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-3xl border border-indigo-100 shadow-sm text-center">
      
      {/* AMOUNT BADGE */}
      {amount !== undefined && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-50/80 px-4 py-2 border border-indigo-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Payable:
          </span>
          <span className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight">
            ₹{Number(amount).toLocaleString('en-IN')}
          </span>
        </div>
      )}

      {/* QR CODE CONTAINER */}
      <div className="relative group p-3 bg-gradient-to-tr from-slate-50 via-white to-indigo-50/30 rounded-3xl border-2 border-dashed border-indigo-200 shadow-inner">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-white rounded-2xl overflow-hidden shadow-xs">
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 animate-pulse">
              <QrCode className="h-12 w-12 text-indigo-300 animate-spin" />
              <span className="mt-2 text-xs font-semibold text-slate-400">
                Generating Secure UPI QR...
              </span>
            </div>
          )}

          {qrImageUrl && (
            <img
              src={qrImageUrl}
              alt="UPI Payment QR Code"
              className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>

        {/* VERIFICATION BADGE */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-600">
          <ShieldCheck size={14} />
          <span>NPCI Unified Payments Interface (UPI)</span>
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className="mt-4 space-y-1">
        <p className="text-sm font-extrabold text-slate-800">
          Scan with Any UPI Application
        </p>
        <p className="text-xs text-slate-500 max-w-xs">
          Open Google Pay, PhonePe, Paytm, BHIM, Cred or your bank UPI app to scan and approve.
        </p>
      </div>

      {/* SUPPORTED APPS BADGES */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600">
        <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80">
          Google Pay
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80">
          PhonePe
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80">
          Paytm
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80">
          BHIM UPI
        </span>
      </div>

      {/* COPY UPI STRING BUTTON */}
      <div className="mt-4 pt-4 border-t border-slate-100 w-full flex flex-col sm:flex-row items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleCopyUPI}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300 active:scale-95"
          title="Copy raw UPI URI link"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span className="text-emerald-700">Copied UPI Link!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy UPI Intent String</span>
            </>
          )}
        </button>

        {qrPayload && (
          <a
            href={qrPayload}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            <Smartphone size={14} className="text-indigo-600" />
            <span>Open Default App</span>
          </a>
        )}
      </div>

    </div>
  );
};

export default QRCodeDisplay;
