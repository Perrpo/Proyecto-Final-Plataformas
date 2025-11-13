/**
 * Servicio para creación dinámica de endpoints (Low Code)
 * Permite crear APIs sin escribir código
 */

import router from '@adonisjs/core/services/router'

export interface EndpointConfig {
  id: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  description?: string
  handler: {
    type: 'workflow' | 'form' | 'custom' | 'database'
    workflowId?: string
    formId?: string
    query?: string
    table?: string
  }
  authentication?: {
    required: boolean
    roles?: string[]
  }
  validation?: {
    body?: Record<string, any>
    query?: Record<string, any>
    params?: Record<string, any>
  }
  response?: {
    transform?: Record<string, any>
    statusCode?: number
  }
  createdAt?: Date
  updatedAt?: Date
}

class DynamicEndpointService {
  private endpoints: Map<string, EndpointConfig> = new Map()
  private registeredRoutes: Set<string> = new Set()

  /**
   * Crea un nuevo endpoint dinámico
   */
  async createEndpoint(
    config: Omit<EndpointConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EndpointConfig> {
    const endpointId = `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const endpoint: EndpointConfig = {
      ...config,
      id: endpointId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.endpoints.set(endpointId, endpoint)
    await this.registerEndpoint(endpoint)

    return endpoint
  }

  /**
   * Registra un endpoint en el router
   */
  private async registerEndpoint(endpoint: EndpointConfig): Promise<void> {
    const routeKey = `${endpoint.method}:${endpoint.path}`

    if (this.registeredRoutes.has(routeKey)) {
      console.warn(`Route ${routeKey} already registered, skipping...`)
      return
    }

    const handler = async (ctx: any) => {
      try {
        // Validar autenticación si es requerida
        if (endpoint.authentication?.required) {
          // Aquí se podría validar el token y roles
          // Por ahora solo verificamos que exista un header de autorización
          const authHeader = ctx.request.header('authorization')
          if (!authHeader) {
            return ctx.response.unauthorized({ error: 'Authentication required' })
          }
        }

        // Validar parámetros
        const validationErrors = this.validateRequest(endpoint, ctx)
        if (validationErrors.length > 0) {
          return ctx.response.badRequest({ errors: validationErrors })
        }

        // Ejecutar handler según el tipo
        let result: any

        switch (endpoint.handler.type) {
          case 'workflow':
            const workflowService = await import('#services/lowcode/workflow_service')
            const workflowResult = await workflowService.default.executeWorkflow(
              endpoint.handler.workflowId!,
              {
                body: ctx.request.body(),
                query: ctx.request.qs(),
                params: ctx.params,
              }
            )
            result = workflowResult.result || workflowResult
            break

          case 'form':
            const formBuilderService = await import('#services/lowcode/form_builder_service')
            const formResult = await formBuilderService.default.processFormSubmission(
              endpoint.handler.formId!,
              ctx.request.body()
            )
            result = formResult
            break

          case 'database':
            // Aquí se podría ejecutar una query a la base de datos
            result = { message: 'Database handler not yet implemented' }
            break

          default:
            result = { message: 'Custom handler executed', data: ctx.request.body() }
        }

        // Transformar respuesta si es necesario
        if (endpoint.response?.transform) {
          result = this.transformResponse(result, endpoint.response.transform)
        }

        return ctx.response.status(endpoint.response?.statusCode || 200).json(result)
      } catch (error) {
        console.error('Error executing dynamic endpoint:', error)
        return ctx.response.internalServerError({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Registrar la ruta según el método
    const fullPath = `/api/v1/lowcode${endpoint.path}`

    switch (endpoint.method) {
      case 'GET':
        router.get(fullPath, handler)
        break
      case 'POST':
        router.post(fullPath, handler)
        break
      case 'PUT':
        router.put(fullPath, handler)
        break
      case 'PATCH':
        router.patch(fullPath, handler)
        break
      case 'DELETE':
        router.delete(fullPath, handler)
        break
    }

    this.registeredRoutes.add(routeKey)
    console.log(`✅ Dynamic endpoint registered: ${endpoint.method} ${fullPath}`)
  }

  /**
   * Valida la petición según la configuración
   */
  private validateRequest(endpoint: EndpointConfig, ctx: any): string[] {
    const errors: string[] = []

    // Validar body
    if (endpoint.validation?.body) {
      const body = ctx.request.body()
      for (const [field, rules] of Object.entries(endpoint.validation.body)) {
        const value = body[field]
        if (rules.required && (value === undefined || value === null)) {
          errors.push(`${field} is required`)
        }
      }
    }

    // Validar query params
    if (endpoint.validation?.query) {
      const query = ctx.request.qs()
      for (const [field, rules] of Object.entries(endpoint.validation.query)) {
        const value = query[field]
        if (rules.required && (value === undefined || value === null)) {
          errors.push(`Query parameter ${field} is required`)
        }
      }
    }

    return errors
  }

  /**
   * Transforma la respuesta según la configuración
   */
  private transformResponse(data: any, transform: Record<string, any>): any {
    const transformed: Record<string, any> = {}

    for (const [key, value] of Object.entries(transform)) {
      if (typeof value === 'string') {
        // Mapeo simple
        transformed[key] = this.getNestedValue(data, value)
      } else if (typeof value === 'object') {
        // Transformación compleja
        transformed[key] = value
      }
    }

    return transformed
  }

  /**
   * Obtiene un valor anidado de un objeto
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj)
  }

  /**
   * Obtiene un endpoint por ID
   */
  async getEndpoint(endpointId: string): Promise<EndpointConfig | null> {
    return this.endpoints.get(endpointId) || null
  }

  /**
   * Lista todos los endpoints
   */
  async listEndpoints(): Promise<EndpointConfig[]> {
    return Array.from(this.endpoints.values())
  }

  /**
   * Actualiza un endpoint
   */
  async updateEndpoint(
    endpointId: string,
    updates: Partial<EndpointConfig>
  ): Promise<EndpointConfig | null> {
    const endpoint = this.endpoints.get(endpointId)
    if (!endpoint) return null

    // Desregistrar ruta antigua
    const oldRouteKey = `${endpoint.method}:${endpoint.path}`
    this.registeredRoutes.delete(oldRouteKey)

    const updatedEndpoint: EndpointConfig = {
      ...endpoint,
      ...updates,
      id: endpointId,
      updatedAt: new Date(),
    }

    this.endpoints.set(endpointId, updatedEndpoint)
    await this.registerEndpoint(updatedEndpoint)

    return updatedEndpoint
  }

  /**
   * Elimina un endpoint
   */
  async deleteEndpoint(endpointId: string): Promise<boolean> {
    const endpoint = this.endpoints.get(endpointId)
    if (!endpoint) return false

    const routeKey = `${endpoint.method}:${endpoint.path}`
    this.registeredRoutes.delete(routeKey)
    return this.endpoints.delete(endpointId)
  }
}

export default new DynamicEndpointService()


