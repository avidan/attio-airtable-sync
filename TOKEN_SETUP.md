# 🔐 Token-Based Authentication Setup

This guide walks you through setting up secure token-based authentication for both Attio CRM and Airtable.

## Overview

The application now uses Personal Access Tokens instead of OAuth for simpler, more direct API access. This approach provides:

- ✅ **Simplified Setup** - No complex OAuth flows
- 🔐 **Secure Authentication** - Direct token-based access
- ⚡ **Faster Development** - No redirect URIs to configure
- 🎯 **Professional Control** - Enterprise-grade token management

## 🏢 Attio CRM Token Setup

### Step 1: Generate API Token

1. **Log into Attio**
   - Visit [app.attio.com](https://app.attio.com)
   - Log in to your workspace

2. **Navigate to API Settings**
   - Go to **Settings** → **Apps & Integrations**
   - Click on **API** or **Developer Tools**

3. **Create New Token**
   - Click **"Generate New API Key"** or **"Create Token"**
   - Give it a descriptive name: `DataSync Pro Integration`
   - Select appropriate permissions:
     - ✅ **Read** - View workspace data
     - ✅ **Write** - Create and update records
     - ✅ **Admin** - Manage workspace settings (if needed)

4. **Copy Token Securely**
   - Copy the generated token immediately
   - Store it securely (it won't be shown again)
   - The token format: `att_1234567890abcdef...`

### Step 2: Get Workspace Information

1. **Find Workspace ID** (Optional)
   - In your Attio URL, note the workspace identifier
   - Or leave blank to use the default workspace

2. **Test Access**
   - You can test the token manually:
   ```bash
   curl -H "Authorization: Bearer att_your_token_here" \
        https://api.attio.com/v2/workspaces
   ```

## 📊 Airtable Token Setup

### Step 1: Create Personal Access Token

1. **Visit Developer Hub**
   - Go to [airtable.com/developers/web/api/introduction](https://airtable.com/developers/web/api/introduction)
   - Sign in to your Airtable account

2. **Generate Token**
   - Click **"Generate token"** or **"Create new token"**
   - Name: `DataSync Pro Integration`
   - Select scopes:
     - ✅ `data.records:read` - Read records
     - ✅ `data.records:write` - Create/update records
     - ✅ `data.recordComments:read` - Read comments
     - ✅ `data.recordComments:write` - Write comments
     - ✅ `schema.bases:read` - Read base schema
     - ✅ `schema.bases:write` - Modify schema (if needed)

3. **Select Bases**
   - Choose which bases this token can access
   - Select only the bases you want to sync

4. **Copy Token**
   - Copy the generated token: `patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXX`
   - Store securely

### Step 2: Get Base ID

1. **From Airtable URL**
   - Open your base in Airtable
   - URL format: `airtable.com/appXXXXXXXXXXXXXX/...`
   - Base ID is the `appXXXXXXXXXXXXXX` part

2. **From API Documentation**
   - Visit [airtable.com/api](https://airtable.com/api)
   - Select your base
   - Base ID is shown in the documentation

3. **Test Access**
   ```bash
   curl -H "Authorization: Bearer patYOUR_TOKEN_HERE" \
        https://api.airtable.com/v0/meta/bases/appYOUR_BASE_ID/tables
   ```

## 🚀 Using the Application

### Step 1: Launch Application

```bash
cd /Users/avidan/Development/attio-airtable-sync
npm run dev
```

### Step 2: Connect Services

1. **Attio Connection**
   - Enter your Attio API token
   - Optionally enter workspace ID
   - Click **"Connect to Attio"**
   - ✅ Success message confirms connection

2. **Airtable Connection**
   - Enter your Personal Access Token
   - Enter your Base ID (starts with `app`)
   - Click **"Connect to Airtable"**
   - ✅ Success message shows available tables

### Step 3: Professional Features

- **Real-time Validation** - Tokens are tested immediately
- **Secure Storage** - Tokens encrypted in browser storage
- **Connection Status** - Visual indicators show connection health
- **Error Handling** - Clear error messages for troubleshooting

## 🛡️ Security Best Practices

### Token Management

- **Never Share Tokens** - Keep tokens private and secure
- **Use Minimal Permissions** - Only grant necessary scopes
- **Regular Rotation** - Rotate tokens periodically
- **Secure Storage** - Never commit tokens to code repositories

### Application Security

- **Browser Storage** - Tokens stored securely in localStorage
- **HTTPS Only** - Always use secure connections
- **Token Expiry** - Monitor token expiration dates
- **Access Logs** - Review API access logs regularly

## 🔧 Troubleshooting

### Common Issues

**❌ "Invalid Token" Error**
- Verify token is copied correctly
- Check token hasn't expired
- Ensure proper permissions/scopes

**❌ "Base Not Found" Error**
- Verify Base ID format (`appXXXXXXXXXXXXXX`)
- Check token has access to the base
- Ensure base still exists

**❌ "Insufficient Permissions" Error**
- Review token scopes
- Check workspace/base access rights
- Verify account permissions

**❌ "Connection Timeout" Error**
- Check internet connection
- Verify API endpoints are accessible
- Try again after a moment

### Professional Support

1. **Connection Testing**
   - Use the built-in connection test
   - Check browser developer console
   - Verify API responses

2. **Token Validation**
   - Test tokens with curl commands
   - Check token expiration dates
   - Verify scope permissions

3. **Error Logs**
   - Check browser console for errors
   - Review network requests
   - Contact support if issues persist

## 📋 Token Information Summary

### Attio API Token
- **Format**: `att_xxxxxxxxxxxxxxxxxx`
- **Permissions**: Read, Write, (Admin optional)
- **Scope**: Workspace-level access
- **Documentation**: [Attio API Docs](https://docs.attio.com)

### Airtable Personal Access Token  
- **Format**: `patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXX`
- **Permissions**: Multiple scopes (records, schema, comments)
- **Scope**: Base-level access
- **Documentation**: [Airtable API Docs](https://airtable.com/developers/web/api)

## ⚡ Professional Features

- **Enterprise Authentication** - Secure token-based access
- **Real-time Connection Testing** - Instant validation
- **Professional UI/UX** - Sleek, modern interface
- **Comprehensive Error Handling** - Clear troubleshooting
- **Secure Token Management** - Encrypted local storage
- **Multi-service Integration** - Seamless CRM + Database sync

---

**Ready to sync your data professionally? Start by getting your tokens and launching the application!** 🚀