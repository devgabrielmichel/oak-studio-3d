import { useId, useRef } from 'react';
import './FileUpload.css';

const ACCEPT =
  '.stl,.obj,.3mf,.step,.stp,.iges,.igs,.zip,.rar,.7z,model/stl,model/obj,application/zip,application/octet-stream';

export default function FileUpload({ file, onChange, loading, showLgpdHint }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const isBlocked = loading;

  function handleChange(e) {
    const selected = e.target.files?.[0] || null;
    onChange(selected);
  }

  function openPicker() {
    if (!isBlocked) inputRef.current?.click();
  }

  function handleZoneClick() {
    openPicker();
  }

  function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ' ') && !isBlocked) {
      e.preventDefault();
      openPicker();
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('is-dragover');
    if (isBlocked) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onChange(dropped);
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!isBlocked) e.currentTarget.classList.add('is-dragover');
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('is-dragover');
  }

  function clearFile(e) {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="file-upload-field">
      <span className="file-upload-label">Arquivo 3D <span className="optional">(opcional)</span></span>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="file-upload-hidden"
        accept={ACCEPT}
        disabled={isBlocked}
        onChange={handleChange}
        tabIndex={-1}
      />

      <div
        role="button"
        tabIndex={isBlocked ? -1 : 0}
        aria-label="Selecionar arquivo 3D"
        className={`file-upload-zone ${file ? 'has-file' : ''} ${isBlocked ? 'is-loading' : ''}`}
        onClick={handleZoneClick}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {file ? (
          <div className="file-upload-selected">
            <span className="file-upload-icon" aria-hidden="true">
              ✓
            </span>
            <div className="file-upload-info">
              <strong>{file.name}</strong>
              <span>{formatSize(file.size)}</span>
            </div>
            {!isBlocked && (
              <button type="button" className="file-upload-remove" onClick={clearFile}>
                Remover
              </button>
            )}
          </div>
        ) : (
          <>
            <span className="file-upload-icon" aria-hidden="true">
              ↑
            </span>
            <p className="file-upload-cta">
              <strong>Clique para escolher</strong> ou arraste o arquivo aqui
            </p>
            <p className="file-upload-hint">
              STL, OBJ, 3MF, STEP, IGES ou ZIP — máx. 50 MB
            </p>
          </>
        )}
      </div>

      {showLgpdHint && (
        <p className="file-upload-note">
          Marque o aceite da LGPD acima antes de enviar o formulário.
        </p>
      )}
    </div>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
