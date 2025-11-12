import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './Notifications.css';

const Notifications: React.FC = () => {
  const auth = useAuth();
  const { notifications, markAsRead, clearAll, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'product_expiring':
        return '⚠️';
      case 'product_added':
        return '📦';
      case 'donation_completed':
        return '✅';
      case 'donation_requested':
        return '🤝';
      case 'new_user_registered':
        return '👤';
      case 'admin_system_update':
        return '⚙️';
      case 'user_role_changed':
        return '🔐';
      default:
        return '🔔';
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case 'product_expiring':
        return 'Urgente';
      case 'product_added':
        return 'Nuevo';
      case 'donation_completed':
        return 'Completado';
      case 'donation_requested':
        return 'Solicitado';
      case 'new_user_registered':
        return 'Nuevo Usuario';
      case 'admin_system_update':
        return 'Sistema';
      case 'user_role_changed':
        return 'Rol';
      default:
        return 'Info';
    }
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'product_expiring':
        return 'urgent';
      case 'product_added':
        return 'info';
      case 'donation_completed':
        return 'success';
      case 'donation_requested':
        return 'warning';
      case 'new_user_registered':
        return 'info';
      case 'admin_system_update':
        return 'system';
      case 'user_role_changed':
        return 'admin';
      default:
        return 'info';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  const markAllAsRead = () => {
    notifications.forEach(n => !n.read && markAsRead(n.id));
  };

  return (
    <div className="notifications-dashboard">
      <div className="dashboard-header">
        <h1 className="main-title">Panel de Notificaciones</h1>
        <div className="user-info">
          <div>
            <b>{auth.user?.businessName || 'EcoSave Market'}</b>
            <div className="email">{auth.user?.email || 'demo@ecosave.com'}</div>
          </div>
          <button className="logout" onClick={auth.logout}>
            Salir
          </button>
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
        <button
          className="clear-all"
          onClick={clearAll}
          disabled={notifications.length === 0}
        >
          Limpiar todas
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
            <span>Nuevos productos agregados</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="alert-item">
            <span>Solicitudes de donación</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          {auth.user?.role === 'admin' && (
            <>
              <div className="alert-item">
                <span>Nuevos usuarios registrados</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="alert-item">
                <span>Cambios de roles de usuarios</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="alert-item">
                <span>Actualizaciones del sistema</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </>
          )}
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
                className={`notification ${getTypeClass(notification.type)}`}
              >
                <div className="notification-header">
                  <span className="icon">{getIcon(notification.type)}</span>
                  <b>{notification.title}</b>
                  <span className={`badge ${getTypeClass(notification.type)}`}>
                    {getBadgeText(notification.type)}
                  </span>
                  {!notification.read && <span className="dot blue"></span>}
                  <div className="actions-icons">
                    {!notification.read && (
                      <button
                        className="icon-btn"
                        title="Marcar como leído"
                        onClick={() => markAsRead(notification.id)}
                      >
                        ✔️
                      </button>
                    )}
                  </div>
                </div>
                <div className="notification-body">
                  {notification.message}
                </div>
                <div className="notification-footer">
                  <span>{formatTimestamp(notification.timestamp)}</span>
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
            {notifications.filter((n) => n.type === 'product_expiring').length}
          </span>
        </div>
        <div className="summary-card">
          <span className="icon summary-warning">🤝</span>
          <span className="summary-title">Solicitudes</span>
          <span className="summary-value">
            {notifications.filter((n) => n.type === 'donation_requested').length}
          </span>
        </div>
        <div className="summary-card">
          <span className="icon summary-success">✅</span>
          <span className="summary-title">Completadas</span>
          <span className="summary-value">
            {notifications.filter((n) => n.type === 'donation_completed').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
