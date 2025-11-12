# Booknor Translation System Documentation

**Complete guide to translation management for the Booknor application**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Links](#quick-links)
3. [Current Status](#current-status)
4. [Getting Started](#getting-started)
5. [Documentation Files](#documentation-files)
6. [Tools & Scripts](#tools--scripts)
7. [Workflow](#workflow)
8. [FAQs](#faqs)

---

## Overview

Booknor uses **i18next** with **react-i18next** for internationalization, supporting:
- **English (EN)** - Primary language
- **Norwegian (NO)** - Secondary language

### Translation File Structure

```
public/
  locales/
    en/
      admin.json
      auth.json
      booking.json
      common.json
      facility.json
      user.json
      ... (17 files total)
    no/
      admin.json
      auth.json
      booking.json
      common.json
      facility.json
      user.json
      ... (18 files total)
```

---

## Quick Links

### 📚 Documentation

| Document | Purpose | Size |
|----------|---------|------|
| **[TRANSLATION_QUICK_REFERENCE.md](TRANSLATION_QUICK_REFERENCE.md)** | Developer guide, examples, best practices | 10 KB |
| **[TRANSLATION_ANALYSIS_SUMMARY.md](TRANSLATION_ANALYSIS_SUMMARY.md)** | Executive summary, statistics, recommendations | 9 KB |
| **[TRANSLATION_GLOSSARY.md](TRANSLATION_GLOSSARY.md)** | Complete list of all translation keys (707 keys) | 140 KB |
| **[MISSING_TRANSLATIONS.json](MISSING_TRANSLATIONS.json)** | Structured JSON of missing translations | 90 KB |

### 🔧 Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| **analyze_translations.py** | Scan codebase, generate reports | `python3 analyze_translations.py` |

---

## Current Status

**Analysis Date:** October 27, 2025
**Files Scanned:** 346 TypeScript/TSX files

### Coverage Statistics

| Metric | Value |
|--------|-------|
| **Total Translation Keys** | 707 |
| **Namespaces** | 6 active + 11 defined |
| **English Coverage** | 15.7% (111/707) |
| **Norwegian Coverage** | 21.1% (149/707) |

### Health by Namespace

| Namespace | Total Keys | EN Coverage | NO Coverage | Priority |
|-----------|------------|-------------|-------------|----------|
| `admin` | 31 | ✅ 100% | ✅ 100% | Done |
| `common` | 527 | 🔴 8.7% | 🔴 8.7% | CRITICAL |
| `user` | 61 | 🟡 42.6% | 🟡 42.6% | High |
| `facility` | 21 | 🟡 33.3% | ✅ 81.0% | High |
| `support` | 65 | 🔴 0% | 🟡 43.1% | Critical |

---

## Getting Started

### For Developers

1. **Read the Quick Reference**
   ```bash
   cat TRANSLATION_QUICK_REFERENCE.md
   ```

2. **Check Current Status**
   ```bash
   python3 analyze_translations.py
   ```

3. **Use Proper Translation Keys**
   ```typescript
   // ✅ Good
   t('common:actions.save')

   // ❌ Bad (hardcoded Norwegian)
   t('Lagre')
   ```

### For Translators

1. **Review Missing Keys**
   ```bash
   cat MISSING_TRANSLATIONS.json
   ```

2. **Prioritize by Namespace**
   - Start with `common` (481 missing keys)
   - Then `support` (65 missing keys)
   - Then `user` (35 missing keys)

3. **Use Translation Files**
   - Edit `/public/locales/en/{namespace}.json`
   - Edit `/public/locales/no/{namespace}.json`

### For Project Managers

1. **Review Executive Summary**
   ```bash
   cat TRANSLATION_ANALYSIS_SUMMARY.md
   ```

2. **Track Progress**
   - Run analysis weekly: `python3 analyze_translations.py`
   - Monitor coverage percentage
   - Check namespace completion

---

## Documentation Files

### 1. TRANSLATION_QUICK_REFERENCE.md

**Target Audience:** Developers
**Contents:**
- Quick start guide
- Available namespaces
- Best practices (DO's and DON'Ts)
- Common patterns for actions, status, navigation
- Step-by-step guide for adding translations
- Troubleshooting tips
- Code examples from the codebase

**When to use:**
- Writing new features
- Adding translation keys
- Debugging translation issues
- Learning translation conventions

### 2. TRANSLATION_ANALYSIS_SUMMARY.md

**Target Audience:** Project Managers, Team Leads
**Contents:**
- Executive summary with key findings
- Coverage statistics and charts
- Namespace health breakdown
- Critical issues identified
- Priority recommendations (P1, P2, P3)
- Milestone tracking
- Team action items

**When to use:**
- Sprint planning
- Resource allocation
- Progress tracking
- Stakeholder reporting

### 3. TRANSLATION_GLOSSARY.md

**Target Audience:** Translators, Developers, QA
**Contents:**
- All 707 translation keys found in codebase
- Current EN and NO values
- File locations for each key
- Status indicators (✅ complete, ❌ missing)
- Organized by namespace

**When to use:**
- Finding specific translation keys
- Verifying translations exist
- Understanding key usage across files
- Quality assurance testing

### 4. MISSING_TRANSLATIONS.json

**Target Audience:** Translators
**Contents:**
- Structured JSON with all missing translations
- Organized by language (en/no) and namespace
- Nested structure matching translation file format
- Placeholder values for easy identification

**When to use:**
- Bulk translation workflows
- Importing into translation management tools
- Tracking translation work
- Identifying gaps systematically

---

## Tools & Scripts

### analyze_translations.py

**Purpose:** Automated translation analysis and reporting

**Features:**
- Scans all TypeScript/TSX files for translation usage
- Extracts keys with pattern matching
- Compares against existing translation files
- Generates comprehensive reports
- Identifies missing translations
- Calculates coverage statistics

**Usage:**
```bash
# Run analysis
python3 analyze_translations.py

# Output files:
# - TRANSLATION_GLOSSARY.md
# - MISSING_TRANSLATIONS.json
# - Console statistics
```

**When to run:**
- Before starting translation work
- After adding new features
- Weekly for progress tracking
- Before releases
- When translation issues are reported

**Dependencies:**
- Python 3.x
- Standard library only (no external packages)

---

## Workflow

### Adding New Features with Translations

```
1. Write component code
   ↓
2. Use proper translation keys (t('namespace:key.path'))
   ↓
3. Add translations to EN and NO JSON files
   ↓
4. Run analyze_translations.py to verify
   ↓
5. Test in both languages
   ↓
6. Commit (translations + code together)
```

### Fixing Existing Translation Issues

```
1. Run analyze_translations.py
   ↓
2. Review TRANSLATION_GLOSSARY.md for missing keys
   ↓
3. For each missing key:
   a. Add to /public/locales/en/{namespace}.json
   b. Add to /public/locales/no/{namespace}.json
   ↓
4. Re-run analyze_translations.py to verify
   ↓
5. Test affected components
   ↓
6. Commit changes
```

### Migration from Hardcoded Strings

```
1. Run analyze_translations.py
   ↓
2. Identify hardcoded Norwegian strings in code
   (Look for patterns like t('Lagre') instead of t('common:actions.save'))
   ↓
3. For each hardcoded string:
   a. Create proper key in translation files
   b. Replace hardcoded usage with key
   ↓
4. Re-run analyze_translations.py
   ↓
5. Test all affected pages
   ↓
6. Commit changes
```

---

## FAQs

### Q: Where do I add new translation keys?

**A:** Add to both:
- `/public/locales/en/{namespace}.json`
- `/public/locales/no/{namespace}.json`

Choose the appropriate namespace (common, admin, user, facility, etc.)

### Q: How do I know if a translation key exists?

**A:** Three ways:
1. Run `python3 analyze_translations.py`
2. Check `TRANSLATION_GLOSSARY.md`
3. Look directly in the JSON files

### Q: What namespace should I use?

**A:** Follow these guidelines:
- **common**: UI elements, buttons, actions, messages
- **admin**: Admin-specific features
- **user**: User dashboard, profile, settings
- **facility/facilities**: Facility-related content
- **booking/bookings**: Booking process and management
- **auth**: Authentication and registration
- **navigation**: Menu items, breadcrumbs

### Q: Why is coverage so low (15.7%)?

**A:** Main reasons:
1. Many hardcoded Norwegian strings being used as keys
2. Developers using translation keys before adding to files
3. Lack of validation in development workflow
4. Historical debt from rapid development

### Q: How do I fix hardcoded Norwegian strings?

**A:**
1. Find: `t('Lagre')`
2. Create proper key in common.json:
   ```json
   {
     "actions": {
       "save": "Save"  // EN
       "save": "Lagre" // NO
     }
   }
   ```
3. Replace: `t('common:actions.save')`

### Q: How often should I run the analysis?

**A:**
- **Developers**: Before committing translation changes
- **Team**: Weekly during active development
- **Releases**: Before every release
- **Ad-hoc**: When translation issues are reported

### Q: Can I use the analysis tool in CI/CD?

**A:** Yes! Add to your pipeline:
```yaml
# Example GitHub Actions
- name: Check Translation Coverage
  run: |
    python3 analyze_translations.py
    # Add validation logic here
```

### Q: What's the target coverage?

**A:**
- **Minimum (P0)**: 80% within 1 month
- **Target (P1)**: 95% within 2 months
- **Ideal (P2)**: 100% for production release

### Q: How do I contribute translations?

**A:**
1. Fork/clone the repository
2. Edit translation JSON files
3. Run analysis to verify
4. Submit pull request
5. Include before/after coverage stats

---

## Priority Action Items

### 🔴 Critical (This Week)

- [ ] Fix all hardcoded Norwegian strings (~150-200 occurrences)
- [ ] Create `/public/locales/en/support.json`
- [ ] Fix invalid namespace usage in `UsersRolesPage.tsx`

### 🟡 High Priority (Next 2 Weeks)

- [ ] Complete `common` namespace (481 missing keys)
- [ ] Complete `user` namespace (35 missing keys)
- [ ] Complete `facility` namespace (14 missing EN keys)

### 🟢 Medium Priority (Next Month)

- [ ] Add translation validation to pre-commit hooks
- [ ] Create translation guidelines document
- [ ] Set up automated testing for translations
- [ ] Achieve 80%+ coverage for both languages

---

## Maintenance

### Weekly Tasks

```bash
# Run analysis
python3 analyze_translations.py

# Review changes
git diff TRANSLATION_GLOSSARY.md

# Update team on progress
# Report coverage percentage improvement
```

### Monthly Tasks

- Review all namespaces for consistency
- Archive old/unused keys
- Update documentation
- Conduct translation sprint if needed

### Release Tasks

- Run full analysis
- Ensure all user-facing features are translated
- Test language switching
- Verify no hardcoded strings in new features

---

## Getting Help

### Issues or Questions?

1. **Check documentation first**
   - Quick Reference for dev questions
   - Analysis Summary for project questions
   - Glossary for specific key lookups

2. **Run the analysis tool**
   ```bash
   python3 analyze_translations.py
   ```

3. **Contact**
   - Development team for technical issues
   - Project manager for resource allocation
   - Translation team for language questions

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-27 | 1.0 | Initial translation system documentation |
| 2025-10-27 | 1.0 | Analysis showing 15.7% EN, 21.1% NO coverage |

---

## Appendix

### File Locations

```
booknor/
├── public/
│   └── locales/
│       ├── en/           # English translations
│       │   ├── admin.json
│       │   ├── common.json
│       │   └── ...
│       └── no/           # Norwegian translations
│           ├── admin.json
│           ├── common.json
│           └── ...
├── src/
│   ├── i18n/             # i18n configuration
│   └── ...
├── analyze_translations.py              # Analysis tool
├── TRANSLATION_QUICK_REFERENCE.md       # Developer guide
├── TRANSLATION_ANALYSIS_SUMMARY.md      # Executive summary
├── TRANSLATION_GLOSSARY.md              # Complete glossary
├── MISSING_TRANSLATIONS.json            # Missing keys JSON
└── TRANSLATIONS_README.md               # This file
```

### Key Statistics (Current)

```
Total Keys:               707
Keys with Namespace:      214 (30.3%)
Keys without Namespace:   493 (69.7%)

English Coverage:         15.7% (111/707 keys)
Norwegian Coverage:       21.1% (149/707 keys)

Missing English:          596 keys
Missing Norwegian:        558 keys

Namespaces:               17 defined, 6 actively used
Source Files:             346 .ts/.tsx files
```

---

**Last Updated:** October 27, 2025
**Next Review:** November 3, 2025

*For the latest information, run `python3 analyze_translations.py`*
