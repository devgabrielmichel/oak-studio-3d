import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { notify } from '../../utils/toast';

export default function KanbanBoard() {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragCard, setDragCard] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await adminApi.kanban();
      setColumns(data.columns);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function moveCard(cardId, newStatus, statusLabel, clientName) {
    try {
      await adminApi.updateStatus(cardId, newStatus);
      await load();
      notify.success(
        clientName
          ? `${clientName} → ${statusLabel}`
          : `Pedido movido para "${statusLabel}"`
      );
    } catch (err) {
      notify.error(err.message);
    }
  }

  function handleDragStart(e, card, fromStatus) {
    setDragCard({ ...card, fromStatus });
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  async function handleDrop(e, toStatus, statusLabel) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!dragCard || dragCard.fromStatus === toStatus) return;
    await moveCard(dragCard.id, toStatus, statusLabel, dragCard.clientName);
    setDragCard(null);
  }

  async function handleDownload(card) {
    const toastId = notify.loading('Baixando arquivo...');
    try {
      await adminApi.downloadFile(card.id, card.originalFilename);
      notify.dismiss(toastId);
      notify.success('Download iniciado.');
    } catch (err) {
      notify.dismiss(toastId);
      notify.error(err.message);
    }
  }

  if (loading) return <p className="admin-loading">Carregando pedidos...</p>;

  const totalCards = columns.reduce((n, c) => n + c.cards.length, 0);

  return (
    <div>
      {totalCards === 0 ? (
        <p className="admin-empty">
          Nenhum pedido ainda. Os envios do site aparecerão aqui automaticamente.
        </p>
      ) : (
        <div className="kanban">
          {columns.map((col) => (
            <section
              key={col.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id, col.label)}
            >
              <div className="kanban-column-header">
                {col.label}
                <span className="kanban-count">{col.cards.length}</span>
              </div>
              <div className="kanban-cards">
                {col.cards.map((card) => (
                  <article
                    key={card.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, col.id)}
                  >
                    <h4>{card.clientName}</h4>
                    <p>{card.clientEmail}</p>
                    {card.clientPhone && <p>{card.clientPhone}</p>}
                    <p>
                      <strong>{card.originalFilename || 'Sem arquivo anexado'}</strong>
                    </p>
                    {card.projectDescription && (
                      <p>
                        {card.projectDescription.length > 80
                          ? card.projectDescription.slice(0, 80) + '...'
                          : card.projectDescription}
                      </p>
                    )}
                    <p className="kanban-date">
                      {new Date(card.createdAt).toLocaleString('pt-BR')}
                    </p>
                    {card.originalFilename && (
                      <div className="kanban-card-actions">
                        <button type="button" onClick={() => handleDownload(card)}>
                          Baixar arquivo
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
