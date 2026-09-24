import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Cinemagraph } from './components/Cinemagraph';
import { TaskModule } from './components/TaskModule';
import { BestPractices } from './components/BestPractices';
import { Access } from './components/Access';
import { Pricing } from './components/Pricing';
import { Faq } from './components/Faq';
import { CtaFinal } from './components/CtaFinal';
import { Footer } from './components/Footer';
import { BillingProvider } from './context/BillingContext';
import { useReveal } from './hooks/useReveal';

export default function App() {
  useReveal('.reveal');

  return (
    <BillingProvider>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Cinemagraph />
        <TaskModule />
        <BestPractices />
        <Access />
        <Pricing />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
    </BillingProvider>
  );
}
