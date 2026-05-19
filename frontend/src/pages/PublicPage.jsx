import { useEffect, useState } from 'react';
import LandingHero from '../components/LandingHero';
import HowItWorks from '../components/HowItWorks';
import UploadForm from '../components/UploadForm';
import PrivacyModal from '../components/PrivacyModal';
import { publicApi } from '../api/client';
import { notify } from '../utils/toast';
import '../App.css';

export default function PublicPage() {
  const [privacy, setPrivacy] = useState(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  useEffect(() => {
    publicApi
      .privacy()
      .then(setPrivacy)
      .catch(() =>
        setPrivacy({
          title: 'Termos de Privacidade e LGPD',
          content:
            'Não foi possível carregar os termos. Verifique se o servidor está em execução.',
        })
      );
  }, []);

  function scrollToUpload() {
    document.getElementById('enviar')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-brand">
          <span className="logo-mark">OAK</span>
          <span>Oak Studio 3D</span>
        </div>
        <div className="nav-actions">
          <a href="/admin" className="btn btn-ghost btn-sm">
            Área admin
          </a>
          <button type="button" className="btn btn-outline btn-sm" onClick={scrollToUpload}>
            Enviar arquivo
          </button>
        </div>
      </nav>

      <LandingHero onCtaClick={scrollToUpload} />
      <HowItWorks />

      <section id="enviar" className="upload-section">
        <h2>Envie seu projeto</h2>
        <p className="section-lead">
          Preencha o formulário abaixo. Seus dados são tratados com segurança e em
          conformidade com a LGPD.
        </p>

        <label className="lgpd-check card">
          <input
            type="checkbox"
            checked={lgpdAccepted}
            onChange={(e) => setLgpdAccepted(e.target.checked)}
          />
          <span>
            Li e aceito os{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowPrivacy(true)}
            >
              termos de privacidade e tratamento de dados (LGPD)
            </button>
            . Autorizo o envio dos meus dados e arquivos à Oak Studio 3D.
          </span>
        </label>

        <UploadForm
          lgpdAccepted={lgpdAccepted}
          onRequirePrivacy={() => setShowPrivacy(true)}
          disabled={!lgpdAccepted}
        />
      </section>

      <footer className="footer">
        <p>Projeto de Extensão Universitária — Oak Studio 3D</p>
        <p className="muted">Impressão 3D · Orçamentos · Atendimento local</p>
      </footer>

      {showPrivacy && privacy && (
        <PrivacyModal
          privacy={privacy}
          onClose={() => setShowPrivacy(false)}
          onAccept={() => {
            setLgpdAccepted(true);
            setShowPrivacy(false);
            notify.success('Termos aceitos. Você já pode enviar sua solicitação.');
          }}
        />
      )}
    </div>
  );
}
