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
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = queryOne('SELECT * FROM products WHERE id = ?', [id]) as Product | undefined;
    
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
    const priceValue = Number(price);
    const stockValue = Number(stock) || 0;
    
    try {
        runQuery(
            'INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description || '', priceValue, stockValue, image_url || '', category || '']
        );
        
        return res.status(201).json({ name, description, price: priceValue, stock: stockValue, category });
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
    const id = Number(req.params.id);
    const quantity = Number(req.body.quantity) || 0;
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    // ⚠️ Issue: Race condition, no auth
    const product = queryOne('SELECT * FROM products WHERE id = ?', [id]) as Product | undefined;
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const newStock = product.stock + quantity;
    runQuery('UPDATE products SET stock = ? WHERE id = ?', [newStock, id]);
    
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
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    
    const query = 'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?';
    
    try {
        const products = queryAll(query, [`%${q}%`, `%${q}%`]) as Product[];
        return res.json(products);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
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
    const category = req.params.category;
    
    const query = 'SELECT * FROM products WHERE category = ?';
    
    try {
        const products = queryAll(query, [category]) as Product[];
        return res.json(products);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
