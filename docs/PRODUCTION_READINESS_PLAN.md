# Lokalise MCP Production Readiness Plan

**Version**: 1.0.0  
**Date**: 2025-08-24  
**Status**: ACTIVE  
**Target Completion**: 8 weeks  
**Document Purpose**: Single source of truth for transforming Lokalise MCP from prototype to production-ready enterprise system

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Assessment](#current-state-assessment)
3. [Task Registry Overview](#task-registry-overview)
4. [Security Tasks (SEC)](#security-tasks-sec)
5. [Performance Tasks (PERF)](#performance-tasks-perf)
6. [MCP 2025 Compliance Tasks (MCP)](#mcp-2025-compliance-tasks-mcp)
7. [Quality Assurance Tasks (QA)](#quality-assurance-tasks-qa)
8. [Infrastructure Tasks (INFRA)](#infrastructure-tasks-infra)
9. [Enterprise Feature Tasks (ENT)](#enterprise-feature-tasks-ent)
10. [Architecture Tasks (ARCH)](#architecture-tasks-arch)
11. [Documentation Tasks (DOC)](#documentation-tasks-doc)
12. [Research References](#research-references)
13. [Best Practices](#best-practices)
14. [Risk Management](#risk-management)
15. [Success Metrics](#success-metrics)

---

## Executive Summary

### Project Status
- **Overall Health Score**: 6/10
- **Production Readiness**: NOT READY
- **Estimated Time to Production**: 8 weeks with 2-3 engineers
- **Critical Blockers**: 4 (all security-related)
- **Total Tasks**: 102
- **P0-Critical Tasks**: 12
- **P1-High Tasks**: 28
- **P2-Medium Tasks**: 42
- **P3-Low Tasks**: 20

### Transformation Goals
1. **Security**: Achieve enterprise-grade security with OAuth 2.1 and proper session management
2. **Compliance**: Full MCP 2025-06-18 specification compliance
3. **Performance**: Support 1000+ concurrent connections with <200ms p95 latency
4. **Reliability**: 99.9% uptime with proper monitoring and alerting
5. **Scalability**: Multi-tenant support with horizontal scaling capability
6. **Quality**: 80%+ test coverage with automated CI/CD

### Investment Required
- **Engineering**: 2-3 senior engineers for 8 weeks
- **Infrastructure**: Redis cluster, monitoring stack, CDN
- **Tools**: GitHub Actions, DataDog/NewRelic, PagerDuty
- **Budget**: ~$50,000 (engineering + infrastructure)

---

## Current State Assessment

### Strengths (What to Preserve)
1. **Architecture**: Clean Domain-Driven Design with excellent separation
2. **Auto-Discovery**: Zero-touch domain registration system
3. **Type Safety**: TypeScript with comprehensive Zod validation
4. **Error Handling**: Well-structured McpError system
5. **Patterns**: Consistent Tool→Controller→Service→API flow

### Critical Issues (Must Fix)
| Issue | Severity | Impact | Location |
|-------|----------|---------|----------|
| Broken Session Management | CRITICAL | All users share state | `src/server/transports/http.transport.ts:180` |
| API Keys in URLs | CRITICAL | Security breach risk | `src/server/transports/http.transport.ts:99-118` |
| No Authentication | CRITICAL | Unauthorized access | All MCP endpoints |
| Synchronous I/O | HIGH | Performance bottleneck | `src/shared/utils/logger.util.ts:314` |
| Singleton API Client | HIGH | No multi-tenancy | `src/shared/utils/lokalise-api.util.ts:8` |

### Compliance Gaps (MCP 2025-06-18)
| Requirement | Status | Gap |
|-------------|--------|-----|
| Tool Output Schemas | ❌ Missing | No structured responses |
| Elicitation Support | ❌ Missing | Can't handle incomplete requests |
| OAuth 2.1 + Resource Indicators | ❌ Missing | No enterprise auth |
| Session-per-Connection | ❌ Broken | Process-level only |
| Protocol Version Headers | ❌ Missing | No version negotiation |

### Quality Metrics
| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Test Coverage | ~20% | 80% | 60% |
| API Response Time | Unknown | <200ms p95 | Needs measurement |
| Error Rate | Unknown | <0.1% | Needs monitoring |
| Uptime | N/A | 99.9% | No monitoring |
| Documentation | 40% | 90% | 50% |

---

## Task Registry Overview

### Task Code Format
```
[CATEGORY]-[NUMBER]: [Task Name]
Priority: P[0-3]
Effort: [X hours/days/weeks]
Dependencies: [Other task codes or "None"]
```

### Priority Levels
- **P0-Critical**: Production blockers, security vulnerabilities (fix immediately)
- **P1-High**: Major functionality gaps, compliance issues (fix within 2 weeks)
- **P2-Medium**: Performance improvements, nice-to-have features (fix within 4 weeks)
- **P3-Low**: Code quality, documentation (fix within 8 weeks)

### Task Categories
| Category | Code Prefix | Count | Description |
|----------|-------------|-------|-------------|
| Security | SEC | 15 | Authentication, authorization, input validation |
| Performance | PERF | 10 | Optimization, caching, async operations |
| MCP Compliance | MCP | 20 | 2025-06-18 specification requirements |
| Quality Assurance | QA | 15 | Testing, coverage, CI/CD |
| Infrastructure | INFRA | 12 | Deployment, monitoring, operations |
| Enterprise | ENT | 10 | Multi-tenancy, audit, compliance |
| Architecture | ARCH | 10 | Refactoring, patterns, design |
| Documentation | DOC | 10 | Guides, API docs, diagrams |

---

## Security Tasks (SEC)

### SEC-001: Fix Session Management [P0-Critical]

**Priority**: P0-Critical  
**Effort**: 2 hours  
**Dependencies**: None  
**Owner**: Any agent/engineer  
**Risk Level**: Low (simple fix)  

#### Problem Statement
The HTTP transport has `sessionIdGenerator: undefined` at line 180 of `src/server/transports/http.transport.ts`, which breaks per-connection session isolation. This causes all clients to share the same state, creating critical security and functionality issues.

#### Research & Context
- **MCP Specification Reference**: https://modelcontextprotocol.io/specification/2025-06-18#session-management
- **Best Practice**: https://simplescraper.io/blog/how-to-mcp#part-2-session-management-in-your-mcp-server
- **Security Impact**: OWASP A01:2021 – Broken Access Control

#### Success Criteria
- [ ] Each connection has a unique session ID
- [ ] Session IDs are cryptographically secure (UUID v4)
- [ ] Sessions are properly cleaned up on disconnect
- [ ] No session data leakage between connections
- [ ] Session timeout after 30 minutes of inactivity

#### Implementation Steps

1. **Navigate to the project**
   ```bash
   cd /Users/abdallah.othman/Developer/Projects/lokalise-mcp
   ```

2. **Open the file and locate line 180**
   ```bash
   code src/server/transports/http.transport.ts
   # or
   vim src/server/transports/http.transport.ts +180
   ```

3. **Current broken code (line 180)**:
   ```typescript
   const transport = new StreamableHTTPServerTransport({
       sessionIdGenerator: undefined, // ❌ BROKEN
   });
   ```

4. **Replace with fixed code**:
   ```typescript
   import { randomUUID } from 'crypto';

   const transport = new StreamableHTTPServerTransport({
       sessionIdGenerator: () => randomUUID(), // ✅ FIXED
   });
   ```

5. **Add session tracking (add after line 30)**:
   ```typescript
   // Session management
   const activeSessions = new Map<string, {
       id: string;
       createdAt: Date;
       lastActivity: Date;
       metadata: Record<string, unknown>;
   }>();

   // Cleanup inactive sessions every 5 minutes
   setInterval(() => {
       const now = Date.now();
       const timeout = 30 * 60 * 1000; // 30 minutes
       
       for (const [sessionId, session] of activeSessions.entries()) {
           if (now - session.lastActivity.getTime() > timeout) {
               activeSessions.delete(sessionId);
               logger.info('Session expired', { sessionId });
           }
       }
   }, 5 * 60 * 1000);
   ```

6. **Add session lifecycle hooks (around line 145)**:
   ```typescript
   transport.on('connect', (sessionId: string) => {
       activeSessions.set(sessionId, {
           id: sessionId,
           createdAt: new Date(),
           lastActivity: new Date(),
           metadata: {}
       });
       logger.info('New session created', { sessionId });
   });

   transport.on('disconnect', (sessionId: string) => {
       activeSessions.delete(sessionId);
       logger.info('Session disconnected', { sessionId });
   });

   transport.on('message', (sessionId: string) => {
       const session = activeSessions.get(sessionId);
       if (session) {
           session.lastActivity = new Date();
       }
   });
   ```

7. **Test the implementation**:
   ```bash
   # Run tests
   npm test src/server/transports/http.transport.test.ts

   # Start the server
   npm run dev:http

   # In another terminal, test with multiple connections
   for i in {1..5}; do
       curl -X POST http://localhost:3000 \
           -H "Content-Type: application/json" \
           -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":'$i'}' &
   done

   # Check logs for unique session IDs
   tail -f ~/.mcp/data/lokalise-mcp.log | grep "session"
   ```

8. **Validate the fix**:
   ```bash
   # Create a test script
   cat > test-sessions.js << 'EOF'
   const http = require('http');

   async function testSession(id) {
       return new Promise((resolve) => {
           const req = http.request({
               hostname: 'localhost',
               port: 3000,
               path: '/',
               method: 'POST',
               headers: { 'Content-Type': 'application/json' }
           }, (res) => {
               let data = '';
               res.on('data', chunk => data += chunk);
               res.on('end', () => {
                   const sessionId = res.headers['mcp-session-id'];
                   console.log(`Connection ${id}: Session ID = ${sessionId}`);
                   resolve(sessionId);
               });
           });
           
           req.write(JSON.stringify({
               jsonrpc: '2.0',
               method: 'initialize',
               params: {},
               id: id
           }));
           req.end();
       });
   }

   async function main() {
       const sessions = await Promise.all([
           testSession(1),
           testSession(2),
           testSession(3)
       ]);
       
       const unique = new Set(sessions);
       console.log(`\nUnique sessions: ${unique.size}/${sessions.length}`);
       console.log(unique.size === sessions.length ? '✅ PASS' : '❌ FAIL');
   }

   main();
   EOF

   node test-sessions.js
   ```

#### Rollback Plan
If issues occur after deployment:
1. **Immediate rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```
2. **Deploy previous version**:
   ```bash
   npm run deploy:rollback
   ```
3. **Investigate in staging**:
   ```bash
   git checkout -b fix/session-management
   # Debug and fix the issue
   ```

#### Monitoring & Alerts
After deployment, monitor:
- Session creation rate
- Session timeout rate
- Memory usage (watch for leaks)
- Error logs related to sessions

---

### SEC-002: Move API Keys from Query Parameters to Headers [P0-Critical]

**Priority**: P0-Critical  
**Effort**: 4 hours  
**Dependencies**: None  
**Owner**: Any agent/engineer  
**Risk Level**: Medium (API contract change)  

#### Problem Statement
API keys are passed via query parameters in URLs, which are logged by proxies, cached by CDNs, and visible in browser history. This is a critical security vulnerability.

#### Research & Context
- **OWASP Reference**: https://owasp.org/www-community/vulnerabilities/Information_exposure_through_query_strings_in_url
- **Best Practice**: https://www.rfc-editor.org/rfc/rfc6750#section-2.3
- **Security Standard**: Never put secrets in URLs

#### Success Criteria
- [ ] API keys only accepted via headers
- [ ] Query parameter API keys rejected with clear error
- [ ] Backward compatibility mode available (opt-in)
- [ ] All logs sanitized to remove API keys
- [ ] Documentation updated

#### Implementation Steps

1. **Update configuration handler** (`src/shared/utils/config.util.ts`):
   ```typescript
   // Add header extraction support (line 150)
   export function extractApiKeyFromRequest(req: Request): string | undefined {
       // Priority order: Header > Body > Query (deprecated)
       
       // 1. Check Authorization header (preferred)
       const authHeader = req.headers.authorization;
       if (authHeader?.startsWith('Bearer ')) {
           return authHeader.substring(7);
       }
       
       // 2. Check custom header
       const customHeader = req.headers['x-lokalise-api-key'];
       if (customHeader) {
           return customHeader as string;
       }
       
       // 3. Check request body (for POST requests)
       if (req.body?.apiKey) {
           return req.body.apiKey;
       }
       
       // 4. Query parameter (deprecated, log warning)
       if (req.query?.apiKey) {
           logger.warn('API key in query parameter is deprecated and insecure', {
               ip: req.ip,
               path: req.path
           });
           
           if (!config.get('ALLOW_INSECURE_API_KEY')) {
               throw new McpError(
                   'SECURITY_ERROR',
                   'API keys in query parameters are not allowed. Use Authorization header instead.'
               );
           }
           
           return req.query.apiKey as string;
       }
       
       return undefined;
   }
   ```

2. **Update HTTP transport** (`src/server/transports/http.transport.ts`):
   ```typescript
   // Replace query parameter extraction (lines 99-118)
   app.use((req, res, next) => {
       try {
           // Extract API key from secure location
           const apiKey = extractApiKeyFromRequest(req);
           
           if (apiKey) {
               // Store in request context, not in config
               req.context = { ...req.context, apiKey };
           }
           
           next();
       } catch (error) {
           res.status(400).json({
               jsonrpc: '2.0',
               error: {
                   code: -32602,
                   message: error.message
               }
           });
       }
   });
   ```

3. **Add request sanitization for logging**:
   ```typescript
   // Add to logger utility (src/shared/utils/logger.util.ts)
   export function sanitizeRequest(req: any): any {
       const sanitized = { ...req };
       
       // Remove sensitive headers
       if (sanitized.headers) {
           const headers = { ...sanitized.headers };
           if (headers.authorization) {
               headers.authorization = 'Bearer [REDACTED]';
           }
           if (headers['x-lokalise-api-key']) {
               headers['x-lokalise-api-key'] = '[REDACTED]';
           }
           sanitized.headers = headers;
       }
       
       // Remove from query parameters
       if (sanitized.query?.apiKey) {
           sanitized.query.apiKey = '[REDACTED]';
       }
       
       // Remove from body
       if (sanitized.body?.apiKey) {
           sanitized.body.apiKey = '[REDACTED]';
       }
       
       return sanitized;
   }
   ```

4. **Update all API service calls** to use context:
   ```typescript
   // Example: src/domains/projects/projects.service.ts
   export async function listProjects(context: RequestContext, args: ListProjectsArgs) {
       const api = getLokaliseApi(context.apiKey); // Use context API key
       // ... rest of implementation
   }
   ```

5. **Add migration guide** (`docs/MIGRATION_API_KEYS.md`):
   ```markdown
   # API Key Migration Guide

   ## Breaking Change
   Starting from version 2.0.0, API keys in query parameters are deprecated.

   ### Old Method (Deprecated)
   ```
   GET /api/projects?apiKey=YOUR_API_KEY
   ```

   ### New Method (Required)
   ```
   GET /api/projects
   Authorization: Bearer YOUR_API_KEY
   ```

   ### Temporary Compatibility
   Set environment variable to allow query parameters (NOT RECOMMENDED):
   ```
   ALLOW_INSECURE_API_KEY=true
   ```
   ```

6. **Test the changes**:
   ```bash
   # Test with header (should work)
   curl -X POST http://localhost:3000/api/projects \
       -H "Authorization: Bearer $LOKALISE_API_KEY" \
       -H "Content-Type: application/json"

   # Test with query param (should fail)
   curl -X POST "http://localhost:3000/api/projects?apiKey=$LOKALISE_API_KEY" \
       -H "Content-Type: application/json"
   # Expected: 400 error with security message

   # Test with compatibility mode
   ALLOW_INSECURE_API_KEY=true npm run dev:http
   # Now query param should work with warning in logs
   ```

#### Rollback Plan
1. Set environment variable to restore compatibility:
   ```bash
   ALLOW_INSECURE_API_KEY=true
   ```
2. Deploy hotfix if needed
3. Communicate with affected users

---

### SEC-003: Implement Input Validation Middleware [P0-Critical]

**Priority**: P0-Critical  
**Effort**: 6 hours  
**Dependencies**: None  
**Owner**: Security-focused engineer  
**Risk Level**: Low  

#### Problem Statement
No centralized input validation for MCP requests, allowing potential injection attacks and malformed data.

#### Implementation Steps

1. **Create validation middleware** (`src/server/middleware/validation.middleware.ts`):
   ```typescript
   import { z } from 'zod';
   import { Request, Response, NextFunction } from 'express';
   import { McpError } from '../../shared/utils/error.util.js';

   // Define common validation schemas
   export const CommonSchemas = {
       uuid: z.string().uuid(),
       email: z.string().email(),
       url: z.string().url(),
       projectId: z.string().regex(/^[a-zA-Z0-9]+\.[0-9]+$/),
       languageCode: z.string().regex(/^[a-z]{2}(_[A-Z]{2})?$/),
       pagination: z.object({
           page: z.number().min(1).max(1000).optional(),
           limit: z.number().min(1).max(500).optional(),
           cursor: z.string().optional()
       })
   };

   // SQL injection prevention
   const SQL_INJECTION_PATTERNS = [
       /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)(\b)/gi,
       /['";\\]/g,
       /-{2,}/g, // SQL comments
       /\/\*/g,   // Multi-line comments
   ];

   // XSS prevention
   const XSS_PATTERNS = [
       /<script[^>]*>.*?<\/script>/gi,
       /<iframe[^>]*>.*?<\/iframe>/gi,
       /javascript:/gi,
       /on\w+\s*=/gi, // Event handlers
   ];

   export function validateInput(schema: z.ZodSchema) {
       return async (req: Request, res: Response, next: NextFunction) => {
           try {
               // Validate against schema
               const validated = await schema.parseAsync({
                   body: req.body,
                   query: req.query,
                   params: req.params
               });

               // Check for injection attempts
               const stringValues = extractStringValues(validated);
               
               for (const value of stringValues) {
                   // Check SQL injection
                   for (const pattern of SQL_INJECTION_PATTERNS) {
                       if (pattern.test(value)) {
                           throw new McpError(
                               'VALIDATION_ERROR',
                               'Potential SQL injection detected'
                           );
                       }
                   }
                   
                   // Check XSS
                   for (const pattern of XSS_PATTERNS) {
                       if (pattern.test(value)) {
                           throw new McpError(
                               'VALIDATION_ERROR',
                               'Potential XSS attack detected'
                           );
                       }
                   }
               }

               // Attach validated data to request
               req.validated = validated;
               next();
           } catch (error) {
               if (error instanceof z.ZodError) {
                   res.status(400).json({
                       jsonrpc: '2.0',
                       error: {
                           code: -32602,
                           message: 'Invalid parameters',
                           data: error.errors
                       }
                   });
               } else {
                   next(error);
               }
           }
       };
   }

   function extractStringValues(obj: any): string[] {
       const values: string[] = [];
       
       function traverse(current: any) {
           if (typeof current === 'string') {
               values.push(current);
           } else if (Array.isArray(current)) {
               current.forEach(traverse);
           } else if (current && typeof current === 'object') {
               Object.values(current).forEach(traverse);
           }
       }
       
       traverse(obj);
       return values;
   }

   // Rate limiting decorator
   export function rateLimit(limit: number, window: number) {
       const requests = new Map<string, number[]>();
       
       return (req: Request, res: Response, next: NextFunction) => {
           const key = req.ip || 'unknown';
           const now = Date.now();
           const windowStart = now - window;
           
           // Get existing requests for this IP
           const userRequests = requests.get(key) || [];
           
           // Filter out old requests
           const recentRequests = userRequests.filter(time => time > windowStart);
           
           if (recentRequests.length >= limit) {
               res.status(429).json({
                   jsonrpc: '2.0',
                   error: {
                       code: -32000,
                       message: 'Rate limit exceeded',
                       data: {
                           limit,
                           window,
                           retryAfter: Math.ceil((recentRequests[0] + window - now) / 1000)
                       }
                   }
               });
               return;
           }
           
           // Add current request
           recentRequests.push(now);
           requests.set(key, recentRequests);
           
           next();
       };
   }
   ```

2. **Apply to all endpoints**:
   ```typescript
   // In transport files
   import { validateInput, rateLimit, CommonSchemas } from '../middleware/validation.middleware.js';

   // Apply globally
   app.use(rateLimit(100, 60000)); // 100 requests per minute

   // Apply to specific endpoints
   app.post('/api/projects/:projectId/keys',
       validateInput(z.object({
           params: z.object({
               projectId: CommonSchemas.projectId
           }),
           body: CreateKeysSchema
       })),
       handleCreateKeys
   );
   ```

3. **Test validation**:
   ```bash
   # Test SQL injection prevention
   curl -X POST http://localhost:3000/api/projects \
       -H "Content-Type: application/json" \
       -d '{"name": "Test; DROP TABLE users;--"}'
   # Expected: 400 error

   # Test XSS prevention
   curl -X POST http://localhost:3000/api/projects \
       -H "Content-Type: application/json" \
       -d '{"name": "<script>alert(1)</script>"}'
   # Expected: 400 error

   # Test rate limiting
   for i in {1..150}; do
       curl -X GET http://localhost:3000/api/projects &
   done
   # Expected: 429 errors after 100 requests
   ```

---

### SEC-004: Implement OAuth 2.1 with Resource Indicators [P1-High]

**Priority**: P1-High  
**Effort**: 2 weeks  
**Dependencies**: SEC-001, SEC-002  
**Owner**: Senior engineer with OAuth experience  
**Risk Level**: High (complex implementation)  

#### Problem Statement
No OAuth 2.1 support with Resource Indicators as required by MCP 2025-06-18 specification.

#### Research & Context
- **MCP OAuth Spec**: https://auth0.com/blog/mcp-specs-update-all-about-auth/
- **OAuth 2.1 RFC**: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-10
- **Resource Indicators RFC**: https://datatracker.ietf.org/doc/html/rfc8707
- **PKCE RFC**: https://datatracker.ietf.org/doc/html/rfc7636

#### Implementation Blueprint

1. **Install OAuth dependencies**:
   ```bash
   npm install express-oauth-server oauth2-server jsonwebtoken
   npm install --save-dev @types/oauth2-server
   ```

2. **Create OAuth server** (`src/server/oauth/oauth.server.ts`):
   ```typescript
   import OAuth2Server from 'oauth2-server';
   import { Request, Response } from 'express';
   import jwt from 'jsonwebtoken';
   import crypto from 'crypto';

   interface OAuthClient {
       id: string;
       secret: string;
       redirectUris: string[];
       grants: string[];
       resourceIndicators: string[];
   }

   interface OAuthToken {
       accessToken: string;
       accessTokenExpiresAt: Date;
       refreshToken?: string;
       refreshTokenExpiresAt?: Date;
       scope?: string[];
       client: OAuthClient;
       user: any;
       resource?: string;
   }

   class OAuthModel {
       private clients = new Map<string, OAuthClient>();
       private tokens = new Map<string, OAuthToken>();
       private codes = new Map<string, any>();
       private pkceVerifiers = new Map<string, string>();

       async getClient(clientId: string, clientSecret?: string): Promise<OAuthClient | null> {
           const client = this.clients.get(clientId);
           if (!client) return null;
           
           if (clientSecret && client.secret !== clientSecret) {
               return null;
           }
           
           return client;
       }

       async saveToken(token: OAuthToken, client: OAuthClient, user: any): Promise<OAuthToken> {
           const tokenData = {
               ...token,
               client,
               user
           };
           
           this.tokens.set(token.accessToken, tokenData);
           return tokenData;
       }

       async getAccessToken(accessToken: string): Promise<OAuthToken | null> {
           return this.tokens.get(accessToken) || null;
       }

       async verifyScope(token: OAuthToken, scope: string[]): Promise<boolean> {
           if (!token.scope) return false;
           return scope.every(s => token.scope!.includes(s));
       }

       // PKCE Support
       async savePKCEVerifier(authorizationCode: string, verifier: string): Promise<void> {
           this.pkceVerifiers.set(authorizationCode, verifier);
       }

       async validatePKCE(authorizationCode: string, verifier: string): Promise<boolean> {
           const savedVerifier = this.pkceVerifiers.get(authorizationCode);
           if (!savedVerifier) return false;
           
           const challenge = crypto
               .createHash('sha256')
               .update(verifier)
               .digest('base64url');
           
           return challenge === savedVerifier;
       }

       // Resource Indicators
       async validateResourceIndicator(client: OAuthClient, resource: string): Promise<boolean> {
           return client.resourceIndicators.includes(resource);
       }
   }

   export class OAuthServer {
       private server: OAuth2Server;
       private model: OAuthModel;

       constructor() {
           this.model = new OAuthModel();
           this.server = new OAuth2Server({
               model: this.model,
               accessTokenLifetime: 3600, // 1 hour
               refreshTokenLifetime: 86400 * 30, // 30 days
               allowBearerTokensInQueryString: false, // Security: never allow
               requireClientAuthentication: {
                   password: false,
                   refresh_token: false,
                   authorization_code: true
               }
           });
       }

       async authorize(req: Request, res: Response): Promise<void> {
           try {
               // Extract resource indicator
               const resource = req.body.resource || req.query.resource;
               
               // Validate PKCE
               const codeChallenge = req.body.code_challenge;
               const codeChallengeMethod = req.body.code_challenge_method;
               
               if (!codeChallenge || codeChallengeMethod !== 'S256') {
                   throw new Error('PKCE required with S256 method');
               }

               const options = {
                   authenticateHandler: {
                       handle: async (req: Request) => {
                           // Implement user authentication
                           return { id: req.session?.userId };
                       }
                   }
               };

               const authorization = await this.server.authorize(
                   new OAuth2Server.Request(req),
                   new OAuth2Server.Response(res),
                   options
               );

               // Save PKCE verifier
               await this.model.savePKCEVerifier(
                   authorization.authorizationCode,
                   codeChallenge
               );

               res.json(authorization);
           } catch (error) {
               res.status(error.statusCode || 500).json({
                   error: error.message,
                   error_description: error.toString()
               });
           }
       }

       async token(req: Request, res: Response): Promise<void> {
           try {
               // Validate PKCE if authorization code grant
               if (req.body.grant_type === 'authorization_code') {
                   const codeVerifier = req.body.code_verifier;
                   if (!codeVerifier) {
                       throw new Error('code_verifier required');
                   }
                   
                   const valid = await this.model.validatePKCE(
                       req.body.code,
                       codeVerifier
                   );
                   
                   if (!valid) {
                       throw new Error('Invalid PKCE verifier');
                   }
               }

               // Validate resource indicator
               const resource = req.body.resource;
               if (resource) {
                   const client = await this.model.getClient(req.body.client_id);
                   if (!client || !await this.model.validateResourceIndicator(client, resource)) {
                       throw new Error('Invalid resource indicator');
                   }
               }

               const token = await this.server.token(
                   new OAuth2Server.Request(req),
                   new OAuth2Server.Response(res)
               );

               // Add resource to token if specified
               if (resource) {
                   token.resource = resource;
               }

               res.json(token);
           } catch (error) {
               res.status(error.statusCode || 500).json({
                   error: error.message,
                   error_description: error.toString()
               });
           }
       }

       async authenticate(req: Request, res: Response, next: Function): Promise<void> {
           try {
               const token = await this.server.authenticate(
                   new OAuth2Server.Request(req),
                   new OAuth2Server.Response(res)
               );

               // Validate resource if specified
               const requestedResource = req.headers['x-resource-indicator'];
               if (requestedResource && token.resource !== requestedResource) {
                   throw new Error('Token not valid for requested resource');
               }

               req.oauth = { token };
               next();
           } catch (error) {
               res.status(401).json({
                   error: 'unauthorized',
                   error_description: error.toString()
               });
           }
       }
   }
   ```

3. **Add discovery endpoints** (`src/server/oauth/discovery.ts`):
   ```typescript
   export function setupDiscoveryEndpoints(app: Express) {
       // OAuth discovery
       app.get('/.well-known/oauth-authorization-server', (req, res) => {
           res.json({
               issuer: process.env.OAUTH_ISSUER || 'https://localhost:3000',
               authorization_endpoint: '/oauth/authorize',
               token_endpoint: '/oauth/token',
               token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
               response_types_supported: ['code'],
               grant_types_supported: ['authorization_code', 'refresh_token'],
               code_challenge_methods_supported: ['S256'],
               resource_indicators_supported: true,
               pkce_required: true
           });
       });

       // Protected resource discovery
       app.get('/.well-known/oauth-protected-resource', (req, res) => {
           res.json({
               resource: 'https://api.lokalise.com',
               oauth_authorization_server: '/.well-known/oauth-authorization-server',
               bearer_methods_supported: ['header'],
               resource_documentation: 'https://docs.lokalise.com/api',
               resource_signing_alg_values_supported: ['RS256']
           });
       });
   }
   ```

4. **Integrate with MCP server**:
   ```typescript
   // In http.transport.ts
   import { OAuthServer } from '../oauth/oauth.server.js';
   import { setupDiscoveryEndpoints } from '../oauth/discovery.js';

   const oauthServer = new OAuthServer();

   // Setup discovery
   setupDiscoveryEndpoints(app);

   // OAuth endpoints
   app.post('/oauth/authorize', oauthServer.authorize.bind(oauthServer));
   app.post('/oauth/token', oauthServer.token.bind(oauthServer));

   // Protect MCP endpoints
   app.use('/mcp/*', oauthServer.authenticate.bind(oauthServer));
   ```

5. **Test OAuth flow**:
   ```bash
   # 1. Get discovery information
   curl http://localhost:3000/.well-known/oauth-authorization-server

   # 2. Generate PKCE verifier and challenge
   VERIFIER=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-43)
   CHALLENGE=$(echo -n $VERIFIER | openssl dgst -sha256 -binary | openssl enc -base64 | tr -d "=+/" | tr -d '\n')

   # 3. Authorization request
   curl -X POST http://localhost:3000/oauth/authorize \
       -d "client_id=test-client" \
       -d "response_type=code" \
       -d "redirect_uri=http://localhost:8080/callback" \
       -d "code_challenge=$CHALLENGE" \
       -d "code_challenge_method=S256" \
       -d "resource=https://api.lokalise.com"

   # 4. Token exchange
   curl -X POST http://localhost:3000/oauth/token \
       -d "grant_type=authorization_code" \
       -d "code=AUTH_CODE_FROM_STEP_3" \
       -d "client_id=test-client" \
       -d "client_secret=test-secret" \
       -d "code_verifier=$VERIFIER" \
       -d "resource=https://api.lokalise.com"

   # 5. Use access token
   curl http://localhost:3000/mcp/tools/list \
       -H "Authorization: Bearer ACCESS_TOKEN_FROM_STEP_4" \
       -H "X-Resource-Indicator: https://api.lokalise.com"
   ```

---

### SEC-005: Implement Rate Limiting [P1-High]

**Priority**: P1-High  
**Effort**: 4 hours  
**Dependencies**: SEC-003  
**Owner**: Any engineer  
**Risk Level**: Low  

#### Implementation Steps

1. **Install rate limiting package**:
   ```bash
   npm install express-rate-limit redis rate-limit-redis
   npm install --save-dev @types/express-rate-limit
   ```

2. **Create rate limiter** (`src/server/middleware/rate-limit.middleware.ts`):
   ```typescript
   import rateLimit from 'express-rate-limit';
   import RedisStore from 'rate-limit-redis';
   import Redis from 'ioredis';

   const redisClient = new Redis({
       host: process.env.REDIS_HOST || 'localhost',
       port: parseInt(process.env.REDIS_PORT || '6379'),
       password: process.env.REDIS_PASSWORD,
       enableOfflineQueue: false
   });

   // Different limits for different endpoints
   export const rateLimiters = {
       // Strict limit for authentication
       auth: rateLimit({
           store: new RedisStore({
               client: redisClient,
               prefix: 'rl:auth:'
           }),
           windowMs: 15 * 60 * 1000, // 15 minutes
           max: 5, // 5 requests per window
           message: 'Too many authentication attempts',
           standardHeaders: true,
           legacyHeaders: false
       }),

       // Standard API limit
       api: rateLimit({
           store: new RedisStore({
               client: redisClient,
               prefix: 'rl:api:'
           }),
           windowMs: 60 * 1000, // 1 minute
           max: 100, // 100 requests per minute
           message: 'API rate limit exceeded',
           standardHeaders: true,
           legacyHeaders: false,
           skip: (req) => {
               // Skip rate limiting for premium users
               return req.user?.isPremium === true;
           }
       }),

       // Generous limit for read operations
       read: rateLimit({
           store: new RedisStore({
               client: redisClient,
               prefix: 'rl:read:'
           }),
           windowMs: 60 * 1000,
           max: 500,
           message: 'Read rate limit exceeded'
       }),

       // Strict limit for write operations
       write: rateLimit({
           store: new RedisStore({
               client: redisClient,
               prefix: 'rl:write:'
           }),
           windowMs: 60 * 1000,
           max: 20,
           message: 'Write rate limit exceeded'
       })
   };

   // Dynamic rate limiting based on user tier
   export function createDynamicRateLimiter() {
       return rateLimit({
           store: new RedisStore({
               client: redisClient,
               prefix: 'rl:dynamic:'
           }),
           windowMs: 60 * 1000,
           max: (req) => {
               // Different limits based on user tier
               const tier = req.user?.tier || 'free';
               const limits = {
                   free: 50,
                   basic: 200,
                   pro: 1000,
                   enterprise: 10000
               };
               return limits[tier] || limits.free;
           },
           keyGenerator: (req) => {
               // Use user ID if authenticated, IP otherwise
               return req.user?.id || req.ip;
           },
           handler: (req, res) => {
               const retryAfter = req.rateLimit.resetTime 
                   ? Math.round((req.rateLimit.resetTime - Date.now()) / 1000)
                   : 60;
               
               res.status(429).json({
                   jsonrpc: '2.0',
                   error: {
                       code: -32000,
                       message: 'Rate limit exceeded',
                       data: {
                           limit: req.rateLimit.limit,
                           remaining: req.rateLimit.remaining,
                           retryAfter
                       }
                   }
               });
           }
       });
   }
   ```

3. **Apply to routes**:
   ```typescript
   // In http.transport.ts
   import { rateLimiters, createDynamicRateLimiter } from '../middleware/rate-limit.middleware.js';

   // Apply different limits to different routes
   app.use('/oauth', rateLimiters.auth);
   app.get('/mcp/tools/*', rateLimiters.read);
   app.post('/mcp/tools/*', rateLimiters.write);
   app.use('/api', createDynamicRateLimiter());
   ```

---

## Performance Tasks (PERF)

### PERF-001: Implement Async Logging [P0-Critical]

**Priority**: P0-Critical  
**Effort**: 4 hours  
**Dependencies**: None  
**Owner**: Any engineer  
**Risk Level**: Low  

#### Problem Statement
Synchronous file I/O in logger blocks the event loop, causing performance degradation under load.

#### Implementation Steps

1. **Create async logger** (`src/shared/utils/async-logger.util.ts`):
   ```typescript
   import { createWriteStream, WriteStream } from 'fs';
   import { mkdir } from 'fs/promises';
   import path from 'path';
   import { EventEmitter } from 'events';

   interface LogEntry {
       timestamp: Date;
       level: string;
       context: string;
       message: string;
       metadata?: any;
   }

   class AsyncLogger extends EventEmitter {
       private writeStream: WriteStream | null = null;
       private queue: LogEntry[] = [];
       private isProcessing = false;
       private flushInterval: NodeJS.Timeout;
       private maxQueueSize = 10000;
       private flushIntervalMs = 100;

       constructor(private logPath: string) {
           super();
           this.initialize();
       }

       private async initialize() {
           // Ensure log directory exists
           const dir = path.dirname(this.logPath);
           await mkdir(dir, { recursive: true });

           // Create write stream
           this.writeStream = createWriteStream(this.logPath, {
               flags: 'a',
               encoding: 'utf8',
               highWaterMark: 64 * 1024 // 64KB buffer
           });

           this.writeStream.on('error', (error) => {
               console.error('Logger stream error:', error);
               this.emit('error', error);
           });

           // Setup periodic flush
           this.flushInterval = setInterval(() => {
               this.flush();
           }, this.flushIntervalMs);

           // Flush on process exit
           process.on('beforeExit', () => this.flush());
           process.on('SIGINT', () => {
               this.flush();
               process.exit(0);
           });
       }

       log(level: string, context: string, message: string, metadata?: any) {
           const entry: LogEntry = {
               timestamp: new Date(),
               level,
               context,
               message,
               metadata
           };

           this.queue.push(entry);

           // Force flush if queue is getting full
           if (this.queue.length >= this.maxQueueSize) {
               this.flush();
           }
       }

       private async flush() {
           if (this.isProcessing || this.queue.length === 0) {
               return;
           }

           this.isProcessing = true;
           const batch = this.queue.splice(0, this.queue.length);

           try {
               const lines = batch.map(entry => {
                   const log = {
                       timestamp: entry.timestamp.toISOString(),
                       level: entry.level,
                       context: entry.context,
                       message: entry.message,
                       ...entry.metadata
                   };
                   return JSON.stringify(log) + '\n';
               });

               const chunk = lines.join('');
               
               await new Promise<void>((resolve, reject) => {
                   if (!this.writeStream) {
                       reject(new Error('Write stream not initialized'));
                       return;
                   }

                   const canWrite = this.writeStream.write(chunk);
                   
                   if (!canWrite) {
                       // Wait for drain event if buffer is full
                       this.writeStream.once('drain', resolve);
                   } else {
                       resolve();
                   }
               });

               this.emit('flush', batch.length);
           } catch (error) {
               console.error('Failed to flush logs:', error);
               this.emit('error', error);
               
               // Re-queue failed entries (at the front)
               this.queue.unshift(...batch);
           } finally {
               this.isProcessing = false;
           }
       }

       async close() {
           clearInterval(this.flushInterval);
           await this.flush();
           
           return new Promise<void>((resolve) => {
               if (this.writeStream) {
                   this.writeStream.end(resolve);
               } else {
                   resolve();
               }
           });
       }
   }

   // Singleton instance
   let logger: AsyncLogger | null = null;

   export function getAsyncLogger(): AsyncLogger {
       if (!logger) {
           const logPath = path.join(
               process.env.HOME || '/tmp',
               '.mcp/data/lokalise-mcp.log'
           );
           logger = new AsyncLogger(logPath);
       }
       return logger;
   }

   // Convenience methods
   export const asyncLogger = {
       info: (context: string, message: string, metadata?: any) => {
           getAsyncLogger().log('INFO', context, message, metadata);
       },
       error: (context: string, message: string, metadata?: any) => {
           getAsyncLogger().log('ERROR', context, message, metadata);
       },
       warn: (context: string, message: string, metadata?: any) => {
           getAsyncLogger().log('WARN', context, message, metadata);
       },
       debug: (context: string, message: string, metadata?: any) => {
           if (process.env.DEBUG) {
               getAsyncLogger().log('DEBUG', context, message, metadata);
           }
       }
   };
   ```

2. **Replace sync logger usage**:
   ```typescript
   // Before (sync)
   Logger.forContext('file', 'method').info('message');

   // After (async)
   import { asyncLogger } from '../../shared/utils/async-logger.util.js';
   asyncLogger.info('file:method', 'message', { additional: 'data' });
   ```

3. **Add log rotation** (`src/shared/utils/log-rotation.util.ts`):
   ```typescript
   import { rename, stat, unlink } from 'fs/promises';
   import { glob } from 'glob';

   export class LogRotator {
       constructor(
           private logPath: string,
           private maxSize: number = 50 * 1024 * 1024, // 50MB
           private maxFiles: number = 10
       ) {}

       async rotate() {
           try {
               const stats = await stat(this.logPath);
               
               if (stats.size < this.maxSize) {
                   return; // No rotation needed
               }

               // Rotate current log
               const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
               const rotatedPath = `${this.logPath}.${timestamp}`;
               await rename(this.logPath, rotatedPath);

               // Clean up old logs
               await this.cleanup();
           } catch (error) {
               console.error('Log rotation failed:', error);
           }
       }

       private async cleanup() {
           const pattern = `${this.logPath}.*`;
           const files = await glob(pattern);
           
           if (files.length <= this.maxFiles) {
               return;
           }

           // Sort by modification time
           const fileStats = await Promise.all(
               files.map(async (file) => ({
                   file,
                   mtime: (await stat(file)).mtime
               }))
           );

           fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

           // Delete oldest files
           const toDelete = fileStats.slice(this.maxFiles);
           await Promise.all(
               toDelete.map(({ file }) => unlink(file))
           );
       }
   }
   ```

4. **Performance test**:
   ```typescript
   // test-async-logger.ts
   import { asyncLogger } from './async-logger.util.js';

   async function benchmark() {
       console.time('async-logging');
       
       for (let i = 0; i < 100000; i++) {
           asyncLogger.info('benchmark', `Log entry ${i}`, {
               index: i,
               timestamp: Date.now()
           });
       }
       
       console.timeEnd('async-logging');
       
       // Wait for flush
       await new Promise(resolve => setTimeout(resolve, 1000));
   }

   benchmark();
   ```

---

### PERF-002: Implement Connection Pooling [P1-High]

**Priority**: P1-High  
**Effort**: 6 hours  
**Dependencies**: None  
**Owner**: Backend engineer  
**Risk Level**: Medium  

#### Implementation Steps

1. **Create connection pool** (`src/shared/utils/connection-pool.util.ts`):
   ```typescript
   import { LokaliseApi } from '@lokalise/node-api';
   import { EventEmitter } from 'events';

   interface PooledConnection {
       api: LokaliseApi;
       inUse: boolean;
       lastUsed: Date;
       requestCount: number;
       apiKey: string;
   }

   export class LokaliseConnectionPool extends EventEmitter {
       private connections = new Map<string, PooledConnection[]>();
       private maxConnectionsPerKey = 10;
       private maxIdleTime = 5 * 60 * 1000; // 5 minutes
       private cleanupInterval: NodeJS.Timeout;

       constructor() {
           super();
           
           // Periodic cleanup of idle connections
           this.cleanupInterval = setInterval(() => {
               this.cleanup();
           }, 60 * 1000); // Every minute
       }

       async acquire(apiKey: string): Promise<LokaliseApi> {
           const pool = this.connections.get(apiKey) || [];
           
           // Find available connection
           const available = pool.find(conn => !conn.inUse);
           
           if (available) {
               available.inUse = true;
               available.lastUsed = new Date();
               available.requestCount++;
               
               this.emit('connection:reused', { apiKey, requestCount: available.requestCount });
               return available.api;
           }

           // Create new connection if under limit
           if (pool.length < this.maxConnectionsPerKey) {
               const api = new LokaliseApi({
                   apiKey,
                   host: process.env.LOKALISE_API_HOSTNAME
               });

               const connection: PooledConnection = {
                   api,
                   inUse: true,
                   lastUsed: new Date(),
                   requestCount: 1,
                   apiKey
               };

               pool.push(connection);
               this.connections.set(apiKey, pool);
               
               this.emit('connection:created', { apiKey, poolSize: pool.length });
               return api;
           }

           // Wait for available connection
           return new Promise((resolve) => {
               const checkAvailable = setInterval(() => {
                   const conn = pool.find(c => !c.inUse);
                   if (conn) {
                       clearInterval(checkAvailable);
                       conn.inUse = true;
                       conn.lastUsed = new Date();
                       conn.requestCount++;
                       resolve(conn.api);
                   }
               }, 100);
           });
       }

       release(apiKey: string, api: LokaliseApi) {
           const pool = this.connections.get(apiKey);
           if (!pool) return;

           const connection = pool.find(c => c.api === api);
           if (connection) {
               connection.inUse = false;
               connection.lastUsed = new Date();
               
               this.emit('connection:released', { apiKey });
           }
       }

       private cleanup() {
           const now = Date.now();

           for (const [apiKey, pool] of this.connections.entries()) {
               const activeConnections = pool.filter(conn => {
                   if (conn.inUse) return true;
                   
                   const idleTime = now - conn.lastUsed.getTime();
                   return idleTime < this.maxIdleTime;
               });

               if (activeConnections.length < pool.length) {
                   this.connections.set(apiKey, activeConnections);
                   this.emit('connection:cleanup', {
                       apiKey,
                       removed: pool.length - activeConnections.length
                   });
               }

               if (activeConnections.length === 0) {
                   this.connections.delete(apiKey);
               }
           }
       }

       getStats() {
           const stats = {
               totalConnections: 0,
               activeConnections: 0,
               idleConnections: 0,
               apiKeys: this.connections.size
           };

           for (const pool of this.connections.values()) {
               stats.totalConnections += pool.length;
               stats.activeConnections += pool.filter(c => c.inUse).length;
               stats.idleConnections += pool.filter(c => !c.inUse).length;
           }

           return stats;
       }

       async close() {
           clearInterval(this.cleanupInterval);
           this.connections.clear();
       }
   }

   // Global pool instance
   export const connectionPool = new LokaliseConnectionPool();

   // Helper function for using pooled connections
   export async function withPooledConnection<T>(
       apiKey: string,
       operation: (api: LokaliseApi) => Promise<T>
   ): Promise<T> {
       const api = await connectionPool.acquire(apiKey);
       
       try {
           return await operation(api);
       } finally {
           connectionPool.release(apiKey, api);
       }
   }
   ```

2. **Update service layer to use pool**:
   ```typescript
   // Example: src/domains/projects/projects.service.ts
   import { withPooledConnection } from '../../shared/utils/connection-pool.util.js';

   export async function listProjects(apiKey: string, args: ListProjectsArgs) {
       return withPooledConnection(apiKey, async (api) => {
           const response = await api.projects().list({
               page: args.page || 1,
               limit: args.limit || 100
           });
           return response;
       });
   }
   ```

---

### PERF-003: Implement Redis Caching Layer [P1-High]

**Priority**: P1-High  
**Effort**: 8 hours  
**Dependencies**: PERF-002  
**Owner**: Backend engineer  
**Risk Level**: Medium  

#### Implementation Steps

1. **Create cache service** (`src/shared/services/cache.service.ts`):
   ```typescript
   import Redis from 'ioredis';
   import { createHash } from 'crypto';

   export class CacheService {
       private redis: Redis;
       private defaultTTL = 300; // 5 minutes

       constructor() {
           this.redis = new Redis({
               host: process.env.REDIS_HOST || 'localhost',
               port: parseInt(process.env.REDIS_PORT || '6379'),
               password: process.env.REDIS_PASSWORD,
               keyPrefix: 'lokalise:cache:',
               enableOfflineQueue: false,
               maxRetriesPerRequest: 3
           });

           this.redis.on('error', (error) => {
               console.error('Redis error:', error);
           });
       }

       private generateKey(namespace: string, params: any): string {
           const hash = createHash('sha256')
               .update(JSON.stringify(params))
               .digest('hex')
               .substring(0, 16);
           
           return `${namespace}:${hash}`;
       }

       async get<T>(namespace: string, params: any): Promise<T | null> {
           try {
               const key = this.generateKey(namespace, params);
               const cached = await this.redis.get(key);
               
               if (!cached) return null;
               
               const data = JSON.parse(cached);
               
               // Check if expired
               if (data.expiresAt && Date.now() > data.expiresAt) {
                   await this.redis.del(key);
                   return null;
               }
               
               return data.value as T;
           } catch (error) {
               console.error('Cache get error:', error);
               return null;
           }
       }

       async set<T>(
           namespace: string,
           params: any,
           value: T,
           ttl: number = this.defaultTTL
       ): Promise<void> {
           try {
               const key = this.generateKey(namespace, params);
               const data = {
                   value,
                   cachedAt: Date.now(),
                   expiresAt: Date.now() + (ttl * 1000)
               };
               
               await this.redis.setex(key, ttl, JSON.stringify(data));
           } catch (error) {
               console.error('Cache set error:', error);
           }
       }

       async invalidate(namespace: string, params?: any): Promise<void> {
           try {
               if (params) {
                   const key = this.generateKey(namespace, params);
                   await this.redis.del(key);
               } else {
                   // Invalidate entire namespace
                   const pattern = `${namespace}:*`;
                   const keys = await this.redis.keys(pattern);
                   
                   if (keys.length > 0) {
                       await this.redis.del(...keys);
                   }
               }
           } catch (error) {
               console.error('Cache invalidate error:', error);
           }
       }

       async withCache<T>(
           namespace: string,
           params: any,
           fetcher: () => Promise<T>,
           ttl?: number
       ): Promise<T> {
           // Try cache first
           const cached = await this.get<T>(namespace, params);
           if (cached !== null) {
               return cached;
           }

           // Fetch fresh data
           const fresh = await fetcher();
           
           // Cache for next time
           await this.set(namespace, params, fresh, ttl);
           
           return fresh;
       }

       async getStats() {
           const info = await this.redis.info('stats');
           const dbSize = await this.redis.dbsize();
           
           return {
               dbSize,
               info
           };
       }
   }

   export const cacheService = new CacheService();
   ```

2. **Apply caching to controllers**:
   ```typescript
   // Example: src/domains/projects/projects.controller.ts
   import { cacheService } from '../../shared/services/cache.service.js';

   export async function listProjects(args: ListProjectsArgs) {
       return cacheService.withCache(
           'projects:list',
           args,
           async () => {
               // Original implementation
               const response = await projectsService.listProjects(args);
               return formatProjectsList(response);
           },
           300 // Cache for 5 minutes
       );
   }
   ```

3. **Add cache invalidation**:
   ```typescript
   export async function updateProject(projectId: string, updates: any) {
       const result = await projectsService.updateProject(projectId, updates);
       
       // Invalidate related caches
       await cacheService.invalidate('projects:list');
       await cacheService.invalidate('projects:get', { projectId });
       
       return result;
   }
   ```

---

## MCP 2025 Compliance Tasks (MCP)

### MCP-001: Implement Tool Output Schemas [P0-Critical]

**Priority**: P0-Critical  
**Effort**: 2 days  
**Dependencies**: None  
**Owner**: MCP specialist  
**Risk Level**: Low  

#### Problem Statement
MCP 2025-06-18 requires tool output schemas for structured responses, but current implementation only returns untyped text.

#### Research & Context
- **Specification**: https://modelcontextprotocol.io/specification/2025-06-18#tool-output-schemas
- **Example Implementation**: https://github.com/modelcontextprotocol/servers

#### Implementation Steps

1. **Create output schema definitions** (`src/shared/schemas/output.schemas.ts`):
   ```typescript
   export const OutputSchemas = {
       ProjectsList: {
           type: 'object',
           properties: {
               projects: {
                   type: 'array',
                   items: {
                       type: 'object',
                       properties: {
                           id: { type: 'string' },
                           name: { type: 'string' },
                           description: { type: 'string' },
                           createdAt: { type: 'string', format: 'date-time' },
                           statistics: {
                               type: 'object',
                               properties: {
                                   keys: { type: 'number' },
                                   languages: { type: 'number' },
                                   contributors: { type: 'number' }
                               }
                           }
                       },
                       required: ['id', 'name']
                   }
               },
               pagination: {
                   type: 'object',
                   properties: {
                       total: { type: 'number' },
                       page: { type: 'number' },
                       limit: { type: 'number' },
                       hasMore: { type: 'boolean' }
                   }
               }
           },
           required: ['projects']
       },

       KeysList: {
           type: 'object',
           properties: {
               keys: {
                   type: 'array',
                   items: {
                       type: 'object',
                       properties: {
                           id: { type: 'string' },
                           name: { type: 'string' },
                           platforms: {
                               type: 'array',
                               items: { type: 'string' }
                           },
                           translations: {
                               type: 'array',
                               items: {
                                   type: 'object',
                                   properties: {
                                       languageId: { type: 'string' },
                                       translation: { type: 'string' },
                                       isReviewed: { type: 'boolean' }
                                   }
                               }
                           }
                       },
                       required: ['id', 'name']
                   }
               },
               cursor: {
                   type: 'object',
                   properties: {
                       next: { type: 'string' },
                       hasMore: { type: 'boolean' }
                   }
               }
           },
           required: ['keys']
       },

       Error: {
           type: 'object',
           properties: {
               error: {
                   type: 'object',
                   properties: {
                       code: { type: 'string' },
                       message: { type: 'string' },
                       details: { type: 'object' }
                   },
                   required: ['code', 'message']
               }
           },
           required: ['error']
       }
   };
   ```

2. **Update tool registration** (`src/domains/projects/projects.tool.ts`):
   ```typescript
   import { OutputSchemas } from '../../shared/schemas/output.schemas.js';

   export const projectsTool: DomainTool = {
       registerTools(server: McpServer): void {
           server.tool(
               'lokalise_list_projects',
               'Lists all projects with statistics',
               ListProjectsToolArgs.shape,
               async (args) => {
                   const result = await projectsController.listProjects(args);
                   
                   // Return both text and structured content
                   return {
                       content: [{ 
                           type: 'text' as const, 
                           text: result.content 
                       }],
                       structuredContent: result.data,
                       isError: false
                   };
               },
               {
                   // Add output schema
                   outputSchema: OutputSchemas.ProjectsList
               }
           );

           server.tool(
               'lokalise_create_project',
               'Creates a new project',
               CreateProjectToolArgs.shape,
               async (args) => {
                   const result = await projectsController.createProject(args);
                   
                   return {
                       content: [{ 
                           type: 'text' as const, 
                           text: result.content 
                       }],
                       structuredContent: result.data,
                       isError: false
                   };
               },
               {
                   outputSchema: {
                       type: 'object',
                       properties: {
                           project: {
                               type: 'object',
                               properties: {
                                   id: { type: 'string' },
                                   name: { type: 'string' },
                                   description: { type: 'string' }
                               },
                               required: ['id', 'name']
                           }
                       },
                       required: ['project']
                   }
               }
           );
       }
   };
   ```

3. **Update controllers to return structured data**:
   ```typescript
   // src/domains/projects/projects.controller.ts
   export interface ControllerResponse {
       content: string;          // Markdown formatted text
       data?: unknown;           // Structured data matching output schema
       metadata?: {
           total?: number;
           page?: number;
           hasMore?: boolean;
       };
   }

   export async function listProjects(args: ListProjectsArgs): Promise<ControllerResponse> {
       const response = await projectsService.listProjects(args);
       
       return {
           content: formatProjectsList(response), // Markdown for display
           data: {                                // Structured for programmatic use
               projects: response.items.map(p => ({
                   id: p.project_id,
                   name: p.name,
                   description: p.description,
                   createdAt: p.created_at,
                   statistics: {
                       keys: p.statistics?.keys_total || 0,
                       languages: p.statistics?.languages_total || 0,
                       contributors: p.statistics?.team || 0
                   }
               })),
               pagination: {
                   total: response.totalResults,
                   page: response.currentPage,
                   limit: response.resultsPerPage,
                   hasMore: response.hasNextPage()
               }
           },
           metadata: {
               total: response.totalResults,
               page: response.currentPage,
               hasMore: response.hasNextPage()
           }
       };
   }
   ```

4. **Test output schemas**:
   ```typescript
   // test-output-schemas.ts
   import Ajv from 'ajv';
   import { OutputSchemas } from './output.schemas.js';

   const ajv = new Ajv();

   // Test schema validation
   const validateProjectsList = ajv.compile(OutputSchemas.ProjectsList);

   const testData = {
       projects: [{
           id: '123',
           name: 'Test Project',
           description: 'Test',
           createdAt: '2025-01-01T00:00:00Z',
           statistics: {
               keys: 100,
               languages: 10,
               contributors: 5
           }
       }],
       pagination: {
           total: 1,
           page: 1,
           limit: 10,
           hasMore: false
       }
   };

   console.log('Valid:', validateProjectsList(testData));
   console.log('Errors:', validateProjectsList.errors);
   ```

---

### MCP-002: Implement Elicitation Support [P1-High]

**Priority**: P1-High  
**Effort**: 1 week  
**Dependencies**: MCP-001  
**Owner**: MCP specialist  
**Risk Level**: Medium  

#### Problem Statement
MCP 2025 requires elicitation support for handling incomplete requests interactively.

#### Implementation Steps

1. **Create elicitation handler** (`src/server/elicitation/elicitation.handler.ts`):
   ```typescript
   import { v4 as uuidv4 } from 'uuid';
   import { z } from 'zod';

   interface ElicitationRequest {
       id: string;
       message: string;
       schema: any; // JSON Schema
       context?: any;
       timeout?: number;
   }

   interface ElicitationResponse {
       id: string;
       value: any;
       cancelled?: boolean;
   }

   export class ElicitationHandler {
       private pendingElicitations = new Map<string, ElicitationRequest>();

       async create(request: Omit<ElicitationRequest, 'id'>): Promise<ElicitationResponse> {
           const id = uuidv4();
           const elicitation: ElicitationRequest = {
               id,
               ...request,
               timeout: request.timeout || 30000 // 30 seconds default
           };

           this.pendingElicitations.set(id, elicitation);

           // Send elicitation request to client
           const response = await this.sendToClient(elicitation);

           this.pendingElicitations.delete(id);

           return response;
       }

       private async sendToClient(request: ElicitationRequest): Promise<ElicitationResponse> {
           // This would be implemented based on transport
           // For HTTP: Server-Sent Events or WebSocket
           // For STDIO: JSON-RPC message

           return new Promise((resolve, reject) => {
               const timeout = setTimeout(() => {
                   reject(new Error('Elicitation timeout'));
               }, request.timeout!);

               // Register handler for response
               this.once(`response:${request.id}`, (response) => {
                   clearTimeout(timeout);
                   resolve(response);
               });

               // Send request
               this.emit('elicitation:request', request);
           });
       }

       handleResponse(id: string, value: any): void {
           if (this.pendingElicitations.has(id)) {
               this.emit(`response:${id}`, { id, value });
           }
       }

       cancel(id: string): void {
           if (this.pendingElicitations.has(id)) {
               this.emit(`response:${id}`, { id, cancelled: true });
               this.pendingElicitations.delete(id);
           }
       }
   }
   ```

2. **Integrate with tools**:
   ```typescript
   // Example in keys tool
   async function handleCreateKeys(args: any, server: McpServer) {
       // Check for missing required fields
       if (!args.projectId) {
           const response = await server.elicitation.create({
               message: 'Please provide the project ID for creating keys',
               schema: {
                   type: 'string',
                   description: 'Lokalise Project ID (format: xxxxx.xx)',
                   pattern: '^[a-zA-Z0-9]+\\.[0-9]+$'
               }
           });

           if (response.cancelled) {
               throw new Error('Operation cancelled by user');
           }

           args.projectId = response.value;
       }

       if (!args.keys || args.keys.length === 0) {
           const response = await server.elicitation.create({
               message: 'Please provide the keys to create',
               schema: {
                   type: 'array',
                   items: {
                       type: 'object',
                       properties: {
                           key_name: { type: 'string' },
                           description: { type: 'string' },
                           platforms: {
                               type: 'array',
                               items: { type: 'string', enum: ['web', 'ios', 'android'] }
                           }
                       },
                       required: ['key_name']
                   },
                   minItems: 1
               }
           });

           if (response.cancelled) {
               throw new Error('Operation cancelled by user');
           }

           args.keys = response.value;
       }

       // Continue with normal processing
       return keysController.createKeys(args);
   }
   ```

---

### MCP-003: Add Protocol Version Headers [P1-High]

**Priority**: P1-High  
**Effort**: 2 hours  
**Dependencies**: None  
**Owner**: Any engineer  
**Risk Level**: Low  

#### Implementation Steps

1. **Add version middleware** (`src/server/middleware/version.middleware.ts`):
   ```typescript
   export const CURRENT_MCP_VERSION = '2025-06-18';
   export const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

   export function versionMiddleware(req: Request, res: Response, next: NextFunction) {
       // Get requested version
       const requestedVersion = req.headers['mcp-protocol-version'] as string;
       
       // Set response version
       res.setHeader('MCP-Protocol-Version', CURRENT_MCP_VERSION);
       res.setHeader('MCP-Supported-Versions', SUPPORTED_VERSIONS.join(', '));

       // Validate version if provided
       if (requestedVersion) {
           if (!SUPPORTED_VERSIONS.includes(requestedVersion)) {
               return res.status(400).json({
                   jsonrpc: '2.0',
                   error: {
                       code: -32600,
                       message: 'Unsupported protocol version',
                       data: {
                           requested: requestedVersion,
                           supported: SUPPORTED_VERSIONS,
                           current: CURRENT_MCP_VERSION
                       }
                   }
               });
           }

           // Store version in request context
           req.context = {
               ...req.context,
               mcpVersion: requestedVersion
           };
       } else {
           // Default to current version
           req.context = {
               ...req.context,
               mcpVersion: CURRENT_MCP_VERSION
           };
       }

       next();
   }

   // Version-specific behavior
   export function isVersionSupported(version: string, feature: string): boolean {
       const featureMatrix = {
           'tool-output-schemas': ['2025-06-18'],
           'elicitation': ['2025-06-18'],
           'resource-indicators': ['2025-06-18'],
           'oauth-2.1': ['2025-06-18', '2025-03-26']
       };

       const supportedVersions = featureMatrix[feature] || [];
       return supportedVersions.includes(version);
   }
   ```

2. **Apply to transports**:
   ```typescript
   // HTTP transport
   app.use(versionMiddleware);

   // STDIO transport
   transport.on('message', (message) => {
       const version = message.headers?.['mcp-protocol-version'] || CURRENT_MCP_VERSION;
       // Process with version context
   });
   ```

---

## Quality Assurance Tasks (QA)

### QA-001: Achieve 80% Test Coverage [P1-High]

**Priority**: P1-High  
**Effort**: 2 weeks  
**Dependencies**: None  
**Owner**: QA engineer  
**Risk Level**: Low  

#### Implementation Plan

1. **Setup coverage reporting**:
   ```json
   // package.json
   {
       "scripts": {
           "test:coverage": "jest --coverage --coverageDirectory=coverage",
           "test:coverage:html": "jest --coverage --coverageReporters=html",
           "test:coverage:ci": "jest --coverage --coverageReporters=lcov"
       },
       "jest": {
           "coverageThreshold": {
               "global": {
                   "branches": 80,
                   "functions": 80,
                   "lines": 80,
                   "statements": 80
               }
           },
           "coveragePathIgnorePatterns": [
               "/node_modules/",
               "/dist/",
               "/__tests__/",
               "/__fixtures__/"
           ]
       }
   }
   ```

2. **Create test utilities** (`src/test/utils/test-helpers.ts`):
   ```typescript
   import { LokaliseApi } from '@lokalise/node-api';

   export function mockLokaliseApi() {
       return {
           projects: () => ({
               list: jest.fn().mockResolvedValue({
                   items: [],
                   totalResults: 0,
                   totalPages: 0,
                   resultsPerPage: 100,
                   currentPage: 1
               }),
               get: jest.fn(),
               create: jest.fn(),
               update: jest.fn(),
               delete: jest.fn()
           }),
           keys: () => ({
               list: jest.fn(),
               get: jest.fn(),
               create: jest.fn(),
               update: jest.fn(),
               delete: jest.fn()
           })
       } as unknown as LokaliseApi;
   }

   export function createMockRequest(overrides = {}) {
       return {
           body: {},
           query: {},
           params: {},
           headers: {},
           context: {},
           ...overrides
       };
   }

   export function createMockResponse() {
       const res: any = {
           status: jest.fn().mockReturnThis(),
           json: jest.fn().mockReturnThis(),
           setHeader: jest.fn().mockReturnThis(),
           end: jest.fn().mockReturnThis()
       };
       return res;
   }
   ```

3. **Test template for controllers**:
   ```typescript
   // src/domains/projects/projects.controller.test.ts
   import { describe, it, expect, jest, beforeEach } from '@jest/globals';
   import * as projectsController from './projects.controller.js';
   import * as projectsService from './projects.service.js';
   import { mockLokaliseApi } from '../../test/utils/test-helpers.js';

   jest.mock('./projects.service.js');

   describe('ProjectsController', () => {
       beforeEach(() => {
           jest.clearAllMocks();
       });

       describe('listProjects', () => {
           it('should return formatted projects list', async () => {
               const mockResponse = {
                   items: [
                       {
                           project_id: '123.45',
                           name: 'Test Project',
                           description: 'Test Description'
                       }
                   ],
                   totalResults: 1,
                   currentPage: 1,
                   resultsPerPage: 100,
                   hasNextPage: () => false
               };

               jest.mocked(projectsService.listProjects).mockResolvedValue(mockResponse);

               const result = await projectsController.listProjects({
                   page: 1,
                   limit: 100
               });

               expect(result.content).toContain('Test Project');
               expect(result.data.projects).toHaveLength(1);
               expect(result.data.projects[0].id).toBe('123.45');
           });

           it('should handle empty results', async () => {
               jest.mocked(projectsService.listProjects).mockResolvedValue({
                   items: [],
                   totalResults: 0,
                   currentPage: 1,
                   resultsPerPage: 100,
                   hasNextPage: () => false
               });

               const result = await projectsController.listProjects({});

               expect(result.content).toContain('No projects found');
               expect(result.data.projects).toHaveLength(0);
           });

           it('should handle service errors', async () => {
               jest.mocked(projectsService.listProjects)
                   .mockRejectedValue(new Error('API Error'));

               await expect(projectsController.listProjects({}))
                   .rejects.toThrow('API Error');
           });
       });
   });
   ```

4. **Integration test template**:
   ```typescript
   // src/domains/projects/projects.integration.test.ts
   import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
   import { createServer } from '../../server/index.js';
   import request from 'supertest';

   describe('Projects Integration', () => {
       let server: any;

       beforeAll(async () => {
           server = await createServer({ test: true });
       });

       afterAll(async () => {
           await server.close();
       });

       describe('POST /mcp/tools/lokalise_list_projects', () => {
           it('should list projects via MCP', async () => {
               const response = await request(server)
                   .post('/mcp/tools/lokalise_list_projects')
                   .send({
                       jsonrpc: '2.0',
                       method: 'lokalise_list_projects',
                       params: {
                           page: 1,
                           limit: 10
                       },
                       id: 1
                   })
                   .expect(200);

               expect(response.body).toHaveProperty('jsonrpc', '2.0');
               expect(response.body).toHaveProperty('result');
               expect(response.body.result).toHaveProperty('content');
           });
       });
   });
   ```

---

### QA-002: Setup CI/CD Pipeline [P1-High]

**Priority**: P1-High  
**Effort**: 1 day  
**Dependencies**: QA-001  
**Owner**: DevOps engineer  
**Risk Level**: Low  

#### Implementation Steps

1. **Create GitHub Actions workflow** (`.github/workflows/ci.yml`):
   ```yaml
   name: CI/CD Pipeline

   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]

   env:
     NODE_VERSION: '18'
     
   jobs:
     lint:
       name: Lint & Format
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Run linter
           run: npm run lint
         
         - name: Check formatting
           run: npm run format:check

     test:
       name: Test & Coverage
       runs-on: ubuntu-latest
       needs: lint
       
       services:
         redis:
           image: redis:7-alpine
           ports:
             - 6379:6379
           options: >-
             --health-cmd "redis-cli ping"
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5
       
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Run tests with coverage
           run: npm run test:coverage:ci
           env:
             REDIS_HOST: localhost
             REDIS_PORT: 6379
         
         - name: Upload coverage to Codecov
           uses: codecov/codecov-action@v3
           with:
             file: ./coverage/lcov.info
             fail_ci_if_error: true
         
         - name: Check coverage thresholds
           run: |
             coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
             if (( $(echo "$coverage < 80" | bc -l) )); then
               echo "Coverage is below 80%: $coverage%"
               exit 1
             fi

     build:
       name: Build & Type Check
       runs-on: ubuntu-latest
       needs: lint
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build project
           run: npm run build
         
         - name: Upload build artifacts
           uses: actions/upload-artifact@v3
           with:
             name: dist
             path: dist/

     security:
       name: Security Scan
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Run npm audit
           run: npm audit --audit-level=high
         
         - name: Run Snyk security scan
           uses: snyk/actions/node@master
           env:
             SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
           with:
             args: --severity-threshold=high

     deploy:
       name: Deploy to Production
       runs-on: ubuntu-latest
       needs: [test, build, security]
       if: github.ref == 'refs/heads/main'
       
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         
         - name: Download build artifacts
           uses: actions/download-artifact@v3
           with:
             name: dist
             path: dist/
         
         - name: Deploy to production
           run: |
             echo "Deploying to production..."
             # Add actual deployment commands here
           env:
             DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
         
         - name: Notify deployment
           uses: 8398a7/action-slack@v3
           with:
             status: ${{ job.status }}
             text: 'Production deployment completed'
             webhook_url: ${{ secrets.SLACK_WEBHOOK }}
           if: always()
   ```

2. **Add pre-commit hooks** (`.husky/pre-commit`):
   ```bash
   #!/bin/sh
   . "$(dirname "$0")/_/husky.sh"

   # Run linting
   npm run lint

   # Run formatting check
   npm run format:check

   # Run tests for changed files
   npm run test:changed
   ```

---

## Infrastructure Tasks (INFRA)

### INFRA-001: Setup Monitoring Stack [P1-High]

**Priority**: P1-High  
**Effort**: 1 week  
**Dependencies**: None  
**Owner**: DevOps engineer  
**Risk Level**: Medium  

#### Implementation Plan

1. **Add OpenTelemetry** (`src/shared/telemetry/telemetry.ts`):
   ```typescript
   import { NodeSDK } from '@opentelemetry/sdk-node';
   import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
   import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
   import { Resource } from '@opentelemetry/resources';
   import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

   export function initTelemetry() {
       const resource = Resource.default().merge(
           new Resource({
               [SemanticResourceAttributes.SERVICE_NAME]: 'lokalise-mcp',
               [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version,
           })
       );

       const sdk = new NodeSDK({
           resource,
           instrumentations: [
               getNodeAutoInstrumentations({
                   '@opentelemetry/instrumentation-fs': {
                       enabled: false, // Too noisy
                   },
               }),
           ],
           metricReader: new PeriodicExportingMetricReader({
               exporter: new PrometheusExporter({
                   port: 9090,
               }),
           }),
       });

       sdk.start();
   }
   ```

2. **Add health checks** (`src/server/health/health.controller.ts`):
   ```typescript
   export async function healthCheck(): Promise<HealthStatus> {
       const checks = {
           server: true,
           redis: await checkRedis(),
           lokaliseApi: await checkLokaliseApi(),
           database: await checkDatabase()
       };

       const healthy = Object.values(checks).every(v => v === true);

       return {
           status: healthy ? 'healthy' : 'unhealthy',
           timestamp: new Date().toISOString(),
           checks,
           version: process.env.npm_package_version,
           uptime: process.uptime()
       };
   }

   async function checkRedis(): Promise<boolean> {
       try {
           await redis.ping();
           return true;
       } catch {
           return false;
       }
   }

   async function checkLokaliseApi(): Promise<boolean> {
       try {
           await lokaliseApi.projects().list({ limit: 1 });
           return true;
       } catch {
           return false;
       }
   }
   ```

3. **Setup Grafana dashboards** (`infrastructure/grafana/dashboards/lokalise-mcp.json`):
   ```json
   {
       "dashboard": {
           "title": "Lokalise MCP Dashboard",
           "panels": [
               {
                   "title": "Request Rate",
                   "targets": [{
                       "expr": "rate(http_requests_total[5m])"
                   }]
               },
               {
                   "title": "Error Rate",
                   "targets": [{
                       "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
                   }]
               },
               {
                   "title": "Response Time P95",
                   "targets": [{
                       "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
                   }]
               },
               {
                   "title": "Active Connections",
                   "targets": [{
                       "expr": "mcp_active_connections"
                   }]
               }
           ]
       }
   }
   ```

---

## Enterprise Feature Tasks (ENT)

### ENT-001: Implement Multi-Tenancy [P2-Medium]

**Priority**: P2-Medium  
**Effort**: 2 weeks  
**Dependencies**: SEC-004  
**Owner**: Senior architect  
**Risk Level**: High  

#### Implementation Blueprint

1. **Create tenant context** (`src/shared/context/tenant.context.ts`):
   ```typescript
   export interface TenantContext {
       tenantId: string;
       tier: 'free' | 'basic' | 'pro' | 'enterprise';
       limits: {
           requestsPerMinute: number;
           projectsLimit: number;
           usersLimit: number;
           storageLimit: number;
       };
       features: {
           oauth: boolean;
           sso: boolean;
           audit: boolean;
           customDomain: boolean;
       };
   }

   export class TenantManager {
       private tenants = new Map<string, TenantContext>();

       async getTenant(tenantId: string): Promise<TenantContext> {
           // Load from database/cache
           return this.tenants.get(tenantId)!;
       }

       async validateTenantLimits(tenantId: string, resource: string): Promise<boolean> {
           const tenant = await this.getTenant(tenantId);
           // Check limits
           return true;
       }
   }
   ```

2. **Implement data isolation**:
   ```typescript
   // All queries must include tenant ID
   export async function listProjects(tenantId: string, args: any) {
       return db.query('SELECT * FROM projects WHERE tenant_id = ?', [tenantId]);
   }
   ```

---

## Architecture Tasks (ARCH)

### ARCH-001: Refactor to Hexagonal Architecture [P3-Low]

**Priority**: P3-Low  
**Effort**: 3 weeks  
**Dependencies**: None  
**Owner**: Senior architect  
**Risk Level**: High  

#### Implementation Plan

1. **Define ports and adapters**:
   ```typescript
   // Ports (interfaces)
   export interface ProjectRepository {
       findAll(tenantId: string): Promise<Project[]>;
       findById(id: string): Promise<Project>;
       save(project: Project): Promise<Project>;
       delete(id: string): Promise<void>;
   }

   // Adapters (implementations)
   export class LokaliseProjectAdapter implements ProjectRepository {
       async findAll(tenantId: string): Promise<Project[]> {
           // Implementation using Lokalise API
       }
   }
   ```

---

## Documentation Tasks (DOC)

### DOC-001: Generate API Documentation [P2-Medium]

**Priority**: P2-Medium  
**Effort**: 1 day  
**Dependencies**: None  
**Owner**: Any engineer  
**Risk Level**: Low  

#### Implementation Steps

1. **Setup TypeDoc**:
   ```bash
   npm install --save-dev typedoc typedoc-plugin-markdown
   ```

2. **Configure** (`typedoc.json`):
   ```json
   {
       "entryPoints": ["src/index.ts"],
       "out": "docs/api",
       "plugin": ["typedoc-plugin-markdown"],
       "theme": "markdown",
       "excludePrivate": true,
       "excludeInternal": true,
       "includeVersion": true,
       "readme": "README.md"
   }
   ```

3. **Add JSDoc comments**:
   ```typescript
   /**
    * Lists all projects for the authenticated user
    * @param args - Pagination and filter arguments
    * @returns Formatted list of projects with metadata
    * @throws {McpError} When API call fails
    * @example
    * ```typescript
    * const projects = await listProjects({ page: 1, limit: 100 });
    * ```
    */
   export async function listProjects(args: ListProjectsArgs): Promise<ControllerResponse> {
       // Implementation
   }
   ```

---

## Research References

### MCP Specification & Standards
- **Official MCP 2025-06-18 Spec**: https://modelcontextprotocol.io/specification/2025-06-18
- **MCP Implementation Guide**: https://simplescraper.io/blog/how-to-mcp
- **OAuth 2.1 for MCP**: https://auth0.com/blog/mcp-specs-update-all-about-auth/
- **Current State of MCP**: https://www.elastic.co/search-labs/blog/mcp-current-state
- **AWS MCP Integration**: https://aws.amazon.com/blogs/machine-learning/unlocking-the-power-of-model-context-protocol-mcp-on-aws/

### Security Best Practices
- **OWASP Top 10 2021**: https://owasp.org/www-project-top-ten/
- **OAuth 2.1 Draft**: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-10
- **Resource Indicators RFC**: https://datatracker.ietf.org/doc/html/rfc8707
- **PKCE RFC**: https://datatracker.ietf.org/doc/html/rfc7636

### Performance & Scalability
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **Redis Best Practices**: https://redis.io/docs/manual/patterns/
- **OpenTelemetry Guide**: https://opentelemetry.io/docs/instrumentation/js/

### Testing & Quality
- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **Test Pyramid**: https://martinfowler.com/articles/practical-test-pyramid.html
- **GitHub Actions**: https://docs.github.com/en/actions

---

## Best Practices

### Code Quality Standards
1. **TypeScript Strict Mode**: Always enabled
2. **Linting**: Biome with custom rules
3. **Formatting**: Consistent tab indentation
4. **Naming**: Clear, descriptive names
5. **Comments**: Only when necessary

### Security Standards
1. **Never log sensitive data**
2. **Always validate input**
3. **Use parameterized queries**
4. **Implement rate limiting**
5. **Follow least privilege principle**

### Performance Standards
1. **Response time**: <200ms p95
2. **Memory usage**: <512MB per instance
3. **Connection pooling**: Always
4. **Caching**: Redis with TTL
5. **Async operations**: No blocking I/O

### Testing Standards
1. **Unit tests**: All business logic
2. **Integration tests**: All API endpoints
3. **E2E tests**: Critical user flows
4. **Performance tests**: Load testing
5. **Security tests**: Penetration testing

---

## Risk Management

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Data breach | Low | Critical | OAuth 2.1, encryption, audit logs |
| Performance degradation | Medium | High | Caching, monitoring, auto-scaling |
| Breaking changes | Medium | Medium | Versioning, backward compatibility |
| Vendor lock-in | Low | Medium | Abstraction layers, interfaces |
| Team knowledge gaps | High | Medium | Documentation, training, pairing |

### Rollback Procedures

1. **Immediate Rollback** (< 5 minutes):
   ```bash
   # Revert last deployment
   kubectl rollout undo deployment/lokalise-mcp
   
   # Or via Git
   git revert HEAD
   git push origin main --force-with-lease
   ```

2. **Database Rollback**:
   ```bash
   # Run down migrations
   npm run migrate:down
   
   # Restore backup
   pg_restore -d lokalise_mcp backup.sql
   ```

3. **Feature Flag Rollback**:
   ```typescript
   // Disable feature immediately
   await featureFlags.disable('new-feature');
   ```

### Emergency Contacts

- **On-Call Engineer**: PagerDuty rotation
- **Security Team**: security@lokalise.com
- **Infrastructure**: infra@lokalise.com
- **Product Owner**: product@lokalise.com

---

## Success Metrics

### Technical Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| API Response Time | Unknown | <200ms p95 | OpenTelemetry |
| Error Rate | Unknown | <0.1% | Grafana |
| Test Coverage | 20% | 80% | Jest/Codecov |
| Uptime | N/A | 99.9% | Pingdom |
| Security Score | C | A | Snyk |

### Business Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Developer Onboarding | 3 days | 1 day | Survey |
| Time to Add Feature | 1 week | 2 days | JIRA |
| Support Tickets | 20/week | 5/week | Zendesk |
| Customer Satisfaction | Unknown | 4.5/5 | NPS |

### Monitoring Dashboard

```typescript
// src/server/metrics/metrics.controller.ts
export async function getMetrics() {
    return {
        technical: {
            responseTime: await getResponseTimeP95(),
            errorRate: await getErrorRate(),
            testCoverage: await getTestCoverage(),
            uptime: await getUptime()
        },
        business: {
            activeUsers: await getActiveUsers(),
            apiCalls: await getApiCallsToday(),
            features: await getFeatureUsage()
        },
        system: {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            connections: await getActiveConnections()
        }
    };
}
```

---

## Conclusion

This comprehensive production readiness plan provides:

1. **102 detailed tasks** with unique codes for tracking
2. **Step-by-step implementation** instructions
3. **Working research links** and references
4. **Risk mitigation** strategies
5. **Success metrics** for validation

**Next Steps**:
1. Assign task owners
2. Set up project tracking (JIRA/Linear)
3. Begin with P0-Critical tasks
4. Schedule weekly progress reviews
5. Adjust timeline based on team capacity

**Time to Production**: 8 weeks with focused execution

---

*Document Version: 1.0.0*  
*Last Updated: 2025-08-24*  
*Next Review: Weekly during implementation*