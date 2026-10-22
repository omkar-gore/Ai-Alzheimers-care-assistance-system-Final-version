import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query?.token; // Bearer TOKEN or query token

  if (!token) return res.status(401).json({ message: 'Access token missing' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.jwtPayload = payload;
    const userId = payload.id || payload._id || payload.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token: missing user identity' });
    }

    req.user = await User.findById(userId).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Convenience properties
    req.user.id = req.user._id ? req.user._id.toString() : String(userId);

    // Resolve role from all possible candidate locations:
    // User model (role, userRole, userType, _doc) or JWT payload (role, userRole, userType)
    const rawRole =
      req.user.role ||
      req.user.userRole ||
      req.user.userType ||
      req.user._doc?.role ||
      req.user._doc?.userRole ||
      req.user._doc?.userType ||
      payload.role ||
      payload.userRole ||
      payload.userType ||
      '';

    const normalizedRole = String(rawRole).trim().toLowerCase();

    // Set normalized role on req.user and across all common aliases
    req.user.role = normalizedRole;
    req.user.userRole = normalizedRole;
    req.user.userType = normalizedRole;
    if (req.user._doc) {
      req.user._doc.role = normalizedRole;
      req.user._doc.userRole = normalizedRole;
      req.user._doc.userType = normalizedRole;
    }

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles) => {
  const normalizedAllowedRoles = roles.map((r) => String(r).toLowerCase().trim());
  return (req, res, next) => {
    const rawRole =
      req.user?.role ||
      req.user?.userRole ||
      req.user?.userType ||
      req.user?._doc?.role ||
      req.user?._doc?.userRole ||
      req.jwtPayload?.role ||
      req.jwtPayload?.userRole ||
      req.jwtPayload?.userType ||
      '';
    const userRole = String(rawRole).toLowerCase().trim();

    if (!req.user || !normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Permission denied: unauthorized role' });
    }
    next();
  };
};

export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.jwtPayload = payload;
    const userId = payload.id || payload._id || payload.userId;
    if (userId) {
      req.user = await User.findById(userId).select('-password');
      if (req.user) {
        req.user.id = req.user._id ? req.user._id.toString() : String(userId);
        const rawRole =
          req.user.role ||
          req.user.userRole ||
          req.user.userType ||
          req.user._doc?.role ||
          payload.role ||
          payload.userRole ||
          payload.userType ||
          '';
        const normalizedRole = String(rawRole).trim().toLowerCase();
        req.user.role = normalizedRole;
        req.user.userRole = normalizedRole;
      }
    }
  } catch (err) {
    // Gracefully ignore token errors for optional routes
  }
  next();
};
