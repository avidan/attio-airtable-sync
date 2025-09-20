import OAuthService from './oauthService'

class AttioOAuth {
  constructor() {
    this.clientId = import.meta.env.VITE_ATTIO_CLIENT_ID
    this.clientSecret = import.meta.env.VITE_ATTIO_CLIENT_SECRET
    this.authUrl = 'https://app.attio.com/oauth/authorize'
    this.tokenUrl = 'https://app.attio.com/oauth/token'
    this.apiBaseUrl = 'https://api.attio.com/v2'
    this.redirectUri = window.location.origin + '/oauth/callback/attio'
  }

  // Start OAuth flow
  startOAuthFlow() {
    const state = OAuthService.generateState()

    // Store state for verification
    OAuthService.storeOAuthData('attio', { state })

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state: state,
      scope: 'read write' // Adjust scopes as needed
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
    const storedData = OAuthService.getOAuthData('attio')
    if (!storedData || storedData.state !== state) {
      throw new Error('Invalid OAuth state')
    }

    try {
      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(code)

      // Store tokens
      OAuthService.storeTokens('attio', tokens)

      // Clear OAuth data
      OAuthService.clearOAuthData('attio')

      return tokens
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.message}`)
    }
  }

  // Exchange authorization code for access token
  async exchangeCodeForTokens(code) {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error_description || 'Token exchange failed')
    }

    return await response.json()
  }

  // Refresh access token
  async refreshToken() {
    const tokens = OAuthService.getTokens('attio')
    if (!tokens || !tokens.refresh_token) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error_description || 'Token refresh failed')
    }

    const newTokens = await response.json()
    OAuthService.storeTokens('attio', newTokens)

    return newTokens
  }

  // Get valid access token (refresh if needed)
  async getAccessToken() {
    if (OAuthService.areTokensValid('attio')) {
      return OAuthService.getTokens('attio').access_token
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
    return OAuthService.areTokensValid('attio')
  }

  // Logout
  logout() {
    OAuthService.clearTokens('attio')
    OAuthService.clearOAuthData('attio')
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
      throw new Error(errorData.message || `API request failed: ${response.status}`)
    }

    return await response.json()
  }
}

export default new AttioOAuth()
