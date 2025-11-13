/**
 * Servicio para construcción dinámica de formularios (Low Code)
 * Permite crear y gestionar formularios sin escribir código
 */

export interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio'
  required?: boolean
  placeholder?: string
  defaultValue?: any
  options?: Array<{ label: string; value: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    customMessage?: string
  }
  conditional?: {
    field: string
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
    value: any
  }
}

export interface FormConfig {
  id: string
  name: string
  description?: string
  fields: FormField[]
  submitAction?: {
    type: 'api' | 'workflow' | 'custom'
    endpoint?: string
    method?: 'POST' | 'PUT' | 'PATCH'
    workflowId?: string
  }
  layout?: {
    columns?: number
    sections?: Array<{
      title: string
      fields: string[] // IDs de campos
    }>
  }
  createdAt?: Date
  updatedAt?: Date
}

class FormBuilderService {
  private forms: Map<string, FormConfig> = new Map()

  /**
   * Crea un nuevo formulario
   */
  async createForm(config: Omit<FormConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<FormConfig> {
    const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const form: FormConfig = {
      ...config,
      id: formId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.forms.set(formId, form)
    return form
  }

  /**
   * Obtiene un formulario por ID
   */
  async getForm(formId: string): Promise<FormConfig | null> {
    return this.forms.get(formId) || null
  }

  /**
   * Lista todos los formularios
   */
  async listForms(): Promise<FormConfig[]> {
    return Array.from(this.forms.values())
  }

  /**
   * Actualiza un formulario existente
   */
  async updateForm(formId: string, updates: Partial<FormConfig>): Promise<FormConfig | null> {
    const form = this.forms.get(formId)
    if (!form) return null

    const updatedForm: FormConfig = {
      ...form,
      ...updates,
      id: formId, // No permitir cambiar el ID
      updatedAt: new Date(),
    }

    this.forms.set(formId, updatedForm)
    return updatedForm
  }

  /**
   * Elimina un formulario
   */
  async deleteForm(formId: string): Promise<boolean> {
    return this.forms.delete(formId)
  }

  /**
   * Valida los datos de un formulario según su configuración
   */
  async validateFormData(formId: string, data: Record<string, any>): Promise<{
    valid: boolean
    errors: Record<string, string[]>
  }> {
    const form = await this.getForm(formId)
    if (!form) {
      return {
        valid: false,
        errors: { _form: ['Formulario no encontrado'] },
      }
    }

    const errors: Record<string, string[]> = {}

    for (const field of form.fields) {
      const value = data[field.name]
      const fieldErrors: string[] = []

      // Validación de requerido
      if (field.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${field.label} es requerido`)
      }

      // Validaciones específicas por tipo
      if (value !== undefined && value !== null && value !== '') {
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          fieldErrors.push(`${field.label} debe ser un email válido`)
        }

        if (field.type === 'number') {
          const numValue = Number(value)
          if (isNaN(numValue)) {
            fieldErrors.push(`${field.label} debe ser un número`)
          } else {
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              fieldErrors.push(`${field.label} debe ser mayor o igual a ${field.validation.min}`)
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              fieldErrors.push(`${field.label} debe ser menor o igual a ${field.validation.max}`)
            }
          }
        }

        if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
          fieldErrors.push(
            field.validation.customMessage || `${field.label} no cumple con el formato requerido`
          )
        }
      }

      if (fieldErrors.length > 0) {
        errors[field.name] = fieldErrors
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    }
  }

  /**
   * Procesa el envío de un formulario
   */
  async processFormSubmission(
    formId: string,
    data: Record<string, any>
  ): Promise<{
    success: boolean
    message: string
    data?: any
    errors?: Record<string, string[]>
  }> {
    const form = await this.getForm(formId)
    if (!form) {
      return {
        success: false,
        message: 'Formulario no encontrado',
      }
    }

    // Validar datos
    const validation = await this.validateFormData(formId, data)
    if (!validation.valid) {
      return {
        success: false,
        message: 'Errores de validación',
        errors: validation.errors,
      }
    }

    // Procesar según la acción configurada
    if (form.submitAction) {
      switch (form.submitAction.type) {
        case 'api':
          // Aquí se podría hacer una llamada HTTP a un endpoint
          return {
            success: true,
            message: 'Formulario enviado correctamente',
            data: {
              formId,
              submittedData: data,
              action: form.submitAction,
            },
          }

        case 'workflow':
          // Aquí se podría ejecutar un workflow
          return {
            success: true,
            message: 'Workflow iniciado correctamente',
            data: {
              formId,
              workflowId: form.submitAction.workflowId,
              submittedData: data,
            },
          }

        default:
          return {
            success: true,
            message: 'Formulario procesado correctamente',
            data: {
              formId,
              submittedData: data,
            },
          }
      }
    }

    return {
      success: true,
      message: 'Formulario enviado correctamente',
      data: {
        formId,
        submittedData: data,
      },
    }
  }
}

export default new FormBuilderService()


