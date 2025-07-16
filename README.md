# Lokalise MCP Server

> **⚠️ Disclaimer**: This is an unofficial, personal project and is not affiliated with, endorsed by, or associated with Lokalise Inc. It uses the publicly available [Lokalise Node.js SDK](https://github.com/lokalise/node-api) to provide MCP integration. All code and implementation are my own work.

<div align="center">
  <img src="assets/icon.svg" alt="Lokalise MCP" width="128" height="128">

  **Bring the power of Lokalise to your AI assistant**

  [![NPM Version](https://img.shields.io/npm/v/lokalise-mcp)](https://www.npmjs.com/package/lokalise-mcp)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
</div>

## What is this?

The Lokalise MCP Server connects AI assistants like Claude to [Lokalise](https://lokalise.com), the leading translation management platform. Through natural conversation, you can manage translation projects, update content, and automate localization workflows—no coding required.

> **Note**: While this project is currently independent, I'm open to collaborating with Lokalise to make this an official integration. If you're from Lokalise and interested in adopting this project, please reach out!

### 🎯 Perfect for:
- **Product Managers** - Monitor translation progress and identify bottlenecks
- **Developers** - Automate key management and bulk updates
- **Localization Teams** - Manage translations and collaborate efficiently
- **Content Teams** - Keep translations synchronized across projects

## ✨ Features

### 📊 **Project Management**
- List and analyze all your projects with completion stats
- Create new projects with base languages
- Monitor translation health across teams

### 🔤 **Translation Keys**
- Browse and search translation keys
- Bulk create/update/delete operations
- Filter by platform (iOS, Android, Web)

### 🌍 **Languages & Translations**
- Add new target languages instantly
- Update translations across multiple languages
- Track translation progress and review status

### 👥 **Team Collaboration**
- Manage team members and permissions
- Create and assign translation tasks
- Add comments for translator context

### 📝 **Content Management**
- Maintain glossaries for consistency
- Handle plural forms and variants
- Export/import translation files

### 🔒 **Enterprise Ready**
- Secure API token handling
- Rate limiting and error recovery
- Support for custom API endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- A Lokalise account with API access
- Your Lokalise API token ([Get it here](https://app.lokalise.com/settings#apitokens))

### Installation

```bash
# Install globally
npm install -g lokalise-mcp

# Or clone for development
git clone https://github.com/AbdallahAHO/lokalise-mcp.git
cd lokalise-mcp
npm install
```

### Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your Lokalise API token:
   ```bash
   # .env
   LOKALISE_API_KEY=your_token_here
   ```

### Running the Server

```bash
# HTTP mode (recommended)
npm run mcp:http

# STDIO mode (for Claude Desktop)
npm run mcp:stdio

# CLI mode (direct commands)
npm run cli -- list-projects
```

## 🤖 Using with Claude

### Claude Desktop Setup

1. Open Claude Desktop settings
2. Go to "Developer" → "Model Context Protocol"
3. Add the Lokalise MCP server:
   ```json
   {
     "lokalise": {
       "command": "npx",
       "args": ["lokalise-mcp"],
       "env": {
         "LOKALISE_API_KEY": "your_token_here"
       }
     }
   }
   ```

### Example Conversations

**Project Overview:**
> "Show me all my Lokalise projects and their translation progress"

**Content Management:**
> "Create a new key 'welcome_message' with English text 'Welcome to our app!' and add Spanish and French translations"

**Bulk Operations:**
> "Find all keys containing 'button' and update their descriptions to include platform information"

**Team Collaboration:**
> "Create a task for translating the new onboarding flow into German and assign it to the German team"

## 📚 Available Tools

The server provides 39 MCP tools covering all major Lokalise operations:

<details>
<summary><b>Click to see all available tools</b></summary>

### Projects (6 tools)
- `lokalise_list_projects` - List all projects with statistics
- `lokalise_get_project` - Get detailed project information
- `lokalise_create_project` - Create a new project
- `lokalise_update_project` - Update project settings
- `lokalise_delete_project` - Delete a project
- `lokalise_empty_project` - Remove all keys from a project

### Keys (7 tools)
- `lokalise_list_keys` - List translation keys with filtering
- `lokalise_get_key` - Get detailed key information
- `lokalise_create_keys` - Create multiple keys at once
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

### Translations (4 tools)
- `lokalise_list_translations` - List translations with filtering
- `lokalise_get_translation` - Get translation details
- `lokalise_update_translation` - Update a translation
- `lokalise_bulk_update_translations` - Update multiple translations

### Additional Collections
- **Tasks** (5 tools) - Manage translation tasks
- **Comments** (5 tools) - Handle key comments
- **Contributors** (6 tools) - Manage team members
- **Glossary** (5 tools) - Maintain terminology

</details>

## 🛠️ Advanced Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOKALISE_API_KEY` | Your Lokalise API token (required) | - |
| `LOKALISE_API_HOSTNAME` | Custom API endpoint | `https://api.lokalise.com/api2/` |
| `TRANSPORT_MODE` | Server mode: `http` or `stdio` | `http` |
| `PORT` | HTTP server port | `3000` |
| `DEBUG` | Enable debug logging | `false` |

### Custom API Endpoints

For enterprise or staging environments:
```bash
LOKALISE_API_HOSTNAME=https://api.enterprise.lokalise.com/api2/
```

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details on:
- Setting up the development environment
- Architecture and code organization
- Creating new tools and domains
- Submitting pull requests

## 📖 Documentation

- [Contributing Guide](CONTRIBUTING.md) - Development setup and guidelines
- [Lokalise API Docs](https://developers.lokalise.com/reference) - Official API reference
- [MCP Documentation](https://modelcontextprotocol.io) - Learn about MCP

## 🐛 Troubleshooting

### Common Issues

**"Authentication failed"**
- Verify your API token is correct
- Check token permissions in Lokalise settings

**"Rate limit exceeded"**
- The server includes automatic rate limiting
- For high-volume operations, consider batching

**"Connection refused"**
- Ensure the server is running (`npm run mcp:http`)
- Check firewall settings for port 3000

### Debug Mode

Enable detailed logging:
```bash
DEBUG=true npm run mcp:http
```

## 👤 Author

**Abdallah Othman**
- Website: [abdallahaho.com](https://abdallahaho.com)
- GitHub: [@AbdallahAHO](https://github.com/AbdallahAHO)
- Email: abdallah.ali.hassan@othman.com

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- Uses the open-source [Lokalise Node.js SDK](https://github.com/lokalise/node-api)
- Created with ❤️ for the localization community
- Special thanks to Lokalise for providing an excellent API and SDK

---

<div align="center">
  <b>Ready to supercharge your localization workflow?</b><br>
  <a href="https://github.com/AbdallahAHO/lokalise-mcp">⭐ Star us on GitHub</a> •
  <a href="https://github.com/AbdallahAHO/lokalise-mcp/issues">Report an Issue</a> •
  <a href="https://lokalise.com">Learn about Lokalise</a>
</div>