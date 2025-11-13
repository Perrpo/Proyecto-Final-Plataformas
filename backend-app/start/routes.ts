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
  
  // Orders - RPA Processing System
  router.group(() => {
    // Order CRUD
    router.get('/', '#controllers/http/order_controller.index')
    router.post('/', '#controllers/http/order_controller.store')
    router.get('/:id', '#controllers/http/order_controller.show')
    
    // Order Processing
    router.post('/:id/process', '#controllers/http/order_controller.processOrder')
    router.post('/process-pending', '#controllers/http/order_controller.processPendingOrders')
    router.post('/:id/retry', '#controllers/http/order_controller.retryOrder')
    
    // Order Validation
    router.get('/:id/validate', '#controllers/http/order_controller.validateOrder')
    
    // Invoice Generation
    router.get('/:id/invoice', '#controllers/http/order_controller.downloadInvoice')
    
    // Email Management
    router.post('/:id/resend-email', '#controllers/http/order_controller.resendEmail')
    router.post('/test-email', '#controllers/http/order_controller.testEmail')
    
    // Order Actions
    router.post('/:id/cancel', '#controllers/http/order_controller.cancelOrder')
    
    // Statistics
    router.get('/stats', '#controllers/http/order_controller.getStats')
  }).prefix('orders')

  // Low Code Platform
  router.group(() => {
    // Formularios
    router.get('/forms', '#controllers/http/lowcode_controller.listForms')
    router.get('/forms/:id', '#controllers/http/lowcode_controller.getForm')
    router.post('/forms', '#controllers/http/lowcode_controller.createForm')
    router.put('/forms/:id', '#controllers/http/lowcode_controller.updateForm')
    router.delete('/forms/:id', '#controllers/http/lowcode_controller.deleteForm')
    router.post('/forms/:id/submit', '#controllers/http/lowcode_controller.submitForm')

    // Workflows
    router.get('/workflows', '#controllers/http/lowcode_controller.listWorkflows')
    router.get('/workflows/:id', '#controllers/http/lowcode_controller.getWorkflow')
    router.post('/workflows', '#controllers/http/lowcode_controller.createWorkflow')
    router.put('/workflows/:id', '#controllers/http/lowcode_controller.updateWorkflow')
    router.delete('/workflows/:id', '#controllers/http/lowcode_controller.deleteWorkflow')
    router.post('/workflows/:id/execute', '#controllers/http/lowcode_controller.executeWorkflow')

    // Endpoints Dinámicos
    router.get('/endpoints', '#controllers/http/lowcode_controller.listEndpoints')
    router.get('/endpoints/:id', '#controllers/http/lowcode_controller.getEndpoint')
    router.post('/endpoints', '#controllers/http/lowcode_controller.createEndpoint')
    router.put('/endpoints/:id', '#controllers/http/lowcode_controller.updateEndpoint')
    router.delete('/endpoints/:id', '#controllers/http/lowcode_controller.deleteEndpoint')
  }).prefix('lowcode')
  
}).prefix('/api/v1')
