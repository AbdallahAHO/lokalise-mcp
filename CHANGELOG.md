## [1.0.7] - 2025-08-14

### Added
- **Initial Languages Support on Project Creation**: Enhanced project creation to support specifying initial languages when creating a project, with automatic base language inclusion when it differs from English
- **Comprehensive Test Coverage**: Added extensive test fixtures and snapshot tests for keys, projects, and tasks domains to improve reliability and maintainability
- **Enhanced Key Name Display Logic**: Unified key name display logic into helper function for consistent formatting across the application

### Changed
- **Node.js Import Standards**: Updated native module imports to use explicit `node:` protocol for clarity and compliance with current Node.js standards
- **TypeScript Build Optimization**: Excluded test and fixture files from TypeScript compilation to streamline build process
- **Improved Error Handling**: Enhanced error handling in scripts with better variable naming to avoid linter warnings

### Fixed
- **Test Stability**: Implemented stable and repeatable test snapshots by mocking Date to fixed timestamps
- **Language Code Handling**: Fixed language code handling in task formatters to safely support null/undefined values
- **Test Coverage**: Added comprehensive test coverage for edge cases including nulls, invalid dates, long content, and markdown escaping

### Developer Experience
- **Test Infrastructure**: Added 2,130+ lines of test code including fixtures and snapshots
- **Formatter Testing**: Comprehensive snapshot tests for keys, projects, and tasks formatting
- **Edge Case Coverage**: Robust testing for special characters, long names, comments, and screenshots

## [1.0.6] - 2025-08-14
### Changed
- Fixed the error handling in the MCP server for tasks domain and return formatErrorForMcpTool for all tools
- Improved the tasks tool response formatting to include more information about the task

## [1.0.5] - 2025-08-12

### Added
- Improve the NPX setup


## [1.0.4] - 2025-08-11

### Added
- **Queued Processes Domain** (2 tools + 1 resource): Monitor and manage asynchronous operations
  - `lokalise_list_queued_processes` - List all queued processes with filtering
  - `lokalise_get_queued_process` - Get detailed status of specific processes
  - Resource: `lokalise-queued-processes` for process monitoring
- **Team Users Domain** (4 tools + 2 resources): Comprehensive team member management
  - `lokalise_list_team_users` - List all team users with pagination
  - `lokalise_get_team_user` - Get detailed user information
  - `lokalise_update_team_user` - Update user role and permissions
  - `lokalise_delete_team_user` - Remove users from team
  - Resources: `lokalise-team-users` (collection) and `lokalise-team-user-details` (individual)
- **User Groups Domain** (9 tools + 2 resources): Advanced group-based permission management
  - `lokalise_list_usergroups` - List all user groups in team
  - `lokalise_get_usergroup` - Get group details with members and projects
  - `lokalise_create_usergroup` - Create new permission groups
  - `lokalise_update_usergroup` - Update group settings and permissions
  - `lokalise_delete_usergroup` - Remove user groups
  - `lokalise_add_members_to_group` - Add team members to groups
  - `lokalise_remove_members_from_group` - Remove members from groups
  - `lokalise_add_projects_to_group` - Assign projects to groups
  - `lokalise_remove_projects_from_group` - Unassign projects from groups
  - Resources: `lokalise-usergroups` (collection) and `lokalise-usergroup-details` (individual)
- **Enhanced MCP Prompts System**: Comprehensive workflow prompts for AI assistants
  - Post-upload validation workflows for translation file imports
  - Document extraction review workflows for content verification
  - Expanded prompt schemas with detailed type definitions
  - Structured workflow templates for common localization tasks

### Changed
- **MCP Prompts Architecture**: Complete restructure with detailed schemas and validation
  - Added 700+ lines of type definitions for better type safety
  - Expanded prompt templates from basic to comprehensive workflows
  - Improved prompt organization with clear separation of concerns
- **Documentation Updates**: Enhanced README and CLAUDE.md with latest features

### Fixed
- Export ordering consistency across domain modules

### Developer Experience
- Total MCP tools increased from 39 to **54 tools** (+15)
- Total MCP resources increased from 16 to **21 resources** (+5)
- Enhanced auto-discovery system seamlessly integrates new domains
- Maintained 100% backward compatibility with existing integrations


All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-08-11

### Added
- **MCP Initialization Config**: Dynamic configuration handling from MCP client info during initialization, enabling runtime flexibility (#12)
- **Docker Deployment Support**: Added Dockerfile and Smithery configuration for cloud deployment (#6)
- **Smithery Integration**: Users can now install and use the server via Smithery without local dependencies

### Changed
- **Configuration Prioritization**: MCP init config now takes precedence over environment variables and other sources
- Updated smithery.yaml configuration for improved deployment

### Fixed
- Improved configuration loader with better precedence handling
- Enhanced boolean parsing in configuration valuesUpdate
- Fixed issues with Smithery MCP server Lokalise API Key token issue [#7](https://github.com/AbdallahAHO/lokalise-mcp/issues/7)

## [1.0.2] - 2025-01-17

### Changed
- **Logger Optimization**: Deferred logger initialization and file setup for better performance
- Improved logger lifecycle management to prevent early file system access

### Fixed
- Resolved logger initialization timing issues
- Fixed potential race conditions in logger setup

## [1.0.1] - 2025-01-16

### Added
- **Pre-commit Hooks**: Automated formatting and linting checks before commits
- **Automated Release Workflow**: Streamlined release process with GitHub Actions
- **CI Enhancements**: Extended CI workflow to run on all main branch pushes

### Changed
- Updated DXT command configuration
- Improved CI/CD pipeline with environment variable support for signing certificates
- Enhanced release workflow permissions for GitHub Actions

### Fixed
- GitHub CLI integration for PR creation to resolve permissions issues
- Release workflow GitHub Actions permissions handling
- Added missing CHANGELOG.md for automated releases
- Removed redundant source file ignores from configuration

### Removed
- Signature verification requirement from DXT command

## [1.0.0] - 2025-01-16

### Added
- **Initial Release** of Lokalise MCP Server
- **39 MCP Tools** across 7 comprehensive domains:
  - **Projects** (6 tools): List, get, create, update, delete, and empty projects
  - **Languages** (6 tools): System languages, project languages management
  - **Keys** (7 tools): Complete key management with bulk operations
  - **Tasks** (5 tools): Translation task management
  - **Comments** (5 tools): Key and project comment handling
  - **Translations** (4 tools): Translation content management with cursor pagination
  - **Contributors** (6 tools): Team member and permission management
- **16 MCP Resources** for efficient data access patterns
- **Auto-Discovery Architecture**: Automatic domain registration without manual imports
- **Dual Transport Support**: Both HTTP (default) and STDIO transports
- **CLI Mode**: Direct command execution for scripting and automation
- **Domain Scaffolding**: Interactive wizard for rapid domain generation
- **Enterprise Features**:
  - Comprehensive error handling with custom McpError class
  - Contextualized logging with session tracking
  - Multi-source configuration management (ENV > .env > global config)
  - Zod schema validation for all inputs
  - Rate limiting and pagination support
- **Developer Experience**:
  - TypeScript with strict mode
  - Biome for consistent formatting and linting
  - Jest testing framework with >80% coverage target
  - Comprehensive API documentation
  - .npmignore for clean package distribution

### Technical Details
- Built with @modelcontextprotocol/sdk for MCP compliance
- Official @lokalise/node-api client integration
- Express server for HTTP transport with Server-Sent Events
- Commander.js for CLI framework
- ES modules with Node.js >=18.0.0 requirement

[1.0.7]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/AbdallahAHO/lokalise-mcp/releases/tag/v1.0.0