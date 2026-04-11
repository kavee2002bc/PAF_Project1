import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const res = await api.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuth(token, res.data);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        navigate('/login', { replace: true });
      }
    };

    run();
  }, [navigate, setAuth]);

  return (
    <div className="loading-state" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
      <p>Signing you in with Google...</p>
    </div>
  );
};

export default OAuth2Callback;
