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

type PresentationRequest = new (urls: string[]) => {
  start: () => Promise<PresentationSession>;
};

type PresentationWindow = Window & {
  PresentationRequest?: PresentationRequest;
};

type PresentationNavigator = Navigator & {
  presentation?: {
    receiver?: PresentationReceiver;
  };
};

type TvPlatform = 'android' | 'iphone' | 'other';

const getTvPlatform = (): TvPlatform => {
  if (typeof navigator === 'undefined') {
    return 'other';
  }

  if (/android/i.test(navigator.userAgent)) {
    return 'android';
  }

  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    return 'iphone';
  }

  return 'other';
};

const getTvModeUrl = (requestedFocus?: 'jogos' | 'podcast') => {
  if (typeof window === 'undefined') {
    return '';
  }

  const url = new URL(window.location.href);
  url.searchParams.set('display', 'tv');
  const focus = requestedFocus
    ?? (new URLSearchParams(window.location.search).get('focus') === 'podcast' ? 'podcast' : 'jogos');
  url.searchParams.set('focus', focus === 'podcast' ? 'podcast' : 'jogos');
  url.hash = focus === 'podcast' ? 'podcast' : 'jogos';
  return url.toString();
};

const supportsNativeTvHandoff = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const hasPresentationApi = typeof (window as PresentationWindow).PresentationRequest === 'function';
  const mobileOrTablet = /android|iphone|ipad|ipod|mobile|tablet/i.test(navigator.userAgent)
    || window.matchMedia('(pointer: coarse)').matches;

  return hasPresentationApi || (mobileOrTablet && typeof navigator.share === 'function');
};

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const savedTheme = window.localStorage.getItem('theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  });
  const [canConnectToTv] = useState(supportsNativeTvHandoff);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [isDeviceSupportOpen, setIsDeviceSupportOpen] = useState(false);
  const [tvConnection, setTvConnection] = useState<PresentationSession | null>(null);
  const isTvConnected = tvConnection?.state === 'connected';
  const tvPlatform = getTvPlatform();
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

  const handleConnectToTv = async (focus: 'jogos' | 'podcast' = 'jogos') => {
    const presentationConstructor = (window as PresentationWindow).PresentationRequest;

    if (presentationConstructor) {
      try {
        const request = new presentationConstructor([getTvModeUrl(focus)]);
        const connection = await request.start();
        connection.onstatechange = () => {
          if (connection.state === 'connected') {
            connection.send?.(JSON.stringify({ type: 'tv-ready', focus }));
            setConnectionMessage(focus === 'podcast'
              ? 'TV conectada. O podcast foi aberto no modo TV; use Play/Pause, setas e avanço para controlar.'
              : 'TV conectada. Os jogos foram abertos no modo TV; use o controle da TV para navegar.');
          } else if (connection.state === 'closed' || connection.state === 'terminated') {
            setTvConnection(null);
            setConnectionMessage(null);
          }
          setTvConnection(connection);
        };
        setTvConnection(connection);
      } catch (error) {
        if (error instanceof Error && error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
          setConnectionMessage('Não foi possível iniciar a conexão direta. Verifique se o celular e a TV estão na mesma rede.');
        }
      }
      return;
    }

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Horizonte.espanhol na TV',
          text: tvPlatform === 'iphone'
            ? 'Abra o modo TV no iPhone e escolha uma opção de transmissão ou uma TV compatível.'
            : 'Abra o modo TV do Horizonte.espanhol na sua TV para jogar com o controle.',
          url: getTvModeUrl(focus),
        });
        setConnectionMessage(tvPlatform === 'iphone'
          ? 'No menu de compartilhamento, escolha uma opção de transmissão ou espelhamento de tela. O iPhone não permite iniciar a transmissão diretamente pelo navegador.'
          : 'Abra o link na TV ou escolha uma opção de transmissão no menu do celular. O modo TV já começa nos jogos.');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setConnectionMessage('A conexão foi cancelada pelo dispositivo.');
        }
      }
      return;
    }

    handleOpenTvMode(focus);
  };

  const handleOpenTvMode = (focus: 'jogos' | 'podcast') => {
    window.open(getTvModeUrl(focus), '_blank', 'noopener,noreferrer');
    setConnectionMessage(focus === 'podcast'
      ? 'O modo TV do podcast foi aberto. Use Play/Pause, setas e avanço no controle.'
      : 'O modo TV dos jogos foi aberto. Use o controle para selecionar e jogar.');
  };

  const handleDisconnectFromTv = () => {
    tvConnection?.close?.();
    tvConnection?.terminate?.();
    setTvConnection(null);
    setConnectionMessage(null);
  };

  const sendTvCommand = (type: string) => {
    tvConnection?.send?.(JSON.stringify({ type }));
    setConnectionMessage('Comando enviado para a TV.');
  };

  useEffect(() => {
    if (!isDeviceSupportOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        setIsDeviceSupportOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDeviceSupportOpen]);

  return (
    <div className="app-container">
      <Header theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
      <CelestialCarousel />
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
      <PodcastShowcase />
      <GamesSection />
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
      <LeadForm />
      <Footer />
    </div>
  );
}

export default App;
