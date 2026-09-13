import { useEffect, useState } from 'react';
import Header from './components/Header/Header';
import CelestialCarousel from './components/CelestialCarousel/CelestialCarousel';
import PodcastShowcase from './components/PodcastShowcase/PodcastShowcase';
import GamesSection from './components/GamesSection/GamesSection';
import LeadForm from './components/LeadForm/LeadForm';
import Footer from './components/Footer/Footer';
import { useScrollReveal } from './hooks/useScrollReveal';
import './styles/globals.css';

type ThemeMode = 'light' | 'dark';

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const savedTheme = window.localStorage.getItem('theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  });

  useScrollReveal();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="app-container">
      <Header theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
      <CelestialCarousel />
      <PodcastShowcase />
      <GamesSection />
      <LeadForm />
      <Footer />
    </div>
  );
}

export default App;
