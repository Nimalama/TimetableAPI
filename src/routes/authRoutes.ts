import crypto from 'crypto';
import path from 'path';

import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';

import { JWT_SECRET_KEY } from '../constants/consts';
import { validateToken } from '../middleware/validation';
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
    res
      .status(201)
      .json({ data: { fullName: newUser.fullName, email: newUser.email, userType: newUser.userType, token } });
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
    res
      .status(200)
      .json({ data: { id: user.id, fullName: user.fullName, email: user.email, userType: user.userType, token } });
  } catch (error) {
    console.error('Error logging in: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for validating token
router.get('/validateToken', (req: Request, res: Response) => {
  const { token } = req.query;

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

const CLIENT_ID = '682374523124-chs6fq2ctt29ngk5omi23qqv62qm3bg2.apps.googleusercontent.com'; // Replace with your Google client ID

router.post('/google-signin', async (req: Request, res: Response) => {
  try {
    const { idToken, userType } = req.body;

    // Verify the token
    const client = new OAuth2Client(CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Extract user data
    const { email, name } = payload;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      // If user exists, generate JWT token and send response
      const token = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          fullName: existingUser.fullName,
          userType: existingUser.userType
        },
        JWT_SECRET_KEY,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        data: { fullName: existingUser.fullName, email: existingUser.email, userType: existingUser.userType, token }
      });
    }
    // randon 8 digits
    const password = Math.floor(10000000 + Math.random() * 90000000).toString();

    // If user does not exist, create a new user
    const newUser = await User.create({
      email: email ?? '',
      fullName: name ?? '',
      userType,
      password
    });

    // Generate JWT token for new user
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, fullName: newUser.fullName, userType: newUser.userType },
      JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Send response with user data and token
    res
      .status(201)
      .json({ data: { fullName: newUser.fullName, email: newUser.email, userType: newUser.userType, token } });
  } catch (error) {
    console.error('Error signing in with Google: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Define storage for the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads/'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + String(Date.now()) + path.extname(file.originalname)); // Set filename
  }
});

// Create upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.patch('/authProfile', validateToken, upload.single('profilePic'), async (req, res) => {
  const { address, department, fullName } = req.body;
  const userId = req.user?.id; // Extract user ID from decoded token

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (req.file) {
      // If a new profile pic is uploaded, update profilePic field
      user.profilePic = req.file.path; // Assuming you store the path to the file in the database
    }
    if (address !== undefined) user.address = address;
    if (department !== undefined) user.department = department;
    if (fullName !== undefined) user.fullName = fullName;

    // Save updated user
    await user.save();

    return res.status(200).json({ data: true });
  } catch (error) {
    console.error('Error updating profile:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/authProfile', validateToken, async (req, res) => {
  const userId = req.user?.id; // Extract user ID from decoded token

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send profile information in response
    return res.status(200).json({ data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const emailFromRequest = email as string;

  // Find user by email (you might use a database query here)
  const user = await User.findOne({ where: { email: emailFromRequest } });

  console.log(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate token
  const token = crypto.randomBytes(20).toString('hex');

  // Save the token in the user record or in a temporary store (e.g., Redis) along with the user ID
  // user.resetToken = token;
  // user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

  // Send reset password email
  const transporter = nodemailer.createTransport({
    // Configure email service
    service: 'gmail',
    auth: {
      user: 'your@example.com',
      pass: 'yourpassword'
    }
  });

  const mailOptions = {
    from: 'your@example.com',
    to: emailFromRequest,
    subject: 'Password Reset',
    text: `Click this link to reset your password: http://localhost:3000/reset-password?token=${token}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending reset email' });
  }
});

export default router;
