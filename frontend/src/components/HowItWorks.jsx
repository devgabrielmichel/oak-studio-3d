import './HowItWorks.css';

const STEPS = [
  {
    num: '1',
    title: 'Leia e aceite',
    text: 'Consulte nossos termos de privacidade em conformidade com a LGPD antes de enviar qualquer dado.',
  },
  {
    num: '2',
    title: 'Envie o arquivo',
    text: 'Preencha seus dados e faça upload do modelo 3D (STL, OBJ, 3MF e outros formatos).',
  },
  {
    num: '3',
    title: 'Receba o retorno',
    text: 'Analisamos seu projeto e entramos em contato com orçamento e orientações técnicas.',
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="how-it-works">
      <h2>Como funciona</h2>
      <p className="section-lead">
        Três passos simples para começar seu projeto de impressão 3D.
      </p>
      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step.num} className="step card">
            <div className="step-header">
              <span className="step-badge" aria-hidden="true">
                {step.num}
              </span>
              <h3>{step.title}</h3>
            </div>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
