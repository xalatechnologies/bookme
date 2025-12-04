# Scripts Directory

This directory contains utility scripts for development, testing, and database management.

## 📁 Directory Structure

### `/database` - Database Scripts
SQL scripts and database-related utilities:
- **Migrations** - Database schema migrations
- **Seeds** - Test and initial data
- **Queries** - Utility SQL queries
- **Tools** - Database management utilities

**Common scripts:**
- Migration utilities for Supabase
- Facility data setup
- User and profile management
- Amenities and features setup

### `/setup` - Setup Scripts
Scripts for setting up development and test environments:

#### `/setup/users`
- `setup-test-users.js` - Create test users
- `setup-remote-users.js` - Setup remote user profiles
- `confirm-remote-users.js` - Verify user setup

#### `/setup/testing`  
- `install-msw.sh` - Install Mock Service Worker
- `install-testing-deps.sh` - Install testing dependencies
- `verify-testing-setup.sh` - Verify test environment

### `/automation` - Automation Scripts
Automated fixes and utilities:

#### `/automation/fixes`
- `fix-all-imports.sh` - Fix import statements
- `fix-eslint-errors.js` - Auto-fix ESLint issues
- `fix-ts-errors.js` - Fix TypeScript errors
- `fix-lint-comprehensive.js` - Comprehensive linting fixes
- `remove-dark-mode-classes.js` - Remove dark mode classes

### `/analysis` - Analysis Scripts
Code analysis and reporting tools:
- `analyze-architecture.js` - Architecture analysis
- `analyze-codebase.js` - Codebase analysis
- `analyze-facility-images.js` - Image usage analysis
- `fix_all_errors.py` - Python-based error analysis

## 🚀 Common Usage

### Setup New Development Environment
```bash
# 1. Setup test users
node setup/users/setup-test-users.js

# 2. Install testing dependencies
bash setup/testing/install-testing-deps.sh

# 3. Verify setup
bash setup/testing/verify-testing-setup.sh
```

### Database Operations
```bash
# Run migrations
node database/migrations/apply-migration.ts

# Seed database
node database/seeds/seed-database.ts
```

### Code Quality
```bash
# Fix linting issues
node automation/fixes/fix-lint-comprehensive.js

# Fix TypeScript errors
node automation/fixes/fix-ts-errors.js

# Analyze codebase
node analysis/analyze-codebase.js
```

## 📝 Script Naming Conventions

- **setup-*.{js,sh}** - Initial setup scripts
- **fix-*.{js,sh}** - Automated fix scripts
- **analyze-*.{js,py}** - Analysis and reporting
- ***.sql** - SQL queries and migrations
- **test-*.js** - Testing utilities
- **verify-*.{js,sh}** - Verification scripts

## ⚠️ Important Notes

### Database Scripts
- Always backup before running migrations
- Test migrations on local/staging first
- SQL scripts may require Supabase CLI or direct access

### Automation Scripts
- Review changes before committing
- Some fix scripts modify multiple files
- Always check git diff after running

### Setup Scripts
- Require proper environment variables
- May need Supabase connection
- Check `.env.example` for required config

## 🔧 Prerequisites

Most scripts require:
- Node.js 18+
- npm/pnpm installed
- Supabase project configured
- Environment variables set (`.env` file)

Database scripts additionally require:
- Supabase CLI installed
- Database connection configured
- Proper permissions/roles

## 📚 Additional Resources

- **Main Documentation:** [/docs/README.md](../docs/README.md)
- **Development Setup:** [/docs/guides/DEVELOPMENT_SETUP.md](../docs/guides/)
- **Database Guide:** [/docs/migration/](../docs/migration/)
- **Testing Guide:** [/docs/testing/](../docs/testing/)

## 🤝 Contributing

When adding new scripts:
1. Place in appropriate subdirectory
2. Follow naming conventions
3. Add documentation header
4. Update this README
5. Test thoroughly before committing

## 📞 Support

For issues with scripts:
1. Check error messages and logs
2. Verify environment configuration
3. Review script documentation
4. Check related docs in `/docs`
5. Ask in team chat/create issue

---

**Last Updated:** 2024-12-04  
**Maintainer:** Development Team
