import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductOverview } from './components/ProductOverview';
import { ScrollShowcase } from './components/ScrollShowcase';
import { OrbitShowcase } from './components/OrbitShowcase';
import { useReveal } from './hooks/useReveal';
import { Downloads } from './components/Downloads';
import { Pricing } from './components/Pricing';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { BillingProvider } from './context/BillingContext';

export default function App() {
  useReveal('.reveal');
  return <BillingProvider>
    <a className="skip-link" href="#main">Saltar al contenido</a>
    <Header />
    <main id="main">
      <Hero />
      <ScrollShowcase />
      <ProductOverview />
      <OrbitShowcase />
      <Downloads />
      <Pricing />
      <Faq />
      <section className="closing" aria-labelledby="closing-title">
        <div className="container">
          <p className="eyebrow">HECHO PARA TU EQUIPO DE ALABANZA</p>
          <h2 id="closing-title">Prepara tu música.<br />Vive cada momento.</h2>
          <a className="btn-primary" href="#descargas">Empezar gratis </a>
          <p>¿Tienes preguntas? <a href="https://t.me/+T9yAuOWOJiMwMGMx" target="_blank" rel="noopener noreferrer">Conversemos en Telegram</a></p>
        </div>
      </section>
    </main>
    <Footer />
  </BillingProvider>;
}
