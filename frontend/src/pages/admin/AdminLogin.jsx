import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi, setToken } from '../../api/client';
import { notify } from '../../utils/toast';
import './admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@oakstudio.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const toastId = notify.loading('Entrando...');

    try {
      const { token, user } = await adminApi.login(email, password);
      setToken(token);
      notify.dismiss(toastId);
      notify.success(`Bem-vindo, ${user.name}!`);
      navigate('/admin/painel');
    } catch (err) {
      notify.dismiss(toastId);
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card card">
        <div className="admin-login-header">
          <span className="logo-mark">OAK</span>
          <h1>Área Administrativa</h1>
          <p>Oak Studio 3D — gestão de pedidos e clientes</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <Link to="/" className="admin-back">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
