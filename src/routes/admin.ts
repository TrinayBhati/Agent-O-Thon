/**
 * SecureShop TypeScript API - Admin Routes
 * ⚠️ INTENTIONALLY VULNERABLE CODE FOR WORKSHOP
 */

import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// ⚠️ Issue: Hardcoded admin credentials
const ADMIN_API_KEY = 'sk-admin-secret-12345';

/**
 * @swagger
 * /api/admin/config:
 *   get:
 *     tags: [Admin]
 *     summary: Get application configuration
 */
router.get('/config', (req: Request, res: Response) => {
    // ⚠️ Issue: Exposing sensitive configuration
    return res.json({
        node_env: process.env.NODE_ENV,
        jwt_secret: process.env.JWT_SECRET,
        admin_api_key: ADMIN_API_KEY,
        env_vars: Object.fromEntries(
            Object.entries(process.env).filter(([k]) => 
                k.includes('KEY') || k.includes('SECRET') || k.includes('PASSWORD')
            )
        )
    });
});

/**
 * @swagger
 * /api/admin/deserialize:
 *   post:
 *     tags: [Admin]
 *     summary: Deserialize data
 */
router.post('/deserialize', (req: Request, res: Response) => {
    const { data } = req.body;
    
    try {
        // ⚠️ Issue: Insecure deserialization
        const deserialized = eval('(' + data + ')');
        return res.json({ result: deserialized });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/render-template:
 *   post:
 *     tags: [Admin]
 *     summary: Render custom template
 */
router.post('/render-template', (req: Request, res: Response) => {
    const { template, data } = req.body;
    
    try {
        // ⚠️ Issue: Template injection
        const render = new Function('data', `with (data) { return \`${template}\`; }`);
        const rendered = render(data || {});
        return res.json({ rendered });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/backup:
 *   get:
 *     tags: [Admin]
 *     summary: Create database backup
 */
router.get('/backup', (req: Request, res: Response) => {
    const backupPath = req.query.path as string || './backup.sql';
    
    // ⚠️ Issue: Command injection
    const command = `sqlite3 secureshop.db .dump > ${backupPath}`;
    
    try {
        execSync(command);
        return res.json({ message: 'Backup created', path: backupPath, command });
    } catch (error: any) {
        return res.status(500).json({ error: error.message, command });
    }
});

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: Get application logs
 */
router.get('/logs', (req: Request, res: Response) => {
    const logFile = req.query.file as string || 'app.log';
    
    // ⚠️ Issue: Path traversal
    const logPath = path.join(__dirname, '..', '..', 'logs', logFile);
    
    try {
        if (fs.existsSync(logPath)) {
            const content = fs.readFileSync(logPath, 'utf-8');
            return res.json({ file: logFile, content });
        }
        return res.status(404).json({ error: 'Log file not found', path: logPath });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/execute-script:
 *   post:
 *     tags: [Admin]
 *     summary: Execute maintenance script
 */
router.post('/execute-script', (req: Request, res: Response) => {
    const { script } = req.body;
    
    // ⚠️ Issue: Direct code execution
    try {
        const result = eval(script);
        return res.json({ result: String(result) });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/system-info:
 *   get:
 *     tags: [Admin]
 *     summary: Get system information
 */
router.get('/system-info', (req: Request, res: Response) => {
    // ⚠️ Issue: Information disclosure
    return res.json({
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cwd: process.cwd(),
        env: process.env
    });
});

/**
 * @swagger
 * /api/admin/run-command:
 *   post:
 *     tags: [Admin]
 *     summary: Run system command
 */
router.post('/run-command', (req: Request, res: Response) => {
    const { cmd } = req.body;
    
    // ⚠️ Issue: OS command execution
    try {
        const output = execSync(cmd, { encoding: 'utf-8' });
        return res.json({ command: cmd, output });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
