import React, { useState, useEffect } from 'react';
import './DynamicForm.css';

const API_BASE = 'http://localhost:3333/api/v1/lowcode';

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
}

interface FormConfig {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  submitAction?: {
    type: 'api' | 'workflow' | 'custom';
    endpoint?: string;
    method?: 'POST' | 'PUT' | 'PATCH';
    workflowId?: string;
  };
}

interface DynamicFormProps {
  formId: string;
  onSubmit?: (data: Record<string, any>) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formId, onSubmit }) => {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message?: string } | null>(null);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/forms/${formId}`);
      const data = await response.json();
      if (data.success) {
        setFormConfig(data.data);
        // Inicializar valores por defecto
        const initialData: Record<string, any> = {};
        data.data.fields.forEach((field: FormField) => {
          if (field.defaultValue !== undefined) {
            initialData[field.name] = field.defaultValue;
          }
        });
        setFormData(initialData);
      }
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar errores del campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch(`${API_BASE}/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitResult({ success: true, message: result.message || 'Formulario enviado correctamente' });
        if (onSubmit) {
          onSubmit(formData);
        }
        // Limpiar formulario después de éxito
        setTimeout(() => {
          setFormData({});
          setSubmitResult(null);
        }, 3000);
      } else {
        setErrors(result.errors || {});
        setSubmitResult({ success: false, message: result.message || 'Error al enviar el formulario' });
      }
    } catch (error) {
      setSubmitResult({ success: false, message: 'Error de conexión' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const fieldErrors = errors[field.name] || [];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <div key={field.id} className="form-field">
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              id={field.name}
              type={field.type}
              name={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={fieldErrors.length > 0 ? 'error' : ''}
            />
            {fieldErrors.length > 0 && (
              <div className="field-errors">
                {fieldErrors.map((error, idx) => (
                  <span key={idx} className="error-message">
                    {error}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="form-field">
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={fieldErrors.length > 0 ? 'error' : ''}
              rows={4}
            />
            {fieldErrors.length > 0 && (
              <div className="field-errors">
                {fieldErrors.map((error, idx) => (
                  <span key={idx} className="error-message">
                    {error}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="form-field">
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              id={field.name}
              name={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              className={fieldErrors.length > 0 ? 'error' : ''}
            >
              <option value="">Selecciona una opción</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.length > 0 && (
              <div className="field-errors">
                {fieldErrors.map((error, idx) => (
                  <span key={idx} className="error-message">
                    {error}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="form-field checkbox-field">
            <label>
              <input
                type="checkbox"
                name={field.name}
                checked={value || false}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                required={field.required}
                className={fieldErrors.length > 0 ? 'error' : ''}
              />
              <span>
                {field.label}
                {field.required && <span className="required">*</span>}
              </span>
            </label>
            {fieldErrors.length > 0 && (
              <div className="field-errors">
                {fieldErrors.map((error, idx) => (
                  <span key={idx} className="error-message">
                    {error}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="form-loading">Cargando formulario...</div>;
  }

  if (!formConfig) {
    return <div className="form-error">Formulario no encontrado</div>;
  }

  return (
    <div className="dynamic-form">
      <div className="form-header">
        <h2>{formConfig.name}</h2>
        {formConfig.description && <p className="form-description">{formConfig.description}</p>}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-fields">
          {formConfig.fields.map((field) => renderField(field))}
        </div>

        {submitResult && (
          <div className={`submit-result ${submitResult.success ? 'success' : 'error'}`}>
            {submitResult.message}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;


