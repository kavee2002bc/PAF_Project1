import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]         = useState('login');   // 'login' | 'register'
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'USER'
  });

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.role);
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed — start the backend first!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">🏛️</div>
          <div>
            <div className="brand-name">CampusNex</div>
            <div className="brand-sub">Smart Campus Operations Hub</div>
          </div>
        </div>

        <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <p className="subtitle">
          {mode === 'login'
            ? 'Sign in to manage campus resources and services.'
            : 'Register to get started with CampusNex.'}
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" required value={form.name}
                onChange={handleChange} placeholder="John Doe"
                className="form-control" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" required value={form.email}
              onChange={handleChange} placeholder="you@university.edu"
              className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" required value={form.password}
              onChange={handleChange} placeholder="••••••••"
              className="form-control" />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="form-control">
                <option value="USER">User — Book resources & report issues</option>
                <option value="ADMIN">Admin — Full system access</option>
                <option value="TECHNICIAN">Technician — Handle maintenance tickets</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? '⏳ Please wait...' : mode === 'login' ? '🔐 Sign In' : '🚀 Create Account'}
          </button>
        </form>

        <div className="login-divider">{mode === 'login' ? 'or quick access' : 'or'}</div>

        {mode === 'login' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={handleGoogleLogin}
              className="google-login-btn" disabled={loading}>
              Continue with Google
            </button>
            <button onClick={() => quickLogin('admin@campus.edu', 'admin123')}
              className="google-login-btn" disabled={loading}>
              ⚙️ Login as Admin (admin@campus.edu)
            </button>
            <button onClick={() => quickLogin('john@campus.edu', 'user123')}
              className="google-login-btn" disabled={loading}>
              👤 Login as User (john@campus.edu)
            </button>
            <button onClick={() => quickLogin('sara@campus.edu', 'tech123')}
              className="google-login-btn" disabled={loading}>
              🔧 Login as Technician (sara@campus.edu)
            </button>
          </div>
        ) : null}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
