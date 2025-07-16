# Release Process Documentation

This document describes the release process for the Lokalise MCP Server, including automated and manual release procedures.

## Overview

The project uses a fully automated release process powered by:
- **Semantic Release**: Automated version management and package publishing
- **GitHub Actions**: CI/CD pipeline for builds and releases
- **DXT Packaging**: Desktop extension creation for Claude Desktop

## Automated Release Process

### 1. Commit to Main Branch

When you push commits to the `main` branch, the release process automatically:

1. Analyzes commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
2. Determines the version bump type:
   - `fix:` → Patch release (1.0.0 → 1.0.1)
   - `feat:` → Minor release (1.0.0 → 1.1.0)
   - `BREAKING CHANGE:` → Major release (1.0.0 → 2.0.0)
3. Updates version numbers across the codebase
4. Generates/updates CHANGELOG.md
5. Creates a git tag
6. Publishes to npm
7. Creates a GitHub Release
8. Triggers DXT package generation

### 2. DXT Package Generation

After semantic-release completes, a separate workflow:

1. Builds the project
2. Generates an updated manifest.json
3. Creates a .dxt package using `@anthropic-ai/dxt pack`
4. Generates SHA256 checksums
5. Uploads artifacts to the GitHub Release

## Manual Release Process

For special cases where manual release is needed:

### Prerequisites

1. Ensure you have write access to the repository
2. Install dependencies: `npm ci`
3. Have npm authentication configured (for npm publishing)

### Steps

1. **Update Version Manually**
   ```bash
   # Update version in package.json and related files
   node scripts/update-version.js 1.2.3
   ```

2. **Generate Manifest**
   ```bash
   npm run generate:manifest
   ```

3. **Build and Test**
   ```bash
   npm run build
   npm test
   ```

4. **Create DXT Package**
   ```bash
   npm run build:dxt
   ```

5. **Prepare Release Assets**
   ```bash
   npm run release:prepare 1.2.3
   ```

6. **Create Git Tag**
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin v1.2.3
   ```

7. **Trigger DXT Release Workflow**
   ```bash
   # Via GitHub CLI
   gh workflow run release-dxt.yml -f version=1.2.3
   
   # Or use the GitHub Actions UI
   ```

## Release Scripts

### Core Scripts

- `npm run build:dxt` - Build and package as DXT
- `npm run release:prepare` - Prepare all release assets
- `npm run release:checksums` - Generate checksums for artifacts
- `npm run release:dry-run` - Test release process without publishing

### Support Scripts

- `scripts/update-version.js` - Update version across all files
- `scripts/generate-manifest.js` - Generate manifest.json with tool discovery
- `scripts/prepare-release.js` - Orchestrate release asset preparation
- `scripts/generate-checksums.js` - Create SHA256 checksums
- `scripts/sign-dxt.js` - Sign DXT packages with certificates
- `scripts/generate-certs.js` - Generate certificates for signing

## DXT Signing

The release process automatically signs DXT packages for security and authenticity.

### Development Signing (Default)

For development and testing, the workflow uses self-signed certificates:
- Automatically generated during the release process
- No manual setup required
- Packages show warning about self-signed certificate

### Production Signing

For official releases, configure production certificates:

1. **Obtain a Code Signing Certificate**
   - Purchase from a trusted CA (DigiCert, Sectigo, GlobalSign)
   - Ensure it has Code Signing extended key usage

2. **Configure GitHub Secrets**
   ```bash
   # Encode certificates as base64
   base64 -i cert.pem | pbcopy  # Copy to clipboard
   # Add as SIGNING_CERT secret
   
   base64 -i key.pem | pbcopy   # Copy to clipboard
   # Add as SIGNING_KEY secret
   
   # Optional: Add intermediate certificates
   base64 -i intermediate.pem | pbcopy
   # Add as SIGNING_INTERMEDIATE secret
   ```

3. **Local Signing**
   ```bash
   # Generate self-signed certificate for development
   npm run certs:generate
   
   # Sign with self-signed certificate
   npm run release:sign release/extension.dxt
   
   # Sign with production certificates
   npm run release:sign release/extension.dxt --production
   
   # Verify signature
   dxt verify release/extension.dxt
   ```

### Certificate Management Scripts

- `npm run certs:generate` - Generate self-signed certificates
- `npm run certs:info` - View certificate information
- `npm run release:sign <file>` - Sign a DXT file

### Security Notes

- Production certificates are never stored in the repository
- GitHub Secrets are encrypted and only accessible during workflow runs
- Self-signed certificates are only for development/testing
- Always verify signatures before distribution

## GitHub Release Assets

Each release includes:

1. **lokalise-mcp-{version}.dxt** - Desktop extension for Claude
2. **lokalise-mcp-{version}.tgz** - npm package tarball
3. **checksums.sha256** - SHA256 checksums for verification
4. **Source code** - Automatically attached by GitHub

## Verifying Downloads

Users can verify their downloads using the checksums file:

```bash
# Download both the DXT and checksums file
curl -LO https://github.com/AbdallahAHO/lokalise-mcp/releases/download/v1.2.3/lokalise-mcp-1.2.3.dxt
curl -LO https://github.com/AbdallahAHO/lokalise-mcp/releases/download/v1.2.3/checksums-1.2.3.sha256

# Verify
sha256sum -c checksums-1.2.3.sha256
```

## Troubleshooting

### Release Not Triggering

1. Check commit message format follows Conventional Commits
2. Ensure NPM_TOKEN secret is configured
3. Review semantic-release logs in GitHub Actions

### DXT Generation Fails

1. Ensure @anthropic-ai/dxt is accessible
2. Check manifest.json is valid
3. Verify all required files are present

### Version Mismatch

If versions are out of sync:

```bash
# Fix version across all files
node scripts/update-version.js $(node -p "require('./package.json').version")
npm run generate:manifest
git add -A
git commit -m "chore: align versions"
```

## Security Considerations

1. **npm Token**: Store securely as `NPM_TOKEN` secret
2. **Signing Keys**: When available, store as GitHub Secrets
3. **Checksums**: Always provided for download verification
4. **Permissions**: Workflows use minimal required permissions

## Rollback Procedure

If a release has issues:

1. **npm**: Deprecate the package version
   ```bash
   npm deprecate lokalise-mcp@1.2.3 "Critical bug - use 1.2.4 instead"
   ```

2. **GitHub**: Mark release as pre-release or draft

3. **Fix and Re-release**: Create fix commit and let automation handle new release

## Release Checklist

Before major releases:

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG prepared
- [ ] Breaking changes documented
- [ ] Migration guide written (if needed)
- [ ] Security audit completed
- [ ] Performance benchmarks run

## Questions?

For release-related questions:
1. Check GitHub Actions logs
2. Review semantic-release documentation
3. Open an issue with the `release` label