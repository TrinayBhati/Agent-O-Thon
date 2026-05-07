# SecureShop TypeScript API

⚠️ **INTENTIONALLY VULNERABLE APPLICATION FOR WORKSHOP USE ONLY** ⚠️

This Express/TypeScript application contains **intentional security vulnerabilities** for educational purposes in the GitHub Copilot Custom Agents Workshop. **DO NOT deploy to production!**

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Navigate to the typescript samples directory
cd samples/typescript

# Install dependencies
npm install
```

### Running the Application

```bash
# Development mode (with ts-node)
npm run dev

# Or build and run
npm run build
npm start

# Watch mode (auto-restart on changes)
npm run watch
```

The API will start on **http://localhost:5002**

### Access Points
- **API Root**: http://localhost:5002/
- **Swagger UI**: http://localhost:5002/swagger
- **Health Check**: http://localhost:5002/health

> ⚠️ A `/debug` endpoint is included only for workshop demonstration and must be disabled in any production deployment.

## Project Structure

```
samples/typescript/
├── src/
│   ├── app.ts              # Main Express application
│   ├── database.ts         # SQLite database setup
│   ├── types.ts            # TypeScript type definitions
│   └── routes/
│       ├── users.ts        # User management (SQL injection, IDOR)
│       ├── files.ts        # File operations (path traversal, SSRF)
│       ├── orders.ts       # Order management (mass assignment)
│       ├── products.ts     # Product catalog (no pagination)
│       └── admin.ts        # Admin functions (code injection)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment config (sample values only; do not store real secrets here)
├── uploads/                # File upload directory
└── README.md               # This file
```

## Vulnerability Matrix

### 🔐 User Endpoints (`/api/users/`)

| Vulnerability | Endpoint | CWE |
|---------------|----------|-----|
| SQL Injection | `POST /api/users/login` | CWE-89 |
| SQL Injection | `GET /api/users/search` | CWE-89 |
| User Enumeration | `POST /api/users/login` | CWE-204 |
| Weak Password Hashing (MD5) | `POST /api/users/hash-password` | CWE-328 |
| Missing Authentication | `GET /api/users/:id` | CWE-306 |
| IDOR | `GET /api/users/:id` | CWE-639 |
| Mass Assignment | `POST /api/users/register` | CWE-915 |
| Information Exposure | All user endpoints | CWE-200 |

### 📁 File Endpoints (`/api/files/`)

| Vulnerability | Endpoint | CWE |
|---------------|----------|-----|
| Path Traversal | `GET /api/files/download` | CWE-22 |
| Arbitrary File Read | `GET /api/files/read` | CWE-22 |
| Command Injection | `POST /api/files/process` | CWE-78 |
| OS Command Injection | `POST /api/files/exec` | CWE-78 |
| Code Injection (eval) | `POST /api/files/eval` | CWE-94 |
| SSRF | `POST /api/files/fetch-url` | CWE-918 |
| XXE | `POST /api/files/parse-xml` | CWE-611 |
| YAML Deserialization | `POST /api/files/parse-yaml` | CWE-502 |
| Prototype Pollution | `POST /api/files/merge` | CWE-1321 |
| Template Injection | `POST /api/files/template` | CWE-1336 |

### 📦 Order Endpoints (`/api/orders/`)

| Vulnerability | Endpoint | CWE |
|---------------|----------|-----|
| IDOR | `GET /api/orders/:id` | CWE-639 |
| Mass Assignment | `POST/PUT /api/orders` | CWE-915 |
| Missing Authorization | All order endpoints | CWE-862 |
| Price Manipulation | `POST /api/orders` | CWE-20 |
| Hardcoded Discount Codes | `POST /api/orders/apply-discount` | CWE-798 |
| SQL Injection | `GET /api/orders/user/:userId` | CWE-89 |

### 🛒 Product Endpoints (`/api/products/`)

| Vulnerability | Endpoint | CWE |
|---------------|----------|-----|
| SQL Injection | `GET /api/products/search` | CWE-89 |
| SQL Injection | `GET /api/products/category/:category` | CWE-89 |
| Mass Assignment | `POST/PUT /api/products` | CWE-915 |
| No Pagination | `GET /api/products` | CWE-400 |
| Missing Authentication | All product endpoints | CWE-306 |
| Race Condition | `POST /api/products/:id/update-stock` | CWE-362 |

### 🛠️ Admin Endpoints (`/api/admin/`)

| Vulnerability | Endpoint | CWE |
|---------------|----------|-----|
| Information Exposure | `GET /api/admin/config` | CWE-200 |
| Insecure Deserialization | `POST /api/admin/deserialize` | CWE-502 |
| Template Injection | `POST /api/admin/render-template` | CWE-1336 |
| Command Injection | `GET /api/admin/backup` | CWE-78 |
| Path Traversal | `GET /api/admin/logs` | CWE-22 |
| Code Injection | `POST /api/admin/execute-script` | CWE-94 |
| Information Disclosure | `GET /api/admin/system-info` | CWE-200 |
| OS Command Injection | `POST /api/admin/run-command` | CWE-78 |

### 🔧 Configuration Issues

| Issue | Location | CWE |
|-------|----------|-----|
| Hardcoded Secrets | `.env`, `admin.ts` | CWE-798 |
| Debug Endpoint | `app.ts` (`/debug`) | CWE-489 |
| Weak JWT Secret | `.env` | CWE-321 |
| CORS All Origins | `app.ts` | CWE-942 |
| Stack Trace Exposure | Error handler | CWE-209 |
| Sensitive Data in Logs | Middleware | CWE-532 |

## Workshop Exercises

### Exercise 1: Use Security Review Agent
```
@Security Review Agent Review samples/typescript/src/routes/files.ts for security vulnerabilities
```

### Exercise 2: Use Code Review Agent
```
@Code Review Agent Review samples/typescript/src/routes/users.ts for code quality issues
```

### Exercise 3: Test SQL Injection
```bash
curl -X POST http://localhost:5002/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"admin' OR '1'='1\", \"password\": \"anything\"}"
```

### Exercise 4: Test Code Injection (eval)
```bash
curl -X POST http://localhost:5002/api/files/eval \
  -H "Content-Type: application/json" \
  -d "{\"expression\": \"process.env\"}"
