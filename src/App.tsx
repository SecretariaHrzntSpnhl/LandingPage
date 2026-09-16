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

type PresentationSession = {
  state?: 'connecting' | 'connected' | 'closed' | 'terminated';
  onstatechange?: () => void;
  onmessage?: (event: MessageEvent<string>) => void;
  send?: (message: string) => void;
  close?: () => void;
  terminate?: () => void;
};

type PresentationReceiver = {
  connectionList?: {
    onchange?: () => void;
    getConnections?: () => PresentationSession[];
  };
};

type PresentationNavigator = Navigator & {
  presentation?: {
    receiver?: PresentationReceiver;
  };
};

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const savedTheme = window.localStorage.getItem('theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  });
  const isTvMode = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('display') === 'tv';
  const tvFocus = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('focus') === 'podcast'
    ? 'podcast'
    : 'jogos';

  useScrollReveal();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isTvMode) {
      return;
    }

    document.documentElement.dataset.displayMode = 'tv';
    const destination = document.getElementById(tvFocus);
    destination?.scrollIntoView({ block: 'start' });

    return () => {
      delete document.documentElement.dataset.displayMode;
    };
  }, [isTvMode, tvFocus]);

  useEffect(() => {
    const receiver = (navigator as PresentationNavigator).presentation?.receiver;
    const connectionList = receiver?.connectionList;
    if (!connectionList?.getConnections) {
      return undefined;
    }

    const forwardCommand = (connection: PresentationSession) => {
      connection.onmessage = (event) => {
        try {
          const command = JSON.parse(event.data) as { type?: string };
          if (typeof command.type === 'string') {
            window.dispatchEvent(new CustomEvent('horizonte:tv-command', { detail: command }));
          }
        } catch {
          // Ignore messages that are not commands from this application.
        }
      };
    };

    connectionList.getConnections().forEach(forwardCommand);
    connectionList.onchange = () => connectionList.getConnections?.().forEach(forwardCommand);
    return () => {
      connectionList.onchange = undefined;
    };
  }, []);

  return (
    <div className="app-container">
      <Header theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
      <CelestialCarousel />
      {/* TV connection UI temporarily offline while the QR receiver flow is tested locally.
      {!isTvMode && (
        <section className="device-support device-support--inline" aria-label="Experiência na TV">
          <div className={`device-support__floating device-support__floating--inline ${isTvConnected ? 'is-connected' : ''}`}>
            <span className="device-support__floating-icon" aria-hidden="true">▣</span>
            <span className="device-support__floating-copy">
              <strong>{isTvConnected ? 'TV conectada' : 'Aprenda também na TV'}</strong>
              <span>{isTvConnected ? 'Abra o controle remoto' : 'Podcast ou jogos na tela grande'}</span>
            </span>
            <button type="button" onClick={() => setIsDeviceSupportOpen(true)}>
              {isTvConnected ? 'Controle' : 'Conectar'}
            </button>
          </div>
        </section>
      )}
      */}
      <PodcastShowcase />
      <GamesSection />
      {/* Re-enable this modal together with the TV invitation after local QR testing.
      {isDeviceSupportOpen && (
        <div className="device-support__backdrop" role="presentation" onClick={() => setIsDeviceSupportOpen(false)}>
          <section
            className="device-support__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="device-support-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="device-support__close"
              onClick={() => setIsDeviceSupportOpen(false)}
              aria-label="Fechar opções de dispositivos"
            >
              ×
            </button>
            <div className="device-support__inner">
              <div className="device-support__hero">
                <span className="device-support__eyebrow">TECNOLOGIA APLICADA AO APRENDIZADO</span>
                <h2 id="device-support-modal-title">Aprenda espanhol com confiança, em qualquer tela</h2>
                <p className="device-support__lead">
                  Uma experiência criada para você praticar no seu ritmo: conteúdo claro, atividades interativas
                  e acesso contínuo no celular, computador ou Smart TV.
                </p>
                <div className="device-support__trust" aria-label="Compromissos da experiência">
                  <span><strong>01</strong> Prática guiada</span>
                  <span><strong>02</strong> Acesso responsivo</span>
                  <span><strong>03</strong> Navegação acessível</span>
                </div>
              </div>
              <div className="device-support__features">
                <article>
                  <span className="device-support__feature-icon" aria-hidden="true">◎</span>
                  <div>
                    <h3>Aprendizado ativo</h3>
                    <p>Podcast, transcript e jogos ajudam você a transformar contato em prática.</p>
                  </div>
                </article>
                <article>
                  <span className="device-support__feature-icon" aria-hidden="true">▦</span>
                  <div>
                    <h3>Feito para todas as telas</h3>
                    <p>Continue de onde parou em celulares, tablets, computadores e TVs compatíveis.</p>
                  </div>
                </article>
                <article>
                  <span className="device-support__feature-icon" aria-hidden="true">↗</span>
                  <div>
                    <h3>Experiência pensada por especialistas</h3>
                    <p>Interface objetiva, controles claros e foco em uma jornada simples para o aluno.</p>
                  </div>
                </article>
              </div>
              <div className="device-support__tv-modes" aria-labelledby="device-support-tv-modes-title">
                <div className="device-support__tv-modes-heading">
                  <span className="device-support__eyebrow">EXPERIENCIA EN PANTALLA GRANDE</span>
                  <h3 id="device-support-tv-modes-title">Escolha como quer aprender na TV</h3>
                  <p>Use o celular como controle e transforme a TV em uma sala de estudo interativa.</p>
                </div>
                <div className="device-support__tv-mode-grid">
                  <button
                    type="button"
                    className="device-support__tv-mode device-support__tv-mode--podcast"
                    onClick={() => void handleConnectToTv('podcast')}
                  >
                    <span className="device-support__tv-mode-icon" aria-hidden="true">▶</span>
                    <span className="device-support__tv-mode-copy">
                      <strong>Ouvir podcast na TV</strong>
                      <span>Acompanhe o áudio, o transcript e controle Play/Pause pelo celular.</span>
                    </span>
                    <span className="device-support__tv-mode-action"><span aria-hidden="true">●</span> Conectar agora</span>
                  </button>
                  <button
                    type="button"
                    className="device-support__tv-mode device-support__tv-mode--games"
                    onClick={() => void handleConnectToTv('jogos')}
                  >
                    <span className="device-support__tv-mode-icon" aria-hidden="true">◆</span>
                    <span className="device-support__tv-mode-copy">
                      <strong>Jogar na TV</strong>
                      <span>Veja os desafios na tela grande e avance pelos níveis com o controle remoto.</span>
                    </span>
                    <span className="device-support__tv-mode-action"><span aria-hidden="true">●</span> Conectar agora</span>
                  </button>
                </div>
              </div>
              <div className="device-support__assurance">
                <span className="device-support__assurance-mark" aria-hidden="true">✓</span>
                <p><strong>Você no controle.</strong> Escolha o dispositivo, pratique com conforto e avance com consistência.</p>
              </div>
              {canConnectToTv && isTvConnected && (
                <div className="device-support__tv-control">
                  <button
                    type="button"
                    className="device-support__connect is-connected"
                    onClick={handleDisconnectFromTv}
                    title="Desconectar da TV"
                  >
                    <span className="device-support__connect-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false">
                        <rect x="3" y="4" width="18" height="13" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                    </span>
                    <span>Conectado à TV · Desconectar</span>
                  </button>
                </div>
              )}
              {connectionMessage && (
                <div className="device-support__message" role="status" aria-live="polite">
                  <p>{connectionMessage}</p>
                  <button type="button" onClick={() => setConnectionMessage(null)} aria-label="Fechar instruções de conexão">
                    Entendi
                  </button>
                </div>
              )}
              {isTvConnected && (
                <div className="device-support__remote" aria-label="Controle remoto da TV">
                  <strong>Controle remoto</strong>
                  <div className="device-support__remote-actions">
                    <button type="button" onClick={() => sendTvCommand('seek-back')} aria-label="Voltar 10 segundos">−10 s</button>
                    <button type="button" onClick={() => sendTvCommand('play-pause')} aria-label="Reproduzir ou pausar">Play/Pause</button>
                    <button type="button" onClick={() => sendTvCommand('seek-forward')} aria-label="Avançar 10 segundos">+10 s</button>
                    <button type="button" onClick={() => sendTvCommand('previous')} aria-label="Episódio anterior">Anterior</button>
                    <button type="button" onClick={() => sendTvCommand('next')} aria-label="Próximo episódio">Próximo</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
      */}
      <LeadForm />
      <Footer />
    </div>
  );
}

export default App;
