/**
 * SecureShop TypeScript API - Database Setup
 * ⚠️ INTENTIONALLY VULNERABLE CODE FOR WORKSHOP
 * 
 * Using sql.js (pure JavaScript SQLite) for cross-platform compatibility
 */

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

let db: SqlJsDatabase;

// ⚠️ Issue: Database file in project directory
const dbPath = path.join(__dirname, '..', '..', 'secureshop.db');

export async function initDatabase(): Promise<SqlJsDatabase> {
    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    
    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            credit_card TEXT,
            ssn TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        );
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            image_url TEXT,
            category TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        );
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            shipping_address TEXT,
            payment_method TEXT,
            card_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id INTEGER,
            user_id INTEGER,
            details TEXT,
            ip_address TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    return db;
}

export function getDb(): SqlJsDatabase {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

export function saveDatabase(): void {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

export function seedDatabase(): void {
    if (!db) return;
    
    const result = db.exec('SELECT COUNT(*) as count FROM users');
    const count = result.length > 0 ? result[0].values[0][0] as number : 0;
    
    if (count === 0) {
        // ⚠️ Issue: Weak/predictable passwords stored in plain text
        db.run(`INSERT INTO users (username, email, password, role, credit_card, ssn) 
                VALUES ('admin', 'admin@secureshop.com', 'admin123', 'admin', '4111-1111-1111-1111', '123-45-6789')`);
        db.run(`INSERT INTO users (username, email, password, role, credit_card) 
                VALUES ('john_doe', 'john@example.com', 'password123', 'user', '4222-2222-2222-2222')`);
        db.run(`INSERT INTO users (username, email, password, role) 
                VALUES ('jane_smith', 'jane@example.com', 'jane2024', 'user')`);

        db.run(`INSERT INTO products (name, description, price, stock, category) 
                VALUES ('Laptop Pro X1', 'High-performance laptop', 1299.99, 50, 'Electronics')`);
        db.run(`INSERT INTO products (name, description, price, stock, category) 
                VALUES ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 200, 'Electronics')`);
        db.run(`INSERT INTO products (name, description, price, stock, category) 
                VALUES ('USB-C Hub', '7-in-1 USB-C hub', 49.99, 100, 'Accessories')`);

        saveDatabase();
        console.log('Database seeded successfully!');
    }
}

export function getLastInsertRowId(): number {
    const result = db.exec('SELECT last_insert_rowid()');
    return result.length > 0 ? result[0].values[0][0] as number : 0;
}

export function queryOne(sql: string): any {
    try {
        const result = db.exec(sql);
        if (result.length === 0 || result[0].values.length === 0) {
            return undefined;
        }
        const columns = result[0].columns;
        const values = result[0].values[0];
        const row: any = {};
        columns.forEach((col, i) => {
            row[col] = values[i];
        });
        return row;
    } catch (error) {
        throw error;
    }
}

export function queryAll(sql: string): any[] {
    try {
        const result = db.exec(sql);
        if (result.length === 0) {
            return [];
        }
        const columns = result[0].columns;
        return result[0].values.map(values => {
            const row: any = {};
            columns.forEach((col, i) => {
                row[col] = values[i];
            });
            return row;
        });
    } catch (error) {
        throw error;
    }
}

export function runQuery(sql: string): any {
    try {
        db.run(sql);
        saveDatabase();
        return { changes: db.getRowsModified(), lastInsertRowid: getLastInsertRowId() };
    } catch (error) {
        throw error;
    }
}

export default { initDatabase, getDb, seedDatabase, queryOne, queryAll, runQuery, saveDatabase };
