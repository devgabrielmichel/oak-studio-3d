import './PrivacyModal.css';

export default function PrivacyModal({ privacy, onClose, onAccept }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal card">
        <header className="modal-header">
          <h2>{privacy.title}</h2>
          {privacy.version && (
            <span className="version">Versão {privacy.version}</span>
          )}
        </header>
        <div className="modal-body">
          {privacy.content.split('\n').map((line, i) =>
            line.trim() ? (
              <p key={i}>{line.replace(/^•\s*/, '')}</p>
            ) : null
          )}
        </div>
        <footer className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Fechar
          </button>
          <button type="button" className="btn btn-primary" onClick={onAccept}>
            Li e aceito os termos
          </button>
        </footer>
      </div>
    </div>
  );
}
