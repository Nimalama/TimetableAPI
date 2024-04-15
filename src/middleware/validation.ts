import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { JWT_SECRET_KEY } from '../constants/consts';

// Extend the Request interface to include a user property
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { userType: string; id: string }; // Modify this according to your user object structure
    }
  }
}

// Middleware to validate JWT token
// eslint-disable-next-line
export const validateAdminToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET_KEY);

    // Check if user is admin
    if (decoded.userType !== 'admin') {
      return res.status(403).json({ message: 'Only admin users can access this route' });
    }

    // Pass user information to next middleware
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error validating token: ', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to validate JWT token
// eslint-disable-next-line
export const validateStudentToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET_KEY);

    // Check if user is student
    if (decoded.userType !== 'student') {
      return res.status(403).json({ message: 'Only student users can access this route' });
    }

    // Pass user information to next middleware
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error validating token: ', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to validate JWT token
// eslint-disable-next-line
export const validateTeacherToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET_KEY);

    // Check if user is teacher
    if (decoded.userType !== 'teacher') {
      return res.status(403).json({ message: 'Only teacher users can access this route' });
    }

    // Pass user information to next middleware
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error validating token: ', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to validate JWT token
// eslint-disable-next-line
export const validateToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET_KEY);

    // Pass user information to next middleware
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error validating token: ', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
