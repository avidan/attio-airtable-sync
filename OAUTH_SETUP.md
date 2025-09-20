# OAuth Setup Guide

This guide walks you through setting up OAuth authentication for both Attio CRM and Airtable.

## 🔐 Prerequisites

Before you begin, make sure you have:
- Developer accounts for both Attio and Airtable
- Admin access to your Attio workspace
- Owner/Creator access to your Airtable base

## 🏗️ Attio OAuth Setup

### Step 1: Request Developer Access
1. Contact Attio support via live chat or email support@attio.com
2. Request developer access for OAuth integration
3. Wait for approval (typically takes 2-3 business days)
4. You'll receive access to a developer account with test data

### Step 2: Create OAuth App
1. Log into your Attio developer account
2. Navigate to **Settings** → **Apps & Integrations**
3. Click **"Create New App"**
4. Fill in the app details:
   - **App Name**: `Attio Airtable Sync`
   - **Description**: `Sync data between Attio and Airtable`
   - **Website URL**: `http://localhost:5173` (for development)

### Step 3: Configure OAuth
1. In your app settings, enable **OAuth 2.0**
2. Add redirect URIs:
   - `http://localhost:5173/oauth/callback/attio` (development)
   - `https://yourdomain.com/oauth/callback/attio` (production)
3. Set required scopes:
   - `read`: Read access to workspace data
   - `write`: Write access to workspace data
4. Save your configuration

### Step 4: Get Credentials
1. Note down your **Client ID**
2. Generate and securely store your **Client Secret**
3. Add these to your `.env` file:

```env
VITE_ATTIO_CLIENT_ID=your_client_id_here
VITE_ATTIO_CLIENT_SECRET=your_client_secret_here
```

## 📊 Airtable OAuth Setup

### Step 1: Create OAuth Integration
1. Visit the [Airtable Developer Hub](https://airtable.com/developers/web)
2. Click **"Create new integration"**
3. Fill in the integration details:
   - **Integration name**: `Attio Airtable Sync`
   - **Description**: `Sync data between Attio CRM and Airtable`
   - **Integration logo**: Upload a logo (optional)

### Step 2: Configure OAuth Settings
1. In the **OAuth** section:
   - **Redirect URLs**: 
     - `http://localhost:5173/oauth/callback/airtable` (development)
     - `https://yourdomain.com/oauth/callback/airtable` (production)
   - **Scopes**: Select the following scopes:
     - `data.records:read` - Read records
     - `data.records:write` - Create/update records
     - `data.recordComments:read` - Read record comments
     - `data.recordComments:write` - Create record comments
     - `schema.bases:read` - Read base schema
     - `schema.bases:write` - Modify base schema

### Step 3: Get Credentials
1. Copy your **Client ID**
2. Generate a **Client Secret** (optional but recommended)
3. Add these to your `.env` file:

```env
VITE_AIRTABLE_CLIENT_ID=your_client_id_here
VITE_AIRTABLE_CLIENT_SECRET=your_client_secret_here
```

## ⚙️ Environment Configuration

Create a `.env` file in your project root with all the OAuth credentials:

```env
# Attio OAuth Configuration
VITE_ATTIO_CLIENT_ID=your_attio_client_id
VITE_ATTIO_CLIENT_SECRET=your_attio_client_secret

# Airtable OAuth Configuration  
VITE_AIRTABLE_CLIENT_ID=your_airtable_client_id
VITE_AIRTABLE_CLIENT_SECRET=your_airtable_client_secret

# App Configuration
VITE_APP_NAME=Attio Airtable Sync
VITE_APP_URL=http://localhost:5173
```

## 🚀 Testing OAuth Flows

### Development Testing
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:5173`
3. Click "Connect to Attio" - you should be redirected to Attio's OAuth page
4. Click "Connect to Airtable" - you should be redirected to Airtable's OAuth page
5. Grant permissions and verify you're redirected back successfully

### Production Deployment
1. Update your redirect URIs in both Attio and Airtable to use your production domain
2. Update your `.env` file with production URLs
3. Deploy your application
4. Test the OAuth flows in production

## 🛡️ Security Best Practices

### Client Secret Handling
- **Development**: Store in `.env` file (never commit to git)
- **Production**: Use environment variables or secure secret management
- **Frontend**: Client secrets are optional for PKCE flows but recommended for security

### PKCE (Proof Key for Code Exchange)
- Airtable OAuth automatically uses PKCE for enhanced security
- This prevents authorization code interception attacks
- The app automatically generates and manages PKCE challenges

### Token Security
- Tokens are stored in localStorage (consider more secure alternatives for production)
- Tokens are automatically refreshed when expired
- Users can disconnect/revoke access at any time

## 🔧 Troubleshooting

### Common Issues

**"Invalid client_id" Error**
- Verify your client ID is correct in the `.env` file
- Ensure you're using the right environment (dev vs prod)

**"Mismatched redirect_uri" Error**
- Check that redirect URIs match exactly in OAuth settings
- Include protocol (http/https) and port numbers

**"Insufficient Permissions" Error**
- Verify you have the required scopes enabled
- Check that your Attio workspace has necessary permissions

**Token Refresh Failures**
- Clear localStorage and re-authenticate
- Check that refresh tokens haven't expired
- Verify client credentials are still valid

### Support Resources
- [Attio Developer Documentation](https://docs.attio.com)
- [Airtable API Documentation](https://airtable.com/developers/web/api/introduction)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)

## 📋 OAuth Flow Summary

### Attio OAuth Flow
1. User clicks "Connect to Attio"
2. Redirected to `https://app.attio.com/oauth/authorize`
3. User grants permissions
4. Redirected to `/oauth/callback/attio` with authorization code
5. App exchanges code for access/refresh tokens
6. Tokens stored securely for API requests

### Airtable OAuth Flow (with PKCE)
1. User clicks "Connect to Airtable"
2. App generates PKCE challenge
3. Redirected to `https://airtable.com/oauth2/v1/authorize` with challenge
4. User grants permissions
5. Redirected to `/oauth/callback/airtable` with authorization code
6. App exchanges code + PKCE verifier for tokens
7. Tokens stored securely for API requests

Both flows include automatic token refresh handling and secure token management.