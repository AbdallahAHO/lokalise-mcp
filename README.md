# Lokalise MCP Server

> **⚠️ Disclaimer**: This is an unofficial, personal project and is not affiliated with, endorsed by, or associated with Lokalise Inc. It uses the publicly available [Lokalise Node.js SDK](https://github.com/lokalise/node-api) to provide MCP integration. All code and implementation are my own work.

<div align="center">
  **Bring the power of Lokalise to your AI assistant**

  [![smithery badge](https://smithery.ai/badge/@AbdallahAHO/lokalise-mcp)](https://smithery.ai/server/@AbdallahAHO/lokalise-mcp)
  [![NPM Version](https://img.shields.io/npm/v/lokalise-mcp)](https://www.npmjs.com/package/lokalise-mcp)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
</div>

## What is this?

The Lokalise MCP Server connects AI assistants like Claude to [Lokalise](https://lokalise.com), the leading translation management platform. Through natural conversation, you can manage translation projects, update content, and automate localization workflows—no coding required.

### 🎯 Perfect for:
- **Product Managers** - Monitor translation progress and identify bottlenecks
- **Developers** - Automate key management and bulk updates
- **Localization Teams** - Manage translations and collaborate efficiently
- **Content Teams** - Keep translations synchronized across projects

## ✨ Key Features

### 🎯 Why Choose Lokalise MCP?

| Feature | Description |
|---------|-------------|
| **🚀 59 MCP Tools** | Comprehensive toolset covering all Lokalise operations |
| **📊 11 Domains** | Organized by functional areas for easy discovery |
| **🤖 17 Workflows** | Pre-built automation for complex multi-step tasks |
| **🔄 Auto-Discovery** | New domains automatically registered, zero configuration |
| **🌐 Dual Transport** | Supports both HTTP and STDIO modes |
| **🔒 Secure** | Multi-layer configuration with OS keychain integration |
| **📈 Production Ready** | Rate limiting, error recovery, and session logging |

## Capabilities

### 📊 **Project Management**
- List and analyze all your projects with completion stats
- Create new projects with base languages
- Monitor translation health across teams
- Empty projects while preserving settings

### 🔤 **Translation Keys (Enhanced)**
- Browse and search translation keys
- **NEW: Filter by uploaded filenames** for document-based workflows
- Bulk create/update/delete operations (up to 1000 keys)
- Filter by platform (iOS, Android, Web)
- Cursor pagination for large datasets

### 🌍 **Languages & Translations**
- Add new target languages instantly
- Update translations across multiple languages
- Track translation progress and review status
- Bulk translation updates with rate limiting

### 👥 **Team Collaboration (Expanded)**
- **User Groups**: Organize teams with bulk permissions
- **Team Users**: Workspace-level user management
- Manage contributors and project permissions
- Create and assign translation tasks
- Add comments for translator context
- Flexible assignment to groups or individuals

### 📝 **Content Management**
- Maintain glossaries for consistency
- Handle plural forms and variants
- Process uploaded files with review workflows
- Monitor queued processes and imports

### 🔄 **Workflow Automation**
- **Post-Upload Review**: Automated task creation for uploaded files
- **Document Extraction**: Extract content and create translation keys
- **TM+MT Integration**: Leverage translation memory and machine translation
- **Flexible Assignment**: Auto-detect user groups vs individual reviewers

### 🔒 **Enterprise Ready**
- Secure API token handling
- Rate limiting and error recovery
- Support for custom API endpoints
- Multi-source configuration management

## 📦 Installation

### Option 1: Smithery install (recommended) ✨

[![smithery badge](https://smithery.ai/badge/@AbdallahAHO/lokalise-mcp)](https://smithery.ai/server/@AbdallahAHO/lokalise-mcp)

[Smithery](https://smithery.ai/server/@AbdallahAHO/lokalise-mcp) provides automated installation for popular MCP clients:

```bash
# Claude Desktop
npx -y @smithery/cli install @AbdallahAHO/lokalise-mcp --client claude

# Cursor
npx -y @smithery/cli install @AbdallahAHO/lokalise-mcp --client cursor

# VS Code (Claude Code)
npx -y @smithery/cli install @AbdallahAHO/lokalise-mcp --client vscode

# Raycast
npx -y @smithery/cli install @AbdallahAHO/lokalise-mcp --client raycast

# Gemini CLI
npx -y @smithery/cli install @AbdallahAHO/lokalise-mcp --client gemini
```

What this does:
- ✅ Installs and configures the MCP server for your client
- ✅ Prompts for and stores `LOKALISE_API_KEY`
- ✅ Sets required permissions automatically

Inspect tools available before installing:

```bash
npx -y @smithery/cli@latest inspect @AbdallahAHO/lokalise-mcp
```

### Option 2: Claude Desktop Extension (DXT)

Fast, local install for Claude Desktop using a packaged extension.

1) Download the latest `.dxt` from Releases:
   - https://github.com/AbdallahAHO/lokalise-mcp/releases

2) Install in Claude Desktop:
   - Double‑click the `.dxt` file, or
   - Drag it into Claude Desktop → Settings → Extensions

3) When prompted, enter your `LOKALISE_API_KEY` (stored securely in the OS keychain). No Node.js needed; Claude ships the runtime.

4) Verify: ask “Can you list my Lokalise projects?”

Notes:
- Uses the `/mcp` HTTP endpoint internally and stdio as appropriate
- Updates by installing a newer `.dxt` from Releases

### Option 3: NPM Global Install

Install globally for persistent access:

```bash
npx -y @smithery/cli@latest inspect @AbdallahAHO/lokalise-mcp
```

### Option 2: Claude Desktop Extension (DXT)

Fast, local install for Claude Desktop using a packaged extension.

1) Download the latest `.dxt` from Releases:
   - https://github.com/AbdallahAHO/lokalise-mcp/releases

2) Install in Claude Desktop:
   - Double‑click the `.dxt` file, or
   - Drag it into Claude Desktop → Settings → Extensions

3) When prompted, enter your `LOKALISE_API_KEY` (stored securely in the OS keychain). No Node.js needed; Claude ships the runtime.

4) Verify: ask “Can you list my Lokalise projects?”

Notes:
- Uses the `/mcp` HTTP endpoint internally and stdio as appropriate
- Updates by installing a newer `.dxt` from Releases

### Option 3: Local (clone + run)

# Run the server
lokalise-mcp
```

### Option 4: NPX (Quick Start)

Use npx to run the server without installation:

```bash
# Run directly with npx
npx lokalise-mcp

# Or configure in Claude Desktop's config file:
```

**Claude Desktop Configuration** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lokalise": {
      "command": "npx",
      "args": ["-y", "lokalise-mcp"],
      "env": {
        "LOKALISE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

This will automatically download and run the latest version when Claude Desktop starts.

### Option 4: Local (clone + run)

Use this for development or when you prefer to run locally:

```bash
git clone https://github.com/AbdallahAHO/lokalise-mcp.git
cd lokalise-mcp
npm install

# Provide your API key
export LOKALISE_API_KEY="your-api-key-here"

# Start HTTP transport (default port 3000)
npm run mcp:http

# Or start STDIO transport
npm run mcp:stdio
```

Then connect your client to either:
- STDIO: configure your client to launch the binary `lokalise-mcp` (via `npx lokalise-mcp@latest`), or simply use the Smithery install
- HTTP (SSE): `http://localhost:3000/mcp`

## ⚙️ Configuration

### API Key Setup

The Lokalise API key can be configured in multiple ways (in order of priority):

1. **Environment Variable** (Recommended for security):
   ```bash
   export LOKALISE_API_KEY="your-api-key-here"
   ```

2. **`.env` File** (For local development):
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

3. **Global MCP Config** (`~/.mcp/configs.json`):
   ```json
   {
     "lokalise-mcp": {
       "LOKALISE_API_KEY": "your-api-key-here"
     }
   }
   ```

### Getting Your API Token

1. Log in to [Lokalise](https://app.lokalise.com)
2. Navigate to **Settings** → **API Tokens**
3. Click **Generate new token**
4. Copy the token and save it securely

## 🚀 Running the Server

```bash
# HTTP mode (recommended for development)
npm run mcp:http

# STDIO mode (for Claude Desktop integration)
npm run mcp:stdio

# CLI mode (direct commands)
npm run cli -- list-projects
```

## 🤖 Using with Claude Desktop

### Quick Verification

Once installed, you can verify the connection by asking Claude:

> "Can you list my Lokalise projects?"

Claude will use the `lokalise_list_projects` tool to fetch and display your projects.

### Claude Desktop Setup

If installed via Smithery, no manual config is needed. Verify by looking for the 🔌 icon and asking Claude: “Can you list my Lokalise projects?”

### 💬 Example Conversations

#### 📊 **Project Overview**
```
You: "Show me all my Lokalise projects and their translation progress"

Claude: I'll fetch your Lokalise projects with their translation statistics.
[Uses lokalise_list_projects tool]

Here are your projects:
1. Mobile App (85% translated, 5 languages)
2. Website (92% translated, 12 languages)
3. Documentation (78% translated, 3 languages)
```

#### 🔤 **Content Management**
```
You: "Create a key 'welcome_message' with text 'Welcome to our app!'"

Claude: I'll create that translation key with the English text.
[Uses lokalise_create_keys tool]

✅ Created 'welcome_message' with base translation.
```

#### 🔄 **Bulk Operations**
```
You: "Find all keys containing 'button' and add iOS platform"

Claude: I'll find and update all button-related keys.
[Uses lokalise_list_keys and lokalise_bulk_update_keys tools]

✅ Updated 23 keys with iOS platform designation.
```

#### 👥 **Team Collaboration**
```
You: "Create a German translation task and assign to the German team"

Claude: I'll create a task for German translations.
[Uses lokalise_create_task tool]

✅ Created task with 47 keys assigned to German team.
```

## 📚 Available Tools

The server provides **59 MCP tools** covering all major Lokalise operations across **11 domains**:

<details>
<summary><b>Click to see all available tools</b></summary>

### Projects (6 tools)
- `lokalise_list_projects` - List all projects with statistics
- `lokalise_get_project` - Get detailed project information
- `lokalise_create_project` - Create a new project
- `lokalise_update_project` - Update project settings
- `lokalise_delete_project` - Delete a project
- `lokalise_empty_project` - Remove all keys from a project

### Keys (7 tools) - **Enhanced with file filtering**
- `lokalise_list_keys` - List keys with **NEW: filterFilenames** support
- `lokalise_get_key` - Get detailed key information
- `lokalise_create_keys` - Create multiple keys at once (up to 1000)
- `lokalise_update_key` - Update a single key
- `lokalise_bulk_update_keys` - Update multiple keys
- `lokalise_delete_key` - Delete a single key
- `lokalise_bulk_delete_keys` - Delete multiple keys

### Languages (6 tools)
- `lokalise_list_system_languages` - List all available languages
- `lokalise_list_project_languages` - List project languages
- `lokalise_add_project_languages` - Add languages to project
- `lokalise_get_language` - Get language details
- `lokalise_update_language` - Update language settings
- `lokalise_remove_language` - Remove a language

### User Groups (9 tools) - **NEW**
- `lokalise_list_usergroups` - List all user groups
- `lokalise_get_usergroup` - Get group details
- `lokalise_create_usergroup` - Create new group
- `lokalise_update_usergroup` - Update group settings
- `lokalise_delete_usergroup` - Delete group
- `lokalise_add_usergroup_members` - Add members
- `lokalise_remove_usergroup_members` - Remove members
- `lokalise_list_usergroup_members` - List members
- `lokalise_add_usergroup_projects` - Assign to projects

### Translations (4 tools)
- `lokalise_list_translations` - List with cursor pagination
- `lokalise_get_translation` - Get translation details
- `lokalise_update_translation` - Update a translation
- `lokalise_bulk_update_translations` - Bulk updates with rate limiting

### Additional Collections
- **Contributors** (6 tools) - Manage project team members
- **Tasks** (5 tools) - Create and manage translation tasks
- **Comments** (5 tools) - Handle key comments and discussions
- **Glossary** (5 tools) - Maintain terminology consistency
- **Team Users** (4 tools) - **NEW** - Workspace user management
- **Queued Processes** (2 tools) - **NEW** - Monitor background operations

</details>

## 🛠️ Advanced Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOKALISE_API_KEY` | Your Lokalise API token (required) | - |
| `TRANSPORT_MODE` | Server mode: `http` or `stdio` | `http` |
| `PORT` | HTTP server port | `3000` |
| `DEBUG` | Enable debug logging | `false` |

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details on:
- Setting up the development environment
- Architecture and code organization
- Automated CI/CD checks on all PRs
- Release process and workflow
- Creating new tools and domains
- Submitting pull requests

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [🤝 Contributing Guide](CONTRIBUTING.md) | Development setup and guidelines |
| [🌐 Lokalise API Docs](https://developers.lokalise.com/reference) | Official API reference |
| [🤖 MCP Documentation](https://modelcontextprotocol.io) | Learn about Model Context Protocol |
| [🎯 Smithery Server](https://smithery.ai/server/@AbdallahAHO/lokalise-mcp) | Installation and updates |

## 🐛 Troubleshooting

**"Authentication failed"**
- Verify your API token is correct
- Check token permissions in Lokalise settings
- Ensure the token has appropriate project access

**"Rate limit exceeded"**
- The server includes automatic rate limiting
- For high-volume operations, consider batching
- Wait 60 seconds before retrying

**"Connection refused"**
- For HTTP mode: Ensure the server is running (`npm run mcp:http`)
- For STDIO mode: Check Claude Desktop configuration
- Verify firewall settings for port 3000

### Configuration File Locations

**Claude Desktop Config:**
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**MCP Global Config:**
- All platforms: `~/.mcp/configs.json`

### Debug Mode

Enable detailed logging:
```bash
# For development
DEBUG=true npm run mcp:http

# In Claude Desktop config
"env": {
  "LOKALISE_API_KEY": "your-key",
  "DEBUG": "true"
}
```

### Getting Help

2. Review [GitHub Issues](https://github.com/AbdallahAHO/lokalise-mcp/issues)
3. Enable debug mode for detailed error messages
4. Contact support with debug logs

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- Uses the open-source [Lokalise Node.js SDK](https://github.com/lokalise/node-api)

---

<div align="center">
  <a href="https://github.com/AbdallahAHO/lokalise-mcp">⭐ Star us on GitHub</a> •
  <a href="https://github.com/AbdallahAHO/lokalise-mcp/issues">Report an Issue</a> •
  <a href="https://lokalise.com">Learn about Lokalise</a>
</div>
