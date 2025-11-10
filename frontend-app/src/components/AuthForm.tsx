import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

const AuthForm: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [business, setBusiness] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email y contraseña son requeridos');
      return;
    }

    if (tab === 'register' && !username) {
      setError('Nombre es requerido para registrarse');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      let result;
      if (tab === 'login') {
        result = await auth.login(email, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Error desconocido');
        }
      } else {
        result = await auth.register(email, password, username, business);
        if (result.success) {
          const message = result.message || '¡Registro exitoso! Ahora puedes iniciar sesión.';
          setSuccessMessage(message);
          setTab('login');
          setUsername('');
          setBusiness('');
          // Mantener email para facilitar el login
          setPassword('');
        } else {
          setError(result.error || 'Error desconocido');
        }
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <div className={`split-card ${tab === 'register' ? 'is-register' : ''}`}>
          <aside className="panel-left">
            <div className="brand">
              <span className="brand-logo">🍱</span>
            </div>
            {tab === 'login' ? (
              <div key="left-login">
                <h2 className="right-title">Sign In</h2>
                <form onSubmit={handleSubmit} className="form">
                  <div className="input-row">
                    <span className="icon">@</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="input-row">
                    <span className="icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="reveal-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  {successMessage && <div className="success-message">{successMessage}</div>}
                  <button className="submit-btn" type="submit" disabled={isLoading}>
                    {isLoading ? 'Procesando...' : 'SIGN IN'}
                  </button>
                </form>
                <div className="switch-row">
                  <button className="ghost" onClick={() => setTab('register')}>
                    Create account
                  </button>
                </div>
              </div>
            ) : (
              <div key="left-welcome">
                <h2 className="left-title">Welcome Back!</h2>
                <p className="left-text">
                  To keep connected with us please login with your personal info
                </p>
                <button className="left-cta" onClick={() => setTab('login')}>
                  SIGN IN
                </button>
              </div>
            )}
          </aside>
          <section className="panel-right">
            {tab === 'register' ? (
              <div key="right-register">
                <h2 className="right-title">Create Account</h2>
                <p className="right-helper">or use your email for registration:</p>
                <form onSubmit={handleSubmit} className="form">
                  <div className="input-row">
                    <span className="icon">👤</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Name"
                      required
                    />
                  </div>
                  <div className="input-row">
                    <span className="icon">🏢</span>
                    <input
                      type="text"
                      value={business}
                      onChange={(e) => setBusiness(e.target.value)}
                      placeholder="Business (optional)"
                    />
                  </div>
                  <div className="input-row">
                    <span className="icon">@</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="input-row">
                    <span className="icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      className="reveal-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  {successMessage && <div className="success-message">{successMessage}</div>}
                  <button className="submit-btn" type="submit" disabled={isLoading}>
                    {isLoading ? 'Procesando...' : 'SIGN UP'}
                  </button>
                </form>
                <div className="switch-row">
                  <button className="ghost" onClick={() => setTab('login')}>
                    I already have an account
                  </button>
                </div>
              </div>
            ) : (
              <div key="right-hello">
                <h2 className="left-title">Hello, friend</h2>
                <p className="left-text">
                  Enter your personal details and start journey with us
                </p>
                <button className="left-cta" onClick={() => setTab('register')}>
                  SIGN UP
                </button>
              </div>
            )}
          </section>
          <div className="switch-overlay" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
