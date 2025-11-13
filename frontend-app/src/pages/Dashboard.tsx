import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
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

interface Donation {
  id: number;
  productName: string;
  quantity: number;
  date: string;
  ong: string;
  status: 'completed' | 'pending';
}

const Dashboard: React.FC = () => {
  const auth = useAuth();
  const { addNotification } = useNotifications();
  const [products, setProducts] = useState<Product[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showDonationHistory, setShowDonationHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    categoria: '',
    unidades: 1,
    vencimiento: ''
  });

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

  const exampleDonations: Donation[] = [
    {
      id: 1,
      productName: 'Pan integral',
      quantity: 25,
      date: '2025-01-20',
      ong: 'Banco de Alimentos Local',
      status: 'completed'
    },
    {
      id: 2,
      productName: 'Manzanas',
      quantity: 8,
      date: '2025-01-21',
      ong: 'Comunidad Solidaria',
      status: 'pending'
    },
    {
      id: 3,
      productName: 'Yogur natural',
      quantity: 12,
      date: '2025-01-18',
      ong: 'Fundación Esperanza',
      status: 'completed'
    }
  ];

  useEffect(() => {
    loadProducts();
    loadDonations();
  }, []);

  const loadProducts = () => {
    console.log('Cargando productos...', exampleProducts.length);
    setIsLoading(true);
    setProducts(exampleProducts);
    console.log('Productos cargados:', exampleProducts.length);
    setIsLoading(false);
  };

  const loadDonations = () => {
    setDonations(exampleDonations);
  };

  const handleAddProduct = () => {
    if (!newProduct.nombre || !newProduct.categoria || !newProduct.vencimiento) {
      alert('Por favor completa todos los campos');
      return;
    }

    const today = new Date();
    const expiryDate = new Date(newProduct.vencimiento);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let estado = 'Normal';
    let color = 'verde';
    let vencimientoStr = '';

    if (daysUntilExpiry < 0) {
      estado = 'Vencido';
      color = 'rojo';
      vencimientoStr = `${newProduct.vencimiento} (VENCIDO)`;
    } else if (daysUntilExpiry === 0) {
      estado = 'Urgente';
      color = 'rojo';
      vencimientoStr = `${newProduct.vencimiento} (HOY)`;
    } else if (daysUntilExpiry <= 2) {
      estado = 'Urgente';
      color = 'rojo';
      vencimientoStr = `${newProduct.vencimiento} (${daysUntilExpiry} días)`;
    } else if (daysUntilExpiry <= 5) {
      estado = 'Advertencia';
      color = 'amarillo';
      vencimientoStr = `${newProduct.vencimiento} (${daysUntilExpiry} días)`;
    } else {
      vencimientoStr = `${newProduct.vencimiento} (${daysUntilExpiry} días)`;
    }

    const product: Product = {
      id: products.length + 1,
      nombre: newProduct.nombre,
      estado,
      categoria: newProduct.categoria,
      unidades: newProduct.unidades,
      vencimiento: vencimientoStr,
      color
    };

    setProducts([...products, product]);
    
    // Send notification
    addNotification({
      type: 'product_added',
      title: 'Nuevo Producto Agregado',
      message: `${product.nombre} (${product.unidades} unidades) ha sido agregado al inventario.`,
    });

    // Send notification if product is expiring soon
    if (daysUntilExpiry <= 3) {
      addNotification({
        type: 'product_expiring',
        title: 'Producto Próximo a Vencer',
        message: `${product.nombre} vence en ${daysUntilExpiry} días.`,
      });
    }

    setNewProduct({ nombre: '', categoria: '', unidades: 1, vencimiento: '' });
    setShowAddProduct(false);
  };

  const handleDonate = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const donation: Donation = {
        id: donations.length + 1,
        productName: product.nombre,
        quantity: product.unidades,
        date: new Date().toISOString().split('T')[0],
        ong: 'ONG Seleccionada',
        status: 'pending'
      };
      setDonations([...donations, donation]);
      
      // Send notification
      addNotification({
        type: 'donation_completed',
        title: 'Donación Completada',
        message: `${product.nombre} (${product.unidades} unidades) ha sido donado exitosamente.`,
      });
      
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleDiscount = (productId: number) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, estado: 'Descuento', color: 'azul' }
        : p
    ));
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
    return donations.filter(d => d.status === 'completed').length;
  }, [donations]);

  const discountProducts = useMemo(() => {
    return products.filter((p) => p.estado === 'Descuento').length;
  }, [products]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="main-title">Dashboard {auth.user?.role === 'ong' ? 'ONG' : auth.user?.role === 'admin' ? 'Admin' : 'Supermercado'}</h1>
          <p className="subtitle">Gestiona tus productos y donaciones</p>
        </div>
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

      <div className="action-buttons">
        <button 
          className="btn-primary" 
          onClick={() => setShowAddProduct(true)}
        >
          ➕ Agregar Producto
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => setShowDonationHistory(true)}
        >
          📋 Historial de Donaciones
        </button>
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
                  <button 
                    className="donar" 
                    onClick={() => handleDonate(p.id)}
                    disabled={p.estado === 'Donado' || p.estado === 'Vencido'}
                  >
                    <span>♡</span> Donar
                  </button>
                  <button 
                    className="descuento" 
                    onClick={() => handleDiscount(p.id)}
                    disabled={p.estado === 'Donado' || p.estado === 'Descuento'}
                  >
                    <span>%</span> Descuento
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para agregar producto */}
      {showAddProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Agregar Nuevo Producto</h3>
            <div className="form-group">
              <label>Nombre del Producto:</label>
              <input
                type="text"
                value={newProduct.nombre}
                onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                placeholder="Ej: Pan integral"
              />
            </div>
            <div className="form-group">
              <label>Categoría:</label>
              <select
                value={newProduct.categoria}
                onChange={(e) => setNewProduct({...newProduct, categoria: e.target.value})}
              >
                <option value="">Selecciona una categoría</option>
                <option value="Panadería">Panadería</option>
                <option value="Lácteos">Lácteos</option>
                <option value="Frutas">Frutas</option>
                <option value="Verduras">Verduras</option>
                <option value="Carnes">Carnes</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
            <div className="form-group">
              <label>Unidades:</label>
              <input
                type="number"
                min="1"
                value={newProduct.unidades}
                onChange={(e) => setNewProduct({...newProduct, unidades: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Fecha de Vencimiento:</label>
              <input
                type="date"
                value={newProduct.vencimiento}
                onChange={(e) => setNewProduct({...newProduct, vencimiento: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddProduct(false)} className="btn-cancel">
                Cancelar
              </button>
              <button onClick={handleAddProduct} className="btn-primary">
                Agregar Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para historial de donaciones */}
      {showDonationHistory && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h3>Historial de Donaciones</h3>
            <div className="donation-list">
              {donations.length === 0 ? (
                <p>No hay donaciones registradas</p>
              ) : (
                donations.map((donation) => (
                  <div key={donation.id} className="donation-item">
                    <div className="donation-info">
                      <h4>{donation.productName}</h4>
                      <p>Cantidad: {donation.quantity} unidades</p>
                      <p>Fecha: {donation.date}</p>
                      <p>ONG: {donation.ong}</p>
                    </div>
                    <div className="donation-status">
                      <span className={`badge ${donation.status}`}>
                        {donation.status === 'completed' ? 'Completada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowDonationHistory(false)} className="btn-primary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
