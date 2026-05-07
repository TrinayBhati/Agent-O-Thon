/**
 * SecureShop TypeScript API - File Routes
 * ⚠️ INTENTIONALLY VULNERABLE CODE FOR WORKSHOP
 */

import { Router, Request, Response } from 'express';
import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { parseString } from 'xml2js';
import * as yaml from 'js-yaml';

const router = Router();

/**
 * @swagger
 * /api/files/download:
 *   get:
 *     tags: [Files]
 *     summary: Download a file
 */
router.get('/download', (req: Request, res: Response) => {
    const { filename } = req.query;
    
    // ⚠️ Issue: Path Traversal
    const basePath = path.join(__dirname, '..', '..', 'uploads');
    const filePath = path.join(basePath, filename as string);
    
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    
    return res.status(404).json({ error: 'File not found', path: filePath });
});

/**
 * @swagger
 * /api/files/read:
 *   get:
 *     tags: [Files]
 *     summary: Read file contents
 */
router.get('/read', (req: Request, res: Response) => {
    const { path: filePath } = req.query;
    
    // ⚠️ Issue: Arbitrary file read
    try {
        const content = fs.readFileSync(filePath as string, 'utf-8');
        return res.json({ path: filePath, content });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/files/process:
 *   post:
 *     tags: [Files]
 *     summary: Process a file with system command
 */
router.post('/process', (req: Request, res: Response) => {
    const { filename, operation = 'type' } = req.body;
    
    // ⚠️ Issue: Command Injection
    const command = `${operation} ${filename}`;
    
    try {
        const result = execSync(command, { encoding: 'utf-8' });
        return res.json({ command, output: result });
    } catch (error: any) {
        return res.status(500).json({ error: error.message, command });
    }
});

/**
 * @swagger
 * /api/files/exec:
 *   post:
 *     tags: [Files]
 *     summary: Execute arbitrary command
 */
router.post('/exec', (req: Request, res: Response) => {
    const { cmd } = req.body;
    
    // ⚠️ Issue: Direct command execution
    exec(cmd, (error, stdout, stderr) => {
        return res.json({ command: cmd, stdout, stderr, error: error?.message });
    });
});

/**
 * @swagger
 * /api/files/eval:
 *   post:
 *     tags: [Files]
 *     summary: Evaluate JavaScript expression
 */
router.post('/eval', (req: Request, res: Response) => {
    const { expression } = req.body;
    
    try {
        // ⚠️ Issue: Code Injection via eval
        const result = eval(expression);
        return res.json({ expression, result: String(result) });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/files/fetch-url:
 *   post:
 *     tags: [Files]
 *     summary: Fetch content from URL
 */
router.post('/fetch-url', async (req: Request, res: Response) => {
    const { url } = req.body;
    
    // ⚠️ Issue: SSRF - No URL validation
    try {
        const response = await axios.get(url, { timeout: 10000 });
        return res.json({ url, status: response.status, data: response.data });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/files/parse-xml:
 *   post:
 *     tags: [Files]
 *     summary: Parse XML content
 */
router.post('/parse-xml', (req: Request, res: Response) => {
    const { xml } = req.body;
    
    // ⚠️ Issue: XXE vulnerability
    parseString(xml, (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.json(result);
    });
});

/**
 * @swagger
 * /api/files/parse-yaml:
 *   post:
 *     tags: [Files]
 *     summary: Parse YAML content
 */
router.post('/parse-yaml', (req: Request, res: Response) => {
    const { yaml: yamlContent } = req.body;
    
    try {
        // ⚠️ Issue: Unsafe YAML load
        const result = yaml.load(yamlContent);
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/files/merge:
 *   post:
 *     tags: [Files]
 *     summary: Merge objects
 */
router.post('/merge', (req: Request, res: Response) => {
    const { target, source } = req.body;
    
    // ⚠️ Issue: Prototype Pollution
    const merge = (target: any, source: any) => {
        for (const key in source) {
            if (typeof source[key] === 'object' && source[key] !== null) {
                if (!target[key]) target[key] = {};
                merge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    };
    
    const result = merge(target || {}, source || {});
    return res.json(result);
});

export default router;
