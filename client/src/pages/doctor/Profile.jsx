import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Save,
  Pencil,
  X,
  FileBadge,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import AIChat from '../../components/AIChat';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();

  // Profile data state
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    gender: '',
    age: '',
    medicalDegree: '',
    specialization: '',
    clinicName: '',
    yearsOfExperience: '',
  });

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Fetch Doctor Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/doctor/profile');
      if (res.data?.doctor) {
        const doc = res.data.doctor;
        setDoctor(doc);
        setEditForm({
          name: doc.name || '',
          phone: doc.phone || '',
          gender: doc.gender || '',
          age: doc.age || '',
          medicalDegree: doc.medicalDegree || '',
          specialization: doc.specialization || '',
          clinicName: doc.clinicName || '',
          yearsOfExperience: doc.yearsOfExperience !== undefined ? String(doc.yearsOfExperience) : '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err);
      setError(
        err.response?.data?.message ||
          'Unable to load profile information. Please check your connection and login.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Edit Profile submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        name: editForm.name,
        phone: editForm.phone,
        gender: editForm.gender,
        age: editForm.age ? Number(editForm.age) : undefined,
        medicalDegree: editForm.medicalDegree,
        specialization: editForm.specialization,
        clinicName: editForm.clinicName,
        yearsOfExperience: editForm.yearsOfExperience ? Number(editForm.yearsOfExperience) : 0,
      };

      const res = await axios.put('/doctor/profile', payload);
      if (res.data?.doctor) {
        setDoctor(res.data.doctor);
        if (setUser && user) {
          setUser({ ...user, name: res.data.doctor.name, phone: res.data.doctor.phone });
        }
      }
      setSuccessMessage(res.data?.message || 'Profile updated successfully.');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Change Password submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await axios.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordSuccess(res.data?.message || 'Password changed successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setPasswordError(
        err.response?.data?.message ||
          'Failed to change password. Please verify current password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClearPasswordForm = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/doctor/login', { replace: true });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
        {/* PAGE TITLE & SUBTITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck size={14} />
              <span>Practitioner Credentials</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Doctor Profile
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              View and manage your professional and account information.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchProfile}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-200 transition"
              >
                <Pencil size={15} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <X size={15} />
                <span>Cancel Editing</span>
              </button>
            )}
          </div>
        </div>

        {/* FEEDBACK ALERTS */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="text-emerald-500 hover:text-emerald-700 p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading && !doctor ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-bold text-sm">Loading Doctor profile credentials...</p>
          </div>
        ) : (
          <>
            {/* =====================================================
                SECTION 1: HERO OVERVIEW CARD
            ====================================================== */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-100 shrink-0">
                    {doctor?.name
                      ? doctor.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'DR'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {doctor?.name || user?.name || 'Dr. Medical Practitioner'}
                      </h2>
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {doctor?.role ? doctor.role.charAt(0).toUpperCase() + doctor.role.slice(1) : 'Doctor'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mt-1">
                      {doctor?.specialization || 'Clinical Practitioner'} •{' '}
                      {doctor?.clinicName || 'Affiliated Hospital/Clinic'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 self-start sm:self-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Assigned Panel
                      </span>
                      <span className="text-lg font-black text-slate-800">
                        {doctor?.patientCount ?? 0} Patients
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* READ-ONLY INFORMATION GRID */}
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Doctor Name */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User size={14} className="text-indigo-600" />
                      <span>Doctor Name</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.name || 'Not provided'}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Mail size={14} className="text-indigo-600" />
                      <span>Email Address</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.email || user?.email || 'Not provided'}
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Phone size={14} className="text-indigo-600" />
                      <span>Phone Number</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.phone || 'Not provided'}
                    </p>
                  </div>

                  {/* Specialization */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-indigo-600" />
                      <span>Specialization</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.specialization || 'Not provided'}
                    </p>
                  </div>

                  {/* Qualification / Medical Degree */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-indigo-600" />
                      <span>Qualification (Medical Degree)</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.medicalDegree || 'Not provided'}
                    </p>
                  </div>

                  {/* Medical Registration Number */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileBadge size={14} className="text-indigo-600" />
                      <span>Medical Registration Number</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.medicalRegistrationNumber || 'Not provided'}
                    </p>
                  </div>

                  {/* Hospital / Clinic */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Building2 size={14} className="text-indigo-600" />
                      <span>Hospital / Clinic</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.clinicName || 'Not provided'}
                    </p>
                  </div>

                  {/* Years of Experience */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock size={14} className="text-indigo-600" />
                      <span>Years of Experience</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.yearsOfExperience !== undefined && doctor?.yearsOfExperience !== null
                        ? `${doctor.yearsOfExperience} years`
                        : 'Not provided'}
                    </p>
                  </div>

                  {/* Gender */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User size={14} className="text-indigo-600" />
                      <span>Gender</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.gender || 'Not provided'}
                    </p>
                  </div>

                  {/* Age */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-600" />
                      <span>Age</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.age ? `${doctor.age} years` : 'Not provided'}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <MapPin size={14} className="text-indigo-600" />
                      <span>Address</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      Not provided
                    </p>
                  </div>

                  {/* Account Role */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-indigo-600" />
                      <span>Account Role</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      Doctor (Clinical Practitioner)
                    </p>
                  </div>

                  {/* Account Created Date */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1 md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-600" />
                      <span>Account Created Date</span>
                    </span>
                    <p className="text-base font-extrabold text-slate-800">
                      {doctor?.createdAt
                        ? new Date(doctor.createdAt).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Doctor Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. 9876509876"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Gender
                      </label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="120"
                        value={editForm.age}
                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Qualification (Medical Degree)
                      </label>
                      <input
                        type="text"
                        value={editForm.medicalDegree}
                        onChange={(e) => setEditForm({ ...editForm, medicalDegree: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. MBBS, MD (Neurology)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={editForm.specialization}
                        onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Cognitive Neurology"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Hospital / Clinic
                      </label>
                      <input
                        type="text"
                        value={editForm.clinicName}
                        onChange={(e) => setEditForm({ ...editForm, clinicName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. City Memory Clinic"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="80"
                        value={editForm.yearsOfExperience}
                        onChange={(e) => setEditForm({ ...editForm, yearsOfExperience: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                    >
                      <Save size={16} />
                      <span>{editLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* =====================================================
                SECTION 2: ACCOUNT & SECURITY / CHANGE PASSWORD
            ====================================================== */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Lock size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Account &amp; Security
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Manage your credentials and password security.
                  </p>
                </div>
              </div>

              {/* Password feedback alerts */}
              {passwordError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-center gap-2.5">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                  Change Password
                </h3>

                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="Enter current password"
                      className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-200 transition disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating Password...' : 'Change Password'}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearPasswordForm}
                    className="px-5 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition"
                  >
                    Cancel / Clear
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
    </div>
  );
};

export default DoctorProfile;
