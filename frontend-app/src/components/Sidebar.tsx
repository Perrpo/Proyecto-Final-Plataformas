import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const isONG = user?.role === 'ong';
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="logo">
        <span>🍱</span>
        <div>
          <h3>FoodSave</h3>
          <small>Plataforma anti-desperdicio</small>
        </div>
      </div>
      <nav>
        {isAdmin ? (
          <>
            <NavLink to="/dashboard-admin" className={({ isActive }) => isActive ? 'active' : ''}>
              ⚙️ Panel Administrador
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>
              📍 Mapa General
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => isActive ? 'active' : ''}>
              🔔 Notificaciones
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </NavLink>
            <NavLink to="/lowcode" className={({ isActive }) => isActive ? 'active' : ''}>
              🔧 Low Code
            </NavLink>
          </>
        ) : isONG ? (
          <>
            <NavLink to="/dashboard-ong" className={({ isActive }) => isActive ? 'active' : ''}>
              🏢 Dashboard ONG
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>
              📍 Puntos de Recolección
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => isActive ? 'active' : ''}>
              🔔 Notificaciones
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </NavLink>
            <NavLink to="/lowcode" className={({ isActive }) => isActive ? 'active' : ''}>
              🔧 Low Code
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              🏪 Dashboard Supermercado
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>
              📍 Mapa de ONGs
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => isActive ? 'active' : ''}>
              🔔 Notificaciones
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </NavLink>
            <NavLink to="/lowcode" className={({ isActive }) => isActive ? 'active' : ''}>
              🔧 Low Code
            </NavLink>
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="user-role">
          <span className="role-badge">
            {isAdmin ? '⚙️ Administrador' : isONG ? '🤝 ONG' : '🏪 Supermercado'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
