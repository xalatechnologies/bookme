# Changelog

All notable changes to the BookMe project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Infrastructure
- Reorganized project documentation into categorized folders
- Cleaned up scripts directory with subdirectory organization
- Enhanced .gitignore for better artifact management
- Added comprehensive contributing guidelines
- Added project structure analysis and improvement plans

## [1.0.0] - 2024-12-04

### Added
- **Facility Rules System**: Complete CRUD operations for facility-specific rules
  - Admin interface for adding/editing/deleting rules
  - Public display of facility rules
  - Supabase integration with Row Level Security
  - Performance optimizations with debouncing (90% reduction in API calls)
  
- **Documentation**: Comprehensive project documentation
  - Feature guides (facility rules, performance fixes)
  - User guides (quick start, troubleshooting)
  - Architecture documentation
  - Testing strategies
  - Migration guides
  - i18n documentation
  
- **Project Organization**:
  - Organized 202+ documentation files into 14 categories
  - Structured scripts directory with purpose-based folders
  - Enhanced README with documentation links
  
### Changed
- **Performance**: Optimized facility rules text input with local state management
- **Documentation Structure**: Moved from flat structure to hierarchical organization
- **Scripts Organization**: Categorized scripts into database, setup, automation, and analysis

### Fixed
- Facility rules initialization errors
- Infinite re-render issues in facility edit page
- Text input lag when typing rules (500ms debounce implemented)
- SQL migration idempotency issues
- TypeScript type errors in facility rules service

## [0.9.0] - 2024-11-XX

### Added
- User authentication system with Supabase
- Facility booking management
- Admin dashboard for facility management
- Role-based access control (RBAC)
- Multi-language support (Norwegian/English)
- Interactive map integration with Mapbox
- Facility search and filtering
- Booking calendar view
- User profile management

### Changed
- Migrated from localStorage to Supabase backend
- Refactored components to feature-based architecture
- Improved TypeScript type safety throughout codebase

### Fixed
- Various bug fixes and performance improvements
- Accessibility improvements
- Mobile responsiveness issues

## [0.8.0] - 2024-10-XX

### Added
- Initial project setup
- Basic facility listing
- Mock data for development
- Core UI components with Radix UI
- Tailwind CSS styling system

### Technical
- React 19.1.1 with TypeScript
- Vite build system
- ESLint and Prettier configuration
- Playwright E2E testing setup

---

## Release Types

### Major Release (X.0.0)
- Breaking changes
- Major new features
- Significant architecture changes

### Minor Release (0.X.0)
- New features (backward compatible)
- Significant improvements
- Deprecations (with warnings)

### Patch Release (0.0.X)
- Bug fixes
- Performance improvements
- Documentation updates
- Minor enhancements

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute and maintain the changelog.

---

**Maintainers:** For unreleased changes, add entries under `[Unreleased]` section following the categories:
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for removed features
- `Fixed` for bug fixes
- `Security` for vulnerability fixes
