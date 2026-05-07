/**
 * SecureShop TypeScript API - Type Definitions
 * ⚠️ INTENTIONALLY VULNERABLE CODE FOR WORKSHOP
 */

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: string;
    credit_card?: string;
    ssn?: string;
    created_at: string;
    is_active: number;
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    image_url?: string;
    category?: string;
    created_at: string;
    is_active: number;
}

export interface Order {
    id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    total_price: number;
    status: string;
    shipping_address?: string;
    payment_method?: string;
    card_number?: string;
    created_at: string;
}

export interface AuditLog {
    id: number;
    action: string;
    entity_type: string;
    entity_id?: number;
    user_id?: number;
    details?: string;
    ip_address?: string;
    timestamp: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface CreateOrderRequest {
    user_id: number;
    product_id: number;
    quantity: number;
    total_price?: number;
    status?: string;
    card_number?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
