import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi, setToken } from '../../api/client';
import { notify } from '../../utils/toast';
import KanbanBoard from '../../components/admin/KanbanBoard';
import ClientsList from '../../components/admin/ClientsList';
import './admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('kanban');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
        notify.error('Sessão expirada. Faça login novamente.');
        navigate('/admin');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function logout() {
    setToken(null);
    notify.success('Você saiu da área administrativa.');
    navigate('/admin');
  }

  if (loading) {
    return <p className="admin-loading">Carregando painel...</p>;
  }

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <div>
          <h1>Oak Studio 3D — Painel</h1>
        </div>
        <div className="admin-topbar-actions">
          <span className="admin-user">{user?.name}</span>
          <Link to="/" className="btn btn-ghost btn-sm">
            Site
          </Link>
          <button type="button" className="btn btn-outline btn-sm" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <main className="admin-content">
        <nav className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${tab === 'kanban' ? 'active' : ''}`}
            onClick={() => setTab('kanban')}
          >
            Pedidos (Kanban)
          </button>
          <button
            type="button"
            className={`admin-tab ${tab === 'clients' ? 'active' : ''}`}
            onClick={() => setTab('clients')}
          >
            Clientes
          </button>
        </nav>

        {tab === 'kanban' ? <KanbanBoard /> : <ClientsList />}
      </main>
    </div>
  );
}
