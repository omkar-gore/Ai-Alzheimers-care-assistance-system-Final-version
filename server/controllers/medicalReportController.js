import MedicalReport from '../models/MedicalReport.js';
import fs from 'fs';
import path from 'path';
import {
  resolveTargetPatient,
  isAuthorizedForPatient,
} from '../utils/authCheck.js';

// ==========================================
// GET ALL MEDICAL REPORTS
// ==========================================
export const getMedicalReports = async (req, res) => {
  try {
    const targetPatientId = await resolveTargetPatient(req.user, req.query.patientId);

    const reports = await MedicalReport.find({
      patient: targetPatientId,
    })
      .populate('patient', 'name email phone')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone')
      .sort({ uploadedAt: -1 });

    return res.status(200).json(reports);
  } catch (error) {
    console.error('Get medical reports error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Unable to fetch medical reports',
    });
  }
};

// ==========================================
// UPLOAD MEDICAL REPORT
// ==========================================
export const uploadMedicalReport = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver' && req.user.role !== 'doctor') {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        message: 'Permission denied: Only caregivers or doctors can upload reports',
      });
    }

    const targetPatientId = await resolveTargetPatient(req.user, req.body.patientId);

    if (!req.file) {
      return res.status(400).json({
        message: 'Please select a medical report file',
      });
    }

    const { reportName, reportType } = req.body;

    if (!reportName?.trim()) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: 'Report name is required',
      });
    }

    const relativeFilePath = path
      .relative(process.cwd(), req.file.path)
      .replace(/\\/g, '/');

    const fileUrl = `/${relativeFilePath}`;

    const report = await MedicalReport.create({
      patient: targetPatientId,
      caregiver: req.user.role === 'caregiver' ? req.user._id : null,
      doctor: req.user.role === 'doctor' ? req.user._id : null,
      reportName: reportName.trim(),
      reportType: reportType || 'Other',
      fileName: req.file.originalname,
      fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date(),
    });

    const populatedReport = await MedicalReport.findById(report._id)
      .populate('patient', 'name email phone')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone');

    return res.status(201).json({
      message: 'Medical report uploaded successfully',
      report: populatedReport,
    });
  } catch (error) {
    console.error('Upload medical report error:', error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(error.status || 500).json({
      message: error.message || 'Unable to upload medical report',
    });
  }
};

// ==========================================
// DELETE MEDICAL REPORT
// ==========================================
export const deleteMedicalReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: 'Medical report not found',
      });
    }

    const authorized = await isAuthorizedForPatient(req.user, report.patient);
    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: You are not authorized to delete this report',
      });
    }

    // Delete physical file
    if (report.fileUrl) {
      const relativePath = report.fileUrl.replace(/^\//, '');
      const filePath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not remove file on disk:', e.message);
        }
      }
    }

    await MedicalReport.findByIdAndDelete(report._id);

    return res.status(200).json({
      message: 'Medical report deleted successfully',
    });
  } catch (error) {
    console.error('Delete medical report error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Unable to delete medical report',
    });
  }
};

export default {
  getMedicalReports,
  uploadMedicalReport,
  deleteMedicalReport,
};