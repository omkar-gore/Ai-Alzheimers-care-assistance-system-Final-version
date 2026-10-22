import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Camera,
  Pencil,
  Save,
  X,
  Lock,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Heart,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import PatientLayout from './PatientLayout';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();

  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [profileImage, setProfileImage] = useState(
    user?.profileImage || ''
  );

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [notifications, setNotifications] = useState({
    medicationReminders: true,
    appointmentReminders: true,
    taskReminders: true,
    emergencyAlerts: true,
    emailNotifications: false,
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      setErrorMessage('');

      /*
       * We use the existing auth/user information here.
       * This keeps the patient profile independent from
       * caregiver-only profile routes.
       */

      if (user) {
        setFormData({
          name: user.name || '',
          age: user.age || '',
          gender: user.gender || '',
          email: user.email || '',
          phone: user.phone || '',
        });

        setProfileImage(user.profileImage || '');
      }
    } catch (error) {
      console.error('Load patient profile error:', error);

      setErrorMessage(
        'Failed to load your profile.'
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  // ==========================================
  // MESSAGE HELPERS
  // ==========================================

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage('');

    window.setTimeout(() => {
      setSuccessMessage('');
    }, 3500);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage('');

    window.setTimeout(() => {
      setErrorMessage('');
    }, 4500);
  };

  // ==========================================
  // INPUT HANDLERS
  // ==========================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // PROFILE PHOTO
  // ==========================================

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError(
        'Please select a valid image file.'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError(
        'Profile image must be smaller than 5 MB.'
      );
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setProfileImage(imageUrl);

    showSuccess(
      'Photo selected. Permanent photo upload can be connected later.'
    );
  };

  const handleRemovePhoto = () => {
    setProfileImage('');

    showSuccess(
      'Photo removed from the current preview.'
    );
  };

  // ==========================================
  // EDIT PROFILE
  // ==========================================

  const handleEdit = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    loadProfile();
    setIsEditing(false);
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      showError('Full name is required.');
      return;
    }

    if (!formData.email.trim()) {
      showError('Email address is required.');
      return;
    }

    if (!formData.phone.trim()) {
      showError('Phone number is required.');
      return;
    }

    if (
      formData.age !== '' &&
      (Number(formData.age) < 1 ||
        Number(formData.age) > 120)
    ) {
      showError('Please enter a valid age.');
      return;
    }

    if (
      formData.gender &&
      !['Male', 'Female', 'Other'].includes(
        formData.gender
      )
    ) {
      showError('Please select a valid gender.');
      return;
    }

    /*
     * Patient profile backend route may not exist yet.
     * For now we update the AuthContext/local user state.
     * This makes the page fully usable without touching
     * the existing caregiver backend.
     */

    try {
      setSavingProfile(true);
      setErrorMessage('');

      const payload = {
        name: formData.name.trim(),
        age: formData.age === '' ? null : Number(formData.age),
        gender: formData.gender,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        profileImage,
      };

      const res = await axios.put('/profile', payload);
      const savedUser = res.data?.user || { ...user, ...payload };

      setUser(savedUser);

      setFormData({
        name: savedUser.name || '',
        age: savedUser.age || '',
        gender: savedUser.gender || '',
        email: savedUser.email || '',
        phone: savedUser.phone || '',
      });

      setIsEditing(false);

      showSuccess(
        'Profile updated successfully.'
      );
    } catch (error) {
      console.error(
        'Save patient profile error:',
        error
      );

      showError(
        'Failed to update your profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordData.currentPassword) {
      showError(
        'Please enter your current password.'
      );
      return;
    }

    if (!passwordData.newPassword) {
      showError(
        'Please enter a new password.'
      );
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError(
        'New password must contain at least 6 characters.'
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      showError(
        'New password and confirm password do not match.'
      );
      return;
    }

    /*
     * Password API will be connected when the
     * patient-specific backend profile controller
     * is added.
     *
     * We do not call the caregiver-only /profile
     * endpoint here.
     */

    try {
      setChangingPassword(true);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showSuccess(
        'Password details validated. Password API will be connected next.'
      );
    } catch (error) {
      console.error(
        'Change password error:',
        error
      );

      showError(
        'Failed to update your password.'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const handleNotificationChange = (name) => {
    setNotifications((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    navigate('/auth/patient/login', { replace: true });
  };

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================

  const handleDeleteAccount = async () => {
    /*
     * Account deletion will be connected through
     * the patient backend controller later.
     *
     * We intentionally do not call the caregiver
     * profile endpoint.
     */

    try {
      setDeletingAccount(true);

      showSuccess(
        'Account deletion service will be connected next.'
      );

      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error(
        'Delete account error:',
        error
      );

      showError(
        'Failed to delete your account.'
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const getInitials = () => {
    if (!formData.name) {
      return 'P';
    }

    return formData.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  };

  const formatRole = (role) => {
    if (!role) {
      return 'Patient';
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
  };

  const InputField = ({
    label,
    name,
    value,
    type = 'text',
    placeholder,
  }) => {
    return (
      <div className="flex flex-col gap-2">

        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>

        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={!isEditing}
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
            !isEditing
              ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600'
              : 'border-slate-300 bg-white text-slate-800 focus:border-slate-500 focus:ring-2 focus:ring-slate-100'
          }`}
        />

      </div>
    );
  };

  const PasswordInput = ({
    label,
    name,
    value,
    showPassword,
    setShowPassword,
  }) => {
    return (
      <div className="flex flex-col gap-2">

        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>

        <div className="relative">

          <input
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            name={name}
            value={value}
            onChange={handlePasswordChange}
            placeholder="Enter password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>

        </div>

      </div>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingProfile) {
    return (
      <PatientLayout
        title="My Profile"
        subtitle="Manage your personal CareMate account."
      >
        <div className="flex min-h-[55vh] items-center justify-center">

          <div className="rounded-2xl border border-blue-100 bg-white px-8 py-7 text-center shadow-xl shadow-blue-100/50">

            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-4 text-sm font-bold text-slate-700">
              Loading your profile...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait a moment.
            </p>

          </div>

        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout
      title="My Profile"
      subtitle="Manage your personal CareMate account."
    >

      <div className="space-y-6">

        {/* ======================================
            SUCCESS / ERROR
        ======================================= */}

        {successMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={19} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <X size={19} />
            <span>{errorMessage}</span>
          </div>
        )}


        {/* ======================================
            PROFILE HEADER
        ======================================= */}

        <section className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">

          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />

          <div className="-mt-16 px-5 pb-6 sm:px-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex flex-col items-center sm:flex-row sm:items-end">

                {/* Photo */}

                <div className="relative">

                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-100 shadow-lg">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Patient profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-black text-blue-600">
                        {getInitials()}
                      </span>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
                    title="Change profile photo"
                  >
                    <Camera size={17} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />

                </div>


                <div className="mt-4 text-center sm:ml-5 sm:mt-0 sm:text-left">

                  <h2 className="text-2xl font-black text-slate-900">
                    {formData.name || 'Patient'}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    {formatRole(user?.role)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    CareMate Patient Portal
                  </p>

                </div>

              </div>


              {/* Photo buttons */}

              <div className="flex justify-center gap-2 sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Camera size={16} />
                  Change Photo
                </button>

                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}

              </div>

            </div>

          </div>

        </section>


        {/* ======================================
            PERSONAL INFORMATION
        ======================================= */}

        <section className="rounded-[26px] border border-blue-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">

            <div>

              <p className="text-xs font-black uppercase tracking-[1.3px] text-blue-600">
                Personal details
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-800">
                Personal Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your basic patient account information.
              </p>

            </div>


            {!isEditing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <Pencil size={16} />

                <span className="hidden sm:inline">
                  Edit Profile
                </span>
              </button>
            ) : (
              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  form="patient-profile-form"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  <Save size={16} />

                  {savingProfile
                    ? 'Saving...'
                    : 'Save'}
                </button>

              </div>
            )}

          </div>


          <form
            id="patient-profile-form"
            onSubmit={handleSaveProfile}
            className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"
          >

            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              placeholder="Enter your full name"
            />

            <InputField
              label="Age"
              name="age"
              value={formData.age}
              type="number"
              placeholder="Enter your age"
            />


            <div className="flex flex-col gap-2">

              <label className="text-sm font-semibold text-slate-700">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  !isEditing
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600'
                    : 'border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              >

                <option value="">
                  Select gender
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            <InputField
              label="Email Address"
              name="email"
              value={formData.email}
              type="email"
              placeholder="Enter your email"
            />


            <InputField
              label="Phone Number"
              name="phone"
              value={formData.phone}
              placeholder="Enter your phone number"
            />


            <div className="flex flex-col gap-2">

              <label className="text-sm font-semibold text-slate-700">
                Account Role
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                <User
                  size={18}
                  className="text-blue-500"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Patient
                </span>

              </div>

            </div>

          </form>

        </section>


        {/* ======================================
            HEALTH & CARE INFORMATION
        ======================================= */}

        <section className="rounded-[26px] border border-blue-100 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <Heart
                  size={19}
                  fill="currentColor"
                />
              </div>

              <div>

                <h2 className="font-black text-slate-900">
                  Care Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your CareMate support information.
                </p>

              </div>

            </div>

          </div>


          <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">

            <InfoCard
              icon={Heart}
              title="Care Support"
              value="Connected"
            />

            <InfoCard
              icon={Shield}
              title="Patient Portal"
              value="Active"
            />

            <InfoCard
              icon={User}
              title="Account Type"
              value="Patient"
            />

          </div>

        </section>


        {/* ======================================
            CHANGE PASSWORD
        ======================================= */}

        <section className="rounded-[26px] border border-blue-100 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Lock size={19} />
              </div>

              <div>

                <h2 className="font-black text-slate-900">
                  Change Password
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Keep your CareMate account secure.
                </p>

              </div>

            </div>

          </div>


          <form
            onSubmit={handleChangePassword}
            className="grid gap-5 p-5 sm:p-6"
          >

            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={
                passwordData.currentPassword
              }
              showPassword={
                showCurrentPassword
              }
              setShowPassword={
                setShowCurrentPassword
              }
            />

            <div className="grid gap-5 sm:grid-cols-2">

              <PasswordInput
                label="New Password"
                name="newPassword"
                value={
                  passwordData.newPassword
                }
                showPassword={
                  showNewPassword
                }
                setShowPassword={
                  setShowNewPassword
                }
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={
                  passwordData.confirmPassword
                }
                showPassword={
                  showConfirmPassword
                }
                setShowPassword={
                  setShowConfirmPassword
                }
              />

            </div>


            <div className="flex justify-end">

              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changingPassword
                  ? 'Updating...'
                  : 'Update Password'}
              </button>

            </div>

          </form>

        </section>


        {/* ======================================
            NOTIFICATIONS
        ======================================= */}

        <section className="rounded-[26px] border border-blue-100 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Bell size={19} />
              </div>

              <div>

                <h2 className="font-black text-slate-900">
                  Notifications
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Choose which reminders you want to receive.
                </p>

              </div>

            </div>

          </div>


          <div className="divide-y divide-slate-100">

            {[
              {
                key: 'medicationReminders',
                title: 'Medication Reminders',
                description:
                  'Receive reminders when medicines are due.',
              },
              {
                key: 'appointmentReminders',
                title: 'Appointment Reminders',
                description:
                  'Get notified about upcoming appointments.',
              },
              {
                key: 'taskReminders',
                title: 'Task Reminders',
                description:
                  'Receive reminders for your daily tasks.',
              },
              {
                key: 'emergencyAlerts',
                title: 'Emergency Alerts',
                description:
                  'Receive important patient safety alerts.',
              },
              {
                key: 'emailNotifications',
                title: 'Email Notifications',
                description:
                  'Receive important CareMate updates by email.',
              },
            ].map((item) => (

              <div
                key={item.key}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
              >

                <div>

                  <p className="text-sm font-bold text-slate-800">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    handleNotificationChange(
                      item.key
                    )
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    notifications[item.key]
                      ? 'bg-blue-600'
                      : 'bg-slate-300'
                  }`}
                  aria-label={`Toggle ${item.title}`}
                >

                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      notifications[item.key]
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />

                </button>

              </div>

            ))}

          </div>

        </section>


        {/* ======================================
            SECURITY
        ======================================= */}

        <section className="rounded-[26px] border border-blue-100 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Shield size={19} />
              </div>

              <div>

                <h2 className="font-black text-slate-900">
                  Security & Account
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Information about your CareMate account.
                </p>

              </div>

            </div>

          </div>


          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">

            <SecurityCard
              icon={Calendar}
              title="Account Created"
              value={
                user?.createdAt
                  ? new Date(
                      user.createdAt
                    ).toLocaleDateString()
                  : 'Not available'
              }
            />

            <SecurityCard
              icon={Shield}
              title="Account Status"
              value="Active"
              valueClass="text-emerald-600"
            />

            <SecurityCard
              icon={Lock}
              title="Authentication"
              value="Password Protected"
            />

            <SecurityCard
              icon={User}
              title="Account Type"
              value={formatRole(user?.role)}
            />

          </div>

        </section>


        {/* ======================================
            ACCOUNT ACTIONS
        ======================================= */}

        <section className="rounded-[26px] border border-blue-100 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

            <h2 className="font-black text-slate-900">
              Account Actions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage your CareMate account.
            </p>

          </div>


          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut size={17} />
              Logout
            </button>

            <button
              type="button"
              onClick={() =>
                setShowDeleteConfirmation(true)
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={17} />
              Delete Account
            </button>

          </div>

        </section>


        {/* ======================================
            DANGER ZONE
        ======================================= */}

        <section className="rounded-[26px] border border-red-200 bg-white shadow-sm">

          <div className="border-b border-red-100 px-5 py-4 sm:px-6">

            <h2 className="font-black text-red-700">
              Danger Zone
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              These actions can permanently affect your account.
            </p>

          </div>


          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>

              <p className="text-sm font-bold text-slate-800">
                Delete your CareMate account
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                Account deletion is permanent and cannot
                be undone.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setShowDeleteConfirmation(true)
              }
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete Account
            </button>

          </div>

        </section>

      </div>


      {/* ======================================
          DELETE CONFIRMATION MODAL
      ======================================= */}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2
                size={22}
                className="text-red-600"
              />
            </div>


            <h2 className="mt-5 text-xl font-black text-slate-900">
              Delete Account?
            </h2>


            <p className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to delete your
              CareMate account? This action cannot be
              undone.
            </p>


            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirmation(false)
                }
                disabled={deletingAccount}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingAccount
                  ? 'Deleting...'
                  : 'Delete Account'}
              </button>

            </div>

          </div>

        </div>
      )}

    </PatientLayout>
  );
};


// ==========================================
// INFO CARD
// ==========================================

const InfoCard = ({
  icon: Icon,
  title,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-center gap-3">

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Icon size={18} />
        </span>

        <div>

          <p className="text-xs text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-sm font-bold text-slate-700">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
};


// ==========================================
// SECURITY CARD
// ==========================================

const SecurityCard = ({
  icon: Icon,
  title,
  value,
  valueClass = 'text-slate-700',
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-center gap-3">

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
          <Icon size={18} />
        </span>

        <div>

          <p className="text-xs text-slate-400">
            {title}
          </p>

          <p
            className={`mt-1 text-sm font-bold ${valueClass}`}
          >
            {value}
          </p>

        </div>

      </div>

    </div>
  );
};

export default Profile;