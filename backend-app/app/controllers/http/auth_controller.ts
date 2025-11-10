import type { HttpContext } from '@adonisjs/core/http'
import supabaseService from '#services/supabase_service'

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    try {
      const { email, password, name, business } = request.only(['email', 'password', 'name', 'business'])

      // Validate required fields
      if (!email || !password || !name) {
        return response.badRequest({
          message: 'Email, password, and name are required',
        })
      }

      const supabase = supabaseService.getClient()

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            business: business || null,
          },
        },
      })

      if (authError) {
        return response.badRequest({
          message: authError.message,
        })
      }

      return response.created({
        message: 'User registered successfully',
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          name,
        },
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to register user',
        error: error.message,
      })
    }
  }

  /**
   * Login user
   */
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      // Validate required fields
      if (!email || !password) {
        return response.badRequest({
          message: 'Email and password are required',
        })
      }

      const supabase = supabaseService.getClient()

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        return response.unauthorized({
          message: authError.message,
        })
      }

      return response.ok({
        message: 'Login successful',
        token: authData.session?.access_token,
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          name: authData.user?.user_metadata?.name,
        },
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to login',
        error: error.message,
      })
    }
  }

  /**
   * Logout user
   */
  async logout({ request, response }: HttpContext) {
    try {
      const supabase = supabaseService.getClient()

      // Get token from Authorization header
      const authHeader = request.header('Authorization')
      if (!authHeader) {
        return response.unauthorized({
          message: 'No authorization token provided',
        })
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        return response.badRequest({
          message: error.message,
        })
      }

      return response.ok({
        message: 'Logout successful',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to logout',
        error: error.message,
      })
    }
  }
}
