/* eslint-disable indent */
import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';


import { sequelize } from '../../sequelize';
import { JWT_SECRET_KEY } from '../constants/consts';
import { User } from '../models/user.model';

import authRouter from './authRoutes';

jest.mock('nodemailer');

const app = express();

app.use(express.json());
app.use('/auth', authRouter);

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Auth Routes', () => {
    beforeEach(async () => {
        await User.destroy({ where: { email: 'test@example.com' } });
    });

    it('should register a new user', async () => {
        const res = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'password',
            fullName: 'Test User',
            userType: 'student'
        });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('token');
    });

    it('should not register an existing user', async () => {
        await User.create({
            email: 'test@example.com',
            password: await bcrypt.hash('password', 10),
            fullName: 'Test User',
            userType: 'student'
        });

        const res = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'password',
            fullName: 'Test User',
            userType: 'student'
        });

        expect(res.status).toBe(400);
        expect(res.body).toBe('Email already exists');
    });

    it('should log in an existing user', async () => {
        const hashedPassword = await bcrypt.hash('password', 10);

        await User.create({
            email: 'test@example.com',
            password: hashedPassword,
            fullName: 'Test User',
            userType: 'student'
        });

        const res = await request(app).post('/auth/login').send({
            email: 'test@example.com',
            password: 'password'
        });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('token');
    });

    it('should not log in with invalid credentials', async () => {
        await User.create({
            email: 'test@example.com',
            password: await bcrypt.hash('password', 10),
            fullName: 'Test User',
            userType: 'student'
        });

        const res = await request(app).post('/auth/login').send({
            email: 'test@example.com',
            password: 'wrongpassword'
        });

        expect(res.status).toBe(401);
        expect(res.body).toBe('Invalid email or password');
    });

    it('should validate a valid token', async () => {
        const token = jwt.sign({ id: 1, email: 'test@example.com', fullName: 'Test User', userType: 'student' }, JWT_SECRET_KEY, { expiresIn: '24h' });

        const res = await request(app).get('/auth/validateToken').query({ token });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
    });

    it('should not validate an invalid token', async () => {
        const res = await request(app).get('/auth/validateToken').query({ token: 'invalidtoken' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid token');
    });

    it('should update user profile', async () => {
        const user = await User.create({
            email: 'test@example.com',
            password: 'password',
            fullName: 'Test User',
            userType: 'student'
        });

        const token = jwt.sign({ id: user.id, email: user.email, fullName: user.fullName, userType: user.userType }, JWT_SECRET_KEY, { expiresIn: '24h' });

        const res = await request(app)
            .patch('/auth/authProfile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                address: 'New Address',
                department: 'New Department',
                fullName: 'Updated User'
            });

        expect(res.status).toBe(200);
        expect(res.body.data).toBe(true);

        const updatedUser = await User.findByPk(user.id);

        expect(updatedUser?.address).toBe('New Address');
        expect(updatedUser?.department).toBe('New Department');
        expect(updatedUser?.fullName).toBe('Updated User');
    });

    it('should fetch user profile', async () => {
        const user = await User.create({
            email: 'test@example.com',
            password: 'password',
            fullName: 'Test User',
            userType: 'student'
        });

        const token = jwt.sign({ id: user.id, email: user.email, fullName: user.fullName, userType: user.userType }, JWT_SECRET_KEY, { expiresIn: '24h' });

        const res = await request(app)
            .get('/auth/authProfile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe(user.email);
    });
});
