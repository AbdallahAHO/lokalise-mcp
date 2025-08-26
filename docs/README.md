# 📚 Lokalise MCP Documentation

> Well-organized documentation for the Lokalise Model Context Protocol Server
> 
> **Quick Navigation**: Jump to the section you need based on your goal

## Documentation Structure

Our documentation is organized by purpose to help you find what you need quickly:

```
docs/
├── 01-getting-started/     # Setup and configuration
├── 02-development/          # Development guides and standards
├── 03-testing/              # Testing strategies and guides
├── 04-deployment/           # Release and production deployment
├── 05-project-management/   # Task tracking and planning
├── 06-reference/            # Historical and reference docs
└── archive/                 # Deprecated documentation
```

---

## 🚀 01 - Getting Started

Start here if you're new to the project or setting up your environment.

| Document | Description | Audience |
|----------|-------------|----------|
| [**Configuration Guide**](./01-getting-started/CONFIGURATION.md) | Environment setup, API keys, transport modes | Developers, DevOps |
| [**MCP Implementation Guide**](./01-getting-started/MCP_IMPLEMENTATION_GUIDE.md) | Understanding the MCP architecture and patterns | Developers |

**Quick Start:**
```bash
# 1. Set up your environment
export LOKALISE_API_KEY=your_api_key

# 2. Install dependencies
npm install

# 3. Run the server
npm run dev:http
```

---

## 💻 02 - Development

Essential guides for developers working on the codebase.

| Document | Description | When to Use |
|----------|-------------|-------------|
| [**Style Guide**](./02-development/STYLE_GUIDE.md) | Code formatting, naming conventions, best practices | Before writing code |
| [**Implementation Checklist**](./02-development/LOKALISE_MCP_IMPLEMENTATION_CHECKLIST.md) | Complete feature list, tool inventory, domain status | Planning features |

**Key Development Commands:**
```bash
npm run scaffold:domain    # Create new domain
npm run format            # Format code
npm run lint              # Check code quality
npm run build             # Build project
```

---

## 🧪 03 - Testing

Everything you need to write and debug tests.

| Document | Description | Focus Area |
|----------|-------------|------------|
| [**Testing Guide**](./03-testing/TESTING-GUIDE.md) | Comprehensive testing patterns, mocking strategies | Writing tests |
| [**Test Troubleshooting**](./03-testing/TEST-TROUBLESHOOTING.md) | Common issues and quick fixes | Debugging tests |

**Testing Quick Reference:**
```bash
npm test                  # Run all tests
npm run test:coverage     # Check coverage
npm run test:watch        # Watch mode
```

**Three-Tier Mocking Architecture:**
1. **Module Mocks** - Replace entire modules
2. **Mock Builders** - Create realistic test data
3. **Mock Factory** - Simulate API responses

---

## 🚢 04 - Deployment

Guides for releasing and deploying to production.

| Document | Description | Phase |
|----------|-------------|-------|
| [**NPM Release Guide**](./04-deployment/NPM_RELEASE_GUIDE.md) | Publishing to npm registry | Release |
| [**Releasing Guide**](./04-deployment/RELEASING.md) | Complete release process and checklist | Release |
| [**Production Readiness Plan**](./04-deployment/PRODUCTION_READINESS_PLAN.md) | Production deployment checklist and monitoring | Pre-production |

**Release Process:**
```bash
# 1. Update version
npm version patch/minor/major

# 2. Build and test
npm run build && npm test

# 3. Publish
npm publish
```

---

## 📊 05 - Project Management

Task tracking and project planning documents.

| Document | Description | Users |
|----------|-------------|-------|
| [**Agent Task Assignments**](./05-project-management/AGENT_TASK_ASSIGNMENTS.md) | Task matrix for AI agents, test coverage tracking | AI Agents, Developers |

**Agent Workspace:**
- See `.agent-workspace/` for the new multi-agent collaboration system
- Includes task board, knowledge base, and workflow guides

---

## 📖 06 - Reference

Historical and reference documentation.

| Document | Description | Purpose |
|----------|-------------|---------|
| [**Phase 1 Completion Report**](./06-reference/PHASE1-COMPLETION-REPORT.md) | Infrastructure setup completion details | Historical reference |

---

## 🗂️ Archive

Deprecated documentation preserved for historical reference.

Located in `docs/archive/`:
- Legacy testing guides (consolidated into main Testing Guide)
- Migration documents
- Obsolete implementation examples

---

## 🔍 Quick Links

### For Developers
- [Setup Guide](./01-getting-started/CONFIGURATION.md)
- [Testing Guide](./03-testing/TESTING-GUIDE.md)
- [Style Guide](./02-development/STYLE_GUIDE.md)

### For AI Agents
- [Task Assignments](./05-project-management/AGENT_TASK_ASSIGNMENTS.md)
- [Agent Workspace](../.agent-workspace/README.md)
- [CLAUDE.md](../CLAUDE.md)

### For DevOps
- [Production Readiness](./04-deployment/PRODUCTION_READINESS_PLAN.md)
- [Release Process](./04-deployment/RELEASING.md)

---

## 📝 Documentation Standards

### When to Update Documentation
- **Before**: Planning new features
- **During**: Implementation discoveries
- **After**: Completing features

### Documentation Principles
1. **Accuracy**: Keep in sync with code
2. **Clarity**: Write for your audience
3. **Organization**: Use the folder structure
4. **Maintenance**: Archive outdated content

### Contributing to Docs
1. Place documents in the appropriate category folder
2. Update this README index
3. Keep file names descriptive and consistent
4. Use markdown formatting consistently

---

## 🎯 Finding What You Need

**"I want to..."**

- **Set up the project** → [01-getting-started/](./01-getting-started/)
- **Write code** → [02-development/](./02-development/)
- **Write tests** → [03-testing/](./03-testing/)
- **Deploy to production** → [04-deployment/](./04-deployment/)
- **Track tasks** → [05-project-management/](./05-project-management/)
- **Understand history** → [06-reference/](./06-reference/)

---

*Documentation structure optimized for clarity and discoverability. Last reorganized: 2025-08-26*