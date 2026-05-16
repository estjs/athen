import './home.css';

interface HomeAction {
  text: string;
  href: string;
}

interface CustomHomeData {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryAction: HomeAction;
  secondaryAction: HomeAction;
  image: { src: string; alt: string };
  metrics: Array<{ value: string; label: string }>;
  features: Array<{ title: string; text: string }>;
  workflow: string[];
  sponsors: string[];
  faq: Array<{ question: string; answer: string }>;
}

export function CustomHome({ data }: { data: CustomHomeData }) {
  return (
    <main class="custom-home">
      <section class="custom-home-hero">
        <div class="custom-home-copy">
          <p class="custom-home-eyebrow">{data.eyebrow}</p>
          <h1>{data.title}</h1>
          <p class="custom-home-subtitle">{data.subtitle}</p>
          <div class="custom-home-actions">
            <a class="custom-home-button primary" href={data.primaryAction.href}>
              {data.primaryAction.text}
            </a>
            <a class="custom-home-button secondary" href={data.secondaryAction.href}>
              {data.secondaryAction.text}
            </a>
          </div>
        </div>
        <div class="custom-home-visual">
          <img src={data.image.src} alt={data.image.alt} />
        </div>
      </section>

      <section class="custom-home-section">
        <h2>Metrics</h2>
        <div class="custom-home-metrics">
          {data.metrics.map((metric) => (
            <div class="custom-home-metric" key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section class="custom-home-section">
        <h2>Editable Building Blocks</h2>
        <div class="custom-home-features">
          {data.features.map((feature) => (
            <article class="custom-home-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section class="custom-home-section custom-home-workflow">
        <h2>Workflow</h2>
        <ol>
          {data.workflow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section class="custom-home-section">
        <h2>Sponsors</h2>
        <div class="custom-home-sponsors">
          {data.sponsors.map((sponsor) => (
            <span key={sponsor}>{sponsor}</span>
          ))}
        </div>
      </section>

      <section class="custom-home-section">
        <h2>FAQ</h2>
        <div class="custom-home-faq">
          {data.faq.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
