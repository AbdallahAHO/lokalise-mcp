# 🚀 Getting Started

This section contains everything you need to set up and understand the Lokalise MCP Server.

## Documents

### [Configuration Guide](./CONFIGURATION.md)
- Environment variables setup
- API key configuration  
- Transport mode selection (HTTP vs STDIO)
- Multi-source configuration management

### [MCP Implementation Guide](./MCP_IMPLEMENTATION_GUIDE.md)
- Model Context Protocol overview
- Architecture patterns
- Domain-driven design principles
- Tool and resource implementation

## Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/lokalise-mcp.git
cd lokalise-mcp

# 2. Install dependencies
npm install

# 3. Configure environment
export LOKALISE_API_KEY=your_api_key_here
# Or create a .env file

# 4. Run development server
npm run dev:http   # HTTP mode
npm run dev:stdio  # STDIO mode

# 5. Test the setup
npm run cli -- list-projects
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Lokalise API key (get from [Lokalise Settings](https://app.lokalise.com/profile))

## Next Steps

Once setup is complete:
1. Review the [Development Guide](../02-development/) to understand the codebase
2. Check [Testing Guide](../03-testing/) to run tests
3. Explore the [Agent Workspace](../../.agent-workspace/) for task management

## Troubleshooting

Common setup issues:

**Missing API Key:**
```bash
Error: LOKALISE_API_KEY not configured
Solution: Set the environment variable or add to .env file
```

**Port Already in Use (HTTP mode):**
```bash
Error: EADDRINUSE :::3000
Solution: Change port with PORT=3001 npm run dev:http
```

**Module Not Found:**
```bash
Error: Cannot find module
Solution: Run npm install and npm run build
```

---

*For more detailed configuration options, see [CONFIGURATION.md](./CONFIGURATION.md)*