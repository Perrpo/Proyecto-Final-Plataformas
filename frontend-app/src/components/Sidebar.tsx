import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
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
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>
          Mapa
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => isActive ? 'active' : ''}>
          Notificaciones
          <span className="badge">2</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
