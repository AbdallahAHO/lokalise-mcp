# 🚀 Releasing Lokalise MCP

This guide explains how to release new versions of the Lokalise MCP Server. The process is fully automated through GitHub Actions.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Release Process](#release-process)
- [Troubleshooting](#troubleshooting)
- [Manual Release](#manual-release)
- [Release Checklist](#release-checklist)

## Overview

The release process follows GitFlow and is automated through GitHub Actions:

1. **Trigger** the release workflow from the `develop` branch
2. **Review** the automatically created PR
3. **Merge** the PR to trigger npm publish and GitHub release
4. **Done** - changes are automatically back-merged to develop

## Prerequisites

Before releasing, ensure:

- [ ] You have write access to the repository
- [ ] The `develop` branch is up to date with all changes
- [ ] All tests are passing on `develop`
- [ ] GitHub Secrets are configured (see below)
- [ ] You have decided on the release type (patch/minor/major)

### GitHub Secrets Configuration

You must configure these secrets in your repository settings:

#### Required Secrets

1. **`NPM_TOKEN`** (REQUIRED for npm publishing)
   - Go to: https://www.npmjs.com/settings/~/tokens
   - Click "Generate New Token" → "Classic Token"
   - Select type: "Automation"
   - Copy the token
   - Add to GitHub: Settings → Secrets → Actions → New repository secret
   - Name: `NPM_TOKEN`
   - Value: Your npm token

#### Optional Secrets (for production DXT signing)

2. **`SIGNING_CERT`** (Optional - for production certificate)
   - Convert your certificate to base64:
     ```bash
     base64 -i cert.pem | pbcopy  # macOS
     base64 -w 0 cert.pem         # Linux
     ```
   - Add to GitHub Secrets as `SIGNING_CERT`

3. **`SIGNING_KEY`** (Optional - for production certificate)
   - Convert your private key to base64:
     ```bash
     base64 -i key.pem | pbcopy   # macOS
     base64 -w 0 key.pem          # Linux
     ```
   - Add to GitHub Secrets as `SIGNING_KEY`

**Note**: If signing certificates are not provided, DXT packages will be self-signed, which is fine for development and testing.

### Release Types

- **Patch** (1.0.x): Bug fixes, documentation updates
- **Minor** (1.x.0): New features, backward-compatible changes
- **Major** (x.0.0): Breaking changes, major rewrites

## Release Process

### Step 1: Start the Release

1. Go to the [Actions tab](https://github.com/AbdallahAHO/lokalise-mcp/actions) on GitHub
2. Click on "Release - Master Workflow" in the left sidebar
3. Click "Run workflow" button
4. Select:
   - **Branch**: `develop` (required)
   - **Release type**: patch/minor/major
   - **Dry run**: false (leave unchecked for real release)
5. Click "Run workflow"

### Step 2: Monitor the Workflow

The workflow will:
- ✅ Determine the next version number
- ✅ Create a release branch (e.g., `release/v1.0.1`)
- ✅ Update version in all files
- ✅ Generate/update CHANGELOG.md
- ✅ Build the project
- ✅ Create DXT package
- ✅ Open a PR to main branch

### Step 3: Review the Pull Request

1. The workflow will create a PR titled "Release vX.Y.Z"
2. Review the PR checklist:
   - Version updates in `package.json`, `manifest.json`, etc.
   - CHANGELOG.md updates
   - Build artifacts created
3. Ensure all CI checks pass

### Step 4: Merge the Release

1. Once satisfied, merge the PR using "Merge pull request" (not squash)
2. This triggers the main branch workflow which will:
   - ✅ Create and sign the DXT package
   - ✅ Publish to npm
   - ✅ Create GitHub release with artifacts
   - ✅ Tag the release
   - ✅ Back-merge to develop

### Step 5: Verify the Release

Check that everything worked:
- [ ] npm package: https://www.npmjs.com/package/lokalise-mcp
- [ ] GitHub release: https://github.com/AbdallahAHO/lokalise-mcp/releases
- [ ] Tag exists: `git tag -l`
- [ ] Develop branch updated: `git log --oneline develop`

## Troubleshooting

### Common Issues

#### Workflow fails to start
- Ensure you're running from the `develop` branch
- Check you have workflow dispatch permissions

#### Version already exists
- This happens if a release was partially completed
- Manually bump the version in package.json and try again

#### npm publish fails
- Check `NPM_TOKEN` is valid and has publish permissions
- Ensure you're not trying to publish an existing version
- Check npm account has 2FA configured for automation

#### DXT signing fails
- This is okay - it will fall back to self-signed certificates
- For production signing, add `SIGNING_CERT` and `SIGNING_KEY` secrets

#### Back-merge conflicts
- Rare but can happen with concurrent development
- Manually resolve: `git checkout develop && git merge main`

### Debugging Workflows

1. Check workflow run logs in GitHub Actions
2. Look for error messages in red
3. Each step shows detailed output when expanded
4. Check the summary at the bottom of each workflow run

## Manual Release

If automation fails, you can release manually:

```bash
# 1. Checkout develop and pull latest
git checkout develop
git pull origin develop

# 2. Create release branch
git checkout -b release/v1.0.1

# 3. Update version
node scripts/update-version.js 1.0.1
npm run generate:manifest

# 4. Build and test
npm run build
npm test

# 5. Create DXT package
node scripts/prepare-release.js 1.0.1

# 6. Commit changes
git add -A
git commit -m "chore(release): prepare release v1.0.1"

# 7. Push branch
git push -u origin release/v1.0.1

# 8. Create PR manually on GitHub

# 9. After merge, tag and publish
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# 10. Publish to npm
npm publish

# 11. Create GitHub release manually with DXT file

# 12. Back-merge
git checkout develop
git merge main
git push origin develop
```

## Release Checklist

Use this checklist for every release:

### Pre-Release
- [ ] All features for this release are merged to develop
- [ ] All tests pass locally: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No security vulnerabilities: `npm audit`
- [ ] Documentation is up to date

### During Release
- [ ] Workflow started from develop branch
- [ ] Correct release type selected
- [ ] PR created successfully
- [ ] All CI checks pass on PR
- [ ] CHANGELOG looks correct
- [ ] Version bumped correctly

### Post-Release
- [ ] npm package published
- [ ] GitHub release created
- [ ] DXT file attached to release
- [ ] Tag created
- [ ] Back-merged to develop
- [ ] Announce release (optional)

## Version History

| Version | Date | Type | Notes |
|---------|------|------|-------|
| 1.0.0 | 2024-01-16 | Major | Initial release |
| 1.0.1 | TBD | Patch | Automated release process |

## Testing the Release Workflow

Before doing a real release, test with a dry run:

1. Go to [Actions](https://github.com/AbdallahAHO/lokalise-mcp/actions)
2. Select "Release - Master Workflow"
3. Run with:
   - Branch: `develop`
   - Release type: `patch`
   - **Dry run: ✅ CHECK THIS**
4. Verify the workflow completes without errors
5. Check that no PR was created (dry run mode)

## Questions?

If you encounter issues:
1. Check the [GitHub Actions logs](https://github.com/AbdallahAHO/lokalise-mcp/actions)
2. Open an [issue](https://github.com/AbdallahAHO/lokalise-mcp/issues)
3. Contact the maintainers

---

Remember: The automation handles everything! Just trigger the workflow and review the PR. 🎉