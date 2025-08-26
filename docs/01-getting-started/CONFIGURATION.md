# Configuration Management

## Overview

The Lokalise MCP server uses a centralized configuration management system that provides:
- **Single entry point** for all configuration access
- **Strong typing** with TypeScript and Zod validation
- **Priority-based** configuration loading from multiple sources
- **Environment-specific** configuration support

## Configuration Priority

Configuration values are loaded from multiple sources with the following priority (highest to lowest):

1. **HTTP Query Parameters** (Smithery) - Passed via query strings
2. **MCP Initialization Config** - From clientInfo during MCP initialization
3. **Environment Variables** - Direct process.env values
4. **`.env` File** - Project root .env file
5. **Global Config File** - `~/.mcp/configs.json`

Higher priority sources override lower priority ones.

## Usage

### Import the Config Utility

```typescript
import { config } from "./shared/utils/config.util.js";
```

### Load Configuration

Configuration is automatically loaded when first accessed, but can be explicitly loaded:

```typescript
config.load(); // Called automatically in main entry point
```

### Access Configuration Values

All configuration access should go through typed getter methods:

```typescript
// Core configuration
const apiKey = config.getLokaliseApiKey();        // Required, throws if not set
const apiHost = config.getLokaliseApiHostname();  // With default fallback

// Server configuration
const transportMode = config.getTransportMode();  // "stdio" | "http"
const port = config.getPort();                    // Default: 3000

// Debug configuration
const isDebug = config.isDebugEnabled();          // boolean
const debugPattern = config.getDebugPattern();    // string | undefined

// Environment detection
const isTest = config.isTestEnvironment();        // Detects test environment
const isMcpServer = config.isMcpServerMode();     // MCP server vs CLI mode
const nodeEnv = config.getNodeEnv();              // "development" | "test" | "production"
```

### Set Configuration from Different Sources

```typescript
// Set HTTP query configuration (highest priority)
config.setHttpQueryConfig({
  LOKALISE_API_KEY: "key_from_query",
  debug_mode: true
});

// Set MCP initialization configuration
config.setMcpInitConfig({
  LOKALISE_API_KEY: "key_from_mcp",
  DEBUG: false
});
```

### Validate Configuration

```typescript
const validation = config.validate();
if (!validation.valid) {
  console.error("Configuration errors:", validation.errors);
}
```

## Environment Variables

The following environment variables are supported:

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `LOKALISE_API_KEY` | string | Yes | - | Your Lokalise API token |
| `LOKALISE_API_HOSTNAME` | string | No | `https://api.lokalise.com/api2/` | Custom Lokalise API endpoint |
| `TRANSPORT_MODE` | string | No | `stdio` | Transport mode: `stdio` or `http` |
| `PORT` | number | No | `3000` | HTTP server port (only for HTTP transport) |
| `DEBUG` | boolean/string | No | `false` | Debug mode or pattern for selective logging |
| `NODE_ENV` | string | No | - | Node environment: `development`, `test`, `production` |
| `MCP_SERVER_MODE` | boolean | No | `false` | Indicates if running as MCP server |

## Configuration Files

### `.env` File

Create a `.env` file in the project root:

```env
LOKALISE_API_KEY=your_api_key_here
LOKALISE_API_HOSTNAME=https://api.lokalise.com/api2/
TRANSPORT_MODE=http
PORT=3000
DEBUG=true
```

### Global Config File

Create `~/.mcp/configs.json` for global configuration:

```json
{
  "lokalise-mcp": {
    "environments": {
      "LOKALISE_API_KEY": "your_global_api_key",
      "LOKALISE_API_HOSTNAME": "https://api.lokalise.com/api2/"
    }
  }
}
```

## Debug Configuration

The `DEBUG` environment variable supports multiple formats:

- `true` or `1` - Enable all debug logging
- `false` or `0` - Disable debug logging
- Pattern string - Enable selective logging (e.g., `"controllers/*,services/*"`)

Examples:
```bash
DEBUG=true                    # Enable all debug
DEBUG=controllers/*           # Debug only controllers
DEBUG=services/*,utils/*      # Debug services and utils
```

## Type Safety

All configuration is strongly typed using Zod schemas:

```typescript
// Configuration schema is defined in src/shared/schemas/config.schema.ts
export const RuntimeConfigSchema = z.object({
  LOKALISE_API_KEY: z.string().min(1, "LOKALISE_API_KEY is required"),
  LOKALISE_API_HOSTNAME: z.string().url().default("https://api.lokalise.com/api2/"),
  TRANSPORT_MODE: z.enum(["stdio", "http"]).default("stdio"),
  PORT: z.number().int().min(1).max(65535).default(3000),
  DEBUG: z.union([z.boolean(), z.string()]).default(false),
  // ... other fields
});
```

## Best Practices

1. **Never access `process.env` directly** - Always use the config utility
2. **Use typed getter methods** - Avoid generic `config.get()` when possible
3. **Handle configuration errors early** - Validate configuration at startup
4. **Use appropriate defaults** - Provide sensible defaults for optional values
5. **Document required variables** - Clearly indicate which variables are required

## Migration Guide

If you're updating code that previously used `process.env` directly:

```typescript
// ❌ Old way - direct process.env access
const apiKey = process.env.LOKALISE_API_KEY;
const isTest = process.env.NODE_ENV === "test";

// ✅ New way - through config utility
import { config } from "./shared/utils/config.util.js";
const apiKey = config.getLokaliseApiKey();
const isTest = config.isTestEnvironment();
```

## Exceptions

The following cases legitimately use `process.env` directly:

1. **Logger utility** - To avoid circular dependencies
2. **Test utilities** - When spawning child processes or manipulating test environment
3. **Build scripts** - Scripts that run outside the main application context

## Smithery Integration

For Smithery deployments, configuration can be passed via HTTP query parameters:

```
GET /mcp?LOKALISE_API_KEY=key&debug_mode=true
```

These query parameters have the highest priority and will override all other configuration sources.