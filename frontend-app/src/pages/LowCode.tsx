import React, { useState, useEffect } from 'react';
import './LowCode.css';

const API_BASE = 'http://localhost:3333/api/v1/lowcode';

interface Form {
  id: string;
  name: string;
  description?: string;
  fields: any[];
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
}

interface Endpoint {
  id: string;
  name: string;
  path: string;
  method: string;
}

const LowCode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forms' | 'workflows' | 'endpoints'>('forms');
  const [forms, setForms] = useState<Form[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'form' | 'workflow' | 'endpoint' | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'forms') {
        const response = await fetch(`${API_BASE}/forms`);
        const data = await response.json();
        if (data.success) setForms(data.data || []);
      } else if (activeTab === 'workflows') {
        const response = await fetch(`${API_BASE}/workflows`);
        const data = await response.json();
        if (data.success) setWorkflows(data.data || []);
      } else if (activeTab === 'endpoints') {
        const response = await fetch(`${API_BASE}/endpoints`);
        const data = await response.json();
        if (data.success) setEndpoints(data.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType(activeTab.slice(0, -1) as 'form' | 'workflow' | 'endpoint');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;

    try {
      const endpoint = activeTab === 'forms' ? 'forms' : activeTab === 'workflows' ? 'workflows' : 'endpoints';
      const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div className="lowcode">
      <div className="lowcode-header">
        <div>
          <h1 className="main-title">🔧 Low Code Platform</h1>
          <p className="subtitle">Crea formularios, workflows y endpoints sin código</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Crear Nuevo
        </button>
      </div>

      <div className="lowcode-tabs">
        <button
          className={activeTab === 'forms' ? 'active' : ''}
          onClick={() => setActiveTab('forms')}
        >
          📝 Formularios ({forms.length})
        </button>
        <button
          className={activeTab === 'workflows' ? 'active' : ''}
          onClick={() => setActiveTab('workflows')}
        >
          🔄 Workflows ({workflows.length})
        </button>
        <button
          className={activeTab === 'endpoints' ? 'active' : ''}
          onClick={() => setActiveTab('endpoints')}
        >
          🔌 Endpoints ({endpoints.length})
        </button>
      </div>

      <div className="lowcode-content">
        {loading ? (
          <div className="loading-message">Cargando...</div>
        ) : (
          <>
            {activeTab === 'forms' && (
              <div className="items-grid">
                {forms.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <p>No hay formularios creados</p>
                    <button className="btn-primary" onClick={handleCreate}>
                      Crear Primer Formulario
                    </button>
                  </div>
                ) : (
                  forms.map((form) => (
                    <div key={form.id} className="item-card">
                      <div className="item-header">
                        <h3>{form.name}</h3>
                        <div className="item-actions">
                          <button className="btn-icon" title="Editar">✏️</button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDelete(form.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {form.description && <p className="item-desc">{form.description}</p>}
                      <div className="item-meta">
                        <span>📋 {form.fields?.length || 0} campos</span>
                        <span>🆔 {form.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'workflows' && (
              <div className="items-grid">
                {workflows.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🔄</div>
                    <p>No hay workflows creados</p>
                    <button className="btn-primary" onClick={handleCreate}>
                      Crear Primer Workflow
                    </button>
                  </div>
                ) : (
                  workflows.map((workflow) => (
                    <div key={workflow.id} className="item-card">
                      <div className="item-header">
                        <h3>{workflow.name}</h3>
                        <div className="item-actions">
                          <button className="btn-icon" title="Editar">✏️</button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDelete(workflow.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {workflow.description && (
                        <p className="item-desc">{workflow.description}</p>
                      )}
                      <div className="item-meta">
                        <span>🔗 {workflow.nodes?.length || 0} nodos</span>
                        <span>🆔 {workflow.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'endpoints' && (
              <div className="items-grid">
                {endpoints.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🔌</div>
                    <p>No hay endpoints creados</p>
                    <button className="btn-primary" onClick={handleCreate}>
                      Crear Primer Endpoint
                    </button>
                  </div>
                ) : (
                  endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="item-card">
                      <div className="item-header">
                        <h3>{endpoint.name}</h3>
                        <div className="item-actions">
                          <button className="btn-icon" title="Editar">✏️</button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDelete(endpoint.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="item-meta">
                        <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
                          {endpoint.method}
                        </span>
                        <span className="path-text">{endpoint.path}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && modalType && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo {modalType === 'form' ? 'Formulario' : modalType === 'workflow' ? 'Workflow' : 'Endpoint'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="coming-soon">
                🚧 El editor visual estará disponible próximamente.
                <br />
                Por ahora, puedes usar la API directamente para crear elementos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowCode;


