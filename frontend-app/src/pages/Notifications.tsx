import React, { useState, useMemo } from 'react';
import './Notifications.css';

interface Notification {
  id: number;
  text: string;
  type: 'urgent' | 'warning' | 'success' | 'info';
  isRead: boolean;
  timestamp: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      text: 'Producto vence hoy - Pollo fresco (5 unidades)',
      type: 'urgent',
      isRead: false,
      timestamp: 'Hace 2 min',
    },
    {
      id: 2,
      text: 'Vencimiento en 2 días - Pan integral (25 unidades)',
      type: 'warning',
      isRead: false,
      timestamp: 'Hace 1 hora',
    },
    {
      id: 3,
      text: 'Donación completada - Leche entera a Banco de Alimentos Central',
      type: 'success',
      isRead: true,
      timestamp: 'Hace 3 horas',
    },
    {
      id: 4,
      text: 'Nueva ONG registrada - Fundación Esperanza en tu área',
      type: 'info',
      isRead: true,
      timestamp: 'Hace 1 día',
    },
    {
      id: 5,
      text: 'Inventario bajo - Quedan pocas unidades de productos en categoría Frutas',
      type: 'warning',
      isRead: true,
      timestamp: 'Hace 2 días',
    },
  ]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return '⚠️';
      case 'warning':
        return '⏰';
      case 'success':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'Urgente';
      case 'warning':
        return 'Advertencia';
      case 'success':
        return 'Éxito';
      default:
        return 'Info';
    }
  };

  return (
    <div className="notifications-dashboard">
      <div className="dashboard-header">
        <h1 className="main-title">Panel de Notificaciones</h1>
        <div className="user-info">
          <div>
            <b>EcoSave Market</b>
            <div className="email">demo@ecosave.com</div>
          </div>
          <button className="logout">Salir</button>
        </div>
      </div>
      <p className="subtitle">Alertas automáticas sobre inventarios y actividades</p>
      <div className="actions-row">
        <span className="badge-unread">{unreadCount} sin leer</span>
        <button
          className="mark-read"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Marcar todas como leídas
        </button>
      </div>
      <div className="card config-card">
        <h2 className="main-title">
          <span className="icon">⚙️</span> Configuración de Alertas
        </h2>
        <p className="subtitle">Personaliza qué notificaciones quieres recibir</p>
        <div className="alert-list">
          <div className="alert-item">
            <span>Alertas de vencimiento</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="alert-item">
            <span>Confirmaciones de donación</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="alert-item">
            <span>Alertas de inventario bajo</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="alert-item">
            <span>Nuevos socios en área</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
      <div className="card">
        <h2 className="main-title">Notificaciones Recientes</h2>
        <p className="subtitle">Historial de alertas y actividades del sistema</p>
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <span className="icon">📭</span>
              <p>No hay notificaciones para mostrar</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification ${notification.type}`}
              >
                <div className="notification-header">
                  <span className="icon">{getIcon(notification.type)}</span>
                  <b>{notification.text.split(' - ')[0]}</b>
                  <span className={`badge ${notification.type}`}>
                    {getBadgeText(notification.type)}
                  </span>
                  {!notification.isRead && <span className="dot blue"></span>}
                  <div className="actions-icons">
                    {!notification.isRead && (
                      <button
                        className="icon-btn"
                        title="Marcar como leído"
                        onClick={() => markAsRead(notification.id)}
                      >
                        ✔️
                      </button>
                    )}
                    <button
                      className="icon-btn"
                      title="Eliminar"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="notification-body">
                  {notification.text.split(' - ')[1] || notification.text}
                </div>
                <div className="notification-footer">
                  <span>{notification.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="summary-row">
        <div className="summary-card">
          <span className="icon summary-alert">⚠️</span>
          <span className="summary-title">Alertas Urgentes</span>
          <span className="summary-value">
            {notifications.filter((n) => n.type === 'urgent').length}
          </span>
        </div>
        <div className="summary-card">
          <span className="icon summary-warning">⏰</span>
          <span className="summary-title">Advertencias</span>
          <span className="summary-value">
            {notifications.filter((n) => n.type === 'warning').length}
          </span>
        </div>
        <div className="summary-card">
          <span className="icon summary-success">✅</span>
          <span className="summary-title">Acciones Completadas</span>
          <span className="summary-value">
            {notifications.filter((n) => n.type === 'success').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
