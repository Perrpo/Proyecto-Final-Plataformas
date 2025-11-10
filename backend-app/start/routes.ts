/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'

// Root route
router.get('/', async () => {
  return {
    message: 'EcoSave Market API',
    version: '1.0.0',
    status: 'running',
    supabase: 'connected'
  }
})

router.group(() => {
  // Health check
  router.get('/health', async () => {
    return { status: 'ok' }
  })

  // Supabase connection test
  router.get('/supabase/test', '#controllers/http/supabase_test_controller.testConnection')
  router.get('/supabase/info', '#controllers/http/supabase_test_controller.info')

  // Users
  router.resource('users', '#controllers/http/user_controller').apiOnly()
  
  // Auth
  router.post('auth/register', '#controllers/http/auth_controller.register')
  router.post('auth/login', '#controllers/http/auth_controller.login')
  // TODO: Register 'auth' middleware in start/kernel.ts before uncommenting
  // router.post('auth/logout', '#controllers/http/auth_controller.logout').middleware('auth')
  router.post('auth/logout', '#controllers/http/auth_controller.logout')
  
}).prefix('/api/v1')
