# Security Guidelines for Token Storage

## Overview
This application requires API tokens for both Attio and Airtable. Proper token management is crucial for security.

## Secure Token Storage

### Local Development (.env.local)
For development, store tokens in `.env.local`:

```bash
# Attio Configuration
VITE_ATTIO_TOKEN=your_attio_personal_access_token_here
VITE_ATTIO_OBJECT_ID=your_attio_object_id_here

# Airtable Configuration  
VITE_AIRTABLE_TOKEN=your_airtable_personal_access_token_here
VITE_AIRTABLE_BASE_ID=your_airtable_base_id_here

# Optional: Auto-load tokens on startup
VITE_AUTO_LOAD_TOKENS=true
```

### Security Best Practices

#### 1. File Permissions
Ensure `.env.local` has restricted permissions:
```bash
chmod 600 .env.local
```

#### 2. Git Exclusion
The `.env.local` file is automatically excluded by `.gitignore`. Never commit tokens to version control.

#### 3. Token Rotation
- Rotate tokens regularly (monthly recommended)
- Immediately rotate if compromised
- Use tokens with minimal required permissions

#### 4. Environment Separation
- Use different tokens for development/production
- Never use production tokens in development

### Token Permissions

#### Attio Token Requirements
Your Attio Personal Access Token needs:
- Read access to objects
- Read access to records
- Write access for sync operations (if enabled)

#### Airtable Token Requirements
Your Airtable Personal Access Token needs:
- Read access to bases and tables
- Write access for sync operations (if enabled)

### Production Deployment

For production deployments:

1. **Environment Variables**: Use your hosting platform's environment variable system
2. **Secret Management**: Consider using dedicated secret management services
3. **Token Monitoring**: Monitor token usage for suspicious activity
4. **Access Logging**: Enable API access logging where possible

### Security Checklist

- [ ] `.env.local` file permissions set to 600
- [ ] Tokens have minimal required permissions
- [ ] Different tokens used for dev/prod environments
- [ ] Regular token rotation schedule established
- [ ] Access monitoring configured
- [ ] Team members educated on token security

### Incident Response

If tokens are compromised:

1. **Immediate**: Revoke compromised tokens from API provider
2. **Generate**: Create new tokens with minimal permissions
3. **Update**: Update all applications using the tokens
4. **Monitor**: Watch for unauthorized access attempts
5. **Review**: Audit how the compromise occurred

### Contact

For security concerns or questions about token management, review the API documentation:
- [Attio API Documentation](https://developers.attio.com/)
- [Airtable API Documentation](https://airtable.com/developers/web/api/introduction)