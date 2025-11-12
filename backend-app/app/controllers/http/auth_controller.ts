import type { HttpContext } from '@adonisjs/core/http'
import supabaseService from '#services/supabase_service'

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    try {
      const { email, password, business_name, phone, nit, role } = request.only(['email', 'password', 'business_name', 'phone', 'nit', 'role'])

      // Validate required fields
      if (!email || !password || !business_name || !phone || !nit || !role) {
        return response.badRequest({
          message: 'Email, password, business name, phone, NIT, and role are required',
        })
      }

      // Validate role
      if (role !== 'supermarket' && role !== 'ong' && role !== 'admin') {
        return response.badRequest({
          message: 'Role must be either "supermarket", "ong", or "admin"',
        })
      }

      const supabase = supabaseService.getClient()

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name,
            phone,
            nit,
            role,
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
          business_name,
          phone,
          nit,
          role,
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
      const { email, password, role } = request.only(['email', 'password', 'role'])

      // Validate required fields
      if (!email || !password) {
        return response.badRequest({
          message: 'Email and password are required',
        })
      }

      // Validate role if provided
      if (role && role !== 'supermarket' && role !== 'ong' && role !== 'admin') {
        return response.badRequest({
          message: 'Role must be either "supermarket", "ong", or "admin"',
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

      // Get user role from metadata or use provided role
      let userRole = authData.user?.user_metadata?.role;
      
      // Check if user is admin by email (this takes precedence)
      const adminEmails = ['admin@ecosave.com', 'administrator@ecosave.com']; // Add admin emails here
      const isAdminByEmail = adminEmails.includes(authData.user?.email || '');
      
      if (isAdminByEmail) {
        userRole = 'admin'; // Force admin role for admin emails
      } else if (!userRole && role) {
        // If user has no role in metadata but provided one in login, use it
        userRole = role;
      } else if (!userRole) {
        // If still no role, default to supermarket
        userRole = 'supermarket';
      }

      return response.ok({
        message: 'Login successful',
        token: authData.session?.access_token,
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          businessName: authData.user?.user_metadata?.business_name || 'Administrador',
          phone: authData.user?.user_metadata?.phone || 'N/A',
          nit: authData.user?.user_metadata?.nit || 'N/A',
          role: userRole,
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
