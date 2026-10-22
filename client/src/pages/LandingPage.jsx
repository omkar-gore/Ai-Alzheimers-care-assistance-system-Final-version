import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Users,
  Stethoscope,
  Brain,
  ShieldCheck,
  CalendarCheck,
  Pill,
  Activity,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const features = [
    {
      icon: Brain,
      title: 'Memory Support',
      text: 'Help patients remember people, activities and important daily information.',
    },
    {
      icon: Pill,
      title: 'Medicine Management',
      text: 'Organize medication schedules and keep medicine tracking simple.',
    },
    {
      icon: CalendarCheck,
      title: 'Daily Routine',
      text: 'Manage tasks, meals, exercise, sleep and everyday activities.',
    },
    {
      icon: Activity,
      title: 'Health Monitoring',
      text: 'Monitor important health information and patient progress.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Access',
      text: 'Role-based access keeps patient and care information protected.',
    },
    {
      icon: Users,
      title: 'Connected Care',
      text: 'Connect patients, caregivers and doctors through one platform.',
    },
  ];

  const modules = [
    {
      icon: Heart,
      title: 'Patient',
      description:
        'A simple and supportive experience for daily activities, memory support and healthy routines.',
      items: ['Daily Routine', 'Memory Support', 'Mind Games'],
      color: 'blue',
      path: '/auth/patient/login',
    },
    {
      icon: Users,
      title: 'Caregiver',
      description:
        'Manage patient activities, medicines, schedules, alerts and everyday care from one place.',
      items: ['Patient Monitoring', 'Medicine Tracking', 'Care Planning'],
      color: 'teal',
      path: '/auth/caregiver/login',
    },
    {
      icon: Stethoscope,
      title: 'Doctor',
      description:
        'View useful patient information, reports, appointments and health-related insights.',
      items: ['Health Reports', 'Appointments', 'Patient Insights'],
      color: 'violet',
      path: '/auth/doctor/login',
    },
  ];

  const scrollTo = (id) => {
    setMobileMenuOpen(false);

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="caremate-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          font-family: Inter, "Segoe UI", Arial, sans-serif;
          background: #eef7ff;
          color: #17233c;
        }

        button {
          font-family: inherit;
        }

        .caremate-page {
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 8% 8%, rgba(120, 190, 255, 0.22), transparent 28%),
            radial-gradient(circle at 90% 18%, rgba(102, 224, 210, 0.18), transparent 25%),
            #eef7ff;
        }

        /* =========================
           NAVBAR
        ========================= */

        .cm-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.96);
          border-bottom: 1px solid #dbeafe;
          box-shadow: 0 8px 30px rgba(30, 64, 175, 0.08);
          backdrop-filter: blur(15px);
        }

        .cm-header-inner {
          width: min(1180px, calc(100% - 36px));
          margin: auto;
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }

        .cm-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        .cm-logo {
          width: 45px;
          height: 45px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: linear-gradient(135deg, #1976f3, #16b8a6);
          box-shadow: 0 8px 20px rgba(25, 118, 243, 0.25);
          transition: 0.3s ease;
        }

        .cm-brand:hover .cm-logo {
          transform: scale(1.08) rotate(-3deg);
        }

        .cm-brand-name {
          text-align: left;
          line-height: 1.05;
        }

        .cm-brand-name strong {
          display: block;
          font-size: 21px;
          color: #10213f;
          letter-spacing: -0.5px;
        }

        .cm-brand-name strong span {
          color: #1976f3;
        }

        .cm-brand-name small {
          display: block;
          margin-top: 4px;
          color: #718096;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .cm-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px;
          border-radius: 15px;
          background: #f3f8fe;
          border: 1px solid #e1ecf8;
        }

        .cm-nav button {
          border: none;
          background: transparent;
          color: #4a5a73;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .cm-nav button:hover {
          color: #1264d8;
          background: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.08);
        }

        .cm-header-actions {
          display: flex;
          gap: 9px;
          align-items: center;
        }

        .cm-login-btn,
        .cm-primary-btn {
          border: none;
          cursor: pointer;
          font-weight: 800;
          border-radius: 11px;
          transition: 0.3s ease;
        }

        .cm-login-btn {
          padding: 11px 17px;
          background: white;
          color: #24405f;
          border: 1px solid #d7e4f1;
        }

        .cm-login-btn:hover {
          background: #eaf4ff;
          color: #1264d8;
          transform: translateY(-2px);
        }

        .cm-primary-btn {
          padding: 12px 18px;
          color: white;
          background: linear-gradient(135deg, #1976f3, #1264d8);
          box-shadow: 0 8px 18px rgba(25, 118, 243, 0.25);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cm-primary-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 13px 26px rgba(25, 118, 243, 0.32);
        }

        .cm-mobile-menu {
          display: none;
          border: 1px solid #d7e4f1;
          background: white;
          color: #203452;
          width: 43px;
          height: 43px;
          border-radius: 11px;
          cursor: pointer;
        }

        /* =========================
           HERO
        ========================= */

        .cm-hero {
          width: min(1180px, calc(100% - 36px));
          margin: auto;
          min-height: 610px;
          display: grid;
          grid-template-columns: 1.04fr 0.96fr;
          align-items: center;
          gap: 65px;
          padding: 62px 0 55px;
        }

        .cm-hero-content {
          max-width: 600px;
        }

        .cm-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #cfe5fb;
          color: #1768c9;
          border-radius: 30px;
          padding: 9px 15px;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 7px 20px rgba(30, 90, 150, 0.08);
        }

        .cm-hero h1 {
          margin: 20px 0 0;
          color: #10203a;
          font-size: clamp(40px, 5vw, 62px);
          line-height: 1.06;
          letter-spacing: -2.5px;
          font-weight: 900;
        }

        .cm-hero h1 .blue {
          color: #1976f3;
        }

        .cm-hero h1 .dark-blue {
          color: #23466f;
        }

        .cm-hero-description {
          margin: 22px 0 0;
          max-width: 570px;
          color: #52647d;
          font-size: 16px;
          line-height: 1.8;
        }

        .cm-hero-buttons {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .cm-outline-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #b9d4ef;
          background: white;
          color: #1c4773;
          padding: 13px 20px;
          border-radius: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .cm-outline-btn:hover {
          background: #e7f3ff;
          border-color: #6eade7;
          transform: translateY(-3px) scale(1.02);
        }

        .cm-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 17px;
          margin-top: 26px;
        }

        .cm-trust-item {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #53657b;
          font-size: 12px;
          font-weight: 700;
        }

        .cm-trust-item svg {
          color: #16a085;
        }

        /* HERO IMAGE */

        .cm-hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .cm-image-frame {
          position: relative;
          width: 100%;
          max-width: 500px;
          padding: 9px;
          border-radius: 27px;
          background: white;
          box-shadow: 0 25px 60px rgba(44, 91, 140, 0.20);
          transition: 0.4s ease;
        }

        .cm-image-frame:hover {
          transform: translateY(-7px) scale(1.025);
          box-shadow: 0 30px 70px rgba(44, 91, 140, 0.28);
        }

        .cm-hero-image {
          width: 100%;
          height: 350px;
          display: block;
          object-fit: cover;
          border-radius: 20px;
        }

        .cm-floating-card {
          position: absolute;
          left: -25px;
          bottom: 28px;
          background: white;
          border-radius: 17px;
          padding: 13px 16px;
          display: flex;
          align-items: center;
          gap: 11px;
          box-shadow: 0 15px 35px rgba(40, 75, 110, 0.18);
          border: 1px solid #e4eef8;
        }

        .cm-floating-icon {
          width: 39px;
          height: 39px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e7f8f4;
          color: #13a98e;
        }

        .cm-floating-card small {
          display: block;
          color: #8190a3;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.7px;
        }

        .cm-floating-card strong {
          display: block;
          margin-top: 3px;
          color: #193451;
          font-size: 12px;
        }

        /* =========================
           SECTION COMMON
        ========================= */

        .cm-section {
          width: min(1180px, calc(100% - 36px));
          margin: auto;
          padding: 75px 0;
        }

        .cm-section-heading {
          text-align: center;
          max-width: 700px;
          margin: auto;
        }

        .cm-section-tag {
          display: inline-block;
          color: #1268d5;
          background: #e3f1ff;
          border-radius: 30px;
          padding: 8px 14px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .cm-section-heading h2 {
          margin: 15px 0 10px;
          color: #142640;
          font-size: clamp(29px, 4vw, 40px);
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .cm-section-heading p {
          margin: 0;
          color: #64758a;
          line-height: 1.7;
          font-size: 14px;
        }

        /* =========================
           ABOUT
        ========================= */

        .cm-about-wrapper {
          background: white;
          border-top: 1px solid #dceaf7;
          border-bottom: 1px solid #dceaf7;
        }

        .cm-about-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 55px;
          align-items: center;
        }

        .cm-about-text h2 {
          color: #142640;
          font-size: 37px;
          line-height: 1.2;
          margin: 15px 0;
        }

        .cm-about-text h2 span {
          color: #1976f3;
        }

        .cm-about-text p {
          color: #61738a;
          line-height: 1.8;
          font-size: 14px;
        }

        .cm-about-highlight {
          margin-top: 22px;
          display: flex;
          gap: 12px;
          align-items: center;
          background: #eef8ff;
          border: 1px solid #d8ebfb;
          border-radius: 15px;
          padding: 14px;
        }

        .cm-about-highlight-icon {
          min-width: 39px;
          height: 39px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1976f3;
          color: white;
        }

        .cm-about-highlight span {
          color: #31506f;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.5;
        }

        .cm-about-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .cm-about-card {
          padding: 22px;
          border-radius: 20px;
          background: #f4f9ff;
          border: 1px solid #e0edf9;
          transition: 0.3s ease;
        }

        .cm-about-card:nth-child(2) {
          background: #effcf9;
        }

        .cm-about-card:nth-child(3) {
          background: #f5f1ff;
        }

        .cm-about-card:nth-child(4) {
          background: #fff9ed;
        }

        .cm-about-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 15px 35px rgba(50, 90, 130, 0.12);
        }

        .cm-about-card-icon {
          width: 43px;
          height: 43px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          color: #1976f3;
        }

        .cm-about-card h3 {
          margin: 15px 0 6px;
          color: #1a304b;
          font-size: 15px;
        }

        .cm-about-card p {
          margin: 0;
          color: #718197;
          font-size: 11px;
          line-height: 1.65;
        }

        /* =========================
           FEATURES
        ========================= */

        .cm-features-wrapper {
          background: #eaf5ff;
        }

        .cm-feature-grid {
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 17px;
        }

        .cm-feature-card {
          background: white;
          border: 1px solid #dceaf7;
          border-radius: 20px;
          padding: 22px;
          min-height: 185px;
          transition: 0.35s ease;
          box-shadow: 0 5px 15px rgba(50, 90, 130, 0.04);
        }

        .cm-feature-card:hover {
          transform: translateY(-8px) scale(1.025);
          border-color: #9bc9f3;
          box-shadow: 0 20px 40px rgba(38, 99, 160, 0.14);
        }

        .cm-feature-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8f3ff;
          color: #1976f3;
          transition: 0.3s ease;
        }

        .cm-feature-card:hover .cm-feature-icon {
          color: white;
          background: #1976f3;
          transform: scale(1.1);
        }

        .cm-feature-card h3 {
          color: #18324f;
          margin: 15px 0 7px;
          font-size: 15px;
        }

        .cm-feature-card p {
          color: #6a7b90;
          font-size: 11px;
          line-height: 1.7;
          margin: 0;
        }

        /* =========================
           MODULES
        ========================= */

        .cm-modules-wrapper {
          background: white;
        }

        .cm-module-grid {
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .cm-module-card {
          border: 1px solid #dce7f2;
          border-radius: 22px;
          padding: 24px;
          background: white;
          box-shadow: 0 7px 20px rgba(45, 85, 120, 0.06);
          transition: 0.4s ease;
          overflow: hidden;
          position: relative;
        }

        .cm-module-card:hover {
          transform: translateY(-9px) scale(1.02);
          box-shadow: 0 24px 50px rgba(45, 85, 120, 0.16);
        }

        .cm-module-card.blue:hover {
          border-color: #86bdf1;
        }

        .cm-module-card.teal:hover {
          border-color: #6ed4c2;
        }

        .cm-module-card.violet:hover {
          border-color: #b4a0ec;
        }

        .cm-module-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cm-module-icon {
          width: 51px;
          height: 51px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .blue .cm-module-icon {
          background: #e6f2ff;
          color: #1976f3;
        }

        .teal .cm-module-icon {
          background: #e6faf6;
          color: #12a88c;
        }

        .violet .cm-module-icon {
          background: #f0ebff;
          color: #7653d4;
        }

        .cm-module-label {
          font-size: 9px;
          font-weight: 900;
          padding: 6px 10px;
          border-radius: 20px;
          letter-spacing: 0.7px;
        }

        .blue .cm-module-label {
          color: #1976f3;
          background: #eaf4ff;
        }

        .teal .cm-module-label {
          color: #10947d;
          background: #e8faf6;
        }

        .violet .cm-module-label {
          color: #6f50c6;
          background: #f1edff;
        }

        .cm-module-card h3 {
          color: #172f4c;
          font-size: 21px;
          margin: 20px 0 9px;
        }

        .cm-module-card > p {
          color: #68798e;
          font-size: 12px;
          line-height: 1.7;
          min-height: 62px;
          margin: 0;
        }

        .cm-module-list {
          margin: 17px 0 0;
          padding: 0;
          list-style: none;
        }

        .cm-module-list li {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 9px;
          color: #4d6077;
          font-size: 11px;
          font-weight: 700;
        }

        .cm-module-list svg {
          color: #16a085;
        }

        .cm-module-button {
          width: 100%;
          margin-top: 20px;
          border: none;
          border-radius: 11px;
          padding: 12px;
          color: white;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          transition: 0.3s ease;
        }

        .blue .cm-module-button {
          background: #1976f3;
        }

        .teal .cm-module-button {
          background: #10a98c;
        }

        .violet .cm-module-button {
          background: #7553d3;
        }

        .cm-module-button:hover {
          transform: scale(1.035);
          filter: brightness(0.94);
          box-shadow: 0 10px 22px rgba(50, 90, 130, 0.18);
        }

        /* =========================
           CTA
        ========================= */

        .cm-cta {
          width: min(1100px, calc(100% - 36px));
          margin: 50px auto;
          border-radius: 28px;
          padding: 55px 30px;
          text-align: center;
          color: white;
          background:
            radial-gradient(circle at 10% 20%, rgba(70, 170, 255, 0.35), transparent 28%),
            radial-gradient(circle at 90% 80%, rgba(39, 211, 180, 0.25), transparent 28%),
            linear-gradient(135deg, #0e3966, #1267b8);
          box-shadow: 0 25px 55px rgba(25, 83, 140, 0.22);
        }

        .cm-cta-icon {
          width: 52px;
          height: 52px;
          margin: auto;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.13);
        }

        .cm-cta h2 {
          margin: 17px 0 9px;
          font-size: 31px;
        }

        .cm-cta p {
          margin: auto;
          max-width: 620px;
          color: #d6e8fa;
          font-size: 13px;
          line-height: 1.7;
        }

        .cm-cta button {
          margin-top: 22px;
          border: none;
          border-radius: 11px;
          padding: 13px 21px;
          color: #1264d8;
          background: white;
          font-weight: 900;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: 0.3s ease;
        }

        .cm-cta button:hover {
          transform: translateY(-4px) scale(1.03);
          background: #eef8ff;
          box-shadow: 0 12px 25px rgba(0,0,0,0.18);
        }

        /* =========================
           FOOTER
        ========================= */

        .cm-footer {
          background: #102a45;
          color: white;
          padding: 38px 0 20px;
        }

        .cm-footer-inner {
          width: min(1180px, calc(100% - 36px));
          margin: auto;
        }

        .cm-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 45px;
        }

        .cm-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cm-footer-brand .cm-logo {
          width: 40px;
          height: 40px;
        }

        .cm-footer-brand strong {
          font-size: 19px;
        }

        .cm-footer-brand span {
          color: #62a9f4;
        }

        .cm-footer-description {
          margin-top: 14px;
          max-width: 480px;
          color: #aebfd1;
          font-size: 11px;
          line-height: 1.8;
        }

        .cm-footer h4 {
          margin: 0 0 12px;
          font-size: 12px;
        }

        .cm-footer button {
          display: block;
          border: none;
          background: none;
          color: #aebfd1;
          padding: 5px 0;
          cursor: pointer;
          font-size: 11px;
          transition: 0.2s ease;
        }

        .cm-footer button:hover {
          color: white;
          transform: translateX(3px);
        }

        .cm-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          margin-top: 28px;
          padding-top: 17px;
          color: #8fa6bd;
          font-size: 10px;
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 900px) {
          .cm-nav,
          .cm-header-actions {
            display: none;
          }

          .cm-mobile-menu {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cm-mobile-nav {
            display: flex;
            flex-direction: column;
            padding: 12px 18px 18px;
            background: white;
            border-top: 1px solid #e3edf7;
          }

          .cm-mobile-nav button {
            border: none;
            background: transparent;
            text-align: left;
            padding: 12px;
            border-radius: 10px;
            color: #3f536d;
            font-weight: 700;
          }

          .cm-mobile-nav button:hover {
            background: #edf6ff;
            color: #1264d8;
          }

          .cm-mobile-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
            padding-top: 10px;
            border-top: 1px solid #edf1f5;
          }

          .cm-mobile-actions button {
            flex: 1;
            text-align: center;
            justify-content: center;
          }

          .cm-hero {
            grid-template-columns: 1fr;
            gap: 40px;
            padding-top: 45px;
          }

          .cm-hero-content {
            text-align: center;
            margin: auto;
          }

          .cm-hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .cm-hero-buttons,
          .cm-trust {
            justify-content: center;
          }

          .cm-image-frame {
            max-width: 520px;
          }

          .cm-about-grid {
            grid-template-columns: 1fr;
          }

          .cm-about-text {
            text-align: center;
          }

          .cm-about-highlight {
            text-align: left;
          }

          .cm-feature-grid,
          .cm-module-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cm-footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .cm-header-inner {
            width: min(100% - 24px, 1180px);
          }

          .cm-section,
          .cm-hero {
            width: min(100% - 24px, 1180px);
          }

          .cm-hero {
            min-height: auto;
            padding: 40px 0 50px;
          }

          .cm-hero h1 {
            font-size: 40px;
            letter-spacing: -1.5px;
          }

          .cm-hero-image {
            height: 270px;
          }

          .cm-floating-card {
            left: 10px;
            bottom: 18px;
          }

          .cm-about-cards,
          .cm-feature-grid,
          .cm-module-grid {
            grid-template-columns: 1fr;
          }

          .cm-section {
            padding: 55px 0;
          }

          .cm-footer-grid {
            grid-template-columns: 1fr;
          }

          .cm-footer-bottom {
            flex-direction: column;
          }

          .cm-cta {
            width: calc(100% - 24px);
            padding: 45px 20px;
          }
        }
      `}</style>

      {/* =========================
          HEADER
      ========================= */}

      <header className="cm-header">
        <div className="cm-header-inner">

          <button
            className="cm-brand"
            onClick={() => scrollTo('home')}
          >
            <div className="cm-logo">
              <Heart size={23} fill="currentColor" />
            </div>

            <div className="cm-brand-name">
              <strong>
                Care<span>Mate</span>
              </strong>
              <small>Connected Care</small>
            </div>
          </button>

          <nav className="cm-nav">
            <button onClick={() => scrollTo('home')}>Home</button>
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('modules')}>Modules</button>
            <button
              onClick={() => navigate('/cognitive-screening')}
              style={{ color: '#0d9488', fontWeight: 800 }}
            >
              Cognitive Screening
            </button>
            <button onClick={() => scrollTo('contact')}>Contact</button>
          </nav>

          <div className="cm-header-actions">
            <button
              className="cm-screening-btn"
              onClick={() => navigate('/cognitive-screening')}
              style={{
                border: '1px solid #14b8a6',
                background: '#f0fdfa',
                color: '#0f766e',
                fontWeight: 800,
                borderRadius: '11px',
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
              }}
            >
              <Brain size={16} />
              Take Screening
            </button>

            <button
              className="cm-login-btn"
              onClick={() => navigate('/auth/patient/login')}
            >
              Login
            </button>

            <button
              className="cm-primary-btn"
              onClick={() => navigate('/auth/patient/register')}
            >
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>

          <button
            className="cm-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="cm-mobile-nav">
            <button onClick={() => scrollTo('home')}>Home</button>
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('modules')}>Modules</button>
            <button
              onClick={() => navigate('/cognitive-screening')}
              style={{ color: '#0d9488', fontWeight: 800 }}
            >
              Early Cognitive Screening (Free)
            </button>
            <button onClick={() => scrollTo('contact')}>Contact</button>

            <div className="cm-mobile-actions">
              <button
                className="cm-login-btn"
                onClick={() => navigate('/auth/patient/login')}
              >
                Login
              </button>

              <button
                className="cm-primary-btn"
                onClick={() => navigate('/auth/patient/register')}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================
          HERO
      ========================= */}

      <main id="home">

        <section className="cm-hero">

          <div className="cm-hero-content">

            <div className="cm-badge">
              <Heart size={14} />
              Smarter care for better living
            </div>

            <h1>
              Compassionate care.
              <span className="blue"> Smarter assistance.</span>
              <span className="dark-blue"> Better living.</span>
            </h1>

            <p className="cm-hero-description">
              CareMate is a connected care platform designed to support
              Alzheimer's patients, caregivers and doctors with everyday
              care, monitoring, memory support and meaningful health
              information.
            </p>

            <div className="cm-hero-buttons">

              <button
                className="cm-primary-btn"
                onClick={() => navigate('/auth/patient/register')}
              >
                Get Started
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="cm-screening-btn"
                onClick={() => navigate('/cognitive-screening')}
                style={{
                  background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '11px',
                  padding: '12px 20px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 18px rgba(15, 118, 110, 0.25)',
                  fontSize: '14px',
                }}
              >
                <Brain size={18} />
                Cognitive Screening
              </button>

              <button
                className="cm-outline-btn"
                onClick={() => scrollTo('about')}
              >
                Learn More
              </button>

            </div>

            <div className="cm-trust">

              <div className="cm-trust-item">
                <CheckCircle2 size={16} />
                Patient-focused
              </div>

              <div className="cm-trust-item">
                <CheckCircle2 size={16} />
                Connected care
              </div>

              <div className="cm-trust-item">
                <CheckCircle2 size={16} />
                Easy to use
              </div>

            </div>
          </div>

          <div className="cm-hero-visual">

            <div className="cm-image-frame">

              <img
                className="cm-hero-image"
                src="https://images.unsplash.com/photo-1559234938-b60fff04894d?auto=format&fit=crop&w=1000&q=85"
                alt="Group of elderly people receiving support"
              />

              <div className="cm-floating-card">
                <div className="cm-floating-icon">
                  <Heart size={19} fill="currentColor" />
                </div>

                <div>
                  <small>CONNECTED CARE</small>
                  <strong>Care made simpler</strong>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* =========================
            ABOUT
        ========================= */}

        <section id="about" className="cm-about-wrapper">

          <div className="cm-section">

            <div className="cm-about-grid">

              <div className="cm-about-text">

                <span className="cm-section-tag">
                  ABOUT CAREMATE
                </span>

                <h2>
                  Technology that puts
                  <span> care first.</span>
                </h2>

                <p>
                  Caring for a person with Alzheimer's can involve many
                  responsibilities. CareMate brings important daily care
                  activities into one organized and easy-to-use platform.
                </p>

                <p>
                  Patients, caregivers and doctors can each access tools
                  designed specifically for their role.
                </p>

                <div className="cm-about-highlight">
                  <div className="cm-about-highlight-icon">
                    <Heart size={19} />
                  </div>

                  <span>
                    One connected platform for patients, caregivers and
                    healthcare professionals.
                  </span>
                </div>

              </div>

              <div className="cm-about-cards">

                <div className="cm-about-card">
                  <div className="cm-about-card-icon">
                    <Brain size={21} />
                  </div>

                  <h3>Patient Support</h3>

                  <p>
                    Simple tools focused on everyday patient needs.
                  </p>
                </div>

                <div className="cm-about-card">
                  <div className="cm-about-card-icon">
                    <Users size={21} />
                  </div>

                  <h3>Caregiver Assistance</h3>

                  <p>
                    Organize important care activities and routines.
                  </p>
                </div>

                <div className="cm-about-card">
                  <div className="cm-about-card-icon">
                    <Stethoscope size={21} />
                  </div>

                  <h3>Doctor Insights</h3>

                  <p>
                    Access useful reports and patient information.
                  </p>
                </div>

                <div className="cm-about-card">
                  <div className="cm-about-card-icon">
                    <ShieldCheck size={21} />
                  </div>

                  <h3>Secure Access</h3>

                  <p>
                    Role-based access keeps information organized.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =========================
            FEATURES
        ========================= */}

        <section id="features" className="cm-features-wrapper">

          <div className="cm-section">

            <div className="cm-section-heading">

              <span className="cm-section-tag">
                POWERFUL FEATURES
              </span>

              <h2>
                Everything needed for
                <br />
                connected care.
              </h2>

              <p>
                Essential tools brought together to make daily care
                easier, clearer and more organized.
              </p>

            </div>

            <div className="cm-feature-grid">

              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    className="cm-feature-card"
                    key={index}
                  >
                    <div className="cm-feature-icon">
                      <Icon size={22} />
                    </div>

                    <h3>{feature.title}</h3>

                    <p>{feature.text}</p>
                  </div>
                );
              })}

            </div>

          </div>
        </section>

        {/* =========================
            MODULES
        ========================= */}

        <section id="modules" className="cm-modules-wrapper">

          <div className="cm-section">

            <div className="cm-section-heading">

              <span className="cm-section-tag">
                THREE CONNECTED MODULES
              </span>

              <h2>
                One platform.
                <br />
                Three care experiences.
              </h2>

              <p>
                Each module provides tools designed around the user's role.
              </p>

            </div>

            <div className="cm-module-grid">

              {modules.map((module) => {
                const Icon = module.icon;

                return (
                  <div
                    className={`cm-module-card ${module.color}`}
                    key={module.title}
                  >

                    <div className="cm-module-top">

                      <div className="cm-module-icon">
                        <Icon size={25} />
                      </div>

                      <span className="cm-module-label">
                        {module.title}
                      </span>

                    </div>

                    <h3>{module.title} Module</h3>

                    <p>{module.description}</p>

                    <ul className="cm-module-list">

                      {module.items.map((item) => (
                        <li key={item}>
                          <CheckCircle2 size={15} />
                          {item}
                        </li>
                      ))}

                    </ul>

                    <button
                      className="cm-module-button"
                      onClick={() => navigate(module.path)}
                    >
                      Enter {module.title} Module
                      <ArrowRight size={15} />
                    </button>

                  </div>
                );
              })}

            </div>

            {/* NEW MODULE: EARLY COGNITIVE SCREENING (PUBLIC ACCESS) */}
            <div
              style={{
                marginTop: '45px',
                background: 'linear-gradient(135deg, #042f2e, #115e59)',
                borderRadius: '24px',
                padding: '36px',
                color: 'white',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                boxShadow: '0 12px 30px rgba(15, 118, 110, 0.22)',
              }}
            >
              <div style={{ maxWidth: '640px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    background: 'rgba(45, 212, 191, 0.2)',
                    color: '#2dd4bf',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '10px',
                  }}
                >
                  New Module • Public Awareness &amp; Screening
                </span>
                <h3 style={{ fontSize: '26px', fontWeight: 900, margin: '4px 0 10px', color: 'white' }}>
                  Early Cognitive Screening
                </h3>
                <p style={{ fontSize: '15px', color: '#ccfbf1', margin: 0, lineHeight: 1.6 }}>
                  Check your memory, attention, orientation, reasoning, and everyday cognitive skills through a short interactive assessment. Non-diagnostic early-risk indicators for individuals and families without requiring patient registration.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => navigate('/cognitive-screening')}
                  style={{
                    background: '#14b8a6',
                    color: '#042f2e',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '16px 26px',
                    fontSize: '16px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(20, 184, 166, 0.35)',
                    transition: '0.2s ease',
                  }}
                >
                  <Brain size={20} />
                  <span>Start Free Screening</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* =========================
            CTA
        ========================= */}

        <section className="cm-cta">

          <div className="cm-cta-icon">
            <Heart size={25} fill="currentColor" />
          </div>

          <h2>Better care starts with better connection.</h2>

          <p>
            Bring patients, caregivers and healthcare professionals together
            with one simple and connected care platform.
          </p>

          <button
            onClick={() => navigate('/auth/patient/register')}
          >
            Get Started with CareMate
            <ArrowRight size={17} />
          </button>

        </section>

        {/* =========================
            FOOTER
        ========================= */}

        <footer id="contact" className="cm-footer">

          <div className="cm-footer-inner">

            <div className="cm-footer-grid">

              <div>

                <div className="cm-footer-brand">

                  <div className="cm-logo">
                    <Heart size={20} fill="currentColor" />
                  </div>

                  <strong>
                    Care<span>Mate</span>
                  </strong>

                </div>

                <p className="cm-footer-description">
                  Alzheimer's patient assistance and care management platform
                  designed to make everyday care simpler, safer and more
                  connected.
                </p>

              </div>

              <div>

                <h4>Platform</h4>

                <button onClick={() => scrollTo('home')}>
                  Home
                </button>

                <button onClick={() => scrollTo('features')}>
                  Features
                </button>

                <button onClick={() => scrollTo('modules')}>
                  Modules
                </button>

              </div>

              <div>

                <h4>Modules</h4>

                <button
                  onClick={() => navigate('/auth/patient/login')}
                >
                  Patient
                </button>

                <button
                  onClick={() => navigate('/auth/caregiver/login')}
                >
                  Caregiver
                </button>

                <button
                  onClick={() => navigate('/auth/doctor/login')}
                >
                  Doctor
                </button>

                <button
                  onClick={() => navigate('/cognitive-screening')}
                  style={{ color: '#2dd4bf', fontWeight: 700 }}
                >
                  Early Cognitive Screening
                </button>

              </div>

            </div>

            <div className="cm-footer-bottom">

              <span>
                © 2026 CareMate. All rights reserved.
              </span>

              <span>
                Built for connected and compassionate care.
              </span>

            </div>

          </div>

        </footer>

      </main>
    </div>
  );
};

export default LandingPage;