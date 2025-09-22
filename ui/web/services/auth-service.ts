// Simple authentication service for the admin panel

export interface AuthToken {
  sub: string // username
  exp: number // expiration timestamp
  // Add other claims as needed
}

export class AuthService {
  // Decode JWT token (simplified version)
  static decodeToken(token: string): AuthToken | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  // Check if token is expired
  static isTokenExpired(token: AuthToken): boolean {
    const now = Math.floor(Date.now() / 1000)
    return token.exp < now
  }

  // Verify token
  static verifyToken(token: string): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded) return false
    
    return !this.isTokenExpired(decoded)
  }

  // Get username from token
  static getUsernameFromToken(token: string): string | null {
    const decoded = this.decodeToken(token)
    if (!decoded) return null
    
    return decoded.sub
  }
}