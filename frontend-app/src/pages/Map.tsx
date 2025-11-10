import React, { useState } from 'react';
import './Map.css';

interface Location {
  id: number;
  nombre: string;
  tipo: string;
  direccion: string;
  especialidades: string[];
  lat?: number;
  lng?: number;
}

const Map: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const locations: Location[] = [
    {
      id: 1,
      nombre: 'Banco de Alimentos Central',
      tipo: 'ONG',
      direccion: 'Calle 50 #25-30, Medellín',
      especialidades: ['Alimentos frescos', 'Productos no perecederos'],
      lat: 6.2442,
      lng: -75.5812,
    },
    {
      id: 2,
      nombre: 'Fundación Esperanza',
      tipo: 'ONG',
      direccion: 'Carrera 43 #25-15, Medellín',
      especialidades: ['Frutas', 'Verduras', 'Panadería'],
      lat: 6.2088,
      lng: -75.5707,
    },
    {
      id: 3,
      nombre: 'María González',
      tipo: 'Consumidor',
      direccion: 'Calle 30 #45-20, Medellín',
      especialidades: ['Productos orgánicos'],
      lat: 6.2673,
      lng: -75.5681,
    },
    {
      id: 4,
      nombre: 'Comedor Comunitario San José',
      tipo: 'ONG',
      direccion: 'Calle 80 #45-20, Medellín',
      especialidades: ['Comidas preparadas', 'Alimentos básicos'],
      lat: 6.2754,
      lng: -75.5689,
    },
  ];

  const handleSearch = () => {
    setIsLoading(true);
    setMessage('Buscando ubicaciones...');
    setTimeout(() => {
      setIsLoading(false);
      setMessage('Búsqueda completada');
    }, 1000);
  };

  const clearSearch = () => {
    setQuery('');
    setMessage('');
  };

  const handleMyLocation = () => {
    setMessage('Obteniendo tu ubicación...');
  };

  const openRouteToAddress = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const addNewLocation = () => {
    setMessage('Función de agregar ubicación próximamente');
  };

  const refreshLocations = () => {
    setMessage('Lista actualizada');
  };

  return (
    <div className="map-dashboard">
      <div className="dashboard-header">
        <h1 className="main-title">Mapa de Puntos de Recolección</h1>
        <div className="user-info">
          <div>
            <b>EcoSave Market</b>
            <div className="email">demo@ecosave.com</div>
          </div>
          <button className="logout">Salir</button>
        </div>
      </div>
      <p className="subtitle">Encuentra ONGs y consumidores cercanos para tus donaciones</p>
      <div className="search-row">
        <input
          className="search"
          placeholder="Buscar por nombre o dirección..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="filters">
          <button className="filter active">Todos</button>
          <button className="filter">ONGs</button>
          <button className="filter">Consumidores</button>
          <button className="filter" onClick={handleSearch} disabled={isLoading}>
            Buscar
          </button>
          <button className="filter" onClick={clearSearch} disabled={isLoading}>
            Limpiar
          </button>
          <button className="filter" onClick={handleMyLocation} disabled={isLoading}>
            Mi ubicación
          </button>
        </div>
      </div>
      <div className="card">
        <h2 className="main-title">Mapa de Puntos de Recolección</h2>
        <p className="subtitle">ONGs y consumidores cercanos para donaciones</p>

        <div className="map-container">
          <div className="google-map">
            <div className="map-fallback">
              <div className="map-icon">🗺️</div>
              <div className="map-text">Mapa de Ubicaciones</div>
              <div className="map-desc">ONGs y Consumidores en Medellín</div>
              <div className="map-coords">
                {locations.map((loc) => (
                  <div key={loc.id} className="location-pin">
                    <div className={`pin-icon ${loc.tipo === 'ONG' ? 'ong' : 'consumer'}`}>
                      {loc.tipo === 'ONG' ? '🏢' : '👤'}
                    </div>
                    <div className="pin-info">
                      <strong>{loc.nombre}</strong>
                      <div className="pin-address">{loc.direccion}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="filters" style={{ marginTop: '1rem' }}>
          <button className="filter" onClick={addNewLocation}>
            Agregar ubicación
          </button>
          <button className="filter" onClick={refreshLocations}>
            Actualizar lista
          </button>
        </div>
        {message && (
          <p className="desc" style={{ marginTop: '0.5rem' }}>
            {message}
          </p>
        )}
        <div className="locations">
          <h3 className="main-title" style={{ marginTop: '2rem' }}>
            Ubicaciones Cercanas
          </h3>
          {locations.map((loc) => (
            <div key={loc.id} className="location">
              <div>
                <b>{loc.nombre}</b>
                <span className="badge">{loc.tipo}</span>
                <div className="desc">{loc.direccion}</div>
                <div className="desc">Especialidades: {loc.especialidades.join(', ')}</div>
              </div>
              <div className="actions">
                <button onClick={() => openRouteToAddress(loc.direccion)}>Ruta</button>
                <button>Contactar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Map;
