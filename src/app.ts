/**
 * SecureShop TypeScript API - Main Application
 * ⚠️ INTENTIONALLY VULNERABLE CODE FOR WORKSHOP
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

import { initDatabase, seedDatabase } from './database';
import userRoutes from './routes/users';
import fileRoutes from './routes/files';
import orderRoutes from './routes/orders';
import productRoutes from './routes/products';
import adminRoutes from './routes/admin';

const app = express();

// ⚠️ Issue: Debug mode
app.set('env', 'development');

// Middleware
app.use(cors()); // ⚠️ CORS allows all origins
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SecureShop API',
            version: '1.0.0',
            description: '⚠️ INTENTIONALLY VULNERABLE E-Commerce API FOR WORKSHOP',
        },
        servers: [{ url: `http://localhost:${process.env.PORT || 5002}` }],
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Logging middleware - ⚠️ Logs sensitive data
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body));
    }
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Home route
app.get('/', (req: Request, res: Response) => {
    res.json({
        name: 'SecureShop API',
        version: '1.0.0',
        description: 'E-Commerce API - ⚠️ VULNERABLE FOR WORKSHOP',
        swagger: '/swagger',
        endpoints: {
            users: '/api/users',
            products: '/api/products',
            orders: '/api/orders',
            files: '/api/files',
            admin: '/api/admin',
        },
    });
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ⚠️ Debug endpoint
app.get('/debug', (req: Request, res: Response) => {
    res.json({
        env: process.env,
        cwd: process.cwd(),
        memory: process.memoryUsage(),
    });
});

// Error handler - ⚠️ exposes stack traces
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});

// Start server
async function startServer() {
    try {
        await initDatabase();
        seedDatabase();
        
        const PORT = process.env.PORT || 5002;
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║          SecureShop TypeScript API - VULNERABLE              ║
║          ⚠️  FOR WORKSHOP/EDUCATIONAL USE ONLY ⚠️            ║
╠══════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                               
║  Swagger: http://localhost:${PORT}/swagger                      
╚══════════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;
