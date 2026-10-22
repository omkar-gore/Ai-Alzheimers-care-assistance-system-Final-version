import React, { useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import axios from '../services/axios';

import {
  Heart,
  Users,
  Stethoscope,
  Brain,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  User,
  Calendar,
  MapPin,
  AlertCircle,
  Building2,
  GraduationCap,
  Briefcase,
  Loader2,
} from 'lucide-react';

const roleLabels = {
  patient: 'Patient',
  caregiver: 'Caregiver',
  doctor: 'Doctor',
};

const roleConfig = {
  patient: {
    icon: Heart,
    title: 'Patient',
    smallTitle: 'Patient Portal',
    subtitle:
      'A simple and supportive space to manage your daily care, routine, memory support and wellbeing.',
    gradient: 'from-blue-600 to-cyan-500',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    ring: 'focus:border-blue-500 focus:ring-blue-100',
  },

  caregiver: {
    icon: Users,
    title: 'Caregiver',
    smallTitle: 'Caregiver Portal',
    subtitle:
      'Stay connected with your loved one and manage medicines, schedules, activities and important care information.',
    gradient: 'from-cyan-600 to-teal-500',
    lightBg: 'bg-cyan-50',
    lightText: 'text-cyan-600',
    button: 'bg-cyan-600 hover:bg-cyan-700',
    ring: 'focus:border-cyan-500 focus:ring-cyan-100',
  },

  doctor: {
    icon: Stethoscope,
    title: 'Doctor',
    smallTitle: 'Doctor Portal',
    subtitle:
      'Access meaningful patient information, reports and health insights to support better care decisions.',
    gradient: 'from-blue-700 to-indigo-600',
    lightBg: 'bg-indigo-50',
    lightText: 'text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    ring: 'focus:border-indigo-500 focus:ring-indigo-100',
  },
};

/* =========================================================
   INPUT COMPONENT
   IMPORTANT:
   This component is outside AuthPage so it does not get
   recreated every time the form state changes.
========================================================= */

const InputField = ({
  label,
  name,
  type = 'text',
  placeholder,
  icon: Icon,
  required = false,
  value,
  min,
  onChange,
  config,
}) => {
  return (
    <div className="group">
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${config.lightText} opacity-60 transition group-focus-within:opacity-100`}
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          required={required}
          className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 ${
            Icon ? 'pl-11' : 'pl-4'
          } pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:bg-white focus:ring-4 ${config.ring}`}
        />
      </div>
    </div>
  );
};

/* =========================================================
   PASSWORD COMPONENT
   IMPORTANT:
   This component is also outside AuthPage.
========================================================= */

