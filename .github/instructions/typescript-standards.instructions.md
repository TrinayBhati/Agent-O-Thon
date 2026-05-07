---
applyTo: "src/**/*.ts"
description: "Enforces best coding standards and principles for TypeScript in this project. Guides code-review and security-review agents."
---

# TypeScript Standards Instructions

Use when: reviewing, analyzing, or generating TypeScript code in this project.

This instruction enforces best coding standards and principles for TypeScript, and guides two agents: `code-review` and `security-review`.

## Code Review Agent

The `code-review` agent reviews TypeScript code for adherence to best practices, including:

- Type safety and strict typing
- Code readability and maintainability
- Performance optimizations
- Error handling
- Code structure and organization

### Output Format

The agent must output findings in a markdown file named `code-review.md`, including:

- Code snippets highlighting issues
- Explanations of problems and suggested fixes
- A summary table of severity for all issues found

Example output structure:

```markdown
# Code Review Findings

## Issue 1: Type Safety Violation
**Severity:** High

**Code Snippet:**
```typescript
let data: any = fetchData();
```

**Explanation:** Using `any` type defeats TypeScript's type checking. Use specific types instead.

**Suggestion:** Define proper interfaces or types for the data.

## Summary Table

| Issue | Severity | File | Line |
|-------|----------|------|------|
| Type Safety Violation | High | src/app.ts | 10 |
```

## Security Review Agent

The `security-review` agent reviews TypeScript code for security vulnerabilities, including:

- Input validation and sanitization
- Authentication and authorization checks
- SQL injection prevention
- XSS protection
- Secure coding practices

### Output Format

The agent must output findings in a markdown file named `security-review.md`, including:

- Code snippets highlighting vulnerabilities
- Explanations of security risks and mitigation strategies
- A summary table of severity for all issues found

Example output structure:

```markdown
# Security Review Findings

## Vulnerability 1: Potential XSS
**Severity:** Critical

**Code Snippet:**
```typescript
document.innerHTML = userInput;
```

**Explanation:** Directly inserting user input into DOM can lead to XSS attacks.

**Mitigation:** Use textContent or sanitize the input.

## Summary Table

| Vulnerability | Severity | File | Line |
|---------------|----------|------|------|
| Potential XSS | Critical | src/routes/users.ts | 25 |
```
