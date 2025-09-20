import OAuthService from './oauthService'

class AirtableOAuth {
  constructor() {
    this.clientId = import.meta.env.VITE_AIRTABLE_CLIENT_ID
    this.clientSecret = import.meta.env.VITE_AIRTABLE_CLIENT_SECRET
    this.authUrl = 'https://airtable.com/oauth2/v1/authorize'
    this.tokenUrl = 'https://airtable.com/oauth2/v1/token'
    this.apiBaseUrl = 'https://api.airtable.com/v0'
    this.redirectUri = window.location.origin + '/oauth/callback/airtable'
  }

  // Start OAuth flow with PKCE
  startOAuthFlow() {
    const state = OAuthService.generateState()
    const pkce = OAuthService.generatePKCEChallenge()

    // Store state and PKCE data for verification
    OAuthService.storeOAuthData('airtable', {
      state,
      codeVerifier: pkce.codeVerifier
    })

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state: state,
      scope: 'data.records:read data.records:write data.recordComments:read data.recordComments:write schema.bases:read schema.bases:write',
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.codeChallengeMethod
    })

    const authUrl = `${this.authUrl}?${params.toString()}`
    window.location.href = authUrl
  }

  // Handle OAuth callback
  async handleCallback(code, state, error) {
    if (error) {
      throw new Error(`OAuth error: ${error}`)
    }

    // Verify state
    const storedData = OAuthService.getOAuthData('airtable')
    if (!storedData || storedData.state !== state) {
      throw new Error('Invalid OAuth state')
    }

    try {
      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(code, storedData.codeVerifier)

      // Store tokens
      OAuthService.storeTokens('airtable', tokens)

      // Clear OAuth data
      OAuthService.clearOAuthData('airtable')

      return tokens
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.message}`)
    }
  }

  // Exchange authorization code for access token with PKCE
  async exchangeCodeForTokens(code, codeVerifier) {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: codeVerifier
    })

    // Add client_secret if available (recommended but optional)
    if (this.clientSecret) {
      params.append('client_secret', this.clientSecret)
    }

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Token exchange error:', errorData)
      throw new Error('Token exchange failed')
    }

    return await response.json()
  }

  // Refresh access token
  async refreshToken() {
    const tokens = OAuthService.getTokens('airtable')
    if (!tokens || !tokens.refresh_token) {
      throw new Error('No refresh token available')
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      client_id: this.clientId
    })

    if (this.clientSecret) {
      params.append('client_secret', this.clientSecret)
    }

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Token refresh error:', errorData)
      throw new Error('Token refresh failed')
    }

    const newTokens = await response.json()
    OAuthService.storeTokens('airtable', newTokens)

    return newTokens
  }

  // Get valid access token (refresh if needed)
  async getAccessToken() {
    if (OAuthService.areTokensValid('airtable')) {
      return OAuthService.getTokens('airtable').access_token
    }

    try {
      const newTokens = await this.refreshToken()
      return newTokens.access_token
    } catch (error) {
      // Refresh failed, need to re-authenticate
      throw new Error('Authentication required')
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return OAuthService.areTokensValid('airtable')
  }

  // Logout
  logout() {
    OAuthService.clearTokens('airtable')
    OAuthService.clearOAuthData('airtable')
  }

  // Make authenticated API request
  async apiRequest(endpoint, options = {}) {
    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token invalid, clear tokens and require re-auth
        this.logout()
        throw new Error('Authentication required')
      }

      const errorData = await response.json()
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`)
    }

    return await response.json()
  }

  // Get user's accessible bases
  async getBases() {
    return await this.apiRequest('/meta/bases')
  }

  // Get base schema
  async getBaseSchema(baseId) {
    return await this.apiRequest(`/meta/bases/${baseId}/tables`)
  }
}

export default new AirtableOAuth()
