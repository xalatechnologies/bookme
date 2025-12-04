# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The BookMe team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them through one of the following methods:

1. **Email** (Preferred): Send details to security@[your-domain].com
2. **GitHub Security Advisory**: Use GitHub's [security advisory feature](https://github.com/your-org/bookme-1/security/advisories/new)

### What to Include

Please include the following information in your report:

- **Description**: Clear description of the vulnerability
- **Impact**: What can an attacker do?
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Proof of Concept**: Code, screenshots, or video demonstration
- **Environment**: Browser, OS, app version, etc.
- **Suggested Fix** (if any): Your recommendations

### Example Report

```
Subject: [SECURITY] SQL Injection in Facility Search

Description:
The facility search endpoint is vulnerable to SQL injection attacks.

Impact:
An attacker can extract sensitive database information or modify data.

Steps to Reproduce:
1. Navigate to /facilities/search
2. Enter: ' OR 1=1 --
3. Submit search form

Proof of Concept:
[Screenshot or code snippet]

Environment:
- Browser: Chrome 120
- OS: macOS 14.0
- Version: 1.0.0

Suggested Fix:
Use parameterized queries instead of string concatenation.
```

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Status Updates**: Every 2 weeks
- **Resolution Target**: Varies by severity

### Severity Levels

**Critical** (Fix within 7 days)
- Remote code execution
- Data breach potential
- Authentication bypass

**High** (Fix within 30 days)
- Privilege escalation
- SQL injection
- XSS vulnerabilities

**Medium** (Fix within 90 days)
- CSRF vulnerabilities
- Information disclosure
- Session issues

**Low** (Fix in next release)
- Minor information leaks
- Non-critical issues

## Security Measures

### Current Protections

#### Authentication & Authorization
- Supabase authentication with secure token handling
- Row Level Security (RLS) policies
- Role-based access control (RBAC)
- Secure session management

#### Data Protection
- HTTPS enforced in production
- Environment variables for sensitive data
- No hardcoded secrets in code
- Input validation and sanitization

#### Frontend Security
- Content Security Policy (CSP)
- XSS protection
- CSRF tokens
- Secure cookie settings

#### API Security
- Rate limiting
- Input validation
- SQL injection prevention (parameterized queries)
- API authentication

#### Dependency Management
- Regular dependency updates
- Automated security scanning (planned)
- No known vulnerable dependencies

### Best Practices

#### For Developers

1. **Never commit secrets**
   ```bash
   # Use .env files (gitignored)
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   ```

2. **Validate all input**
   ```typescript
   // ✅ Good
   const sanitized = z.string().email().parse(input);
   
   // ❌ Bad
   const email = req.body.email; // No validation
   ```

3. **Use security headers**
   ```typescript
   // Set in vercel.json or server config
   headers: {
     'X-Frame-Options': 'DENY',
     'X-Content-Type-Options': 'nosniff',
     // ...
   }
   ```

4. **Escape user content**
   ```tsx
   // React automatically escapes
   <div>{userInput}</div>
   
   // Be careful with dangerouslySetInnerHTML
   ```

#### For Users

1. **Use strong passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Unique per service

2. **Enable 2FA** (if available)
   - Use authenticator apps
   - Keep backup codes secure

3. **Keep software updated**
   - Use latest browser version
   - Update operating system
   - Clear cache regularly

## Disclosure Policy

### Responsible Disclosure

- We follow responsible disclosure practices
- Security researchers will be credited (with permission)
- We'll coordinate disclosure timing with reporters

### Timeline

1. **Day 0**: Vulnerability reported
2. **Day 2**: Acknowledgment sent
3. **Day 7**: Assessment complete
4. **Day X**: Fix developed and tested
5. **Day Y**: Fix deployed to production
6. **Day Y+7**: Public disclosure (coordinated)

### Public Disclosure

After a fix is deployed:
- Security advisory published on GitHub
- CHANGELOG updated with security note
- Credits given to reporter (if approved)
- Users notified of critical updates

## Security Updates

### Notification Methods

- GitHub Security Advisories
- Release notes in CHANGELOG
- Email notifications (for critical issues)
- Social media announcements

### Update Process

1. **Review** security advisory
2. **Update** to latest version
3. **Test** application functionality
4. **Monitor** for issues

## Security Checklist

### For Production Deployments

- [ ] All environment variables set correctly
- [ ] HTTPS enabled and enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info
- [ ] Logging configured (without sensitive data)
- [ ] Database backups enabled
- [ ] RLS policies reviewed
- [ ] Dependencies up to date
- [ ] Security scanning completed

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [React Security Best Practices](https://react.dev/learn/escape-hatches#security-pitfalls)

## Contact

For security concerns:
- **Email**: security@[your-domain].com
- **GitHub**: [Security Advisory](https://github.com/your-org/bookme-1/security/advisories/new)

For general questions:
- See [CONTRIBUTING.md](CONTRIBUTING.md)
- Open a public issue (for non-security topics)

---

**Thank you for helping keep BookMe and our users safe!** 🔒