```

### Exercise 5: Test Command Injection
```bash
curl -X POST http://localhost:5002/api/files/exec \
  -H "Content-Type: application/json" \
  -d "{\"cmd\": \"whoami && hostname\"}"
```

### Exercise 6: Test Prototype Pollution
```bash
curl -X POST http://localhost:5002/api/files/merge \
  -H "Content-Type: application/json" \
  -d "{\"target\": {}, \"source\": {\"__proto__\": {\"polluted\": true}}}"
```

### Exercise 7: Test SSRF
```bash
curl -X POST http://localhost:5002/api/files/fetch-url \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"http://localhost:5002/debug\"}"
```

## Pre-seeded Data

The application automatically seeds placeholder test data. In real deployments, use unique, non-production credentials and do not store real payment data.

### Users
| Username | Password | Role | Credit Card |
|----------|----------|------|-------------|
| admin | <redacted> | admin | <redacted> |
| john_doe | <redacted> | user | <redacted> |
| jane_smith | <redacted> | user | <redacted> |

### Products
| Name | Price | Stock |
|------|-------|-------|
| Laptop Pro X1 | $1,299.99 | 50 |
| Wireless Mouse | $29.99 | 200 |
| USB-C Hub | $49.99 | 100 |

## Technology Stack

- **Node.js**: 18+
- **TypeScript**: 5.3
- **Express**: 4.18
- **better-sqlite3**: SQLite database
- **swagger-jsdoc**: API documentation
- **axios**: HTTP client (for SSRF demo)
- **xml2js**: XML parsing (XXE vulnerable)
- **js-yaml**: YAML parsing (deserialization)
- **crypto-js**: Cryptography (weak MD5)

## Common TypeScript/JavaScript Security Issues Demonstrated

1. **SQL Injection** - Always use parameterized queries
2. **eval()** - Never use eval with user input
3. **child_process.exec** - Avoid shell=true with user input
4. **Prototype Pollution** - Validate object keys before merging
5. **Path Traversal** - Always validate and sanitize file paths
6. **SSRF** - Validate and whitelist URLs
7. **Template Injection** - Don't use Function constructor with user input
8. **Insecure Deserialization** - Never deserialize untrusted data
9. **MD5 for Passwords** - Use bcrypt or Argon2 instead
10. **Hardcoded Secrets** - Use environment variables and secret management

## ⚠️ Security Notice

This application is **INTENTIONALLY VULNERABLE** and should:
- ❌ Never be deployed to production
- ❌ Never be exposed to the internet
- ❌ Never contain real credentials
- ✅ Only be used for educational purposes
- ✅ Only be run in isolated environments

## License

Educational use only. Part of GitHub Copilot Custom Agents Workshop.
