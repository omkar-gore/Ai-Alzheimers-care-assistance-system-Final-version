import React from 'react';
import { Link } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import { Users, Phone, Mail, ChevronDown, UserMinus, Stethoscope, ArrowRight } from 'lucide-react';

const PatientContextHeader = ({ title, subtitle, actionButton }) => {
  const { patients, selectedPatientId, selectedPatient, selectPatient, patientData } = useDoctor();

  if (!selectedPatientId || !selectedPatient) {
    return (
      <div className="rounded-3xl border border-indigo-100 bg-white p-8 text-center space-y-3 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto">
          <Users size={24} />
        </div>
        <h3 className="text-lg font-black text-slate-800">No Patient Selected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          To view and manage {title || 'clinical records'}, please select a patient from your assigned panel.
        </p>
        <div className="pt-2">
          <Link
            to="/doctor/patients"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition"
          >
            <span>Select Patient from Panel</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* COMPACT ACTIVE PATIENT HEADER BAR */}
      <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white font-black text-xl shadow-md">
              {selectedPatient.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 truncate">
                  {selectedPatient.name}
                </h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-100">
                  Active Patient
                </span>
                
                {/* QUICK PATIENT SWITCHER DROPDOWN */}
                {patients.length > 1 && (
                  <div className="relative inline-block">
                    <select
                      value={selectedPatientId}
                      onChange={(e) => selectPatient(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-7 text-[11px] font-extrabold text-indigo-700 outline-none cursor-pointer hover:bg-white transition"
                    >
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          Switch to: {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Age {selectedPatient.age || 'N/A'} • {selectedPatient.gender || 'Not specified'} • Patient ID: {selectedPatient._id}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                {selectedPatient.phone && (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Phone size={12} className="text-slate-400" /> {selectedPatient.phone}
                  </span>
                )}
                {selectedPatient.email && (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Mail size={12} className="text-slate-400" /> {selectedPatient.email}
                  </span>
                )}
                {patientData?.caregiver && (
                  <span className="flex items-center gap-1 text-[11px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
                    <Users size={12} className="text-teal-600" /> Caregiver: {patientData.caregiver.name} ({patientData.caregiver.phone || 'Contact'})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PAGE ACTION BUTTON (e.g. "Schedule Appointment", "Prescribe Medication", etc.) */}
          {actionButton && (
            <div className="shrink-0 self-start md:self-auto">
              {actionButton}
            </div>
          )}

        </div>
      </div>

      {/* OPTIONAL SECTION TITLE BANNER */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientContextHeader;
