import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { JWT_SECRET_KEY } from '../constants/consts';
import { User } from '../models/user.model';

const router = express.Router();

// Route for user registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, userType } = req.body;

    // Check for missing fields
    if (!email || !password || !fullName || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json('Email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({ email, password: hashedPassword, fullName, userType });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, fullName: newUser.fullName, userType: newUser.userType },
      JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Send response with user data and token
    res.status(201).json({ data: { fullName: newUser.fullName, email: newUser.email, userType: newUser.userType, token } });
  } catch (error) {
    console.error('Error registering user: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for user login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName, userType: user.userType },
      JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Send response with user data and token
    res.status(200).json({ data: { fullName: user.fullName, email: user.email, userType: user.userType, token } });
  } catch (error) {
    console.error('Error logging in: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for validating token
router.get('/validateToken', (req: Request, res: Response) => {
  const token = req.headers['x-auth-token'];

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token as string, JWT_SECRET_KEY);

    res.status(200).json(decoded);
  } catch (error) {
    console.error('Error validating token: ', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
