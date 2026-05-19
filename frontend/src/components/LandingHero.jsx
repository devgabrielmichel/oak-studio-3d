import './LandingHero.css';

export default function LandingHero({ onCtaClick }) {
  return (
    <section className="hero">
      <p className="hero-badge">Extensão Universitária · Impressão 3D local</p>
      <h1 className="hero-title">
        Transforme sua ideia em objeto real com a{' '}
        <span className="highlight">Oak Studio 3D</span>
      </h1>
      <p className="hero-subtitle">
        Orçamentos, protótipos e peças personalizadas. Envie seu arquivo de modelagem
        de forma segura — com total transparência e conformidade à LGPD.
      </p>
      <div className="hero-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={onCtaClick}>
          Enviar meu arquivo
        </button>
        <a href="#como-funciona" className="btn btn-ghost">
          Como funciona
        </a>
      </div>
      <ul className="hero-stats">
        <li>
          <strong>STL · OBJ · 3MF</strong>
          <span>Formatos aceitos</span>
        </li>
        <li>
          <strong>100% seguro</strong>
          <span>Dados protegidos</span>
        </li>
        <li>
          <strong>LGPD</strong>
          <span>Consentimento explícito</span>
        </li>
      </ul>
    </section>
  );
}
