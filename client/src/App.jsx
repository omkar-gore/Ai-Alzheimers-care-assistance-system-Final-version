import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';

// =========================================================
// EARLY COGNITIVE SCREENING PAGES
// =========================================================
import CognitiveScreeningPage from './pages/screening/CognitiveScreeningPage';
import ScreeningResultsPage from './pages/screening/ScreeningResultsPage';
import ScreeningHistoryPage from './pages/screening/ScreeningHistoryPage';

// =========================================================
// PATIENT PAGES
// =========================================================

import PatientDashboard from './pages/patient/Dashboard';
import MemoryBook from './pages/patient/MemoryBook';
import MindGames from './pages/patient/MindGames';
import Exercise from './pages/patient/Exercise';
import PeriodTracker from './pages/patient/PeriodTracker';
import PatientProfile from './pages/patient/Profile';
import PatientAppointments from './pages/patient/Appointments';

// =========================================================
// CAREGIVER PAGES
// =========================================================

import CaregiverDashboard from './pages/caregiver/Dashboard';
import Schedule from './pages/caregiver/Schedule';
import Appointments from './pages/caregiver/Appointments';
import Chat from './pages/caregiver/Chat';
import Reports from './pages/caregiver/Reports';
import CaregiverProfile from './pages/caregiver/Profile';
import CaregiverPayments from './pages/caregiver/Payments';

// =========================================================
// DOCTOR LAYOUT & PAGES
// =========================================================

import DoctorLayout from './components/doctor/DoctorLayout';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorMedications from './pages/doctor/Medications';
import DoctorCaregiverReports from './pages/doctor/CaregiverReports';
import DoctorDailyReports from './pages/doctor/DailyReports';
import DoctorCognitiveScreening from './pages/doctor/CognitiveScreening';
import DoctorProgress from './pages/doctor/Progress';
import DoctorClinicalTimeline from './pages/doctor/ClinicalTimeline';
import DoctorNotes from './pages/doctor/DoctorNotes';
import DoctorCarePlan from './pages/doctor/CarePlan';
import DoctorRoutine from './pages/doctor/Routine';
import DoctorProfile from './pages/doctor/Profile';
import DoctorChangePassword from './pages/doctor/ChangePassword';
import DoctorPayments from './pages/doctor/Payments';

// =========================================================
// VIDEO CONSULTATION
// =========================================================

import VideoConsultationPage from './pages/consultation/VideoConsultationPage';

// =========================================================
// COMPONENTS
// =========================================================

import PrivateRoute from './components/PrivateRoute';

// =========================================================
// SCROLL TO TOP
// =========================================================

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return null;
}

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>

          {/* =================================================
              PUBLIC ROUTES
          ================================================= */}

          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/auth/:role/:mode"
            element={<AuthPage />}
          />

          {/* =================================================
              EARLY COGNITIVE SCREENING (PUBLIC ACCESSIBLE)
          ================================================= */}
          <Route
            path="/cognitive-screening"
            element={<CognitiveScreeningPage />}
          />
          <Route
            path="/cognitive-screening/results"
            element={<ScreeningResultsPage />}
          />
          <Route
            path="/cognitive-screening/history"
            element={<ScreeningHistoryPage />}
          />


          {/* =================================================
              PATIENT ROUTES
          ================================================= */}

          {/* PATIENT DASHBOARD */}

          <Route
            path="/patient/dashboard"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </PrivateRoute>
            }
          />


          {/* MEMORY BOOK */}

          <Route
            path="/patient/memory-book"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <MemoryBook />
              </PrivateRoute>
            }
          />


          {/* MIND GAMES */}

          <Route
            path="/patient/mind-games"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <MindGames />
              </PrivateRoute>
            }
          />


          {/* EXERCISE */}

          <Route
            path="/patient/exercise"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <Exercise />
              </PrivateRoute>
            }
          />


          {/* PERIOD TRACKER */}

          <Route
            path="/patient/period-tracker"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <PeriodTracker />
              </PrivateRoute>
            }
          />


          {/* PATIENT APPOINTMENTS */}

          <Route
            path="/patient/appointments"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <PatientAppointments />
              </PrivateRoute>
            }
          />

          <Route
            path="/patient/appointments/:appointmentId/meeting"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <VideoConsultationPage role="patient" />
              </PrivateRoute>
            }
          />


          {/* PATIENT PROFILE */}

          <Route
            path="/patient/profile"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <PatientProfile />
              </PrivateRoute>
            }
          />


          {/* PATIENT SOS */}

          <Route
            path="/patient/sos"
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <div className="min-h-screen bg-slate-50 p-8">
                  <div className="mx-auto max-w-5xl">
                    <div className="rounded-3xl bg-white p-8 shadow-sm">

                      <h1 className="text-3xl font-bold text-red-600">
                        Emergency SOS
                      </h1>

                      <p className="mt-2 text-slate-500">
                        Emergency assistance will appear here.
                      </p>

                    </div>
                  </div>
                </div>
              </PrivateRoute>
            }
          />


          {/* =================================================
              CAREGIVER ROUTES
          ================================================= */}

          {/* CAREGIVER DASHBOARD */}

          <Route
            path="/caregiver/dashboard"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <CaregiverDashboard />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER SCHEDULE */}

          <Route
            path="/caregiver/schedule"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <Schedule />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER APPOINTMENTS */}

          <Route
            path="/caregiver/appointments"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <Appointments />
              </PrivateRoute>
            }
          />

          <Route
            path="/caregiver/appointments/:appointmentId/meeting"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <VideoConsultationPage role="caregiver" />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER CHAT */}

          <Route
            path="/caregiver/chat"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <Chat />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER REPORTS */}

          <Route
            path="/caregiver/reports"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <Reports />
              </PrivateRoute>
            }
          />


          {/* CAREGIVER PROFILE */}

          <Route
            path="/caregiver/profile"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <CaregiverProfile />
              </PrivateRoute>
            }
          />

          {/* CAREGIVER PAYMENTS & UPI */}
          <Route
            path="/caregiver/payments"
            element={
              <PrivateRoute allowedRoles={['caregiver']}>
                <CaregiverPayments />
              </PrivateRoute>
            }
          />


          {/* =================================================
              DOCTOR ROUTES (NESTED WITH FIXED SIDEBAR LAYOUT)
          ================================================= */}

          {/* DEDICATED DOCTOR VIDEO CONSULTATION MEETING ROOM */}
          <Route
            path="/doctor/appointments/:appointmentId/meeting"
            element={
              <PrivateRoute allowedRoles={['doctor']}>
                <VideoConsultationPage role="doctor" />
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor"
            element={
              <PrivateRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="medications" element={<DoctorMedications />} />
            <Route path="caregiver-reports" element={<DoctorCaregiverReports />} />
            <Route path="daily-reports" element={<DoctorDailyReports />} />
            <Route path="cognitive-screening" element={<DoctorCognitiveScreening />} />
            <Route path="progress" element={<DoctorProgress />} />
            <Route path="timeline" element={<DoctorClinicalTimeline />} />
            <Route path="notes" element={<DoctorNotes />} />
            <Route path="care-plan" element={<DoctorCarePlan />} />
            <Route path="routine" element={<DoctorRoutine />} />
            <Route path="payments" element={<DoctorPayments />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="change-password" element={<DoctorChangePassword />} />
          </Route>


          {/* =================================================
              404 ROUTES
          ================================================= */}

          <Route
            path="/404"
            element={<NotFound />}
          />

          <Route
            path="*"
            element={<Navigate to="/404" replace />}
          />

        </Routes>
    </>
  );
}

export default App;