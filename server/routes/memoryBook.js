import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth.js';

import MemoryPerson from '../models/MemoryPerson.js';
import {
  resolveTargetPatient,
  isAuthorizedForPatient,
} from '../utils/authCheck.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.join(__dirname, '../uploads/memory');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const safeName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}${extension}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(authenticateToken);
router.use(authorizeRoles('patient', 'caregiver', 'doctor'));

// =========================================================
// GET MEMORY BOOK
// =========================================================
router.get('/', async (req, res) => {
  try {
    const targetPatientId = await resolveTargetPatient(req.user, req.query.patientId);

    const persons = await MemoryPerson.find({
      patient: targetPatientId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(persons);
  } catch (error) {
    console.error('Failed to fetch memory book:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to fetch memory book',
    });
  }
});

// =========================================================
// ADD MEMORY MEMBER
// =========================================================
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const targetPatientId = await resolveTargetPatient(req.user, req.body.patientId);

    const { name, relationship, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Member name is required.' });
    }

    if (!relationship || !relationship.trim()) {
      return res.status(400).json({ message: 'Relationship is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Member photo is required.' });
    }

    const photoUrl = `/uploads/memory/${req.file.filename}`;

    const memoryPerson = new MemoryPerson({
      patient: targetPatientId,
      name: name.trim(),
      relationship: relationship.trim(),
      photo: photoUrl,
      description: description?.trim() || '',
    });

    await memoryPerson.save();

    return res.status(201).json({
      message: 'Memory member added successfully.',
      person: memoryPerson,
    });
  } catch (error) {
    console.error('Failed to add memory member:', error);

    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }

    return res.status(error.status || 500).json({
      message: error.message || 'Failed to add memory member.',
    });
  }
});

// =========================================================
// DELETE MEMORY MEMBER
// =========================================================
router.delete('/:id', async (req, res) => {
  try {
    const person = await MemoryPerson.findById(req.params.id);

    if (!person) {
      return res.status(404).json({ message: 'Memory member not found.' });
    }

    const authorized = await isAuthorizedForPatient(req.user, person.patient);
    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: Not authorized for this patient\'s memory book',
      });
    }

    if (person.photo) {
      const photoPath = path.join(
        __dirname,
        '..',
        person.photo.replace(/^\/uploads\//, 'uploads/')
      );
      if (fs.existsSync(photoPath)) {
        try {
          fs.unlinkSync(photoPath);
        } catch {}
      }
    }

    await MemoryPerson.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: 'Memory member deleted successfully.',
    });
  } catch (error) {
    console.error('Failed to delete memory member:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to delete memory member.',
    });
  }
});

// Multer error handler
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Image size should be less than 5 MB.' });
    }
    return res.status(400).json({ message: error.message });
  }

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
});

export default router;