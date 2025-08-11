# Smithery Integration Guide

## Overview

The Lokalise MCP server supports dynamic configuration through HTTP query parameters, specifically designed for Smithery integration. This allows the server to receive configuration (like API keys) at runtime through HTTP requests rather than requiring them at startup.

## How It Works

### 1. Server Startup (HTTP Mode)

When starting the server in HTTP transport mode without environment variables:

```bash
TRANSPORT_MODE=http node dist/index.js
```

The server will:
- Start without requiring `LOKALISE_API_KEY`
- Skip API key validation during initialization
- Listen on port 3000 (default) for HTTP requests
- Wait for configuration to be provided via query parameters

### 2. Configuration via Query Parameters

When Smithery (or any HTTP client) makes a request to the MCP endpoint, it can provide configuration through query parameters:

```
http://localhost:3000/mcp?LOKALISE_API_KEY=your_key&LOKALISE_API_HOSTNAME=https://api.lokalise.com/api2/&debug_mode=true
```

### 3. Dynamic Configuration Loading

When the HTTP transport receives a request with query parameters:

1. **Query Parameter Extraction**: The server extracts all query parameters from the request
2. **Configuration Setting**: Parameters are set as HTTP query configuration (highest priority)
3. **Configuration Reload**: The configuration system reloads to apply the new values
4. **API Client Reset**: The Lokalise API client singleton is reset to use the new configuration
5. **Request Processing**: The MCP request is then processed with the updated configuration

## Configuration Priority

The configuration system uses the following priority (highest to lowest):

1. **HTTP Query Parameters** - From Smithery or HTTP requests
2. **MCP Initialization Config** - From MCP client initialization
3. **Environment Variables** - Direct process.env values
4. **`.env` File** - Local environment file
5. **Global Config** - `~/.mcp/configs.json`

## Smithery URL Examples

### Basic Configuration
```
https://your-smithery-deployment.com/mcp?LOKALISE_API_KEY=lok_live_abc123
```

### Full Configuration
```
https://your-smithery-deployment.com/mcp?LOKALISE_API_KEY=lok_live_abc123&LOKALISE_API_HOSTNAME=https://api.lokalise.com/api2/&debug_mode=true
```

### Custom API Endpoint
```
https://your-smithery-deployment.com/mcp?LOKALISE_API_KEY=lok_live_abc123&LOKALISE_API_HOSTNAME=https://api.enterprise.lokalise.com/api2/
```

## Testing with MCP Inspector

1. Start the server without environment variables:
   ```bash
   TRANSPORT_MODE=http node dist/index.js
   ```

2. Open MCP Inspector v0.16.2

3. Select **Streamable HTTP** transport

4. Enter the URL with query parameters:
   ```
   http://localhost:3000/mcp?LOKALISE_API_KEY=your_api_key
   ```

5. Click **Connect**

6. The server will:
   - Receive the API key from query parameters
   - Reload configuration with the new key
   - Reset the API client singleton
   - Process your MCP requests successfully

## Testing with cURL

You can test the integration using cURL:

```bash
# List available tools
curl -X POST "http://localhost:3000/mcp?LOKALISE_API_KEY=your_key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Call a specific tool
curl -X POST "http://localhost:3000/mcp?LOKALISE_API_KEY=your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tools/call",
    "params": {
      "name": "lokalise_list_projects",
      "arguments": {"limit": 10}
    },
    "id":2
  }'
```

## Implementation Details

### Configuration Reload Mechanism

The configuration system implements a `reload()` method that:

1. Resets the `configLoaded` flag
2. Clears the existing merged configuration
3. Reloads configuration from all sources
4. Applies HTTP query parameters with highest priority
5. Resets the Lokalise API client singleton

### API Client Reset

When configuration changes, the Lokalise API client singleton is reset:

```typescript
export function resetLokaliseApi(): void {
  if (lokaliseApi) {
    logger.info("Resetting Lokalise API client singleton");
    lokaliseApi = null;
  }
}
```

This ensures the next API call uses the updated configuration.

### Transport-Specific Validation

The server skips API key validation for HTTP transport during initialization:

```typescript
if (mode === "stdio") {
  // Validate configuration for STDIO transport
  const validation = await validateConfiguration();
  if (!validation.valid) {
    throw new Error(validation.error);
  }
} else {
  // Skip validation for HTTP transport
  logger.info("Skipping API key validation for HTTP transport");
}
```

## Security Considerations

1. **HTTPS Required**: In production, always use HTTPS to protect API keys in transit
2. **Query Parameter Logging**: Be aware that URLs with query parameters may be logged
3. **Token Rotation**: Regularly rotate API keys for security
4. **Access Control**: Implement proper access control for your Smithery deployment

## Troubleshooting

### Server Won't Start
- Ensure you're using `TRANSPORT_MODE=http`
- Check that port 3000 is available
- Verify Node.js version is >=18.0.0

### Configuration Not Loading
- Check query parameter names match exactly (case-sensitive)
- Verify the API key is valid
- Enable debug mode with `debug_mode=true` query parameter
- Check server logs for configuration reload messages

### API Calls Failing
- Ensure API key has proper permissions
- Verify API hostname is correct for your Lokalise environment
- Check network connectivity to Lokalise API
- Review error messages in server logs

## Example Deployment

For a production Smithery deployment:

1. Deploy the MCP server with HTTP transport
2. Configure Smithery with your server URL
3. Set up environment-specific API keys in Smithery
4. Smithery will automatically append configuration as query parameters
5. The server will dynamically load configuration for each request

This architecture allows for:
- Zero-configuration server deployments
- Dynamic multi-tenant support
- Environment-specific configurations
- Secure token management through Smithery