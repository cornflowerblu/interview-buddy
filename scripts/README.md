# Scripts Directory

This directory contains automation scripts for the Interview Buddy project.

## Available Scripts

### create-monorepo-issues.sh

**Purpose:** Automatically create all 9 monorepo setup task issues in GitHub with proper labels, milestone, and assignments.

**Requirements:**
- GitHub CLI (`gh`) installed
- Authenticated with GitHub (`gh auth login`)
- Write access to the repository

**Usage:**
```bash
bash scripts/create-monorepo-issues.sh
```

**What it does:**
1. Creates milestone "Monorepo Setup" (if doesn't exist)
2. Creates 9 GitHub issues (T001-T009)
3. Assigns each issue to the appropriate agent
4. Adds relevant labels (backend, frontend, database, devops, etc.)
5. Links issues to the milestone

**Expected output:**
```
Creating monorepo setup issues for cornflowerblu/interview-buddy...

Creating milestone 'Monorepo Setup'...
Creating Issue 1: [Nexus] T001 - Initialize monorepo package.json...
Creating Issue 2: [Prism] T002 - Setup TypeScript configuration...
...
✅ All 9 issues created successfully!

View them at: https://github.com/cornflowerblu/interview-buddy/issues
```

**Troubleshooting:**

- **"gh: command not found"**
  - Install GitHub CLI: https://cli.github.com/
  
- **"Error: GitHub CLI not authenticated"**
  - Run: `gh auth login`
  - Follow the prompts to authenticate

- **"Milestone already exists"**
  - This is expected if running multiple times
  - The script will continue and create issues

- **Labels not found**
  - The script assumes standard labels exist
  - Create them manually in GitHub if needed:
    - `backend`, `frontend`, `database`, `devops`
    - `typescript`, `configuration`, `prisma`, `docker`, `testing`

**Alternative:**

If you cannot use this script, see [TASK_ASSIGNMENTS.md](../TASK_ASSIGNMENTS.md) for manual issue creation instructions.

## Adding New Scripts

When adding new scripts to this directory:

1. Make scripts executable: `chmod +x scripts/your-script.sh`
2. Add shebang at the top: `#!/bin/bash`
3. Include error handling: `set -e`
4. Document usage in this README
5. Add comments in the script explaining key sections

## Script Conventions

- Use bash for shell scripts
- Include descriptive comments
- Validate requirements before execution
- Provide clear error messages
- Echo progress information
- Exit with appropriate status codes

---

**Last Updated:** 2025-12-08
