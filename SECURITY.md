# Security Policy

## 🔒 Reporting Security Issues

If you discover a security vulnerability in this project, please report it by emailing the maintainers. Please do not create public GitHub issues for security vulnerabilities.

## 🛡️ Security Best Practices

### Firebase Credentials

**CRITICAL**: Never commit Firebase credentials to the repository!

- ✅ Use `.env.local` for environment variables
- ✅ Keep `*firebase-adminsdk*.json` files local only
- ✅ Add sensitive files to `.gitignore`
- ❌ Never commit API keys or service account files
- ❌ Never share credentials in public channels

### Password Security

- Passwords are hashed using SHA-256
- Default admin password should be changed immediately after first login
- Minimum password length: 6 characters
- Consider implementing stronger hashing (bcrypt) for production

### Access Control

- Role-based access control (RBAC) implemented
- 5 user roles: Admin, HR, Direktur, Manager, User
- Each role has specific permissions
- Admin-only features are protected

### Data Protection

- Input validation on all forms
- Sanitization of user inputs
- XSS protection through React's built-in escaping
- CSRF protection through Firebase authentication

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 📋 Security Checklist for Deployment

- [ ] Change default admin password
- [ ] Set up Firebase security rules
- [ ] Enable Firebase App Check
- [ ] Configure CORS properly
- [ ] Use HTTPS in production
- [ ] Set up rate limiting
- [ ] Enable Firebase audit logs
- [ ] Regular security updates for dependencies
- [ ] Implement proper error handling (no sensitive data in errors)
- [ ] Set up monitoring and alerts

## 🚨 Known Security Considerations

1. **Password Hashing**: Currently using SHA-256. Consider upgrading to bcrypt or Argon2 for production.
2. **Session Management**: Using localStorage for session persistence. Consider using httpOnly cookies for enhanced security.
3. **File Upload**: Implement file type validation and size limits for candidate photos.
4. **Rate Limiting**: Not implemented. Consider adding rate limiting for API calls.

## 📚 Additional Resources

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## 🔄 Security Updates

This project should be regularly updated to patch security vulnerabilities:

```bash
npm audit
npm audit fix
```

## 📞 Contact

For security concerns, please contact the project maintainers.

---

Last updated: April 28, 2026
