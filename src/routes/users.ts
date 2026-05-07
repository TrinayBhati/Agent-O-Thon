/**
 * SecureShop TypeScript API - User Routes
 * ⚠️ INTENTIONALLY VULNERABLE CODE FOR WORKSHOP
 */

import { Router, Request, Response } from 'express';
import { queryOne, queryAll, runQuery, hashPassword } from '../database';
import { User } from '../types';

const router = Router();

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags: [Users]
 *     summary: User login
 */
router.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const hashedPassword = hashPassword(password);
    
    try {
        const user = queryOne('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashedPassword]) as User | undefined;
        
        if (user) {
            console.log(`User ${username} logged in`);
            return res.json({
                message: 'Login successful',
                user_id: user.id,
                username: user.username,
                role: user.role,
                credit_card: user.credit_card
            });
        }
        
        const userExists = queryOne('SELECT * FROM users WHERE username = ?', [username]);
        if (userExists) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        return res.status(404).json({ error: 'User not found' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register new user
 */
router.post('/register', (req: Request, res: Response) => {
    const { username, email, password, role, credit_card, ssn } = req.body;
    const hashedPassword = hashPassword(password);
    
    try {
        runQuery(
            'INSERT INTO users (username, email, password, role, credit_card, ssn) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role || 'user', credit_card || '', ssn || '']
        );
        
        return res.status(201).json({
            message: 'User created successfully',
            user: { username, email, role: role || 'user' }
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 */
router.get('/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // ⚠️ Issue: IDOR - no authorization
    const user = queryOne('SELECT * FROM users WHERE id = ?', [id]) as User | undefined;
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
});

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users
 */
router.get('/search', (req: Request, res: Response) => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    
    const query = 'SELECT * FROM users WHERE username LIKE ? OR email LIKE ?';
    
    try {
        const users = queryAll(query, [`%${q}%`, `%${q}%`]) as User[];
        return res.json(users);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/users/hash-password:
 *   post:
 *     tags: [Users]
 *     summary: Hash a password (insecurely)
 */
router.post('/hash-password', (req: Request, res: Response) => {
    const { password } = req.body;
    const hashed = hashPassword(password);
    
    return res.json({
        original: password,
        hashed,
        algorithm: 'SHA-256'
    });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 */
router.get('/', (req: Request, res: Response) => {
    // ⚠️ Issue: No pagination, exposes passwords
    const users = queryAll('SELECT id, username, email, role, credit_card, created_at, is_active FROM users') as User[];
    return res.json(users);
});

export default router;
