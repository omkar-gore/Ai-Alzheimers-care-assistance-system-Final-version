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
    relationshipWithPatient: '',
    patientName: '',
    emergencyContact: '',
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

      const response = await axios.get('/profile');

      const backendUser = response.data?.user;
      const caregiverProfile =
        response.data?.caregiverProfile;

      if (!backendUser) {
        throw new Error('Profile information was not returned.');
      }

      setFormData({
        name: backendUser.name || '',
        age: backendUser.age || '',
        gender: backendUser.gender || '',
        email: backendUser.email || '',
        phone: backendUser.phone || '',
        relationshipWithPatient:
          caregiverProfile?.relationshipWithPatient || '',
        patientName:
          caregiverProfile?.patientName || '',
        emergencyContact:
          caregiverProfile?.emergencyContact || '',
      });

      setProfileImage(
        backendUser.profileImage || ''
      );

      // Keep AuthContext synchronized with MongoDB.
      setUser(backendUser);
    } catch (error) {
      console.error('Load profile error:', error);

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
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
  // PROFILE PHOTO - PREVIEW ONLY FOR NOW
  // ==========================================

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file.');
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
      'Photo selected. Permanent photo upload will be connected next.'
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

    try {
      setSavingProfile(true);
      setErrorMessage('');

      const response = await axios.put('/profile', {
        name: formData.name.trim(),
        age: formData.age,
        gender: formData.gender,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        relationshipWithPatient:
          formData.relationshipWithPatient.trim(),
        patientName:
          formData.patientName.trim(),
        emergencyContact:
          formData.emergencyContact.trim(),
      });

      const updatedUser = response.data?.user;

      const updatedCaregiverProfile =
        response.data?.caregiverProfile;

      if (updatedUser) {
        setUser(updatedUser);

        setFormData((previous) => ({
          ...previous,
          name: updatedUser.name || '',
          age: updatedUser.age || '',
          gender: updatedUser.gender || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          relationshipWithPatient:
            updatedCaregiverProfile?.relationshipWithPatient ||
            previous.relationshipWithPatient,
          patientName:
            updatedCaregiverProfile?.patientName ||
            previous.patientName,
          emergencyContact:
            updatedCaregiverProfile?.emergencyContact ||
            previous.emergencyContact,
        }));
      }

      setIsEditing(false);

      showSuccess(
        response.data?.message ||
          'Profile updated successfully.'
      );
    } catch (error) {
      console.error('Save profile error:', error);

      showError(
        error.response?.data?.message ||
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
      showError('Please enter your current password.');
      return;
    }

    if (!passwordData.newPassword) {
      showError('Please enter a new password.');
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

    try {
      setChangingPassword(true);
      setErrorMessage('');

      const response = await axios.put(
        '/profile/password',
        passwordData
      );

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showSuccess(
        response.data?.message ||
          'Password changed successfully.'
      );
    } catch (error) {
      console.error(
        'Change password error:',
        error
      );

      showError(
        error.response?.data?.message ||
          'Failed to change password.'
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
    navigate('/auth/caregiver/login', { replace: true });
  };

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      setErrorMessage('');

      const response = await axios.delete('/profile');

      showSuccess(
        response.data?.message ||
          'Account deleted successfully.'
      );

      setTimeout(() => {
        logout();
        navigate('/auth/caregiver/login', { replace: true });
      }, 1200);
    } catch (error) {
      console.error(
        'Delete account error:',
        error
      );

      showError(
        error.response?.data?.message ||
          'Failed to delete your account.'
      );

      setShowDeleteConfirmation(false);
    } finally {
      setDeletingAccount(false);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const getInitials = () => {
    if (!formData.name) {
      return 'C';
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
      return 'Caregiver';
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
  // LOADING SCREEN
  // ==========================================

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading your profile...
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ======================================
          HEADER
      ======================================= */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate('/caregiver/dashboard')
              }
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
              title="Back to dashboard"
            >
              <ArrowLeft size={21} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                My Profile
              </h1>

              <p className="text-xs text-slate-500">
                Manage your CareMate account
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 sm:flex">
            <Shield
              size={16}
              className="text-slate-600"
            />

            <span className="text-xs font-semibold text-slate-600">
              {formatRole(user?.role)}
            </span>
          </div>
        </div>
      </header>

      {/* ======================================
          SUCCESS / ERROR MESSAGES
      ======================================= */}

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
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
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* ====================================
              LEFT PROFILE CARD
          ===================================== */}

          <aside className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-28 bg-slate-800" />

              <div className="-mt-14 flex flex-col items-center px-6 pb-6">

                {/* Profile image */}
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-md">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-slate-600">
                        {getInitials()}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-white shadow-md transition hover:bg-slate-700"
                    title="Change profile photo"
                  >
                    <Camera size={16} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  {formData.name || 'Caregiver'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {formatRole(user?.role)}
                </p>

                <div className="mt-5 flex w-full gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Camera size={16} />
                    Change Photo
                  </button>

                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Basic account information */}
                <div className="mt-6 w-full border-t border-slate-200 pt-5">
                  <div className="flex items-center gap-3 py-2.5">
                    <Mail
                      size={17}
                      className="text-slate-500"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">
                        Email
                      </p>

                      <p className="truncate text-sm font-medium text-slate-700">
                        {formData.email ||
                          'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-2.5">
                    <Phone
                      size={17}
                      className="text-slate-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Phone
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {formData.phone ||
                          'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-2.5">
                    <Heart
                      size={17}
                      className="text-slate-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Role
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {formatRole(user?.role)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account actions */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-bold text-slate-900">
                  Account
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Manage your account access
                </p>
              </div>

              <div className="p-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteConfirmation(true)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
              </div>
            </div>
          </aside>

          {/* ====================================
              RIGHT CONTENT
          ===================================== */}

          <section className="space-y-6 lg:col-span-2">

            {/* PERSONAL INFORMATION */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Your basic account information
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
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
                      className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <X size={16} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      form="profile-form"
                      disabled={savingProfile}
                      className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                id="profile-form"
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
                        : 'border-slate-300 bg-white text-slate-800 focus:border-slate-500 focus:ring-2 focus:ring-slate-100'
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
                      className="text-slate-500"
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {formatRole(user?.role)}
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* CAREGIVER INFORMATION */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Heart
                      size={19}
                      className="text-slate-700"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Caregiver Information
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Information about the person you care for
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <InputField
                  label="Relationship with Patient"
                  name="relationshipWithPatient"
                  value={
                    formData.relationshipWithPatient
                  }
                  placeholder="e.g. Daughter, Son, Spouse"
                />

                <InputField
                  label="Patient Name"
                  name="patientName"
                  value={formData.patientName}
                  placeholder="Enter patient's name"
                />

                <InputField
                  label="Emergency Contact"
                  name="emergencyContact"
                  value={
                    formData.emergencyContact
                  }
                  placeholder="Emergency contact number"
                />

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Heart
                    size={18}
                    className="text-slate-500"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Care Responsibility
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      Alzheimer&apos;s Patient
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CHANGE PASSWORD */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Lock
                      size={19}
                      className="text-slate-700"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Change Password
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Keep your CareMate account secure
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
                    showPassword={showNewPassword}
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
                    className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {changingPassword
                      ? 'Updating...'
                      : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* NOTIFICATIONS */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Bell
                      size={19}
                      className="text-slate-700"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Notifications
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Choose which reminders you want to receive
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
                      'Get notified about upcoming doctor appointments.',
                  },
                  {
                    key: 'taskReminders',
                    title: 'Task Reminders',
                    description:
                      'Receive reminders for pending caregiver tasks.',
                  },
                  {
                    key: 'emergencyAlerts',
                    title: 'Emergency Alerts',
                    description:
                      'Receive important patient safety and emergency alerts.',
                  },
                  {
                    key: 'emailNotifications',
                    title: 'Email Notifications',
                    description:
                      'Receive important CareMate updates through email.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
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
                          ? 'bg-slate-800'
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
            </div>

            {/* SECURITY */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Shield
                      size={19}
                      className="text-slate-700"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Security & Account
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Information about your CareMate account
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Calendar
                      size={18}
                      className="text-slate-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Account Created
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {user?.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Shield
                      size={18}
                      className="text-slate-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Account Status
                      </p>

                      <p className="mt-1 text-sm font-semibold text-green-600">
                        Active
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Lock
                      size={18}
                      className="text-slate-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Authentication
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Password Protected
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <User
                      size={18}
                      className="text-slate-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Account Type
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatRole(user?.role)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="rounded-2xl border border-red-200 bg-white shadow-sm">
              <div className="border-b border-red-100 px-5 py-4 sm:px-6">
                <h2 className="font-bold text-red-700">
                  Danger Zone
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  These actions can permanently affect your account.
                </p>
              </div>

              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Delete your CareMate account
                  </p>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                    Your account and associated information may
                    be permanently deleted. This action cannot be
                    undone.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteConfirmation(true)
                  }
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ======================================
          DELETE CONFIRMATION MODAL
      ======================================= */}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2
                size={22}
                className="text-red-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Delete Account?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to delete your CareMate
              account? This will permanently remove your
              account and caregiver profile. This action cannot
              be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirmation(false)
                }
                disabled={deletingAccount}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingAccount
                  ? 'Deleting...'
                  : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;