// Import necessary modules
import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../models/user.model';

// Create Express router
const router = express.Router();

// Route for user registration
router.post('/register', async (req: any, res: any) => {
  console.log(req);
  try {
    const { email, password, fullName, userType } = req.body;

    // Check if all required properties are present
    if (!email || !password || !fullName || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in database
    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
      userType
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        userType: newUser.userType
      },
      'your_secret_key',
      { expiresIn: '24h' }
    );

    // Send response with user data and token
    res.status(201).json({
      fullName: newUser.fullName,
      email: newUser.email,
      userType: newUser.userType,
      token
    });
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

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType
      },
      'your_secret_key',
      { expiresIn: '24h' }
    );

    // Send response with user data and token
    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      token
    });
  } catch (error) {
    console.error('Error logging in: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for valid token check
router.get('/validateToken', (req: any, res: any) => {
  const token = req.headers['x-auth-token'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'your_secret_key');

    res.status(200).json(decoded);
  } catch (error) {
    console.error('Error validating token: ', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
