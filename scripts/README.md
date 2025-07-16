# Scaffolding Scripts

This directory contains domain scaffolding utilities for the Lokalise MCP Server.

## Structure

```
scripts/
├── shared/                          # Shared utilities (refactored)
│   ├── scaffolding-utils.js       # Common functions and constants
│   └── base-scaffolder.js         # Base class for scaffolders
├── templates/                       # Domain file templates
│   ├── domain.cli.ts.template
│   ├── domain.controller.ts.template
│   ├── domain.formatter.ts.template
│   ├── domain.index.ts.template
│   ├── domain.resource.ts.template
│   ├── domain.service.ts.template
│   ├── domain.tool.ts.template
│   └── domain.types.ts.template
├── scaffold-domain-refactored.js    # Interactive scaffolding (new)
├── scaffold-domain-cli-refactored.js # CLI scaffolding (new)
├── scaffold-domain.js               # Legacy interactive (deprecated)
└── scaffold-domain-cli.js           # Legacy CLI (deprecated)
```

## Usage

### Interactive Mode (Recommended)

```bash
npm run scaffold:domain
```

This launches an interactive wizard that guides you through:
1. Domain configuration (name, description, API endpoint)
2. Tool selection (list, get, create, update, delete, bulk operations)
3. Resource selection (collection, detail)
4. CLI command selection

### CLI Mode

```bash
npm run scaffold:domain:cli -- \
  --name translations \
  --description "Translation management" \
  --tools list,get,update \
  --resources collection,detail \
  --cli list,get
```

Options:
- `-n, --name <name>` - Domain name (required)
- `-d, --description <desc>` - Domain description (required)
- `-a, --api-endpoint <endpoint>` - API endpoint (default: /<name>)
- `-t, --tools <tools>` - Comma-separated tools
- `-r, --resources <resources>` - Comma-separated resources
- `-c, --cli <commands>` - Comma-separated CLI commands
- `--custom-tools <tools>` - Custom tools (format: "name:desc,name2:desc2")
- `--custom-resources <resources>` - Custom resources
- `-q, --quiet` - Quiet mode

## Migration from Legacy Scripts

The refactored scripts use a shared codebase for better maintainability:

### What's Changed:
1. **Shared utilities** - Common logic extracted to `shared/` directory
2. **Base class** - Both scripts extend `BaseScaffolder`
3. **Consistent behavior** - Both modes generate identical output
4. **Better validation** - Improved error messages and checks
5. **Cleaner code** - ~50% less duplication

### Migration Steps:
1. The npm scripts already point to the new versions
2. No changes needed to templates
3. Generated domains are 100% compatible

## Examples

### Create a simple domain:
```bash
npm run scaffold:domain
# Follow the interactive prompts
```

### Create a read-only domain:
```bash
npm run scaffold:domain:cli -- \
  --name reports \
  --description "Reporting and analytics" \
  --tools list,get \
  --resources collection,detail \
  --cli list
```

### Create a domain with bulk operations:
```bash
npm run scaffold:domain:cli -- \
  --name imports \
  --description "Bulk import operations" \
  --tools list,create,bulkUpdate,bulkDelete \
  --resources collection
```

## Template Customization

Templates support conditional sections and variable substitution:

### Variables:
- `{{DOMAIN_NAME}}` - Raw domain name
- `{{DOMAIN_NAME_PASCAL}}` - PascalCase version
- `{{DOMAIN_NAME_CAMEL}}` - camelCase version
- `{{DOMAIN_NAME_KEBAB}}` - kebab-case version
- `{{DOMAIN_DESCRIPTION}}` - Domain description
- `{{API_ENDPOINT}}` - API endpoint path

### Conditionals:
- `{{#if hasListTool}}...{{/if}}` - Include if list tool selected
- `{{#if hasCreateTool}}...{{/if}}` - Include if create tool selected
- `{{#unless hasDeleteTool}}...{{/unless}}` - Include if delete NOT selected