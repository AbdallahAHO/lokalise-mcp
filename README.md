# Lokalise MCP Server

> **⚠️ Disclaimer**: This is an unofficial, personal project and is not affiliated with, endorsed by, or associated with Lokalise Inc. It uses the open-source [Lokalise Node.js SDK](https://github.com/lokalise/node-api) to provide MCP integration. All code and implementation are my own work.

<div align="center">
  <b>Bring the power of Lokalise to your AI assistant</b>

  [![smithery badge](https://smithery.ai/badge/@AbdallahAHO/lokalise-mcp)](https://smithery.ai/server/@AbdallahAHO/lokalise-mcp)
  [![NPM Version](https://img.shields.io/npm/v/lokalise-mcp)](https://www.npmjs.com/package/lokalise-mcp)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
</div>

## 🎯 What Is This?

The Lokalise MCP Server connects AI assistants like Claude to [Lokalise](https://lokalise.com), the leading translation management platform. Through natural conversation, you can manage translation projects, update content, and automate localization workflows—no coding required.

**Perfect for:** Product Managers • Developers • Localization Teams • Content Teams

---

## 🚀 Key Features & Capabilities

Transform your localization workflow with **59 tools** across **11 domains** and **17 pre-built automation templates**:

| Feature Category | Capabilities | What You Get |
|-----------------|-------------|--------------|
| **🎯 Strategic Management** | Portfolio analysis, project health monitoring, team coordination | Executive insights, bottleneck identification, resource optimization |
| **🔤 Smart Content Operations** | Bulk key operations (1000+ at once), filename filtering, platform tagging | Release-ready content management, iOS/Android/Web coordination |
| **🌍 Global Expansion** | Language addition, progress tracking, completion analytics | Market entry automation, translation velocity insights |
| **👥 Team Orchestration** | User groups, permissions, workload distribution, reviewer assignment | Optimal team structure, timezone-aware assignments |
| **🔄 Workflow Automation** | File processing, TM+MT integration, multi-stage review pipelines | End-to-end automation, quality gates, escalation rules |
| **📊 Real-time Monitoring** | Process dashboards, audit trails, bulk operation tracking | Operational visibility, failure detection, performance metrics |
| **🔒 Enterprise Security** | Multi-layer auth, secure token handling, rate limiting | Production-ready security, compliance support |

### 🎯 **Why to use Lokalise MCP?**

| **Traditional Approach** | **With Lokalise MCP** |
|--------------------------|----------------------|
| Manual project analysis across multiple screens | "Analyze my portfolio" → Instant strategic insights |
| Hours setting up review workflows | "Create review tasks for uploaded file" → Done in seconds |
| Complex team permission management | "Set up teams for 3 new markets" → Automated structure |
| Reactive problem-solving | Proactive bottleneck identification and recommendations |
| Tool-by-tool operations | Orchestrated multi-tool workflows with one prompt |

## ✨ See It In Action

Copy these prompts to experience sophisticated multi-tool orchestration. From simple requests to advanced patterns—Claude handles the complexity automatically:


### 💻 **React i18n Development Workflow (Cursor IDE)**
*MCP Tools: `lokalise_list_projects` → `lokalise_list_keys` → `lokalise_create_keys` → `lokalise_list_usergroups` → `lokalise_create_task`*

```
Prompt: "I'm working on a new checkout flow in React. Please scan my current
components, extract all hardcoded strings that need internationalization,
convert them to i18n keys using our naming convention (checkout.step1.title),
refactor the JSX to use our i18next hooks, then sync the new keys to our
'Mobile App' project in Lokalise and create translation tasks for our EU markets using relevant tools in configured Lokalise MCP.

Use these exact Lokalise MCP tools:
- lokalise_list_projects (to find Mobile App project)
- lokalise_list_keys (to check for existing keys)
- lokalise_create_keys (to upload new i18n keys)
- lokalise_list_usergroups (to find EU translation teams)
- lokalise_create_task (to create translation tasks)"

// Before: components/checkout/PaymentStep.tsx
const PaymentStep = () => (
  <div>
    <h2>Payment Information</h2>
    <p>Enter your card details below</p>
    <button>Continue to Review</button>
  </div>
);

What Claude orchestrates with MCP tools:
✓ `lokalise_list_projects` - Locates 'Mobile App' project
✓ `lokalise_list_keys` - Validates against existing keys to prevent duplicates
✓ `lokalise_create_keys` - Bulk uploads new i18n keys with platform tags:
  [{
    key_name: "checkout.payment.title",
    platforms: ["web", "ios", "android"],
    translations: [{ language_iso: "en", translation: "Payment Information" }]
  }]
✓ `lokalise_list_usergroups` - Resolves "EU markets" to specific translation teams
✓ `lokalise_create_task` - Creates translation tasks for DE, FR, ES, IT with team assignments
✓ Auto-refactors JSX to use useTranslation hooks
✓ Updates local i18n JSON files with new key structure

// After: Automatically refactored
const PaymentStep = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t('checkout.payment.title')}</h2>
      <p>{t('checkout.payment.subtitle')}</p>
      <button>{t('checkout.payment.continue')}</button>
    </div>
  );
};

Result: Code internationalized, 12 new keys synced via Lokalise MCP tools,
translation tasks created for 4 languages—all without leaving your IDE.
Development workflow stays uninterrupted while localization setup happens
automatically through direct lokalise MCP integration.
```


### 📊 **CSV Translation Upload Automation**
*Triggers: `lokalise_list_projects` → CSV parsing → `lokalise_create_keys` (bulk) → `lokalise_list_project_languages` → `lokalise_create_task` (per language)*

```
Prompt: "I'm attaching our latest feature strings export from Product. It's a CSV with
columns: key_id, context, en_source, es_draft, fr_draft. Using relevant tools in configured Lokalise MCP; Please upload these 50 new keys to our 'E-commerce Platform' project, create translation tasks for the missing
languages (German, Italian, Portuguese), and assign them to our relevant regional teams.
The Product team wants this shipped by end of sprint (March 15th)."

[Attach: feature_v3_strings.csv]

What Claude orchestrates:
✓ Parses CSV and validates column structure
✓ Locates E-commerce Platform project
✓ Creates 50 keys with English source + Spanish/French drafts
✓ Identifies missing target languages (DE, IT, PT)
✓ Resolves regional team assignments automatically
✓ Creates separate translation tasks per language/team
✓ Sets March 15th deadline with buffer for review
✓ Provides upload summary + task tracking URLs

Result: 50 keys uploaded, 3 translation tasks created, teams notified—
what used to take 2 hours of manual CSV imports, key creation, and task setup
now happens in 30 seconds with full audit trail and team coordination.
```

### 🎯 **Strategic Portfolio Dashboard**
*Triggers: `lokalise_list_projects` → `lokalise_get_project` (parallel) → `lokalise_list_project_languages` → `lokalise_list_tasks`*

```
Prompt: "I need a strategic overview of my localization portfolio. Using relevant tools in configured Lokalise MCP;
Show me which projects need immediate attention, identify bottlenecks across teams, and give me data-driven
recommendations for resource allocation. Include completion rates, task backlogs, and
any projects that haven't seen activity in the last 30 days."

What Claude does automatically:
✓ Fetches all projects with statistics
✓ Analyzes each project's health in parallel
✓ Cross-references team workloads
✓ Identifies stalled projects and overdue tasks
✓ Generates strategic recommendations

Result: Executive-level insights you can act on immediately
```

### 🔄 **Intelligent File Processing Workflow**
*Triggers: `lokalise_list_projects` → `lokalise_list_keys` (filter by filename) → `lokalise_list_usergroups` + `lokalise_list_contributors` → `lokalise_list_project_languages` → `lokalise_create_task` (multiple)*

```
Prompt: "I just uploaded 'user-onboarding-v2.json' to my Mobile App project via the Lokalise UI.
The TM+MT processing is done. Now create review tasks for quality assurance - assign
Spanish content to our EMEA translation team, French to Marie (marie@ourcompany.com),
and German to whoever is available on the DACH team. Set the deadline for next Friday."

What Claude orchestrates:
✓ Locates your Mobile App project
✓ Finds all keys from the uploaded file
✓ Resolves "EMEA translation team" → user group ID
✓ Resolves "marie@ourcompany.com" → contributor ID
✓ Finds DACH team members and assigns optimally
✓ Creates separate review tasks per language
✓ Sets appropriate deadlines and task descriptions

Result: Complete review workflow ready in seconds, not minutes of manual setup
```


### 🚀 **Bulk Operations with Smart Validation**
*Triggers: `lokalise_list_projects` → `lokalise_list_keys` (filtered) → `lokalise_bulk_update_keys` → `lokalise_list_tasks` → `lokalise_create_task`*

```
Prompt: "I need to clean up our iOS release. Find all keys tagged 'onboarding' across all
projects, ensure they have iOS platform designation, verify they're all translated to
Spanish and French, and create catch-up tasks for any missing translations. Also check
if any of these keys have been changed in the last 7 days and might need re-review."

What Claude coordinates:
✓ Searches across all projects for 'onboarding' tagged keys
✓ Audits platform tags and adds iOS where missing
✓ Cross-checks translation completeness for Spanish/French
✓ Identifies recently modified keys needing re-review
✓ Creates targeted tasks for missing translations
✓ Provides summary of changes and remaining work

Result: Release-ready content with full audit trail and completion plan
```

> **💡 Master Tip**: The more context and constraints you provide, the smarter Claude's orchestration becomes. Include timelines, priorities, team constraints, and business objectives for maximum AI leverage.

---

## 🎯 Built-in Workflow Prompts

Beyond these examples, the MCP server includes **17 sophisticated prompt templates** that orchestrate complex multi-tool workflows automatically. These aren't just examples—they're production-ready templates you can use immediately.

### 📋 **Project Management Suite**
Ready-to-use prompts for strategic project oversight:

| Prompt Template | What It Does | Tools Orchestrated |
|----------------|--------------|-------------------|
| **`project_portfolio_overview`** | Strategic analysis across all projects with bottleneck identification | 4-6 tools in parallel |
| **`project_deep_dive`** | Comprehensive health analysis of a specific project | 6-8 tools coordinated |
| **`new_project_setup`** | Complete project creation with languages and initial structure | 5-7 tools sequenced |
| **`project_cleanup`** | Safe removal of deprecated content with impact analysis | 3-5 tools with validation |

### 🌍 **Localization Workflow Suite**
Automated language expansion and progress monitoring:

| Prompt Template | What It Does | Tools Orchestrated |
|----------------|--------------|-------------------|
| **`language_expansion`** | Add new markets with proper configuration and team setup | 4-6 tools coordinated |
| **`translation_progress_check`** | Comprehensive progress analysis with actionable insights | 3-5 tools in parallel |
| **`bulk_key_creation`** | Smart content organization for new features | 3-4 tools sequenced |

### 🔄 **Advanced Workflow Automation**
Sophisticated multi-stage orchestration:

| Prompt Template | What It Does | Tools Orchestrated |
|----------------|--------------|-------------------|
| **`post_upload_review_workflow`** | Complete review pipeline for uploaded files with team assignment | 6-8 tools orchestrated |
| **`document_extraction_review_workflow`** | Extract uploaded CSV/JSON content as keys + create translation tasks | 5-7 tools coordinated |
| **`automated_review_pipeline`** | Multi-stage review with quality gates and escalation | 8-10 tools orchestrated |
| **`team_translation_setup`** | Organize teams with optimal workload distribution | 6-8 tools coordinated |

### 🚀 **Enterprise Automation Suite**
Production-ready workflows for complex operations:

| Prompt Template | What It Does | Tools Orchestrated |
|----------------|--------------|-------------------|
| **`process_monitoring_dashboard`** | Real-time monitoring across projects with failure detection | 4-6 tools in parallel |
| **`user_group_audit`** | Comprehensive team analysis with security recommendations | 5-7 tools coordinated |
| **`translation_memory_import`** | Smart TM integration with conflict resolution | 6-8 tools orchestrated |
| **`bulk_operations_monitor`** | Track and audit large-scale changes with rollback info | 4-6 tools coordinated |
| **`team_onboarding_workflow`** | Complete new member setup with permissions and training | 5-7 tools sequenced |

### 🎭 **How to Use Prompt Templates**

```bash
# In Claude, simply reference the prompt name:
"Use the project_portfolio_overview prompt from configured Lokalise MCP to analyze my localization portfolio"

# Or trigger directly with parameters:
"Run the post_upload_review_workflow from configured Lokalise MCP  for 'user-guide.pdf' in Mobile App project,
assign Spanish to EMEA Team and French to marie@company.com"

# Customize for your needs:
"Use the team_translation_setup prompt from configured Lokalise MCP but focus on timezone optimization
for our distributed team across 4 continents"
```

**Template Benefits:**
- 🎯 **Zero Learning Curve**: Pre-built workflows ready to use
- 🚀 **Multi-Tool Orchestration**: Each template coordinates 3-10 tools automatically
- 🧠 **Context Awareness**: Smart parameter resolution and error handling
- 📊 **Rich Outputs**: Formatted reports with actionable insights
- ⚡ **Production Ready**: Battle-tested in real localization projects

---


## 📦 Quick Start

Get up and running in under 60 seconds:

### 🚀 **Recommended: One-Click Install**

[![smithery badge](https://smithery.ai/badge/@AbdallahAHO/lokalise-mcp)](https://smithery.ai/server/@AbdallahAHO/lokalise-mcp)

```bash
# Install for Claude Desktop (most popular)
npx -y @smithery/cli install @AbdallahAHO/lokalise-mcp --client claude

# Other clients: cursor, vscode, raycast, gemini
```

**What happens:** Auto-installs, configures permissions, prompts for your Lokalise API key, ready to use.

### 🎯 **Alternative Installation Methods**

<details>
<summary><b>Claude Desktop Extension (.dxt)</b></summary>

**Fast local install, no Node.js required:**

1. Download the latest `.dxt` from [Releases](https://github.com/AbdallahAHO/lokalise-mcp/releases)
2. Double-click or drag into Claude Desktop → Settings → Extensions
3. Enter your `LOKALISE_API_KEY` when prompted
4. Verify: "Can you list my Lokalise projects?"

</details>

<details>
<summary><b>NPX (No Installation)</b></summary>

**Run directly without installing:**

```bash
# Direct execution
npx lokalise-mcp
```

**Claude Desktop config** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "lokalise": {
      "command": "npx",
      "args": ["-y", "lokalise-mcp"],
      "env": {"LOKALISE_API_KEY": "your-api-key-here"}
    }
  }
}
```

</details>

<details>
<summary><b>Global Install</b></summary>

```bash
npm install -g lokalise-mcp
lokalise-mcp  # Run the server
```

</details>

### 🔑 **Get Your API Key**

1. Log in to [Lokalise](https://app.lokalise.com)
2. Go to **Settings** → **API Tokens**
3. Click **Generate new token**
4. Copy and save securely

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

### ✅ **Verification**

Once installed, test the connection:
```
"Can you list my Lokalise projects?"
```

Claude will use the `lokalise_list_projects` tool and display your projects with statistics.

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

### User Groups (8 tools) - **NEW**
- `lokalise_list_usergroups` - List all user groups
- `lokalise_get_usergroup` - Get group details
- `lokalise_create_usergroup` - Create new group
- `lokalise_update_usergroup` - Update group settings
- `lokalise_delete_usergroup` - Delete group
- `lokalise_add_members_to_group` - Add members to group
- `lokalise_remove_members_from_group` - Remove members from group
- `lokalise_add_projects_to_group` - Assign projects to group

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

1. Check this troubleshooting section
2. Review [GitHub Issues](https://github.com/AbdallahAHO/lokalise-mcp/issues)
3. Enable debug mode for detailed error messages
4. Contact support with debug logs

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details on:
- Setting up the development environment
- Architecture and code organization
- Automated CI/CD checks on all PRs
- Release process and workflow
- Creating new tools and domains
- Submitting pull requests


## 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- Uses the open-source [Lokalise Node.js SDK](https://github.com/lokalise/node-api)

---

<div align="center">
  <a href="https://github.com/AbdallahAHO/lokalise-mcp">⭐ Star us on GitHub</a> •
  <a href="https://github.com/AbdallahAHO/lokalise-mcp/issues">Report an Issue</a> •
  <a href="https://lokalise.com">Learn about Lokalise</a>
</div>
