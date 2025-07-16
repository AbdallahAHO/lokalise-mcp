# NPM Release Guide

## Quick Start

Your lokalise-mcp package is already configured for automated NPM releases! Here's what you need to do:

### 1. Set up NPM Token (One-time Setup)

1. Create an NPM account at https://www.npmjs.com/signup (if you don't have one)
2. Generate an access token:
   - Go to https://www.npmjs.com/settings/your-username/tokens
   - Click "Generate New Token"
   - Choose "Automation" type (for CI/CD)
   - Copy the token
3. Add token to GitHub repository:
   - Go to https://github.com/AbdallahAHO/lokalise-mcp/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM token
   - Click "Add secret"

### 2. How Releases Work

Releases are **fully automated** using semantic-release:

1. **Make commits** following [Conventional Commits](https://www.conventionalcommits.org/):
   - `fix:` - Patch release (1.0.0 → 1.0.1)
   - `feat:` - Minor release (1.0.0 → 1.1.0)
   - `BREAKING CHANGE:` - Major release (1.0.0 → 2.0.0)

2. **Push to main** - The CI workflow automatically:
   - Analyzes commits
   - Determines version bump
   - Updates package.json
   - Publishes to NPM
   - Creates GitHub release
   - Updates CHANGELOG.md

### 3. Example Workflow

```bash
# Make a feature
git checkout -b feature/add-new-tool
# ... make changes ...
git add .
git commit -m "feat: add new translation export tool"
git push origin feature/add-new-tool

# Create PR and merge to main
# GitHub Actions will automatically release!
```

### 4. Monitor Releases

- **GitHub Actions**: Check release status at https://github.com/AbdallahAHO/lokalise-mcp/actions
- **NPM Package**: View at https://www.npmjs.com/package/lokalise-mcp
- **Release Notes**: See https://github.com/AbdallahAHO/lokalise-mcp/releases

### 5. Manual Release (if needed)

```bash
# Dry run to test
npm run release:dry-run

# Manual release (not recommended - use CI)
npm publish
```

## Important Notes

- ✅ Package is already configured with `"access": "public"` in package.json
- ✅ Semantic release handles everything automatically
- ✅ Each release also creates a DXT package for Claude Desktop
- ⚠️ Always use conventional commits for proper versioning
- ⚠️ Only releases happen from the `main` branch

## Troubleshooting

- **Release Failed**: Check GitHub Actions logs
- **NPM Auth Error**: Verify NPM_TOKEN is set correctly
- **Version Not Bumped**: Ensure commits follow conventional format
- **Package Private**: Already set to public in publishConfig

For detailed release documentation, see [RELEASING.md](./RELEASING.md).