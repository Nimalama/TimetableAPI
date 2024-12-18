import path from 'path';

import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer, { TransportOptions } from 'nodemailer';

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET_KEY, REFRESH_TOKEN } from '../constants/consts';
import { validateToken } from '../middleware/validation';
import { User } from '../models/user.model';

// Create OAuth2 client
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Generate access token
const getAccessToken = async (): Promise<string> => {
  const { token } = await oAuth2Client.getAccessToken();

  return token ?? '';
};

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
    res.status(201).json({
      data: {
        fullName: newUser.fullName,
        email: newUser.email,
        userType: newUser.userType,
        token,
        category: newUser.category
      }
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
    res.status(200).json({
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        token,
        category: user.category
      }
    });
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

router.post('/google-signin', async (req: Request, res: Response) => {
  try {
    const { idToken, userType } = req.body;

    // Verify the token
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
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

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName, userType: user.userType },
    JWT_SECRET_KEY,
    { expiresIn: '24h' }
  );

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const options = {
    // host: 'smtp.gmail.com',
    // port: 587,
    // secure: false,
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'modernwalk93@gmail.com',
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: getAccessToken()
    }
  } as TransportOptions;

  const transporter = nodemailer.createTransport(options);

  const mailOptions = {
    from: 'modernwalk93@gmail.com',
    to: emailFromRequest,
    subject: 'Password Reset',
    text: `Click this link to reset your password: http://localhost:5173/reset-password?token=${token}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending reset email' });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  const { newPassword, token } = req.body;

  try {
    // Verify and decode token
    const decoded: any = jwt.verify(token, JWT_SECRET_KEY);
    const userId = decoded.id;

    // Fetch user from database
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and resetToken in the database
    user.password = hashedPassword;
    await user.save();

    res.json({ data: { success: true, message: 'Password reset successfully' } });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

export default router;
