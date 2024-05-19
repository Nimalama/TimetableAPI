/* eslint-disable indent */
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { JWT_SECRET_KEY } from '../../src/constants/consts';

import { validateAdminToken, validateStudentToken, validateTeacherToken, validateToken } from './validation';


const app = express();

app.use(express.json());

app.get('/admin', validateAdminToken, (req: Request, res: Response) => res.status(200).json({ message: 'Admin access granted' }));
app.get('/student', validateStudentToken, (req: Request, res: Response) => res.status(200).json({ message: 'Student access granted' }));
app.get('/teacher', validateTeacherToken, (req: Request, res: Response) => res.status(200).json({ message: 'Teacher access granted' }));
app.get('/any', validateToken, (req: Request, res: Response) => res.status(200).json({ message: 'Any user access granted' }));

describe('Auth Middleware', () => {
    const adminToken = jwt.sign({ userType: 'admin', id: '1' }, JWT_SECRET_KEY);
    const studentToken = jwt.sign({ userType: 'student', id: '2' }, JWT_SECRET_KEY);
    const teacherToken = jwt.sign({ userType: 'teacher', id: '3' }, JWT_SECRET_KEY);
    const invalidToken = jwt.sign({ userType: 'invalid', id: '4' }, JWT_SECRET_KEY);
    const malformedToken = 'malformed.token.here';

    test('validateAdminToken - success', async () => {
        const res = await request(app).get('/admin').set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Admin access granted');
    });

    test('validateAdminToken - no token', async () => {
        const res = await request(app).get('/admin');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('No token provided');
    });

    test('validateAdminToken - invalid token', async () => {
        const res = await request(app).get('/admin').set('Authorization', `Bearer ${invalidToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Only admin users can access this route');
    });

    test('validateStudentToken - success', async () => {
        const res = await request(app).get('/student').set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Student access granted');
    });

    test('validateStudentToken - invalid token', async () => {
        const res = await request(app).get('/student').set('Authorization', `Bearer ${invalidToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Only student users can access this route');
    });

    test('validateTeacherToken - success', async () => {
        const res = await request(app).get('/teacher').set('Authorization', `Bearer ${teacherToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Teacher access granted');
    });

    test('validateTeacherToken - invalid token', async () => {
        const res = await request(app).get('/teacher').set('Authorization', `Bearer ${invalidToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Only teacher users can access this route');
    });

    test('validateToken - success', async () => {
        const res = await request(app).get('/any').set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Any user access granted');
    });

    test('validateToken - no token', async () => {
        const res = await request(app).get('/any');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('No token provided');
    });

    test('validateToken - malformed token', async () => {
        const res = await request(app).get('/any').set('Authorization', `Bearer ${malformedToken}`);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid token');
    });

    test('validateToken - invalid token', async () => {
        const res = await request(app).get('/any').set('Authorization', `Bearer ${invalidToken}`);

        expect(res.status).toBe(200); // Since validateToken allows any valid token
        expect(res.body.message).toBe('Any user access granted');
    });
});