const PasswordField = ({
  label,
  name,
  value,
  show,
  setShow,
  placeholder,
  required = false,
  onChange,
  config,
}) => {
  return (
    <div className="group">
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <Lock
          size={18}
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${config.lightText} opacity-60`}
        />

        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:bg-white focus:ring-4 ${config.ring}`}
        />

        <button
          type="button"
          onClick={() => setShow((previous) => !previous)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   AUTH PAGE
========================================================= */

const AuthPage = () => {
  const { role, mode } = useParams();

  const navigate = useNavigate();

  const { login } = useAuth();

  const isLogin = mode === 'login';

  const config =
    roleConfig[role] || roleConfig.patient;

  const RoleIcon = config.icon;

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    age: '',
    gender: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Patient
    caregiverName: '',
    emergencyContact: '',
    address: '',
    dateOfBirth: '',

    // Caregiver
    relationshipWithPatient: '',
    patientName: '',
    patientId: '',
    patientEmail: '',
    caregiverEmergencyContact: '',

    // Doctor
    medicalDegree: '',
    specialization: '',
    clinicName: '',
    yearsOfExperience: '',
    medicalRegistrationNumber: '',
  });

  /* =========================================================
     GENERAL INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  /* =========================================================
     DATE OF BIRTH CHANGE
     DD/MM/YYYY
  ========================================================= */

  const handleDateOfBirthChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    if (value.length > 4) {
      value =
        value.slice(0, 2) +
        '/' +
        value.slice(2, 4) +
        '/' +
        value.slice(4);
    } else if (value.length > 2) {
      value =
        value.slice(0, 2) +
        '/' +
        value.slice(2);
    }

    setForm((previous) => ({
      ...previous,
      dateOfBirth: value,
    }));

    if (error) {
      setError('');
    }
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');

    if (!form.email && !form.phone) {
      setError(
        'Please enter your email or phone number.'
      );
      return;
    }

    if (!form.password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(
        form.email || form.phone,
        form.password
      );

      if (res.user.role !== role) {
        setError(
          'Access denied. This account does not belong to the selected module.'
        );

        setLoading(false);
        return;
      }

      if (role === 'patient') {
        navigate('/patient/dashboard');
      } else if (role === 'caregiver') {
        navigate('/caregiver/dashboard');
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
    }

    setLoading(false);
  };

  /* =========================================================
     REGISTRATION
  ========================================================= */

  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');

    if (!form.password || !form.confirmPassword) {
      setError(
        'Password and confirm password are required.'
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (
      !form.fullName ||
      !form.age ||
      !form.gender ||
      !form.email ||
      !form.phone
    ) {
      setError(
        'Please fill all required basic information.'
      );
      return;
    }

    /* =======================================================
       PATIENT VALIDATION
    ======================================================= */

    if (role === 'patient') {
      if (
        !form.caregiverName ||
        !form.emergencyContact ||
        !form.address ||
        !form.dateOfBirth
      ) {
        setError(
          'Please fill all patient care information.'
        );
        return;
      }

      const datePattern =
        /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

      if (!datePattern.test(form.dateOfBirth)) {
        setError(
          'Please enter a valid date of birth in DD/MM/YYYY format.'
        );
        return;
      }
    }

    /* =======================================================
       CAREGIVER VALIDATION
    ======================================================= */

    if (role === 'caregiver') {
      if (
        !form.relationshipWithPatient ||
        !form.patientName ||
        !form.caregiverEmergencyContact
      ) {
        setError(
          'Please fill all caregiver information.'
        );
        return;
      }
    }

    /* =======================================================
       DOCTOR VALIDATION
    ======================================================= */

    if (role === 'doctor') {
      if (
        !form.medicalDegree ||
        !form.specialization ||
        !form.clinicName ||
        !form.yearsOfExperience ||
        !form.medicalRegistrationNumber
      ) {
        setError(
          'Please fill all professional information.'
        );
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name: form.fullName,
        age: parseInt(form.age, 10),
        gender: form.gender,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
      };

      /* =====================================================
         PATIENT FIELDS
      ===================================================== */

      if (role === 'patient') {
        payload.caregiverName =
          form.caregiverName;

        payload.emergencyContact =
          form.emergencyContact;

        payload.address =
          form.address;

        payload.dateOfBirth =
          form.dateOfBirth;
      }

      /* =====================================================
         CAREGIVER FIELDS
      ===================================================== */

      if (role === 'caregiver') {
        payload.relationshipWithPatient =
          form.relationshipWithPatient;

        payload.patientName =
          form.patientName;

        payload.patientId =
          form.patientId || null;

        payload.patientEmail =
          form.patientEmail || null;

        payload.caregiverEmergencyContact =
          form.caregiverEmergencyContact;
      }

      /* =====================================================
         DOCTOR FIELDS
      ===================================================== */

      if (role === 'doctor') {
        payload.medicalDegree =
          form.medicalDegree;

        payload.specialization =
          form.specialization;

        payload.clinicName =
          form.clinicName;

        payload.yearsOfExperience =
          parseInt(
            form.yearsOfExperience,
            10
          );

        payload.medicalRegistrationNumber =
          form.medicalRegistrationNumber;
      }

      await axios.post(
        '/auth/register',
        payload
      );

      alert(
        `${roleLabels[role]} registration successful. Please login.`
      );

      navigate(
        `/auth/${role}/login`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff]">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">

          {/* LOGO */}

          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200 transition duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Heart
                size={23}
                fill="currentColor"
              />
            </div>

            <div className="text-left">
              <div className="text-xl font-extrabold tracking-tight text-slate-900">
                Care
                <span className="text-blue-600">
                  Mate
                </span>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Connected Care
              </div>
            </div>
          </button>

          {/* BACK */}

          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition duration-300 hover:bg-blue-50 hover:text-blue-600"
          >
            <ArrowLeft
              size={17}
              className="transition group-hover:-translate-x-1"
            />

            <span className="hidden sm:inline">
              Back to Home
            </span>
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* BACKGROUND DECORATION */}

        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-blue-200/50 lg:grid-cols-[0.85fr_1.15fr]">

          {/* =================================================
              LEFT INFORMATION PANEL
          ================================================= */}

          <section
            className={`relative hidden overflow-hidden bg-gradient-to-br ${config.gradient} p-8 text-white lg:flex lg:min-h-[720px] lg:flex-col xl:p-11`}
          >

            {/* DECORATIVE CIRCLES */}

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10" />

            <div className="absolute right-10 top-1/2 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

            {/* ROLE BADGE */}

            <div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <RoleIcon size={15} />

              {config.smallTitle}
            </div>

            {/* MAIN CONTENT */}

            <div className="relative z-10 my-auto">

              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 shadow-xl backdrop-blur-md">
                <RoleIcon
                  size={38}
                  strokeWidth={1.8}
                />
              </div>

              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                {isLogin
                  ? 'Welcome back'
                  : 'Start your journey'}
              </p>

              <h1 className="max-w-md text-4xl font-extrabold leading-tight xl:text-5xl">
                {isLogin
                  ? `Welcome back, ${config.title}.`
                  : `Care that connects everyone.`}
              </h1>

              <p className="mt-6 max-w-md text-base leading-8 text-white/85">
                {config.subtitle}
              </p>

              {/* BENEFITS */}

              <div className="mt-9 space-y-4">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Brain size={19} />
                  </div>

                  <span className="text-sm font-semibold">
                    Intelligent patient assistance
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Heart size={19} />
                  </div>

                  <span className="text-sm font-semibold">
                    Compassionate connected care
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <ShieldCheck size={19} />
                  </div>

                  <span className="text-sm font-semibold">
                    Secure role-based access
                  </span>
                </div>

              </div>
            </div>

            {/* BOTTOM */}

            <div className="relative z-10 flex items-center gap-2 border-t border-white/15 pt-5 text-xs text-white/65">
              <ShieldCheck size={15} />

              Your information is protected with secure authentication.
            </div>
          </section>

          {/* =================================================
              RIGHT FORM PANEL
          ================================================= */}

          <section className="min-w-0 bg-white">

            <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-12">

              {/* MOBILE ROLE HEADER */}

              <div className="mb-7 flex items-center gap-3 lg:hidden">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${config.lightBg} ${config.lightText}`}
                >
                  <RoleIcon size={23} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {config.smallTitle}
                  </p>

                  <p className="text-sm font-bold text-slate-800">
                    CareMate
                  </p>
                </div>
              </div>

              {/* HEADING */}

              <div className="mb-8">

                <div
                  className={`mb-4 inline-flex items-center gap-2 rounded-full ${config.lightBg} px-4 py-2 text-xs font-bold ${config.lightText}`}
                >
                  <RoleIcon size={14} />

                  {isLogin
                    ? `${config.title} Login`
                    : `${config.title} Registration`}
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {isLogin
                    ? 'Welcome back!'
                    : `Create your ${config.title} account`}
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
                  {isLogin
                    ? 'Enter your credentials below to securely continue to your CareMate dashboard.'
                    : 'Enter your information below to create your secure CareMate account.'}
                </p>
              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">

                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-bold">
                      Please check your information
                    </p>

                    <p className="mt-1 leading-5">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={
                  isLogin
                    ? handleLogin
                    : handleRegister
                }
                className="space-y-7"
              >

                {/* =================================================
                    LOGIN
                ================================================= */}

                {isLogin ? (
                  <>
                    <div className="space-y-5">

                      <InputField
                        label="Email or Phone Number"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email or phone"
                        icon={Mail}
                        required
                        config={config}
                      />

                      <PasswordField
                        label="Password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        show={showPassword}
                        setShow={setShowPassword}
                        required
                        config={config}
                      />

                    </div>

                    {/* LOGIN INFORMATION CARD */}

                    <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm">
                          <ShieldCheck size={16} />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            Secure Login
                          </p>

                          <p className="text-[10px] text-slate-500">
                            Protected account access
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full ${config.lightBg} px-3 py-1 text-[10px] font-bold ${config.lightText}`}
                      >
                        {config.title}
                      </span>
                    </div>
                  </>
                ) : (
                  <>

                    {/* =================================================
                        BASIC INFORMATION
                    ================================================= */}

                    <section>

                      <div className="mb-5 flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.lightBg} ${config.lightText}`}
                        >
                          <User size={19} />
                        </div>

                        <div>
                          <h3 className="font-extrabold text-slate-900">
                            Basic Information
                          </h3>

                          <p className="text-xs text-slate-400">
                            Tell us about yourself
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">

                        <InputField
                          label="Full Name"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          icon={User}
                          required
                          config={config}
                        />

                        <InputField
                          label="Age"
                          name="age"
                          type="number"
                          value={form.age}
                          onChange={handleChange}
                          placeholder="Enter age"
                          min={1}
                          required
                          config={config}
                        />

                        {/* GENDER */}

                        <div className="group">

                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Gender

                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            required
                            className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition hover:border-slate-300 hover:bg-white focus:bg-white focus:ring-4 ${config.ring}`}
                          >
                            <option value="">
                              Select gender
                            </option>

                            <option value="Male">
                              Male
                            </option>

                            <option value="Female">
                              Female
                            </option>

                            <option value="Other">
                              Other
                            </option>
                          </select>
                        </div>

                        <InputField
                          label="Phone Number"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          icon={Phone}
                          required
                          config={config}
                        />

                        <div className="sm:col-span-2">

                          <InputField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            icon={Mail}
                            required
                            config={config}
                          />

                        </div>
                      </div>
                    </section>

                    {/* =================================================
                        SECURITY
                    ================================================= */}

                    <section>

                      <div className="mb-5 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Lock size={19} />
                        </div>

                        <div>
                          <h3 className="font-extrabold text-slate-900">
                            Account Security
                          </h3>

                          <p className="text-xs text-slate-400">
                            Create a secure password
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">

                        <PasswordField
                          label="Password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Create password"
                          show={showPassword}
                          setShow={setShowPassword}
                          required
                          config={config}
                        />

                        <PasswordField
                          label="Confirm Password"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          show={showConfirmPassword}
                          setShow={setShowConfirmPassword}
                          required
                          config={config}
                        />

                      </div>
                    </section>

                    {/* =================================================
                        PATIENT INFORMATION
                    ================================================= */}

                    {role === 'patient' && (
                      <section>

                        <div className="mb-5 flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                            <Heart size={19} />
                          </div>

                          <div>
                            <h3 className="font-extrabold text-slate-900">
                              Patient Care Information
                            </h3>

                            <p className="text-xs text-slate-400">
                              Information for better care support
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                          <InputField
                            label="Caregiver Name"
                            name="caregiverName"
                            value={form.caregiverName}
                            onChange={handleChange}
                            placeholder="Caregiver full name"
                            icon={Users}
                            required
                            config={config}
                          />

                          <InputField
                            label="Emergency Contact"
                            name="emergencyContact"
                            value={form.emergencyContact}
                            onChange={handleChange}
                            placeholder="Emergency phone number"
                            icon={Phone}
                            required
                            config={config}
                          />

                          <div className="sm:col-span-2">

                            <InputField
                              label="Address"
                              name="address"
                              value={form.address}
                              onChange={handleChange}
                              placeholder="Enter your address"
                              icon={MapPin}
                              required
                              config={config}
                            />

                          </div>

                          {/* DATE OF BIRTH */}

                          <div className="group">

                            <label className="mb-2 block text-sm font-bold text-slate-700">
                              Date of Birth

                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            </label>

                            <div className="relative">

                              <Calendar
                                size={18}
                                className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${config.lightText} opacity-60 transition group-focus-within:opacity-100`}
                              />

                              <input
                                type="text"
                                name="dateOfBirth"
                                value={form.dateOfBirth}
                                onChange={
                                  handleDateOfBirthChange
                                }
                                placeholder="DD/MM/YYYY"
                                inputMode="numeric"
                                maxLength={10}
                                required
                                className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:bg-white focus:ring-4 ${config.ring}`}
                              />

                            </div>

                            <p className="mt-1.5 text-[11px] text-slate-400">
                              Enter your date of birth as DD/MM/YYYY
                            </p>
                          </div>

                        </div>
                      </section>
                    )}

                    {/* =================================================
                        CAREGIVER INFORMATION
                    ================================================= */}

                    {role === 'caregiver' && (
                      <section>

                        <div className="mb-5 flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                            <Users size={19} />
                          </div>

                          <div>
                            <h3 className="font-extrabold text-slate-900">
                              Patient Connection
                            </h3>

                            <p className="text-xs text-slate-400">
                              Tell us about the person you care for
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                          <InputField
                            label="Relationship with Patient"
                            name="relationshipWithPatient"
                            value={
                              form.relationshipWithPatient
                            }
                            onChange={handleChange}
                            placeholder="e.g. Daughter, Son, Spouse"
                            icon={Users}
                            required
                            config={config}
                          />

                          <InputField
                            label="Patient Name"
                            name="patientName"
                            value={form.patientName}
                            onChange={handleChange}
                            placeholder="Patient full name"
                            icon={User}
                            required
                            config={config}
                          />

                          <InputField
                            label="Patient ID"
                            name="patientId"
                            value={form.patientId}
                            onChange={handleChange}
                            placeholder="Optional patient ID"
                            config={config}
                          />

                          <InputField
                            label="Patient Email"
                            name="patientEmail"
                            type="email"
                            value={form.patientEmail}
                            onChange={handleChange}
                            placeholder="Optional patient email"
                            icon={Mail}
                            config={config}
                          />

                          <div className="sm:col-span-2">

                            <InputField
                              label="Emergency Contact"
                              name="caregiverEmergencyContact"
                              value={
                                form.caregiverEmergencyContact
                              }
                              onChange={handleChange}
                              placeholder="Emergency contact number"
                              icon={Phone}
                              required
                              config={config}
                            />

                          </div>

                        </div>
                      </section>
                    )}

                    {/* =================================================
                        DOCTOR INFORMATION
                    ================================================= */}

                    {role === 'doctor' && (
                      <section>

                        <div className="mb-5 flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Stethoscope size={19} />
                          </div>

                          <div>
                            <h3 className="font-extrabold text-slate-900">
                              Professional Information
                            </h3>

                            <p className="text-xs text-slate-400">
                              Enter your medical professional details
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                          <InputField
                            label="Medical Degree"
                            name="medicalDegree"
                            value={form.medicalDegree}
                            onChange={handleChange}
                            placeholder="e.g. MBBS, MD"
                            icon={GraduationCap}
                            required
                            config={config}
                          />

                          <InputField
                            label="Specialization"
                            name="specialization"
                            value={form.specialization}
                            onChange={handleChange}
                            placeholder="e.g. Neurology"
                            icon={Briefcase}
                            required
                            config={config}
                          />

                          <div className="sm:col-span-2">

                            <InputField
                              label="Hospital / Clinic Name"
                              name="clinicName"
                              value={form.clinicName}
                              onChange={handleChange}
                              placeholder="Enter hospital or clinic name"
                              icon={Building2}
                              required
                              config={config}
                            />

                          </div>

                          <InputField
                            label="Years of Experience"
                            name="yearsOfExperience"
                            type="number"
                            value={form.yearsOfExperience}
                            onChange={handleChange}
                            placeholder="Years"
                            min={0}
                            required
                            config={config}
                          />

                          <InputField
                            label="Medical Registration Number"
                            name="medicalRegistrationNumber"
                            value={
                              form.medicalRegistrationNumber
                            }
                            onChange={handleChange}
                            placeholder="Registration number"
                            required
                            config={config}
                          />

                        </div>
                      </section>
                    )}

                  </>
                )}

                {/* =================================================
                    SUBMIT BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className={`group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${config.gradient} px-6 py-4 text-sm font-extrabold text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0`}
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />

                      Processing...
                    </>
                  ) : (
                    <>
                      {isLogin
                        ? `Login to ${config.title} Portal`
                        : `Create ${config.title} Account`}

                      <ArrowRight
                        size={18}
                        className="transition duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                {/* =================================================
                    LOGIN / REGISTER SWITCH
                ================================================= */}

                <div className="rounded-2xl border border-blue-100 bg-[#f4faff] p-5 text-center">

                  {isLogin ? (
                    <p className="text-sm text-slate-600">

                      Don't have{' '}

                      <span className="font-bold text-slate-800">
                        {config.title}
                      </span>{' '}

                      account?

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/auth/${role}/register`
                          )
                        }
                        className={`ml-1 font-extrabold ${config.lightText} transition hover:underline`}
                      >
                        Create an account
                      </button>

                    </p>
                  ) : (
                    <p className="text-sm text-slate-600">

                      Already have{' '}

                      <span className="font-bold text-slate-800">
                        {config.title}
                      </span>{' '}

                      account?

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/auth/${role}/login`
                          )
                        }
                        className={`ml-1 font-extrabold ${config.lightText} transition hover:underline`}
                      >
                        Login here
                      </button>

                    </p>
                  )}

                </div>

              </form>

              {/* SECURITY FOOTER */}

              <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                <ShieldCheck size={14} />

                Secure authentication • CareMate Connected Care
              </div>

            </div>
          </section>
        </div>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-blue-100 bg-white py-5 text-center">

        <p className="text-xs font-medium text-slate-400">
          © 2026 CareMate. Built for connected and compassionate care.
        </p>

      </footer>

    </div>
  );
};

export default AuthPage;