import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Pill,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  Upload,
  Trash2,
  Eye,
  FileImage,
  X,
} from 'lucide-react';

import axios from '../../services/axios';
import AIChat from '../../components/AIChat';

const Reports = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [schedules, setSchedules] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Medical reports
  const [medicalReports, setMedicalReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('Other');

  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  // =========================================================
  // BACKEND FILE URL
  // =========================================================

  const getBackendFileUrl = (fileUrl) => {
    if (!fileUrl) {
      return '';
    }

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    const baseURL = axios.defaults.baseURL || '';

    if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
      const backendBase = baseURL.replace(/\/api\/?$/, '');
      return `${backendBase}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
    }

    return fileUrl;
  };

  // =========================================================
  // LOAD CARE REPORTS
  // =========================================================

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/caregiver/patients');
      const list = Array.isArray(response.data) ? response.data : [];
      setPatients(list);
    } catch (err) {
      console.error('Fetch caregiver patients error:', err);
    }
  };

  const loadReports = async (patientId = selectedPatientId) => {
    try {
      setLoading(true);
      setError('');

      const params = patientId ? { patientId } : {};
      const results = await Promise.allSettled([
        axios.get('/caregiver/schedules', { params }),
        axios.get('/caregiver/medicines', { params }),
        axios.get('/caregiver/tasks', { params }),
        axios.get('/caregiver/appointments', { params }),
      ]);

      const [
        scheduleResult,
        medicineResult,
        taskResult,
        appointmentResult,
      ] = results;

      if (scheduleResult.status === 'fulfilled') {
        setSchedules(
          Array.isArray(scheduleResult.value.data)
            ? scheduleResult.value.data
            : []
        );
      }

      if (medicineResult.status === 'fulfilled') {
        setMedicines(
          Array.isArray(medicineResult.value.data)
            ? medicineResult.value.data
            : []
        );
      }

      if (taskResult.status === 'fulfilled') {
        setTasks(
          Array.isArray(taskResult.value.data)
            ? taskResult.value.data
            : []
        );
      }

      if (appointmentResult.status === 'fulfilled') {
        setAppointments(
          Array.isArray(appointmentResult.value.data)
            ? appointmentResult.value.data
            : []
        );
      }

      const allFailed = results.every(
        (result) => result.status === 'rejected'
      );

      if (allFailed) {
        setError('Unable to load patient reports. Please try again.');
      }
    } catch (err) {
      console.error('Reports loading error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load patient reports. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD MEDICAL REPORTS FROM DATABASE
  // =========================================================

  const loadMedicalReports = async (patientId = selectedPatientId) => {
    try {
      setReportsLoading(true);

      const params = patientId ? { patientId } : {};
      const response = await axios.get(
        '/caregiver/medical-reports',
        { params }
      );

      setMedicalReports(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        'Medical reports loading error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to load medical reports.'
      );
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    loadReports(selectedPatientId);
    loadMedicalReports(selectedPatientId);
  }, [selectedPatientId]);

  // =========================================================
  // OPEN FILE PICKER
  // =========================================================

  const openFilePicker = () => {
    setError('');
    setUploadMessage('');

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // =========================================================
  // FILE SELECTED
  // =========================================================

  const handleMedicalReportSelection = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');
    setUploadMessage('');

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    const maxFileSize = 10 * 1024 * 1024;

    const extension = file.name
      .split('.')
      .pop()
      ?.toLowerCase();

    const validExtensions = [
      'pdf',
      'jpg',
      'jpeg',
      'png',
    ];

    const isValidType =
      allowedTypes.includes(file.type) ||
      validExtensions.includes(extension);

    const isValidSize = file.size <= maxFileSize;

    if (!isValidType) {
      setError(
        'Invalid file. Please select a PDF, JPG, JPEG or PNG medical report.'
      );

      event.target.value = '';
      return;
    }

    if (!isValidSize) {
      setError(
        'File is too large. Please select a file up to 10 MB.'
      );

      event.target.value = '';
      return;
    }

    setSelectedFile(file);

    // Automatically create a reasonable report name
    const fileNameWithoutExtension = file.name.replace(
      /\.[^/.]+$/,
      ''
    );

    setReportName(fileNameWithoutExtension);

    // Automatically detect report type
    setReportType(getReportType(file.name));

    // Reset input so same file can be selected again
    event.target.value = '';
  };

  // =========================================================
  // DETECT REPORT TYPE
  // =========================================================

  const getReportType = (fileName) => {
    const name = fileName.toLowerCase();

    if (
      name.includes('blood') ||
      name.includes('cbc') ||
      name.includes('hemoglobin') ||
      name.includes('sugar') ||
      name.includes('glucose')
    ) {
      return 'Blood Report';
    }

    if (name.includes('mri')) {
      return 'MRI';
    }

    if (
      name.includes('ct') ||
      name.includes('scan')
    ) {
      return 'CT Scan';
    }

    if (
      name.includes('xray') ||
      name.includes('x-ray')
    ) {
      return 'X-Ray';
    }

    if (
      name.includes('prescription') ||
      name.includes('medicine')
    ) {
      return 'Prescription';
    }

    if (
      name.includes('doctor') ||
      name.includes('consultation')
    ) {
      return 'Doctor Consultation';
    }

    if (
      name.includes('lab') ||
      name.includes('test')
    ) {
      return 'Lab Report';
    }

    return 'Other';
  };

  // =========================================================
  // FORMAT FILE SIZE
  // =========================================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return '0 B';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // =========================================================
  // CANCEL SELECTED FILE
  // =========================================================

  const cancelSelectedFile = () => {
    setSelectedFile(null);
    setReportName('');
    setReportType('Other');
    setError('');
  };

  // =========================================================
  // UPLOAD MEDICAL REPORT
  // =========================================================

  const uploadMedicalReport = async () => {
    if (!selectedFile) {
      setError('Please select a medical report first.');
      return;
    }

    if (!reportName.trim()) {
      setError('Please enter a name for the medical report.');
      return;
    }

    if (!reportType) {
      setError('Please select the report type.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadMessage('');

      const formData = new FormData();

      formData.append(
        'medicalReport',
        selectedFile
      );

      formData.append(
        'reportName',
        reportName.trim()
      );

      formData.append(
        'reportType',
        reportType
      );

      if (selectedPatientId) {
        formData.append('patientId', selectedPatientId);
      }

      const response = await axios.post(
        '/caregiver/medical-reports',
        formData
      );

      setUploadMessage(
        response.data?.message ||
          'Medical report uploaded successfully.'
      );

      setSelectedFile(null);
      setReportName('');
      setReportType('Other');

      await loadMedicalReports();
    } catch (err) {
      console.error(
        'Medical report upload error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to upload medical report. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // DELETE MEDICAL REPORT
  // =========================================================

  const removeMedicalReport = async (reportId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this medical report?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setUploadMessage('');

      await axios.delete(
        `/caregiver/medical-reports/${reportId}`
      );

      setMedicalReports((previous) =>
        previous.filter(
          (report) => report._id !== reportId
        )
      );

      setUploadMessage(
        'Medical report deleted successfully.'
      );
    } catch (err) {
      console.error(
        'Delete medical report error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to delete medical report.'
      );
    }
  };

  // =========================================================
  // VIEW MEDICAL REPORT
  // =========================================================

  const viewMedicalReport = (report) => {
    const fileUrl = getBackendFileUrl(
      report?.fileUrl
    );

    if (!fileUrl) {
      setError('Medical report file is not available.');
      return;
    }

    window.open(
      fileUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const completedTasks = tasks.filter(
      (task) =>
        task.status === 'Completed' ||
        task.completed === true ||
        task.isCompleted === true
    ).length;

    const pendingTasks = Math.max(
      tasks.length - completedTasks,
      0
    );

    const completedAppointments =
      appointments.filter(
        (appointment) =>
          appointment.status === 'Completed'
      ).length;

    const cancelledAppointments =
      appointments.filter(
        (appointment) =>
          appointment.status === 'Cancelled'
      ).length;

    const scheduledAppointments =
      appointments.filter(
        (appointment) =>
          !appointment.status ||
          appointment.status === 'Scheduled'
      ).length;

    const activeMedicines = medicines.filter(
      (medicine) =>
        medicine.isActive !== false &&
        medicine.active !== false
    ).length;

    const taskCompletionRate =
      tasks.length > 0
        ? Math.round(
            (completedTasks / tasks.length) * 100
          )
        : 0;

    return {
      completedTasks,
      pendingTasks,
      completedAppointments,
      cancelledAppointments,
      scheduledAppointments,
      activeMedicines,
      taskCompletionRate,
    };
  }, [tasks, appointments, medicines]);

  // =========================================================
  // RECENT APPOINTMENTS
  // =========================================================

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        const first = new Date(
          `${a.date || ''} ${a.time || ''}`
        ).getTime();

        const second = new Date(
          `${b.date || ''} ${b.time || ''}`
        ).getTime();

        return second - first;
      })
      .slice(0, 5);
  }, [appointments]);

  // =========================================================
  // RECENT SCHEDULES
  // =========================================================

  const recentSchedules = useMemo(() => {
    return [...schedules].slice(0, 5);
  }, [schedules]);

  // =========================================================
  // APPOINTMENT STATUS
  // =========================================================

  const getAppointmentStatusClass = (status) => {
    if (status === 'Completed') {
      return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'Cancelled') {
      return 'bg-red-50 text-red-700';
    }

    return 'bg-blue-50 text-blue-700';
  };

  const getAppointmentStatusLabel = (status) => {
    return status || 'Scheduled';
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

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
                Patient Reports
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Overview of the patient's care activities,
                medical documents and progress.
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">
            {patients.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Patient:</span>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Patients</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                loadReports();
                loadMedicalReports();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              title="Refresh Reports"
            >
              <RefreshCw size={18} />
            </button>
          </div>

        </div>

      </header>


      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8">

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError('')}
              className="shrink-0 text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>

          </div>
        )}


        {/* ===================================================
            SUCCESS
        =================================================== */}

        {uploadMessage && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">

            <div className="flex items-center gap-2">

              <CheckCircle2 size={18} />

              <span>{uploadMessage}</span>

            </div>

            <button
              type="button"
              onClick={() => setUploadMessage('')}
              className="text-emerald-500 hover:text-emerald-700"
            >
              <X size={18} />
            </button>

          </div>
        )}


        {loading ? (

          <div className="flex min-h-[500px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-semibold text-slate-500">
                Preparing patient reports...
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                CARE SUMMARY
            ================================================= */}

            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <FileText size={27} />
                  </div>

                  <div>

                    <h2 className="text-xl font-extrabold text-slate-900">
                      Care Summary
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      Monitor medicines, daily activities,
                      tasks, appointments and medical reports
                      from one place.
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={16} />
                  Care tracking active
                </div>

              </div>

            </section>


            {/* =================================================
                MEDICAL REPORTS
            ================================================= */}

            <section className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* Header */}

              <div className="border-b border-slate-200 px-6 py-5 sm:px-7">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <FileText size={23} />
                    </div>

                    <div>

                      <h2 className="text-lg font-extrabold text-slate-900">
                        Medical Reports
                      </h2>

                      <p className="text-xs text-slate-500">
                        Blood reports, MRI scans,
                        prescriptions, lab reports and
                        other medical documents.
                      </p>

                    </div>

                  </div>


                  {/* Hidden File Input */}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={handleMedicalReportSelection}
                    className="hidden"
                  />


                  {/* Upload Button */}

                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <Upload size={18} />

                    Upload Medical Report

                  </button>

                </div>

              </div>


              {/* =================================================
                  SELECTED FILE / UPLOAD FORM
              ================================================= */}

              {selectedFile && (

                <div className="border-b border-slate-200 bg-blue-50/50 p-5 sm:p-6">

                  <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                          {selectedFile.type ===
                          'application/pdf' ? (
                            <FileText size={22} />
                          ) : (
                            <FileImage size={22} />
                          )}

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-extrabold text-slate-900">
                            {selectedFile.name}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {formatFileSize(
                              selectedFile.size
                            )}
                          </p>

                        </div>

                      </div>


                      <button
                        type="button"
                        onClick={cancelSelectedFile}
                        disabled={uploading}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>

                    </div>


                    {/* Report Name */}

                    <div className="mt-5">

                      <label className="text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        Report Name
                      </label>

                      <input
                        type="text"
                        value={reportName}
                        onChange={(event) =>
                          setReportName(
                            event.target.value
                          )
                        }
                        placeholder="Example: CBC Blood Test"
                        disabled={uploading}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                      />

                    </div>


                    {/* Report Type */}

                    <div className="mt-4">

                      <label className="text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        Report Type
                      </label>

                      <select
                        value={reportType}
                        onChange={(event) =>
                          setReportType(
                            event.target.value
                          )
                        }
                        disabled={uploading}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                      >

                        <option value="Blood Report">
                          Blood Report
                        </option>

                        <option value="MRI">
                          MRI
                        </option>

                        <option value="CT Scan">
                          CT Scan
                        </option>

                        <option value="X-Ray">
                          X-Ray
                        </option>

                        <option value="Prescription">
                          Prescription
                        </option>

                        <option value="Doctor Consultation">
                          Doctor Consultation
                        </option>

                        <option value="Lab Report">
                          Lab Report
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>


                    {/* Buttons */}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">

                      <button
                        type="button"
                        onClick={cancelSelectedFile}
                        disabled={uploading}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={uploadMedicalReport}
                        disabled={uploading}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {uploading ? (
                          <>
                            <RefreshCw
                              size={17}
                              className="animate-spin"
                            />

                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={17} />

                            Save Medical Report
                          </>
                        )}

                      </button>

                    </div>

                  </div>

                </div>

              )}


              {/* =================================================
                  SAVED REPORTS
              ================================================= */}

              <div className="p-5 sm:p-6">

                {reportsLoading ? (

                  <div className="py-12 text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      Loading medical reports...
                    </p>

                  </div>

                ) : medicalReports.length === 0 ? (

                  <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                      <Upload size={28} />
                    </div>

                    <h3 className="mt-5 text-base font-extrabold text-slate-800">
                      No medical reports uploaded
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                      Upload the patient's blood report,
                      MRI/CT scan, prescription, laboratory
                      report or any other medical document.
                    </p>

                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Choose from device
                    </button>

                    <p className="mt-3 text-[11px] font-medium text-slate-400">
                      PDF, JPG, JPEG and PNG · Maximum 10 MB
                    </p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {medicalReports.map((report) => (

                      <div
                        key={report._id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div className="flex min-w-0 items-center gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">

                            {report.fileType ===
                            'application/pdf' ? (
                              <FileText size={22} />
                            ) : (
                              <FileImage size={22} />
                            )}

                          </div>


                          <div className="min-w-0">

                            <p className="truncate text-sm font-extrabold text-slate-900">
                              {report.reportName}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">

                              <span>
                                {report.reportType}
                              </span>

                              <span>
                                {formatFileSize(
                                  report.fileSize
                                )}
                              </span>

                              <span>
                                {new Date(
                                  report.uploadedAt ||
                                    report.createdAt
                                ).toLocaleDateString(
                                  'en-IN',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )}
                              </span>

                            </div>

                            <p className="mt-1 truncate text-[11px] text-slate-400">
                              {report.fileName}
                            </p>

                          </div>

                        </div>


                        <div className="flex items-center gap-2 sm:shrink-0">

                          <button
                            type="button"
                            onClick={() =>
                              viewMedicalReport(
                                report
                              )
                            }
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeMedicalReport(
                                report._id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50"
                            title="Delete report"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Medicines */}

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Pill size={21} />
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    MEDICINES
                  </span>

                </div>

                <p className="mt-5 text-3xl font-extrabold text-slate-900">
                  {statistics.activeMedicines}
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Active medicines
                </p>

              </div>


              {/* Tasks */}

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ClipboardList size={21} />
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    TASKS
                  </span>

                </div>

                <p className="mt-5 text-3xl font-extrabold text-slate-900">
                  {statistics.completedTasks}
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Completed tasks
                </p>

              </div>


              {/* Appointments */}

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <CalendarDays size={21} />
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    APPOINTMENTS
                  </span>

                </div>

                <p className="mt-5 text-3xl font-extrabold text-slate-900">
                  {statistics.scheduledAppointments}
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Scheduled appointments
                </p>

              </div>


              {/* Progress */}

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <TrendingUp size={21} />
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    PROGRESS
                  </span>

                </div>

                <p className="mt-5 text-3xl font-extrabold text-slate-900">
                  {statistics.taskCompletionRate}%
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Task completion rate
                </p>

              </div>

            </section>


            {/* =================================================
                TASK PROGRESS + APPOINTMENT SUMMARY
            ================================================= */}

            <section className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* Task Progress */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-extrabold text-slate-900">
                      Task Progress
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Current care task completion
                    </p>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <BarChart3 size={21} />
                  </div>

                </div>

                <div className="mt-7">

                  <div className="flex items-end justify-between">

                    <div>

                      <p className="text-4xl font-extrabold text-slate-900">
                        {statistics.taskCompletionRate}%
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Completion rate
                      </p>

                    </div>

                    <p className="text-sm font-bold text-slate-500">
                      {statistics.completedTasks} / {tasks.length} tasks
                    </p>

                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${statistics.taskCompletionRate}%`,
                      }}
                    />

                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-emerald-50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                        Completed
                      </p>

                      <p className="mt-1 text-xl font-extrabold text-emerald-700">
                        {statistics.completedTasks}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-amber-50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                        Pending
                      </p>

                      <p className="mt-1 text-xl font-extrabold text-amber-700">
                        {statistics.pendingTasks}
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* Appointment Summary */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-extrabold text-slate-900">
                      Appointment Summary
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Patient healthcare appointments
                    </p>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Stethoscope size={21} />
                  </div>

                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">

                  <div className="rounded-2xl bg-blue-50 p-4 text-center">

                    <p className="text-2xl font-extrabold text-blue-700">
                      {statistics.scheduledAppointments}
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-blue-600">
                      Scheduled
                    </p>

                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4 text-center">

                    <p className="text-2xl font-extrabold text-emerald-700">
                      {statistics.completedAppointments}
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-emerald-600">
                      Completed
                    </p>

                  </div>

                  <div className="rounded-2xl bg-red-50 p-4 text-center">

                    <p className="text-2xl font-extrabold text-red-700">
                      {statistics.cancelledAppointments}
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-red-600">
                      Cancelled
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/caregiver/appointments')
                  }
                  className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  View appointments
                </button>

              </div>

            </section>


            {/* =================================================
                RECENT APPOINTMENTS + SCHEDULE
            ================================================= */}

            <section className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* Recent Appointments */}

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <CalendarDays size={19} />
                    </div>

                    <div>

                      <h2 className="font-extrabold text-slate-900">
                        Recent Appointments
                      </h2>

                      <p className="text-xs text-slate-500">
                        Latest healthcare appointments
                      </p>

                    </div>

                  </div>

                </div>

                <div className="p-4">

                  {recentAppointments.length === 0 ? (

                    <div className="px-4 py-10 text-center">

                      <CalendarDays
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        No appointments available.
                      </p>

                    </div>

                  ) : (

                    <div className="space-y-2">

                      {recentAppointments.map(
                        (appointment) => (

                          <div
                            key={appointment._id}
                            className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                          >

                            <div className="flex items-start justify-between gap-4">

                              <div>

                                <p className="text-sm font-extrabold text-slate-900">
                                  {appointment.title ||
                                    'Medical Appointment'}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {appointment.date ||
                                    'Date not available'}

                                  {appointment.time
                                    ? ` · ${appointment.time}`
                                    : ''}
                                </p>

                                {appointment.location && (
                                  <p className="mt-1 text-xs font-medium text-slate-400">
                                    {appointment.location}
                                  </p>
                                )}

                              </div>

                              <span
                                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold ${getAppointmentStatusClass(
                                  appointment.status
                                )}`}
                              >
                                {getAppointmentStatusLabel(
                                  appointment.status
                                )}
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              </div>


              {/* Schedule */}

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Clock3 size={19} />
                    </div>

                    <div>

                      <h2 className="font-extrabold text-slate-900">
                        Daily Schedule
                      </h2>

                      <p className="text-xs text-slate-500">
                        Patient's planned activities
                      </p>

                    </div>

                  </div>

                </div>

                <div className="p-4">

                  {recentSchedules.length === 0 ? (

                    <div className="px-4 py-10 text-center">

                      <Clock3
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        No schedule activities available.
                      </p>

                    </div>

                  ) : (

                    <div className="space-y-2">

                      {recentSchedules.map(
                        (schedule) => (

                          <div
                            key={schedule._id}
                            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                          >

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-extrabold text-blue-600 shadow-sm">
                              {schedule.time || '--'}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-extrabold text-slate-900">
                                {schedule.activity ||
                                  'Scheduled activity'}
                              </p>

                              {schedule.notes && (
                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {schedule.notes}
                                </p>
                              )}

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/caregiver/schedule')
                    }
                    className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    View full schedule
                  </button>

                </div>

              </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <section className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600">
                  <FileText size={20} />
                </div>

                <div>

                  <h2 className="font-extrabold text-blue-900">
                    CareMate Care Report
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    This report provides a quick overview of
                    the patient's current care activities and
                    medical documents recorded in CareMate.
                  </p>

                </div>

              </div>

            </section>

          </>

        )}

      </main>

      {/* Floating Role-Aware Assistant */}
      <AIChat
        patientId={selectedPatientId}
        patientName={patients.find((p) => p._id === selectedPatientId)?.name}
      />

    </div>
  );
};

export default Reports;