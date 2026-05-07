/**
 * SecureShop TypeScript API - Product Routes
 * ⚠️ INTENTIONALLY VULNERABLE CODE FOR WORKSHOP
 */

import { Router, Request, Response } from 'express';
import { queryOne, queryAll, runQuery } from '../database';
import { Product } from '../types';

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 */
router.get('/', (req: Request, res: Response) => {
    // ⚠️ Issue: No pagination
    const products = queryAll('SELECT * FROM products') as Product[];
    return res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 */
router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    
    const product = queryOne(`SELECT * FROM products WHERE id = ${id}`) as Product | undefined;
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 */
router.post('/', (req: Request, res: Response) => {
    const { name, description, price, stock, image_url, category } = req.body;
    
    // ⚠️ Issue: No authentication, SQL injection
    try {
        runQuery(`INSERT INTO products (name, description, price, stock, image_url, category)
                  VALUES ('${name}', '${description || ''}', ${price}, ${stock || 0}, '${image_url || ''}', '${category || ''}')`);
        
        return res.status(201).json({ name, description, price, stock: stock || 0, category });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/products/{id}/update-stock:
 *   post:
 *     tags: [Products]
 *     summary: Update product stock
 */
router.post('/:id/update-stock', (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity } = req.body;
    
    // ⚠️ Issue: Race condition, no auth
    const product = queryOne(`SELECT * FROM products WHERE id = ${id}`) as Product | undefined;
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const newStock = product.stock + (quantity || 0);
    runQuery(`UPDATE products SET stock = ${newStock} WHERE id = ${id}`);
    
    return res.json({ ...product, stock: newStock });
});

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     tags: [Products]
 *     summary: Search products
 */
router.get('/search', (req: Request, res: Response) => {
    const { q } = req.query;
    
    // ⚠️ Issue: SQL Injection
    const query = `SELECT * FROM products WHERE name LIKE '%${q}%' OR description LIKE '%${q}%'`;
    
    try {
        const products = queryAll(query) as Product[];
        return res.json(products);
    } catch (error: any) {
        return res.status(500).json({ error: error.message, query });
    }
});

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     tags: [Products]
 *     summary: Get products by category
 */
router.get('/category/:category', (req: Request, res: Response) => {
    const { category } = req.params;
    
    // ⚠️ Issue: SQL Injection
    const query = `SELECT * FROM products WHERE category = '${category}'`;
    
    try {
        const products = queryAll(query) as Product[];
        return res.json(products);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
