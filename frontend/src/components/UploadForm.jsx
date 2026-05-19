import { useRef, useState } from 'react';
import { publicApi } from '../api/client';
import { notify } from '../utils/toast';
import FileUpload from './FileUpload';
import './UploadForm.css';

export default function UploadForm({ lgpdAccepted, onRequirePrivacy, disabled }) {
  const formRef = useRef(null);
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectDescription: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fieldsDisabled = disabled || loading;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      projectDescription: '',
    });
    setFile(null);
    formRef.current?.reset();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!lgpdAccepted) {
      onRequirePrivacy();
      notify.error('Aceite os termos de privacidade (LGPD) antes de enviar.');
      return;
    }

    const body = new FormData();
    body.append('clientName', form.clientName);
    body.append('clientEmail', form.clientEmail);
    body.append('clientPhone', form.clientPhone);
    body.append('projectDescription', form.projectDescription);
    body.append('lgpdAccepted', 'true');
    if (file) body.append('modelFile', file);

    setLoading(true);
    const toastId = notify.loading('Enviando solicitação...');

    try {
      const data = await publicApi.submit(body);
      notify.dismiss(toastId);
      notify.success(data.message);
      resetForm();
    } catch (err) {
      notify.dismiss(toastId);
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} className="upload-form card" onSubmit={handleSubmit}>
      <h2>Dados do cliente</h2>

      <label>
        Nome completo *
        <input
          name="clientName"
          value={form.clientName}
          onChange={handleChange}
          required
          disabled={fieldsDisabled}
          placeholder="Seu nome"
        />
      </label>

      <label>
        E-mail *
        <input
          type="email"
          name="clientEmail"
          value={form.clientEmail}
          onChange={handleChange}
          required
          disabled={fieldsDisabled}
          placeholder="seu@email.com"
        />
      </label>

      <label>
        Telefone / WhatsApp
        <input
          type="tel"
          name="clientPhone"
          value={form.clientPhone}
          onChange={handleChange}
          disabled={fieldsDisabled}
          placeholder="(00) 00000-0000"
        />
      </label>

      <label>
        Descrição do projeto
        <textarea
          name="projectDescription"
          value={form.projectDescription}
          onChange={handleChange}
          rows={3}
          disabled={fieldsDisabled}
          placeholder="Material, cor, quantidade, prazo..."
        />
      </label>

      <FileUpload
        file={file}
        onChange={setFile}
        loading={loading}
        showLgpdHint={disabled}
      />

      <button
        type="submit"
        className="btn btn-primary"
        disabled={fieldsDisabled}
      >
        {loading ? 'Enviando...' : 'Enviar solicitação'}
      </button>

      {disabled && (
        <p className="form-hint">Marque o aceite da LGPD acima para habilitar o envio.</p>
      )}
    </form>
  );
}
