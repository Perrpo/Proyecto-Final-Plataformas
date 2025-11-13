/**
 * Controlador para funcionalidades Low Code
 * Expone APIs para gestionar formularios, workflows y endpoints dinámicos
 */

import type { HttpContext } from '@adonisjs/core/http'
import formBuilderService from '#services/lowcode/form_builder_service'
import workflowService from '#services/lowcode/workflow_service'
import dynamicEndpointService from '#services/lowcode/dynamic_endpoint_service'

export default class LowCodeController {
  // ========== FORMULARIOS ==========

  /**
   * Lista todos los formularios
   * GET /api/v1/lowcode/forms
   */
  async listForms({ response }: HttpContext) {
    try {
      const forms = await formBuilderService.listForms()
      return response.ok({
        success: true,
        data: forms,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Obtiene un formulario por ID
   * GET /api/v1/lowcode/forms/:id
   */
  async getForm({ params, response }: HttpContext) {
    try {
      const form = await formBuilderService.getForm(params.id)
      if (!form) {
        return response.notFound({
          success: false,
          message: 'Formulario no encontrado',
        })
      }
      return response.ok({
        success: true,
        data: form,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Crea un nuevo formulario
   * POST /api/v1/lowcode/forms
   */
  async createForm({ request, response }: HttpContext) {
    try {
      const formData = request.body() as any
      const form = await formBuilderService.createForm(formData)
      return response.created({
        success: true,
        message: 'Formulario creado correctamente',
        data: form,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Actualiza un formulario
   * PUT /api/v1/lowcode/forms/:id
   */
  async updateForm({ params, request, response }: HttpContext) {
    try {
      const updates = request.body()
      const form = await formBuilderService.updateForm(params.id, updates)
      if (!form) {
        return response.notFound({
          success: false,
          message: 'Formulario no encontrado',
        })
      }
      return response.ok({
        success: true,
        message: 'Formulario actualizado correctamente',
        data: form,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Elimina un formulario
   * DELETE /api/v1/lowcode/forms/:id
   */
  async deleteForm({ params, response }: HttpContext) {
    try {
      const deleted = await formBuilderService.deleteForm(params.id)
      if (!deleted) {
        return response.notFound({
          success: false,
          message: 'Formulario no encontrado',
        })
      }
      return response.ok({
        success: true,
        message: 'Formulario eliminado correctamente',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Procesa el envío de un formulario
   * POST /api/v1/lowcode/forms/:id/submit
   */
  async submitForm({ params, request, response }: HttpContext) {
    try {
      const formData = request.body()
      const result = await formBuilderService.processFormSubmission(params.id, formData)
      return response.status(result.success ? 200 : 400).json(result)
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  // ========== WORKFLOWS ==========

  /**
   * Lista todos los workflows
   * GET /api/v1/lowcode/workflows
   */
  async listWorkflows({ response }: HttpContext) {
    try {
      const workflows = await workflowService.listWorkflows()
      return response.ok({
        success: true,
        data: workflows,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Obtiene un workflow por ID
   * GET /api/v1/lowcode/workflows/:id
   */
  async getWorkflow({ params, response }: HttpContext) {
    try {
      const workflow = await workflowService.getWorkflow(params.id)
      if (!workflow) {
        return response.notFound({
          success: false,
          message: 'Workflow no encontrado',
        })
      }
      return response.ok({
        success: true,
        data: workflow,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Crea un nuevo workflow
   * POST /api/v1/lowcode/workflows
   */
  async createWorkflow({ request, response }: HttpContext) {
    try {
      const workflowData = request.body() as any
      const workflow = await workflowService.createWorkflow(workflowData)
      return response.created({
        success: true,
        message: 'Workflow creado correctamente',
        data: workflow,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Actualiza un workflow
   * PUT /api/v1/lowcode/workflows/:id
   */
  async updateWorkflow({ params, request, response }: HttpContext) {
    try {
      const updates = request.body()
      const workflow = await workflowService.updateWorkflow(params.id, updates)
      if (!workflow) {
        return response.notFound({
          success: false,
          message: 'Workflow no encontrado',
        })
      }
      return response.ok({
        success: true,
        message: 'Workflow actualizado correctamente',
        data: workflow,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Elimina un workflow
   * DELETE /api/v1/lowcode/workflows/:id
   */
  async deleteWorkflow({ params, response }: HttpContext) {
    try {
      const deleted = await workflowService.deleteWorkflow(params.id)
      if (!deleted) {
        return response.notFound({
          success: false,
          message: 'Workflow no encontrado',
        })
      }
      return response.ok({
        success: true,
        message: 'Workflow eliminado correctamente',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Ejecuta un workflow
   * POST /api/v1/lowcode/workflows/:id/execute
   */
  async executeWorkflow({ params, request, response }: HttpContext) {
    try {
      const inputData = request.body()
      const result = await workflowService.executeWorkflow(params.id, inputData)
      return response.status(result.success ? 200 : 500).json(result)
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  // ========== ENDPOINTS DINÁMICOS ==========

  /**
   * Lista todos los endpoints dinámicos
   * GET /api/v1/lowcode/endpoints
   */
  async listEndpoints({ response }: HttpContext) {
    try {
      const endpoints = await dynamicEndpointService.listEndpoints()
      return response.ok({
        success: true,
        data: endpoints,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Obtiene un endpoint por ID
   * GET /api/v1/lowcode/endpoints/:id
   */
  async getEndpoint({ params, response }: HttpContext) {
    try {
      const endpoint = await dynamicEndpointService.getEndpoint(params.id)
      if (!endpoint) {
        return response.notFound({
          success: false,
          message: 'Endpoint no encontrado',
        })
      }
      return response.ok({
        success: true,
        data: endpoint,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Crea un nuevo endpoint dinámico
   * POST /api/v1/lowcode/endpoints
   */
  async createEndpoint({ request, response }: HttpContext) {
    try {
      const endpointData = request.body() as any
      const endpoint = await dynamicEndpointService.createEndpoint(endpointData)
      return response.created({
        success: true,
        message: 'Endpoint creado correctamente',
        data: endpoint,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Actualiza un endpoint
   * PUT /api/v1/lowcode/endpoints/:id
   */
  async updateEndpoint({ params, request, response }: HttpContext) {
    try {
      const updates = request.body()
      const endpoint = await dynamicEndpointService.updateEndpoint(params.id, updates)
      if (!endpoint) {
        return response.notFound({
          success: false,
          message: 'Endpoint no encontrado',
        })
      }
      return response.ok({
        success: true,
        message: 'Endpoint actualizado correctamente',
        data: endpoint,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  /**
   * Elimina un endpoint
   * DELETE /api/v1/lowcode/endpoints/:id
   */
  async deleteEndpoint({ params, response }: HttpContext) {
    try {
      const deleted = await dynamicEndpointService.deleteEndpoint(params.id)
      if (!deleted) {
        return response.notFound({
          success: false,
          message: 'Endpoint no encontrado',
        })
      }
      return response.ok({
        success: true,
        message: 'Endpoint eliminado correctamente',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }
}


