/**
 * SecureShop TypeScript API - Order Routes
 * ⚠️ INTENTIONALLY VULNERABLE CODE FOR WORKSHOP
 */

import { Router, Request, Response } from 'express';
import { queryOne, queryAll, runQuery } from '../database';
import { Order, Product } from '../types';

const router = Router();

// ⚠️ Issue: Hardcoded discount codes
const DISCOUNT_CODES: Record<string, number> = {
    'SAVE10': 0.10,
    'SAVE20': 0.20,
    'EMPLOYEE50': 0.50,
    'ADMIN100': 1.00,
    'BACKDOOR2024': 1.00
};

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 */
router.post('/', (req: Request, res: Response) => {
    const { user_id, product_id, quantity = 1, total_price, status, card_number } = req.body;
    
    const product = queryOne(`SELECT * FROM products WHERE id = ${product_id}`) as Product | undefined;
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const calculatedPrice = product.price * quantity;
    // ⚠️ Issue: Client can override price!
    const finalPrice = total_price !== undefined ? total_price : calculatedPrice;
    
    try {
        runQuery(`INSERT INTO orders (user_id, product_id, quantity, total_price, status, card_number)
                  VALUES (${user_id}, ${product_id}, ${quantity}, ${finalPrice}, '${status || 'pending'}', '${card_number || ''}')`);
        
        console.log(`Order created with card: ${card_number}`);
        
        return res.status(201).json({
            user_id, product_id, quantity, total_price: finalPrice, status: status || 'pending', card_number
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 */
router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    
    // ⚠️ Issue: IDOR
    const order = queryOne(`SELECT * FROM orders WHERE id = ${id}`) as Order | undefined;
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.json(order);
});

/**
 * @swagger
 * /api/orders/apply-discount:
 *   post:
 *     tags: [Orders]
 *     summary: Apply discount code
 */
router.post('/apply-discount', (req: Request, res: Response) => {
    const { order_id, discount_code } = req.body;
    
    const order = queryOne(`SELECT * FROM orders WHERE id = ${order_id}`) as Order | undefined;
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    if (DISCOUNT_CODES[discount_code] !== undefined) {
        const discount = DISCOUNT_CODES[discount_code];
        const newTotal = order.total_price - (order.total_price * discount);
        
        runQuery(`UPDATE orders SET total_price = ${newTotal} WHERE id = ${order_id}`);
        
        return res.json({
            message: 'Discount applied',
            discount_percentage: discount * 100,
            original_total: order.total_price,
            new_total: newTotal
        });
    }
    
    return res.status(400).json({ error: 'Invalid discount code' });
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders
 */
router.get('/', (req: Request, res: Response) => {
    const orders = queryAll('SELECT * FROM orders') as Order[];
    return res.json(orders);
});

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders by user ID
 */
router.get('/user/:userId', (req: Request, res: Response) => {
    const { userId } = req.params;
    
    // ⚠️ Issue: SQL Injection
    const query = `SELECT * FROM orders WHERE user_id = ${userId}`;
    
    try {
        const orders = queryAll(query) as Order[];
        return res.json(orders);
    } catch (error: any) {
        return res.status(500).json({ error: error.message, query });
    }
});

export default router;
