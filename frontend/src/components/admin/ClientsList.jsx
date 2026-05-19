import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { notify } from '../../utils/toast';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .clients()
      .then((data) => setClients(data.clients))
      .catch((err) => notify.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="admin-loading">Carregando clientes...</p>;

  if (!clients.length) {
    return (
      <p className="admin-empty">
        Nenhum cliente cadastrado. Clientes são criados automaticamente ao enviar um
        orçamento no site.
      </p>
    );
  }

  return (
    <div className="clients-table-wrap card">
      <table className="clients-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Pedidos</th>
            <th>Último envio</th>
            <th>Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone || '—'}</td>
              <td>{c.submissionCount}</td>
              <td>
                {c.lastSubmissionAt
                  ? new Date(c.lastSubmissionAt).toLocaleString('pt-BR')
                  : '—'}
              </td>
              <td>{new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
