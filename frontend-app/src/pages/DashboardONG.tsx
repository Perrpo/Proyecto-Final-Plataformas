import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './Dashboard.css';

interface AvailableDonation {
  id: number;
  productName: string;
  quantity: number;
  category: string;
  expiryDate: string;
  supermarket: string;
  distance: string;
  status: 'available' | 'requested' | 'collected';
}

interface RequestHistory {
  id: number;
  productName: string;
  quantity: number;
  requestDate: string;
  collectionDate: string;
  supermarket: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const DashboardONG: React.FC = () => {
  const auth = useAuth();
  const { addNotification } = useNotifications();
  const [availableDonations, setAvailableDonations] = useState<AvailableDonation[]>([]);
  const [requestHistory, setRequestHistory] = useState<RequestHistory[]>([]);
  const [showRequestHistory, setShowRequestHistory] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<AvailableDonation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Datos de ejemplo
  const exampleDonations: AvailableDonation[] = [
    {
      id: 1,
      productName: 'Pan integral',
      quantity: 25,
      category: 'Panadería',
      expiryDate: '2025-01-20 (HOY)',
      supermarket: 'Supermercado El Ahorro',
      distance: '2.5 km',
      status: 'available'
    },
    {
      id: 2,
      productName: 'Manzanas',
      quantity: 8,
      category: 'Frutas',
      expiryDate: '2025-01-21 (1 día)',
      supermarket: 'Mercado Fresco',
      distance: '1.8 km',
      status: 'available'
    },
    {
      id: 3,
      productName: 'Yogur natural',
      quantity: 12,
      category: 'Lácteos',
      expiryDate: '2025-01-22 (2 días)',
      supermarket: 'Supermercado La Placita',
      distance: '3.2 km',
      status: 'requested'
    },
    {
      id: 4,
      productName: 'Tomates',
      quantity: 10,
      category: 'Verduras',
      expiryDate: '2025-01-23 (3 días)',
      supermarket: 'Supermercado El Ahorro',
      distance: '2.5 km',
      status: 'available'
    },
    {
      id: 5,
      productName: 'Leche entera',
      quantity: 15,
      category: 'Lácteos',
      expiryDate: '2025-01-25 (5 días)',
      supermarket: 'Mercado Fresco',
      distance: '1.8 km',
      status: 'available'
    }
  ];

  const exampleHistory: RequestHistory[] = [
    {
      id: 1,
      productName: 'Queso fresco',
      quantity: 3,
      requestDate: '2025-01-18',
      collectionDate: '2025-01-19',
      supermarket: 'Supermercado El Ahorro',
      status: 'completed'
    },
    {
      id: 2,
      productName: 'Pollo fresco',
      quantity: 5,
      requestDate: '2025-01-17',
      collectionDate: '2025-01-18',
      supermarket: 'Mercado Fresco',
      status: 'completed'
    },
    {
      id: 3,
      productName: 'Snacks variados',
      quantity: 20,
      requestDate: '2025-01-20',
      collectionDate: 'Pendiente',
      supermarket: 'Supermercado La Placita',
      status: 'pending'
    }
  ];

  useEffect(() => {
    loadAvailableDonations();
    loadRequestHistory();
  }, []);

  const loadAvailableDonations = () => {
    setIsLoading(true);
    setAvailableDonations(exampleDonations);
    setIsLoading(false);
  };

  const loadRequestHistory = () => {
    setRequestHistory(exampleHistory);
  };

  const handleRequestDonation = (donation: AvailableDonation) => {
    setSelectedDonation(donation);
    
    // Update donation status
    setAvailableDonations(prev => 
      prev.map(d => d.id === donation.id ? { ...d, status: 'requested' } : d)
    );

    // Add to request history
    const newRequest: RequestHistory = {
      id: requestHistory.length + 1,
      productName: donation.productName,
      quantity: donation.quantity,
      requestDate: new Date().toISOString().split('T')[0],
      collectionDate: 'Pendiente',
      supermarket: donation.supermarket,
      status: 'pending'
    };
    setRequestHistory([newRequest, ...requestHistory]);
    
    // Send notification
    addNotification({
      type: 'donation_requested',
      title: 'Solicitud de Donación Enviada',
      message: `Has solicitado ${donation.productName} (${donation.quantity} unidades) de ${donation.supermarket}.`,
    });
    
    setSelectedDonation(null);
  };

  const handleConfirmReceipt = (requestId: number) => {
    const request = requestHistory.find(r => r.id === requestId);
    setRequestHistory(prev => 
      prev.map(r => 
        r.id === requestId 
          ? { ...r, status: 'completed' as const, collectionDate: new Date().toISOString().split('T')[0] }
          : r
      )
    );

    // Send notification
    if (request) {
      addNotification({
        type: 'donation_completed',
        title: 'Recepción Confirmada',
        message: `Has recibido ${request.productName} (${request.quantity} unidades) de ${request.supermarket}.`,
      });
    }
  };

  // Estadísticas dinámicas
  const totalAvailable = useMemo(() => {
    return availableDonations.filter(d => d.status === 'available').length;
  }, [availableDonations]);

  const totalRequested = useMemo(() => {
    return availableDonations.filter(d => d.status === 'requested').length;
  }, [availableDonations]);

  const completedRequests = useMemo(() => {
    return requestHistory.filter(r => r.status === 'completed').length;
  }, [requestHistory]);

  const totalItemsReceived = useMemo(() => {
    return requestHistory
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.quantity, 0);
  }, [requestHistory]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="main-title">Dashboard ONG</h1>
          <p className="subtitle">Gestiona tus solicitudes de donaciones</p>
        </div>
        <div className="user-info">
          <div>
            <b>{auth.user?.businessName || 'ONG Solidaria'}</b>
            <div className="email">{auth.user?.email || 'ong@ecosave.com'}</div>
          </div>
          <button className="logout" onClick={auth.logout}>
            Salir
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-icon stat-cube">📦</span>
          <div>
            <div className="stat-title">Donaciones Disponibles</div>
            <div className="stat-value">{totalAvailable}</div>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon stat-alert">⏰</span>
          <div>
            <div className="stat-title">Solicitudes Pendientes</div>
            <div className="stat-value">{totalRequested}</div>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon stat-heart">✅</span>
          <div>
            <div className="stat-title">Recepciones Completadas</div>
            <div className="stat-value">{completedRequests}</div>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon stat-percent">🛒</span>
          <div>
            <div className="stat-title">Total Artículos Recibidos</div>
            <div className="stat-value">{totalItemsReceived}</div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn-secondary" 
          onClick={() => setShowRequestHistory(true)}
        >
          📋 Historial de Recepciones
        </button>
      </div>

      <div className="card">
        <h2 className="main-title">Donaciones Disponibles</h2>
        <p className="subtitle">Alimentos disponibles para recolección inmediata</p>
        <div className="product-list">
          {isLoading ? (
            <div className="loading-message">Cargando donaciones...</div>
          ) : availableDonations.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <p>No hay donaciones disponibles</p>
              <p className="no-products-desc">
                Vuelve pronto para ver nuevas donaciones
              </p>
            </div>
          ) : (
            availableDonations.map((donation) => (
              <div key={donation.id} className="product">
                <div className="product-info">
                  <span className={`dot ${donation.status === 'available' ? 'verde' : donation.status === 'requested' ? 'amarillo' : 'azul'}`}></span>
                  <span className="product-name">{donation.productName}</span>
                  <span className={`badge ${donation.status}`}>
                    {donation.status === 'available' ? 'Disponible' : 
                     donation.status === 'requested' ? 'Solicitado' : 'Recolectado'}
                  </span>
                  <div className="desc">
                    {donation.category} • {donation.quantity} unidades
                  </div>
                  <div className="desc">
                    <span className="calendar-icon">📅</span>
                    Vence: {donation.expiryDate}
                  </div>
                  <div className="desc">
                    <span className="location-icon">📍</span>
                    {donation.supermarket} • {donation.distance}
                  </div>
                </div>
                <div className="actions">
                  <button 
                    className="solicitar" 
                    onClick={() => handleRequestDonation(donation)}
                    disabled={donation.status !== 'available'}
                  >
                    <span>🤝</span> Solicitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para historial de recepciones */}
      {showRequestHistory && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h3>Historial de Recepciones</h3>
            <div className="donation-list">
              {requestHistory.length === 0 ? (
                <p>No hay recepciones registradas</p>
              ) : (
                requestHistory.map((request) => (
                  <div key={request.id} className="donation-item">
                    <div className="donation-info">
                      <h4>{request.productName}</h4>
                      <p>Cantidad: {request.quantity} unidades</p>
                      <p>Fecha solicitud: {request.requestDate}</p>
                      <p>Fecha recolección: {request.collectionDate}</p>
                      <p>Supermercado: {request.supermarket}</p>
                    </div>
                    <div className="donation-status">
                      <span className={`badge ${request.status}`}>
                        {request.status === 'completed' ? 'Completada' : 
                         request.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </span>
                      {request.status === 'pending' && (
                        <button 
                          className="btn-confirm" 
                          onClick={() => handleConfirmReceipt(request.id)}
                          style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
                        >
                          ✅ Confirmar Recepción
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowRequestHistory(false)} className="btn-primary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de solicitud */}
      {selectedDonation && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Solicitud</h3>
            <p>¿Estás seguro que quieres solicitar esta donación?</p>
            <div className="donation-summary">
              <p><strong>Producto:</strong> {selectedDonation.productName}</p>
              <p><strong>Cantidad:</strong> {selectedDonation.quantity} unidades</p>
              <p><strong>Supermercado:</strong> {selectedDonation.supermarket}</p>
              <p><strong>Distancia:</strong> {selectedDonation.distance}</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedDonation(null)} className="btn-cancel">
                Cancelar
              </button>
              <button onClick={() => handleRequestDonation(selectedDonation)} className="btn-primary">
                Confirmar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardONG;
