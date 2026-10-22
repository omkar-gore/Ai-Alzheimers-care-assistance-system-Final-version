import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../services/axios';
import { useAuth } from './AuthContext';

const DoctorContext = createContext(null);

const STORAGE_KEY = 'caremate_doctor_selected_patient';

export const DoctorProvider = ({ children }) => {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });
  const [patientData, setPatientData] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch assigned patients
  const fetchPatients = useCallback(async () => {
    if (!user || user.role !== 'doctor') return;
    try {
      setLoadingPatients(true);
      setError('');
      const res = await axios.get('/doctor/patients');
      const list = Array.isArray(res.data) ? res.data : [];
      setPatients(list);

      // Auto-select first patient if none currently selected or previous selection no longer in list
      if (list.length > 0) {
        setSelectedPatientId((prev) => {
          if (prev && list.some((p) => p._id === prev)) {
            return prev;
          }
          const defaultId = list[0]._id;
          localStorage.setItem(STORAGE_KEY, defaultId);
          return defaultId;
        });
      } else {
        setSelectedPatientId(null);
        localStorage.removeItem(STORAGE_KEY);
        setPatientData(null);
      }
    } catch (err) {
      console.error('Failed to load doctor patients:', err);
      setError(err.response?.data?.message || 'Unable to load assigned patient roster.');
    } finally {
      setLoadingPatients(false);
    }
  }, [user]);

  // 2. Fetch clinical details for selected patient
  const fetchPatientDetails = useCallback(async (patientId) => {
    if (!patientId) {
      setPatientData(null);
      return;
    }
    try {
      setLoadingDetails(true);
      setError('');
      const res = await axios.get(`/doctor/patients/${patientId}/clinical-summary`);
      setPatientData(res.data);
    } catch (err) {
      console.error('Failed to load patient clinical summary:', err);
      try {
        const fallbackRes = await axios.get(`/doctor/patients/${patientId}`);
        setPatientData(fallbackRes.data);
      } catch (fallbackErr) {
        setError(
          err.response?.status === 403
            ? 'Access Denied: Patient is not assigned to your clinical panel.'
            : err.response?.data?.message || 'Failed to retrieve patient clinical record.'
        );
        setPatientData(null);
      }
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Load patient data when selectedPatientId changes
  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientDetails(selectedPatientId);
    } else {
      setPatientData(null);
    }
  }, [selectedPatientId, fetchPatientDetails]);

  // Select patient handler
  const selectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    if (patientId) {
      localStorage.setItem(STORAGE_KEY, patientId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Refresh current patient
  const refreshPatientData = () => {
    if (selectedPatientId) {
      fetchPatientDetails(selectedPatientId);
    }
  };

  // Assign patient
  const assignPatient = async (payload) => {
    const res = await axios.post('/doctor/patients/assign', payload);
    await fetchPatients();
    if (res.data?.patient?._id) {
      selectPatient(res.data.patient._id);
    }
    return res.data;
  };

  // Unassign patient
  const unassignPatient = async (patientId) => {
    await axios.delete(`/doctor/patients/${patientId}/unassign`);
    await fetchPatients();
    if (selectedPatientId === patientId) {
      selectPatient(null);
    }
  };

  const selectedPatient = patients.find((p) => p._id === selectedPatientId) || patientData?.patient || null;

  const value = {
    patients,
    selectedPatientId,
    selectedPatient,
    patientData,
    loadingPatients,
    loadingDetails,
    error,
    selectPatient,
    fetchPatients,
    fetchPatientDetails,
    refreshPatientData,
    assignPatient,
    unassignPatient,
  };

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};
