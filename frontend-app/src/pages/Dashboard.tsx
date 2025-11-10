import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

interface Product {
  id: number;
  nombre: string;
  estado: string;
  categoria: string;
  unidades: number;
  vencimiento: string;
  color: string;
}

const Dashboard: React.FC = () => {
  const auth = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Datos de ejemplo
  const exampleProducts: Product[] = [
    {
      id: 1,
      nombre: 'Pan integral',
      estado: 'Urgente',
      categoria: 'Panadería',
      unidades: 25,
      vencimiento: '2025-01-20 (HOY)',
      color: 'rojo',
    },
    {
      id: 2,
      nombre: 'Yogur natural',
      estado: 'Advertencia',
      categoria: 'Lácteos',
      unidades: 12,
      vencimiento: '2025-01-22 (2 días)',
      color: 'amarillo',
    },
    {
      id: 3,
      nombre: 'Manzanas',
      estado: 'Urgente',
      categoria: 'Frutas',
      unidades: 8,
      vencimiento: '2025-01-21 (1 día)',
      color: 'rojo',
    },
    {
      id: 4,
      nombre: 'Pollo fresco',
      estado: 'Urgente',
      categoria: 'Carnes',
      unidades: 5,
      vencimiento: '2025-01-19 (VENCIDO)',
      color: 'rojo',
    },
    {
      id: 5,
      nombre: 'Leche entera',
      estado: 'Advertencia',
      categoria: 'Lácteos',
      unidades: 15,
      vencimiento: '2025-01-25 (5 días)',
      color: 'amarillo',
    },
    {
      id: 6,
      nombre: 'Queso fresco',
      estado: 'Urgente',
      categoria: 'Lácteos',
      unidades: 3,
      vencimiento: '2025-01-20 (HOY)',
      color: 'rojo',
    },
    {
      id: 7,
      nombre: 'Tomates',
      estado: 'Advertencia',
      categoria: 'Verduras',
      unidades: 10,
      vencimiento: '2025-01-23 (3 días)',
      color: 'amarillo',
    },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    console.log('Cargando productos...', exampleProducts.length);
    setIsLoading(true);
    setProducts(exampleProducts);
    console.log('Productos cargados:', exampleProducts.length);
    setIsLoading(false);
  };

  // Estadísticas dinámicas
  const totalProducts = useMemo(() => products.length, [products]);

  const urgentProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.estado === 'Urgente' ||
        p.vencimiento.includes('HOY') ||
        p.vencimiento.includes('VENCIDO') ||
        p.vencimiento.includes('1 día')
    ).length;
  }, [products]);

  const donatedProducts = useMemo(() => {
    return products.filter((p) => p.estado === 'Donado').length;
  }, [products]);

  const discountProducts = useMemo(() => {
    return products.filter((p) => p.estado === 'Descuento').length;
  }, [products]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="main-title">Dashboard de Productos</h1>
          <p className="subtitle">Gestiona tus productos próximos a vencer</p>
        </div>
        <div className="user-info">
          <div>
            <b>EcoSave Market</b>
            <div className="email">demo@ecosave.com</div>
          </div>
          <button className="logout" onClick={auth.logout}>
            Salir
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-icon stat-cube">🧊</span>
          <div>
            <div className="stat-title">Total Productos</div>
            <div className="stat-value">{totalProducts}</div>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon stat-alert">⚠️</span>
          <div>
            <div className="stat-title">Expiran Pronto</div>
            <div className="stat-value">{urgentProducts}</div>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon stat-heart">💖</span>
          <div>
            <div className="stat-title">Donados</div>
            <div className="stat-value">{donatedProducts}</div>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon stat-percent">%</span>
          <div>
            <div className="stat-title">Con Descuento</div>
            <div className="stat-value">{discountProducts}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="main-title">Productos Próximos a Vencer</h2>
        <p className="subtitle">Productos que requieren acción inmediata</p>
        <div className="product-list">
          {isLoading ? (
            <div className="loading-message">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <p>No hay productos registrados</p>
              <p className="no-products-desc">
                Agrega productos para comenzar a gestionar tu inventario
              </p>
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="product">
                <div className="product-info">
                  <span className={`dot ${p.color}`}></span>
                  <span className="product-name">{p.nombre}</span>
                  <span className={`badge ${p.estado}`}>{p.estado}</span>
                  <div className="desc">
                    {p.categoria} • {p.unidades} unidades
                  </div>
                  <div className="desc">
                    <span className="calendar-icon">📅</span>
                    Vence: {p.vencimiento}
                  </div>
                </div>
                <div className="actions">
                  <button className="donar">
                    <span>♡</span> Donar
                  </button>
                  <button className="descuento">
                    <span>%</span> Descuento
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
