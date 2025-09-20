import CryptoJS from 'crypto-js'

class OAuthService {
  constructor() {
    this.redirectUri = window.location.origin + '/oauth/callback'
  }

  // Generate PKCE challenge for Airtable
  generatePKCEChallenge() {
    const codeVerifier = this.generateCodeVerifier()
    const codeChallenge = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64url)

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256'
    }
  }

  generateCodeVerifier() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Store OAuth state and PKCE data
  storeOAuthData(service, data) {
    localStorage.setItem(`oauth_${service}`, JSON.stringify(data))
  }

  // Retrieve OAuth state and PKCE data
  getOAuthData(service) {
    const data = localStorage.getItem(`oauth_${service}`)
    return data ? JSON.parse(data) : null
  }

  // Clear OAuth data
  clearOAuthData(service) {
    localStorage.removeItem(`oauth_${service}`)
  }

  // Store tokens securely
  storeTokens(service, tokens) {
    localStorage.setItem(`tokens_${service}`, JSON.stringify({
      ...tokens,
      timestamp: Date.now()
    }))
  }

  // Get stored tokens
  getTokens(service) {
    const data = localStorage.getItem(`tokens_${service}`)
    return data ? JSON.parse(data) : null
  }

  // Check if tokens are valid
  areTokensValid(service) {
    const tokens = this.getTokens(service)
    if (!tokens) return false

    // Check if tokens are expired (with 5 minute buffer)
    const expiryTime = tokens.timestamp + (tokens.expires_in * 1000) - (5 * 60 * 1000)
    return Date.now() < expiryTime
  }

  // Clear tokens
  clearTokens(service) {
    localStorage.removeItem(`tokens_${service}`)
  }
}

export default new OAuthService()
