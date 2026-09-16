import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import styles from './PodcastShowcase.module.css';

type SpeedOption = 1 | 1.5 | 2;
type SpeedMenu = 'compact' | 'full' | null;
type CaptionMenu = 'cover' | 'compact' | 'full' | null;
type CaptionLanguage = 'pt' | 'es' | null;
type TvCommand = {
  type?: 'tv-ready' | 'play' | 'pause' | 'play-pause' | 'next' | 'previous' | 'seek-forward' | 'seek-back' | 'close';
};

type TranscriptCue = {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  language: 'pt' | 'es';
};

type TranscriptJsonCue = {
  id: string;
  startTime: number;
  endTime: number;
  pt: string;
  es: string;
};

type TranscriptDocument = {
  episodeId: number;
  audio: string;
  languages: {
    pt: string;
    es: string;
  };
  cues: TranscriptJsonCue[];
};

type Episode = {
  id: number;
  title: string;
  label: string;
  image: string;
  featuredImage?: string;
  description: string;
};

const EPISODES: Episode[] = [
  {
    id: 1,
    title: 'Método Horizonte',
    label: 'Novo episódio',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&h=1400&q=80',
    featuredImage:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&h=1500&q=80',
    description: 'Ouça duas opiniões sobre nossos jogos e conheça os cinco níveis da escala de proficiência.',
  },
  {
    id: 2,
    title: 'Vocabulário em contexto',
    label: 'Em breve',
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&h=1400&q=80',
    description: 'Palavras mais usadas no dia a dia com pronúncia natural.',
  },
  {
    id: 3,
    title: 'Conversas reais',
    label: 'Em breve',
    image:
      'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=900&h=1400&q=80',
    description: 'Escute frases que você vai usar no trabalho, na viagem e na rotina.',
  },
];

const SPEED_OPTIONS: SpeedOption[] = [1, 1.5, 2];
const FALLBACK_DURATION_SECONDS = 18 * 60;
const PODCAST_AUDIO_SOURCE = '/audio/podcast-horizonte-episodio-1.mp3';
const TRANSCRIPT_CORRECTIONS: Array<[string, string]> = [
  ['manzana e rora', 'manzana y roja'],
  ['manzana y roja', '"manzana" e "roja"'],
  ['mação vermelha', 'maçã vermelha'],
  ['buenusaires', '"Buenos Aires"'],
  ['e aí você precisa pedir para provar uma camisa.', 'e aí você precisa pedir: "¿Puedo probarme esta camisa?"'],
  ['Põe do probar uma esta camisa,', '“¿Puedo probarme esta camisa?”,'],
  ['põe do ponerme, esta camisa,', '“¿Puedes ponerme esta camisa?”,'],
  ['põe do probar esta camisa,', '“¿Puedo probar esta camisa?”,'],
  ['e põe do vestirme, esta camisa.', '“¿Puedo vestirme esta camisa?”.'],
  ['“¿Puedo vestirme esta camisa?”.', '“¿Puedo ponerme esta camisa?”.'],
  ['a vontade instintiva é direto no vestirme.', 'a vontade instintiva é dizer "vestirme".'],
  ['usa vestirme nesse contexto da loja', 'usa "vestirme" nesse contexto da loja'],
  ['escausas e efeitos em ordem cronológico', 'causas e efeitos em ordem cronológica'],
  ['eu vió a três países diferentes.', '"Este año, viajé a tres países diferentes."'],
  ['para montar quando liguei a la aeropuerto', 'para montar "Cuando llegué al aeropuerto,'],
  ['já havia perdido me voelo.', 'ya había perdido mi vuelo."'],
  ['E a questão na tela é se eu mais dinheiro viajaria todos os países de América Latina.', 'E a questão na tela é: "Si tuviera más dinero, viajaría por todos los países de América Latina."'],
  ['Tuve, tuviera e tengo.', '"Tuve", "tuviera" e "tengo".'],
  ['E a resposta no caso é o subjuntivo tuviera.', 'E a resposta no caso é o subjuntivo "tuviera".'],
  ['Isso, tuviera.', 'Isso, "tuviera".'],
  ['Mas a frase do desafio começa com si que é ser.', 'Mas a frase do desafio começa com "si", que significa "se".'],
  ['O siga estabelece um mundo imaginário.', 'O "si" estabelece um mundo imaginário.'],
  ['Se o outro viera, se eu tivesse.', '"Si tuviera", "si pudiera".'],
  ['Quando a aeropuerto já me perdido,', 'O exemplo aparece assim: "Cuando llegué al aeropuerto,'],
  ['guerrei, abia, voelo e alhe.', 'ya había perdido mi vuelo."'],
  ['que uma ação já estava concluída antes da outra si quer começar.', 'que uma ação já estava concluída antes de a outra sequer começar.'],
  ['Perdi o sentido ou só assim extremamente não natural por um nativo.', 'Perde o sentido ou fica extremamente não natural para um nativo.'],
  ['Ah, o pretérito perfeito em espanhão é uma pedreira pra nós brasileiros.', 'Ah, o pretérito perfeito em espanhol é uma pedreira pra nós brasileiros.'],
  ['Ele é formado pelo verbo a ver mais o participio.', 'Ele é formado pelo verbo "haber" mais o particípio.'],
  ['Na frase esteânio, o ano fim ainda não acabou, certo?', 'Na frase "Este año", o ano ainda não acabou, certo?'],
  ['Qual vaca você quer?', 'Qual vaga você quer?'],
  ['divírtase', '"diviértase"'],
  ['a horizonte espanhou', 'a Horizonte Espanhol'],
  ['nas hipópiasas', 'nas hipóteses'],
  ['sintá-se', 'sintaxe'],
  ['o yab e a perdido', '"ya" e "había perdido"'],
  ['Sibem. É onde muita gente escorrega.', 'Sim. É onde muita gente escorrega.'],
  ['em vez de sua super-diplomático indivíduo tropeça na gramática.', 'o indivíduo superdiplomático tropeça na gramática.'],
  ['E acaba suando em seguro, né?', 'E acaba soando inseguro, né?'],
  ['Em seguro ou até agressivo.', 'Inseguro ou até agressivo.'],
  ['o negócio vai por água baixo', 'o negócio vai por água abaixo'],
  ['doce e cheio de capturas de tela', 'dossiê cheio de capturas de tela'],
  ['Horizonte Espanhol e de Homecultura', 'Horizonte Espanhol, Idioma e Cultura'],
  ['o lemma da plataforma', 'o lema da plataforma'],
  ['cada jogo é um de grau, cada de grau uma conquista', 'cada jogo é um degrau, cada degrau uma conquista'],
  ['Sou a superinofensivo', 'Soa superinofensivo'],
  ['a Unível 1', 'o nível 1'],
  ['te baseado em reconhecimento passivo', 'tudo baseado em reconhecimento passivo'],
  ['Criu uma falsa, porém necessária, sensação de segurança por aluno.', 'Cria uma falsa, porém necessária, sensação de segurança para o aluno.'],
  ['A plataforma da quatro alternativas', 'A plataforma dá quatro alternativas'],
  ['sou a como se você tivesse perguntando o provendedor se litida a permissão', 'soa como se você estivesse perguntando ao vendedor se ele lhe daria permissão'],
  ['A opção correta ali é probar-me.', 'A opção correta ali é "probarme".'],
  ['o verbo probar-me na loja', 'o verbo "probarme" na loja'],
  ['desinvolutura avançada', 'desenvoltura avançada'],
  ['arreagana', 'carreira'],
  ['suarrude', 'soar rude'],
  ['Meio de tatorial até.', 'Meio ditatorial até.'],
  ['reagra de gramática', 'regra de gramática'],
  ['da espaço para negociar', 'dá espaço para negociar'],
  ['da setapa', 'dessa etapa'],
  ['ficilmo do nível 5', 'desafio final do nível 5'],
  ['esse vaco', 'esse vácuo'],
  ['sobrevidência corporativa', 'sobrevivência corporativa'],
  ['desfarçado como interface', 'disfarçado como interface'],
  ['a faixada que me ficada chama muita atenção', 'a fachada chama muita atenção'],
  ['O lemma deles', 'O lema deles'],
  ['a multipliscólia', 'a multiplicação'],
  ['Sumil.', 'Sumiu.'],
  ['link edim', 'LinkedIn'],
  ['rezá para algum recrutador', 'rezar para algum recrutador'],
  ['Imagina em a seguinte situação, um profissional super-qualificado, tipo com aquele currículo impecável,', 'Imagine a seguinte situação: um profissional superqualificado, com aquele currículo impecável,'],
  ['quando cheguei a aeropuerto, já tinha perdido meu voo.', 'quando cheguei ao aeroporto, já tinha perdido meu voo.'],
  ['A linha que você para quem fala que ele espanha ao meio quebrado', 'A linha que separa quem fala o idioma de forma meio quebrada'],
];

const _normalizeTranscriptText = (text: string) =>
  TRANSCRIPT_CORRECTIONS.reduce((normalizedText, [incorrect, corrected]) => (
    normalizedText.replaceAll(incorrect, corrected)
  ), text);
void _normalizeTranscriptText;

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const roundedSeconds = Math.floor(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export default function PodcastShowcase() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptListRef = useRef<HTMLDivElement | null>(null);
  const togglePlaybackRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const tvCommandRef = useRef<(command: TvCommand) => void>(() => undefined);
  const selectEpisodeRef = useRef<(episodeId: number) => void>(() => undefined);
  const coverTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const coverHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverHoldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coverHoldDirectionRef = useRef<-1 | 1>(1);
  const coverHoldSecondsRef = useRef(0);
  const coverLastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const [coverSeekFeedback, setCoverSeekFeedback] = useState<{ direction: -1 | 1; seconds: number } | null>(null);
  const readingPanelPointerStartRef = useRef<{ x: number; y: number; pointerType: string } | null>(null);
  const readingPanelPointerMovedRef = useRef(false);
  const featuredMetaRef = useRef<HTMLDivElement>(null);
  const closeFeatureButtonRef = useRef<HTMLButtonElement>(null);
  const featureOpenerRef = useRef<HTMLElement | null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<SpeedOption>(1);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_DURATION_SECONDS);
  const [isFeatureMode, setIsFeatureMode] = useState(false);
  const [isEpisodeComplete, setIsEpisodeComplete] = useState(false);
  const [isLockedOnFirstEpisode, setIsLockedOnFirstEpisode] = useState(false);
  const [isEpisodeTransitioning, setIsEpisodeTransitioning] = useState(false);
  const [openSpeedMenu, setOpenSpeedMenu] = useState<SpeedMenu>(null);
  const [isVolumeMenuOpen, setIsVolumeMenuOpen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [captionLanguage, setCaptionLanguage] = useState<CaptionLanguage>(null);
  const [captionMenu, setCaptionMenu] = useState<CaptionMenu>(null);
  const [transcriptCues, setTranscriptCues] = useState<TranscriptCue[]>([]);
  const [readingPanelWidth, setReadingPanelWidth] = useState(78);
  const [isPortraitStudyMode, setIsPortraitStudyMode] = useState(true);
  const [isOrientationSyncEnabled, setIsOrientationSyncEnabled] = useState(false);

  const updateReadingPanelWidth = (nextWidth: number | ((width: number) => number)) => {
    const update = () => setReadingPanelWidth(nextWidth);
    const viewTransitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };

    if (typeof viewTransitionDocument.startViewTransition === 'function') {
      viewTransitionDocument.startViewTransition(update);
      return;
    }

    update();
  };

  useEffect(() => {
    featuredMetaRef.current?.scrollTo({ top: 0 });
  }, [readingPanelWidth]);

  useEffect(() => {
    if (!isFeatureMode) {
      return undefined;
    }

    closeFeatureButtonRef.current?.focus();
    return undefined;
  }, [isFeatureMode]);

  useEffect(() => {
    if (!isFeatureMode || !isOrientationSyncEnabled) {
      return undefined;
    }

    const orientationQuery = window.matchMedia('(orientation: landscape)');
    const syncStudyMode = () => {
      setIsPortraitStudyMode(!orientationQuery.matches);
    };

    orientationQuery.addEventListener('change', syncStudyMode);
    window.addEventListener('orientationchange', syncStudyMode);
    window.addEventListener('resize', syncStudyMode);

    return () => {
      orientationQuery.removeEventListener('change', syncStudyMode);
      window.removeEventListener('orientationchange', syncStudyMode);
      window.removeEventListener('resize', syncStudyMode);
    };
  }, [isFeatureMode, isOrientationSyncEnabled]);

  const [isResizingReadingPanel, setIsResizingReadingPanel] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTranscript = async () => {
      const response = await fetch('/transcripts/episodio-1.json');
      if (!response.ok) {
        throw new Error(`No se pudo cargar el transcript (${response.status}).`);
      }

      const document = (await response.json()) as TranscriptDocument;
      if (
        document.episodeId !== 1
        || !document.audio
        || !Array.isArray(document.cues)
        || document.cues.length === 0
        || document.cues.some((cue) => (
          !cue.id
          || !Number.isFinite(cue.startTime)
          || !Number.isFinite(cue.endTime)
          || cue.endTime <= cue.startTime
          || !cue.pt.trim()
          || !cue.es.trim()
        ))
      ) {
        throw new Error('El transcript del episodio 1 no tiene una estructura válida.');
      }

      if (!isMounted) {
        return;
      }

      setTranscriptCues(document.cues.flatMap((cue) => [
        { id: `${cue.id}-pt`, startTime: cue.startTime, endTime: cue.endTime, text: cue.pt, language: 'pt' as const },
        { id: `${cue.id}-es`, startTime: cue.startTime, endTime: cue.endTime, text: cue.es, language: 'es' as const },
      ]));
    };

    loadTranscript().catch((error: unknown) => {
      if (isMounted) {
        setAudioError(error instanceof Error ? error.message : 'No se pudo cargar el transcript.');
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.playbackRate = speed;
    audioRef.current.volume = volume;
  }, [speed, volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    Array.from(audio.textTracks).forEach((track) => {
      track.mode = track.language === captionLanguage ? 'showing' : 'hidden';
    });
  }, [captionLanguage]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }

      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      setCurrentTime(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration);
      setIsLockedOnFirstEpisode(false);
      setOpenSpeedMenu(null);
      setIsVolumeMenuOpen(false);
      setIsEpisodeComplete(true);
      setIsFeatureMode(true);
      setIsPortraitStudyMode(false);
      setIsOrientationSyncEnabled(false);
    };

    const handleCanPlay = () => {
      setIsAudioLoading(false);
    };

    const handlePlaying = () => {
      setIsAudioLoading(false);
    };

    const handleAudioError = () => {
      setIsAudioLoading(false);
      setIsPlaying(false);
      setAudioError('Não foi possível carregar este episódio. Tente novamente.');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [duration]);

  useEffect(() => {
    if (!isFeatureMode) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const getFocusableElements = (dialog: HTMLElement) => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.getClientRects().length > 0);

    const moveFocusSpatially = (direction: 'left' | 'right' | 'up' | 'down') => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
      const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!dialog || !activeElement || activeElement.getAttribute('role') === 'slider') {
        return false;
      }

      const currentRect = activeElement.getBoundingClientRect();
      const currentCenter = {
        x: currentRect.left + currentRect.width / 2,
        y: currentRect.top + currentRect.height / 2,
      };
      const candidates = getFocusableElements(dialog)
        .filter((element) => element !== activeElement)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          const deltaX = center.x - currentCenter.x;
          const deltaY = center.y - currentCenter.y;
          const isInDirection = direction === 'left'
            ? deltaX < -4
            : direction === 'right'
              ? deltaX > 4
              : direction === 'up'
                ? deltaY < -4
                : deltaY > 4;

          if (!isInDirection) {
            return null;
          }

          const primaryDistance = direction === 'left' || direction === 'right'
            ? Math.abs(deltaX)
            : Math.abs(deltaY);
          const secondaryDistance = direction === 'left' || direction === 'right'
            ? Math.abs(deltaY)
            : Math.abs(deltaX);

          return { element, score: primaryDistance + secondaryDistance * 2 };
        })
        .filter((candidate): candidate is { element: HTMLElement; score: number } => candidate !== null)
        .sort((first, second) => first.score - second.score);

      const nextElement = candidates[0]?.element;
      if (!nextElement) {
        return false;
      }

      nextElement.focus();
      return true;
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]') ?? false;
      const isSlider = target?.getAttribute('role') === 'slider';

      if ((event.key === 'Escape' || event.key === 'Backspace') && !isTyping) {
        event.preventDefault();
        closeFeatureMode();
        return;
      }

      if (isTyping) {
        return;
      }

      if (event.key === 'MediaPlayPause' || event.code === 'MediaPlayPause') {
        event.preventDefault();
        void togglePlaybackRef.current();
        return;
      }

      if (event.key === 'MediaTrackNext' || event.key === 'PageDown') {
        event.preventDefault();
        seekBySeconds(10);
        return;
      }

      if (event.key === 'MediaTrackPrevious' || event.key === 'PageUp') {
        event.preventDefault();
        seekBySeconds(-10);
        return;
      }

      if (event.key === 'AudioVolumeUp') {
        event.preventDefault();
        setVolume((currentVolume) => Math.min(1, Math.round((currentVolume + 0.1) * 100) / 100));
        return;
      }

      if (event.key === 'AudioVolumeDown') {
        event.preventDefault();
        setVolume((currentVolume) => Math.max(0, Math.round((currentVolume - 0.1) * 100) / 100));
        return;
      }

      if (event.key === 'AudioVolumeMute') {
        event.preventDefault();
        setVolume((currentVolume) => currentVolume > 0 ? 0 : 1);
        return;
      }

      if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight'
        || event.key === 'ArrowUp' || event.key === 'ArrowDown') && !isSlider) {
        if (moveFocusSpatially(event.key.slice(5).toLowerCase() as 'left' | 'right' | 'up' | 'down')) {
          event.preventDefault();
        }
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
      if (!dialog) {
        return;
      }

      const focusableElements = getFocusableElements(dialog);

      if (focusableElements.length === 0) {
        event.preventDefault();
        closeFeatureButtonRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFeatureMode]);

  const ensureAudioSource = (episodeId: number) => {
    if (episodeId !== 1) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const hasEpisodeSource = audio.src.includes(PODCAST_AUDIO_SOURCE);

    if (!hasEpisodeSource) {
      audio.src = PODCAST_AUDIO_SOURCE;
      audio.load();
      return;
    }

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
      setIsAudioLoading(false);
    }
  };

  const handleSelectEpisode = (episodeId: number) => {
    if (isLockedOnFirstEpisode && episodeId !== 1) {
      return;
    }

    featureOpenerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedEpisodeId(episodeId);
    setIsFeatureMode(true);
    setIsPortraitStudyMode(false);
    setIsOrientationSyncEnabled(false);
    setReadingPanelWidth(78);
    setIsLockedOnFirstEpisode(true);
    setIsEpisodeComplete(false);
    setCaptionMenu(null);

    if (episodeId === 1) {
      ensureAudioSource(episodeId);
    } else {
      setCaptionLanguage(null);
      setCurrentTime(0);
      setDuration(0);
      setProgress(0);
    }
  };
  selectEpisodeRef.current = handleSelectEpisode;

  const handleTogglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!isFeatureMode) {
      featureOpenerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsFeatureMode(true);
    setIsPortraitStudyMode(false);
    setIsOrientationSyncEnabled(false);
    setReadingPanelWidth(78);
    setSelectedEpisodeId(1);
    setIsLockedOnFirstEpisode(true);
    setIsEpisodeComplete(false);
    setAudioError(null);
    ensureAudioSource(1);

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setIsAudioLoading(true);

    try {
      await audio.play();
      setIsAudioLoading(false);
      setIsPlaying(true);
    } catch (error) {
      console.error('Unable to play podcast episode', error);
      setIsPlaying(false);
      setIsAudioLoading(false);
      setAudioError('Não foi possível iniciar o episódio. Tente novamente.');
    }
  };

  togglePlaybackRef.current = handleTogglePlayback;

  const closeFeatureMode = () => {
    setIsFeatureMode(false);
    setIsPortraitStudyMode(true);
    setIsOrientationSyncEnabled(false);
    setIsLockedOnFirstEpisode(false);
    setCaptionMenu(null);
    setOpenSpeedMenu(null);
    setIsVolumeMenuOpen(false);
    audioRef.current?.pause();
    setIsPlaying(false);
    window.setTimeout(() => featureOpenerRef.current?.focus(), 0);
  };

  useEffect(() => {
    const handleSpacebar = (event: globalThis.KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]') ?? false;
      const isButton = target?.closest('button, [role="button"], [role="slider"]');

      if (event.code !== 'Space' || isTyping || isButton || !audioRef.current?.src || isAudioLoading) {
        return;
      }

      event.preventDefault();
      void togglePlaybackRef.current();
    };

    document.addEventListener('keydown', handleSpacebar);
    return () => document.removeEventListener('keydown', handleSpacebar);
  }, [isAudioLoading, isPlaying]);

  const handleContinueToNextEpisode = () => {
    setIsFeatureMode(false);
    setIsLockedOnFirstEpisode(false);
    setSelectedEpisodeId(2);
    setIsEpisodeComplete(false);
    setProgress(0);
  };

  const handlePreviewEpisode = (direction: -1 | 1) => {
    const targetEpisode = EPISODES.find((episode) => episode.id === activeEpisode.id + direction);

    if (!targetEpisode || isEpisodeTransitioning) {
      return;
    }

    audioRef.current?.pause();
    setIsPlaying(false);
    setOpenSpeedMenu(null);
    setIsVolumeMenuOpen(false);
    setIsEpisodeTransitioning(true);

    window.setTimeout(() => {
      setSelectedEpisodeId(targetEpisode.id);
      setIsLockedOnFirstEpisode(true);
      setIsEpisodeComplete(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setCaptionLanguage(null);
      setAudioError(null);

      window.setTimeout(() => {
        setIsEpisodeTransitioning(false);
      }, 180);
    }, 520);
  };

  const handlePreviewNextEpisode = () => handlePreviewEpisode(1);
  const handlePreviewPreviousEpisode = () => handlePreviewEpisode(-1);

  useEffect(() => {
    const handleTvCommand = (event: Event) => {
      tvCommandRef.current((event as CustomEvent<TvCommand>).detail);
    };

    window.addEventListener('horizonte:tv-command', handleTvCommand);
    return () => window.removeEventListener('horizonte:tv-command', handleTvCommand);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('display') !== 'tv' || params.get('focus') !== 'podcast') {
      return;
    }

    selectEpisodeRef.current(1);
    window.setTimeout(() => {
      document.getElementById('podcast')?.scrollIntoView({ block: 'start' });
    }, 0);
  }, []);

  tvCommandRef.current = (command) => {
    if (command.type === 'play' && !isPlaying) {
      void handleTogglePlayback();
    } else if (command.type === 'pause' && isPlaying) {
      void handleTogglePlayback();
    } else if (command.type === 'play-pause') {
      void handleTogglePlayback();
    } else if (command.type === 'next') {
      handlePreviewNextEpisode();
    } else if (command.type === 'previous') {
      handlePreviewPreviousEpisode();
    } else if (command.type === 'seek-forward') {
      seekBySeconds(10);
    } else if (command.type === 'seek-back') {
      seekBySeconds(-10);
    } else if (command.type === 'close') {
      closeFeatureMode();
    }
  };

  const activeEpisode = EPISODES.find((episode) => episode.id === selectedEpisodeId) ?? EPISODES[0];
  const isPrimaryEpisode = activeEpisode.id === 1;
  const isStudyTextExpanded = !isPortraitStudyMode && readingPanelWidth >= 60;

  const toggleStudyText = () => {
    const shouldExpand = !isStudyTextExpanded;
    setIsOrientationSyncEnabled(false);
    setIsPortraitStudyMode(!shouldExpand);
    updateReadingPanelWidth(shouldExpand ? 80 : 39);
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  };

  const closeVolumeMenu = () => {
    window.setTimeout(() => {
      setIsVolumeMenuOpen(false);
    }, 150);
  };

  const renderSpeedSelector = ({ compact = false }: { compact?: boolean }) => {
    const menuKey: Exclude<SpeedMenu, null> = compact ? 'compact' : 'full';

    return (
    <div className={compact ? styles.speedControlCompact : styles.speedControl}>
      <button
        type="button"
        className={`${styles.speedTrigger} ${compact ? styles.speedTriggerCompact : ''}`}
        disabled={!isPrimaryEpisode}
        onClick={() => {
          setIsVolumeMenuOpen(false);
          setOpenSpeedMenu((current) => (current === menuKey ? null : menuKey));
        }}
        aria-label="Ajustar velocidade de reprodução"
        aria-expanded={openSpeedMenu === menuKey}
        aria-haspopup="menu"
      >
        <span className={styles.speedTriggerIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 15a8 8 0 1 1 16 0" />
            <path d="M12 15l3.8-4.2" />
            <path d="M3.5 15h1.8m13.4 0h1.8" />
          </svg>
        </span>
        <span className={styles.speedTriggerLabel}>{speed}x</span>
      </button>

      {openSpeedMenu === menuKey && (
        <div className={compact ? styles.speedMenuCompact : styles.speedMenu} role="menu" aria-label="Opções de velocidade">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`${compact ? styles.speedMenuItemCompact : styles.speedMenuItem} ${speed === option ? styles.speedMenuItemActive : ''}`}
              onClick={() => {
                setSpeed(option);
                setOpenSpeedMenu(null);
              }}
              role="menuitemradio"
              aria-checked={speed === option}
            >
              {option}x
            </button>
          ))}
        </div>
      )}
    </div>
    );
  };

  const renderCaptionSelector = ({ compact = false, onCover = false }: { compact?: boolean; onCover?: boolean }) => {
    const menuKey: Exclude<CaptionMenu, null> = onCover ? 'cover' : compact ? 'compact' : 'full';
    const isCaptionMenuOpen = captionMenu === menuKey;

    return (
    <div className={`${compact ? styles.captionControlCompact : styles.captionControl} ${onCover ? styles.captionControlCover : ''}`}>
      <button
        type="button"
        className={styles.captionButton}
        onClick={(event) => {
          event.stopPropagation();
          setCaptionMenu((current) => (current === menuKey ? null : menuKey));
        }}
        aria-label={captionLanguage ? `Escolher idioma das legendas (atual: ${captionLanguage === 'pt' ? 'Português' : 'Español'})` : 'Escolher idioma das legendas'}
        aria-pressed={captionLanguage !== null}
        aria-expanded={isCaptionMenuOpen}
        aria-haspopup="menu"
        disabled={!isPrimaryEpisode}
      >
        CC
      </button>
      <span className={styles.captionLanguage} aria-live="polite">
        {captionLanguage === 'pt' ? 'PT' : captionLanguage === 'es' ? 'ES' : ''}
      </span>
      {isCaptionMenuOpen && isPrimaryEpisode && (
        <div className={`${styles.captionMenu} ${compact ? styles.captionMenuCompact : ''} ${onCover ? styles.captionMenuCover : ''}`} role="menu" aria-label="Idioma das legendas">
          <button
            type="button"
            className={`${styles.captionMenuItem} ${captionLanguage === 'pt' ? styles.captionMenuItemActive : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              setCaptionLanguage('pt');
              setCaptionMenu(null);
            }}
            role="menuitemradio"
            aria-checked={captionLanguage === 'pt'}
          >
            <span>Português</span>
            <span aria-hidden="true">{captionLanguage === 'pt' ? '✓' : ''}</span>
          </button>
          <button
            type="button"
            className={`${styles.captionMenuItem} ${captionLanguage === 'es' ? styles.captionMenuItemActive : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              setCaptionLanguage('es');
              setCaptionMenu(null);
            }}
            role="menuitemradio"
            aria-checked={captionLanguage === 'es'}
          >
            <span>Español</span>
            <span aria-hidden="true">{captionLanguage === 'es' ? '✓' : ''}</span>
          </button>
          <button
            type="button"
            className={`${styles.captionMenuItem} ${captionLanguage === null ? styles.captionMenuItemActive : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              setCaptionLanguage(null);
              setCaptionMenu(null);
            }}
            role="menuitemradio"
            aria-checked={captionLanguage === null}
          >
            <span>Sem legendas</span>
            <span aria-hidden="true">{captionLanguage === null ? '✓' : ''}</span>
          </button>
        </div>
      )}
    </div>
    );
  };

  const portugueseCues = transcriptCues.filter((cue) => cue.language === 'pt');
  const spanishCues = transcriptCues.filter((cue) => cue.language === 'es');
  const studyCues = portugueseCues.length > 0 ? portugueseCues : spanishCues;
  const activePortugueseCue = portugueseCues.find((cue) => currentTime >= cue.startTime && currentTime < cue.endTime);
  const activeSpanishCue = spanishCues.find((cue) => currentTime >= cue.startTime && currentTime < cue.endTime);

  useEffect(() => {
    if (!activePortugueseCue || !transcriptListRef.current) {
      return;
    }

    const activeElement = transcriptListRef.current.querySelector<HTMLElement>(
      `[data-cue-id="${CSS.escape(activePortugueseCue.id)}"]`,
    );
    activeElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activePortugueseCue]);

  const seekToCue = (cue: TranscriptCue) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.currentTime = cue.startTime;
    setCurrentTime(cue.startTime);
    setProgress(audio.duration > 0 ? (cue.startTime / audio.duration) * 100 : 0);
  };

  const seekToPosition = (track: HTMLDivElement, clientX: number) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const nextTime = ratio * audio.duration;

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    setProgress((nextTime / audio.duration) * 100);
  };

  const handleSeekPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      navigator.vibrate?.(8);
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsSeeking(true);
    seekToPosition(event.currentTarget, event.clientX);
  };

  const handleSeekPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isSeeking) {
      seekToPosition(event.currentTarget, event.clientX);
    }
  };

  const handleSeekPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsSeeking(false);
  };

  const seekBySeconds = (seconds: number) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    const nextTime = Math.min(Math.max(audio.currentTime + seconds, 0), audio.duration);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    setProgress((nextTime / audio.duration) * 100);
  };

  const clearCoverHold = () => {
    if (coverHoldTimeoutRef.current) {
      clearTimeout(coverHoldTimeoutRef.current);
      coverHoldTimeoutRef.current = null;
    }
    if (coverHoldIntervalRef.current) {
      clearInterval(coverHoldIntervalRef.current);
      coverHoldIntervalRef.current = null;
    }
    coverHoldSecondsRef.current = 0;
  };

  const showCoverSeekFeedback = (direction: -1 | 1, seconds: number) => {
    setCoverSeekFeedback({ direction, seconds });
    window.setTimeout(() => setCoverSeekFeedback(null), 650);
  };

  const startCoverHold = (event: PointerEvent<HTMLDivElement>) => {
    clearCoverHold();
    coverHoldDirectionRef.current = event.clientX < event.currentTarget.getBoundingClientRect().left + event.currentTarget.clientWidth / 2 ? -1 : 1;
    coverHoldTimeoutRef.current = setTimeout(() => {
      const direction = coverHoldDirectionRef.current;
      coverHoldSecondsRef.current = 2;
      seekBySeconds(direction * 2);
      showCoverSeekFeedback(direction, coverHoldSecondsRef.current);
      coverHoldIntervalRef.current = setInterval(() => {
        coverHoldSecondsRef.current += 2;
        seekBySeconds(direction * 2);
        showCoverSeekFeedback(direction, coverHoldSecondsRef.current);
      }, 100);
    }, 320);
  };

  const handleSeekKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      seekBySeconds(10);
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      seekBySeconds(-10);
    }
  };

  const handleCoverPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || (event.target instanceof HTMLElement && event.target.closest('button'))) {
      return;
    }

    coverTouchStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    startCoverHold(event);
  };

  const handleCoverPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const touchStart = coverTouchStartRef.current;
    if (!touchStart || Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y) > 18) {
      clearCoverHold();
    }
  };

  const handleCoverPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const touchStart = coverTouchStartRef.current;
    coverTouchStartRef.current = null;
    const wasHolding = coverHoldIntervalRef.current !== null;
    clearCoverHold();

    if (!touchStart || event.pointerType !== 'touch' || !isPrimaryEpisode) {
      return;
    }

    const deltaX = event.clientX - touchStart.x;
    const deltaY = event.clientY - touchStart.y;
    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      if (wasHolding || Math.abs(deltaX) > 18 || Math.abs(deltaY) > 18) {
        return;
      }

      const now = performance.now();
      const previousTap = coverLastTapRef.current;
      coverLastTapRef.current = { time: now, x: event.clientX, y: event.clientY };
      if (previousTap && now - previousTap.time < 300 && Math.hypot(event.clientX - previousTap.x, event.clientY - previousTap.y) < 48) {
        const direction = event.clientX < event.currentTarget.getBoundingClientRect().left + event.currentTarget.clientWidth / 2 ? -1 : 1;
        seekBySeconds(direction * 10);
        showCoverSeekFeedback(direction, 10);
        coverLastTapRef.current = null;
      }
      return;
    }

    event.preventDefault();
    seekBySeconds(deltaX > 0 ? -10 : 10);
  };

  const handleReadingPanelKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key.startsWith('Arrow')) {
      event.preventDefault();
      updateReadingPanelWidth((width) => width >= 60 ? 39 : 80);
    }
  };

  const handleReadingPanelPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    readingPanelPointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerType: event.pointerType,
    };
    readingPanelPointerMovedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizingReadingPanel(true);

  };

  const handleReadingPanelPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = readingPanelPointerStartRef.current;
    if (!start || !isResizingReadingPanel) {
      return;
    }

    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6;
    if (moved) {
      readingPanelPointerMovedRef.current = true;
    }
  };

  const handleReadingPanelPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const start = readingPanelPointerStartRef.current;
    const wasMoved = readingPanelPointerMovedRef.current;
    const deltaX = start ? event.clientX - start.x : 0;
    const deltaY = start ? event.clientY - start.y : 0;
    const isMobileGesture = start?.pointerType === 'touch'
      && window.matchMedia('(max-width: 760px)').matches;
    const isVerticalSwipe = isMobileGesture
      && Math.abs(deltaY) >= 28
      && Math.abs(deltaY) > Math.abs(deltaX);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    readingPanelPointerStartRef.current = null;
    readingPanelPointerMovedRef.current = false;
    setIsResizingReadingPanel(false);

    if (isVerticalSwipe) {
      event.preventDefault();
      updateReadingPanelWidth(deltaY < 0 ? 80 : 39);
    } else if (!wasMoved) {
      updateReadingPanelWidth((width) => width >= 60 ? 39 : 80);
    }

  };

  const PlayIcon = ({ paused }: { paused: boolean }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paused ? <path d="M8 5.2v13.6L19 12 8 5.2z" /> : <path d="M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z" />}
    </svg>
  );

  return (
    <section className={styles.section} aria-label="Episódios do podcast" id="podcast">
      <div className={styles.sectionGlow} aria-hidden="true" />

      {isFeatureMode && (
        <div
          className={`${styles.featuredOverlay} ${isEpisodeTransitioning ? styles.featuredOverlayTransitioning : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="podcast-featured-title"
          aria-describedby="podcast-featured-description"
        >
          <div className={styles.transitionCurtain} aria-hidden="true" />
          <button
            type="button"
            className={styles.closeFeatureButton}
            ref={closeFeatureButtonRef}
            aria-label="Cerrar reproductor del podcast"
            onClick={closeFeatureMode}
          >
            Cerrar
          </button>
          <p className={styles.tvRemoteHint}>
            Smart TV: setas para navegar, OK para selecionar, Play/Pause para ouvir
          </p>

          {activeEpisode.id > 1 && (
            <button
              type="button"
              className={`${styles.nextEpisodeArrow} ${styles.previousEpisodeArrow}`}
              onClick={handlePreviewPreviousEpisode}
              aria-label={`Voltar ao episódio ${activeEpisode.id - 1}`}
              disabled={isEpisodeTransitioning}
            >
              <svg className={styles.episodeArrowIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14.5 5-7 7 7 7" />
              </svg>
            </button>
          )}

          {activeEpisode.id < EPISODES.length && !isEpisodeComplete && (
            <button
              type="button"
              className={styles.nextEpisodeArrow}
              onClick={handlePreviewNextEpisode}
              aria-label={`Conhecer episódio ${activeEpisode.id + 1}`}
              disabled={isEpisodeTransitioning}
            >
              <svg className={styles.episodeArrowIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9.5 5 7 7-7 7" />
              </svg>
            </button>
          )}

          <div
            className={`${styles.featuredPanel} ${!isPortraitStudyMode ? styles.featuredPanelExpanded : ''} ${isPortraitStudyMode ? styles.featuredPanelPortrait : ''} ${!isPortraitStudyMode && readingPanelWidth < 60 ? styles.featuredPanelStudyClosed : ''} ${isResizingReadingPanel ? styles.featuredPanelResizing : ''}`}
            style={{ '--reading-panel-width': `${readingPanelWidth}%` } as CSSProperties}
          >
            <div
              className={styles.featuredCover}
              style={{ backgroundImage: `url(${activeEpisode.featuredImage ?? activeEpisode.image})` }}
              aria-label={activeEpisode.title}
              onPointerDown={handleCoverPointerDown}
              onPointerMove={handleCoverPointerMove}
              onPointerUp={handleCoverPointerUp}
              onPointerCancel={() => {
                coverTouchStartRef.current = null;
                clearCoverHold();
              }}
            >
              {coverSeekFeedback && (
                <div
                  className={`${styles.coverSeekFeedback} ${coverSeekFeedback.direction < 0 ? styles.coverSeekFeedbackBack : styles.coverSeekFeedbackForward}`}
                  role="status"
                  aria-live="polite"
                >
                  <span aria-hidden="true">{coverSeekFeedback.direction < 0 ? '«' : '»'}</span>
                  <strong>{coverSeekFeedback.direction < 0 ? '-' : '+'}{coverSeekFeedback.seconds}s</strong>
                </div>
              )}
              {renderCaptionSelector({ onCover: true })}
              {captionLanguage && (activePortugueseCue || activeSpanishCue) && (
                <div className={styles.liveCaptionCard} role="status" aria-live="polite">
                  <span className={styles.liveCaptionLabel}>
                    {captionLanguage === 'pt' ? 'Acompanhe a leitura' : 'Tradução de apoio'}
                  </span>
                  <span className={styles.liveCaptionText}>
                    {captionLanguage === 'pt'
                      ? activePortugueseCue?.text
                      : activeSpanishCue?.text}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              className={styles.readingPanelResizeHandle}
              onPointerDown={handleReadingPanelPointerDown}
              onPointerMove={handleReadingPanelPointerMove}
              onPointerUp={handleReadingPanelPointerUp}
              onPointerCancel={() => {
                readingPanelPointerStartRef.current = null;
                readingPanelPointerMovedRef.current = false;
                setIsResizingReadingPanel(false);
              }}
              onKeyDown={handleReadingPanelKeyDown}
              role="slider"
              tabIndex={0}
              aria-label="Deslize para abrir ou fechar o texto do episódio"
              aria-valuemin={30}
              aria-valuemax={80}
              aria-valuenow={Math.round(readingPanelWidth)}
              aria-valuetext={readingPanelWidth >= 60 ? 'Conteúdo expandido sobre a imagem. Ative para recolher' : 'Conteúdo recolhido. Ative para expandir sobre a imagem'}
            >
              <span aria-hidden="true" />
            </button>

            {readingPanelWidth >= 60 && (
              <>
                <button
                  type="button"
                  className={styles.studyOrientationButton}
                  onClick={() => {
                    setIsPortraitStudyMode((portrait) => !portrait);
                    setIsOrientationSyncEnabled((enabled) => !enabled);
                  }}
                  aria-label={isPortraitStudyMode ? 'Mudar estudo para o modo horizontal' : 'Mudar estudo para o modo vertical'}
                  aria-pressed={isPortraitStudyMode}
                  title={isPortraitStudyMode ? 'Mudar para horizontal e acompanhar a orientação do celular' : 'Mudar para vertical e pausar a sincronização'}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 4.5h6.5A2.5 2.5 0 0 1 16 7v3.5M17 19.5h-6.5A2.5 2.5 0 0 1 8 17v-3.5" />
                    <path d="m16 7 2.5 2.5L16 12M8 17l-2.5-2.5L8 12" />
                  </svg>
                  <span>{isPortraitStudyMode ? 'Horizontal' : 'Vertical'}</span>
                </button>

              </>
            )}

            <div
              ref={featuredMetaRef}
              className={`${styles.featuredMeta} ${!isPortraitStudyMode && readingPanelWidth < 60 ? styles.featuredMetaStudyClosed : ''}`}
            >
              <div className={styles.featuredStatusRow}>
                <span className={styles.featuredLivePill}>
                  {isPrimaryEpisode ? (isPlaying ? 'Em reprodução' : 'Episódio disponível') : 'Em breve'}
                </span>
                <span className={styles.lineTag}>{activeEpisode.label}</span>
                <span className={styles.featuredRuntime}>{isPrimaryEpisode ? '18 min' : 'Ainda não lançado'}</span>
              </div>

              <h3 id="podcast-featured-title">{activeEpisode.title}</h3>
              <p id="podcast-featured-description">{activeEpisode.description}</p>

              {isPrimaryEpisode && (
                <div
                  className={`${styles.studyArea} ${isStudyTextExpanded ? styles.studyTextExpanded : ''} ${!isStudyTextExpanded ? styles.studyTextCollapsed : ''}`}
                >
                  <div
                    className={styles.studyToggle}
                    role="button"
                    tabIndex={0}
                    onClick={toggleStudyText}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleStudyText();
                      }
                    }}
                    aria-expanded={isStudyTextExpanded}
                    aria-label={isStudyTextExpanded ? 'Recolher texto do episódio' : 'Abrir texto completo do episódio'}
                  >
                    <span>
                      <strong>Texto do episódio</strong>
                      <small>Escute, leia e pratique no seu ritmo</small>
                    </span>
                    {!isPortraitStudyMode && (
                      <button
                        type="button"
                        className={`${styles.studyOrientationButton} ${styles.studyCollapseButton}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleStudyText();
                        }}
                        aria-label={readingPanelWidth >= 60 ? 'Recolher conteúdo e mostrar somente o áudio' : 'Mostrar texto do episódio'}
                        title={readingPanelWidth >= 60 ? 'Somente áudio' : 'Mostrar texto'}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 8h14M5 12h14M5 16h9" />
                          <path d={readingPanelWidth >= 60 ? 'm17 14 3 3-3 3' : 'm17 14-3 3 3 3'} />
                        </svg>
                        <span>{readingPanelWidth >= 60 ? 'Somente áudio' : 'Mostrar texto'}</span>
                      </button>
                    )}
                  </div>

                  <div id="episode-study-panel" className={styles.studyPanel}>
                    <div className={styles.studyPanelHeader}>
                      <div>
                        <span className={styles.studyEyebrow}>Modo estudo</span>
                        <strong>Compreenda cada frase</strong>
                      </div>
                    </div>

                    {transcriptCues.length === 0 ? (
                      <div className={styles.studyEmptyState}>
                        <span className={styles.studyEmptyIcon} aria-hidden="true">Aa</span>
                        <p>A transcrição sincronizada será adicionada aqui para você acompanhar, repetir e praticar cada frase.</p>
                      </div>
                    ) : (
                      <>
                        <div className={styles.studyCurrentCue} aria-live="polite">
                          <span>{activePortugueseCue?.text ?? activeSpanishCue?.text ?? 'Continue ouvindo para acompanhar a próxima frase.'}</span>
                          {activeSpanishCue && <small>{activeSpanishCue.text}</small>}
                        </div>
                        <div ref={transcriptListRef} className={styles.studyTranscriptList}>
                          {studyCues.map((cue, index) => {
                            const translation = portugueseCues.length > 0 ? spanishCues[index] : undefined;
                            const isActive = cue.id === activePortugueseCue?.id || cue.id === activeSpanishCue?.id;
                            return (
                              <button
                                type="button"
                                key={cue.id}
                                data-cue-id={cue.id}
                                className={`${styles.studyCue} ${isActive ? styles.studyCueActive : ''}`}
                                onClick={() => seekToCue(cue)}
                              >
                                <span className={styles.studyCueTime}>{formatTime(cue.startTime)}</span>
                                <span className={styles.studyCueText}>
                                  <strong>{cue.text}</strong>
                                  {translation && <small>{translation.text}</small>}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeEpisode.id === 1 && isEpisodeComplete ? (
                <div className={styles.episodeComplete}>
                  <strong>Você chegou ao fim deste episódio.</strong>
                  <p>
                    O próximo episódio está sendo preparado e será lançado em breve. Continue acompanhando o
                    Horizonte para não perder a estreia.
                  </p>
                  <button
                    type="button"
                    className={styles.nextEpisodeButton}
                    onClick={handleContinueToNextEpisode}
                  >
                    Conheça o episódio 2
                  </button>
                </div>
              ) : (
                <>
                  {activeEpisode.id !== 1 && (
                    <span className={styles.featuredComingSoon}>Em breve</span>
                  )}
                  {audioError && <p className={styles.audioError} role="alert">{audioError}</p>}

                  <div className={styles.featuredControls}>
                    <div className={styles.progressTimeRow} aria-label="Tempo do episódio">
                      <span>{isPrimaryEpisode ? formatTime(currentTime) : '--:--'}</span>
                      <span>{isPrimaryEpisode ? formatTime(duration) : 'Em breve'}</span>
                    </div>
                    <div
                        className={`${styles.featuredProgressTrack} ${isSeeking ? styles.progressTrackSeeking : ''}`}
                        onPointerDown={isPrimaryEpisode ? handleSeekPointerDown : undefined}
                        onPointerMove={isPrimaryEpisode ? handleSeekPointerMove : undefined}
                        onPointerUp={isPrimaryEpisode ? handleSeekPointerUp : undefined}
                        onPointerCancel={isPrimaryEpisode ? handleSeekPointerUp : undefined}
                        role={isPrimaryEpisode ? 'slider' : undefined}
                        aria-label={isPrimaryEpisode ? `Avançar no podcast: ${formatTime(currentTime)} de ${formatTime(duration)}. Arraste com o dedo para buscar` : 'Episódio em breve'}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress)}
                        aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}. Arraste com o dedo para buscar`}
                        aria-disabled={!isPrimaryEpisode}
                        tabIndex={isPrimaryEpisode ? 0 : -1}
                        onKeyDown={isPrimaryEpisode ? handleSeekKeyDown : undefined}
                    >
                      <span className={styles.featuredProgressBar} style={{ width: `${progress}%` }} />
                    </div>

                    <div className={styles.featuredControlRow}>
                      <button
                        type="button"
                        className={styles.skipButton}
                        onClick={() => seekBySeconds(-10)}
                        aria-label="Retroceder 10 segundos"
                        disabled={!isPrimaryEpisode || isAudioLoading}
                      >
                        −10
                      </button>
                      <button
                        type="button"
                        className={styles.featuredMiniPlay}
                        disabled={!isPrimaryEpisode || isAudioLoading}
                        onClick={handleTogglePlayback}
                        aria-label={isPlaying ? 'Pausar episódio' : 'Reproduzir episódio'}
                      >
                        <PlayIcon paused={!isPlaying} />
                      </button>

                      {renderSpeedSelector({ compact: true })}
                      {renderCaptionSelector({ compact: true })}

                      <button
                        type="button"
                        className={styles.skipButton}
                        onClick={() => seekBySeconds(10)}
                        aria-label="Avançar 10 segundos"
                        disabled={!isPrimaryEpisode || isAudioLoading}
                      >
                        +10
                      </button>

                      <div className={styles.featuredVolumeControl}>
                        <button
                          type="button"
                          className={`${styles.volumeButton} ${isVolumeMenuOpen ? styles.volumeButtonActive : ''}`}
                          disabled={!isPrimaryEpisode}
                          onClick={() => {
                            setOpenSpeedMenu(null);
                            setIsVolumeMenuOpen((open) => !open);
                          }}
                          aria-label="Abrir controle de volume"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2c0-1.8-1-3.4-2.5-4.2v8.4c1.5-.8 2.5-2.4 2.5-4.2zm2.5-8.5v2.1c2.9 1 5 3.8 5 7.4s-2.1 6.4-5 7.4v2.1c4.1-1 7-4.9 7-9.5S22.1 5.5 19 4.5z"/>
                          </svg>
                          <span className={styles.volumeButtonLabel}>VOL</span>
                        </button>
 
                        {isVolumeMenuOpen && (
                          <div className={styles.volumePopover} role="dialog" aria-label="Volume do podcast">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={volume}
                              onChange={handleVolumeChange}
                              onPointerUp={closeVolumeMenu}
                              onMouseUp={closeVolumeMenu}
                              onTouchEnd={closeVolumeMenu}
                              aria-label="Volume do podcast"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className={`${styles.container} ${isFeatureMode ? styles.containerFeatureMode : ''}`}
        aria-hidden={isFeatureMode}
        inert={isFeatureMode || undefined}
      >
        <div className={styles.headerRow}>
          <span className={styles.methodText}>Conheça o método</span>
          <span className={styles.handle}>@Horizonteespanhol</span>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.topMeta}>
            <span className={styles.topLabel}>Episódio #{activeEpisode.id}</span>
          </div>

          <div className={styles.reelStage}>
            <div className={styles.mainFeature} key={activeEpisode.id}>
              <div
                className={`${styles.reelFrame} ${isPrimaryEpisode ? styles.reelFrameLive : ''}`}
                tabIndex={0}
                onClick={() => {
                  if (activeEpisode.id === 1) {
                    void handleTogglePlayback();
                    return;
                  }

                  handleSelectEpisode(activeEpisode.id);
                }}
              >
                <div
                  className={`${styles.coverImage} ${isPrimaryEpisode ? styles.coverImageLive : ''}`}
                  style={{ backgroundImage: `url(${activeEpisode.image})` }}
                  aria-label={activeEpisode.title}
                />

                {isPrimaryEpisode && (
                  <div className={styles.voiceOverlay} aria-hidden="true">
                    <div className={styles.voiceGlow} />
                    <div className={styles.liveBadge}>{isPlaying ? 'Em reprodução' : 'Episódio disponível'}</div>
                  </div>
                )}

                {isPrimaryEpisode && (
                  <button
                    type="button"
                    className={styles.imagePlayButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleTogglePlayback();
                    }}
                    aria-label={isPlaying ? 'Pausar episódio' : 'Começar episódio'}
                    disabled={isAudioLoading}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      {isPlaying
                        ? <path d="M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z" />
                        : <path d="M8 5.2v13.6L19 12 8 5.2z" />}
                    </svg>
                    <span>{isPlaying ? 'Pausar' : 'Começar'}</span>
                  </button>
                )}

                <div className={styles.copyOverlay}>
                  <span className={styles.lineTag}>{activeEpisode.label}</span>
                  <h3>{activeEpisode.title}</h3>
                  <p>{activeEpisode.description}</p>
                </div>
              </div>
            </div>

            <div className={styles.streamLane} aria-hidden="true">
              <span className={styles.streamPulse} />
              <span className={styles.streamPulse} />
              <span className={styles.streamPulse} />
            </div>

            <div className={styles.upcomingEpisodes}>
              <h4 className={styles.upcomingTitle}>Próximos episódios</h4>
              <div className={styles.filmStrip} aria-label="Próximos episódios">
              {EPISODES.map((episode) => (
                <button
                  key={episode.id}
                  type="button"
                  className={`${styles.filmFrame} ${selectedEpisodeId === episode.id ? styles.filmFrameActive : ''} ${episode.id !== 1 ? styles.filmFrameComingSoon : ''}`}
                  onClick={() => handleSelectEpisode(episode.id)}
                  disabled={isLockedOnFirstEpisode && episode.id !== 1}
                  aria-disabled={episode.id !== 1}
                  aria-label={episode.id === 1
                    ? `Selecionar episódio ${episode.title}`
                    : `Episódio ${episode.title}, em breve e indisponível para reprodução`}
                >
                  <span className={styles.frameThumb} style={{ backgroundImage: `url(${episode.image})` }} />
                  <span className={styles.frameMeta}>
                    <small>{episode.label}</small>
                    <strong>{episode.title}</strong>
                  </span>
                  <span className={styles.chapterAction}>{selectedEpisodeId === episode.id && episode.id === 1 ? 'Ouvir' : 'Em breve'}</span>
                </button>
              ))}
              </div>
            </div>
          </div>

          <div className={styles.playerRow}>
            <button
              type="button"
              className={styles.skipButton}
              onClick={() => seekBySeconds(-10)}
              aria-label="Retroceder 10 segundos"
              disabled={!isPrimaryEpisode || isAudioLoading}
            >
              −10
            </button>
            <button
              type="button"
              className={`${styles.mainFrameButton} ${!isPrimaryEpisode ? styles.mainFrameComingSoon : ''}`}
              disabled={!isPrimaryEpisode || isAudioLoading}
              onClick={() => void handleTogglePlayback()}
              aria-label={isPrimaryEpisode ? (isPlaying ? 'Pausar episódio' : 'Reproduzir episódio') : 'Episódio em breve'}
            >
              <PlayIcon paused={!isPlaying} />
              <span>{isPrimaryEpisode ? (isPlaying ? 'Pause' : 'Play') : 'Em breve'}</span>
            </button>

            {renderSpeedSelector({})}
            {renderCaptionSelector({})}

            <button
              type="button"
              className={styles.skipButton}
              onClick={() => seekBySeconds(10)}
              aria-label="Avançar 10 segundos"
              disabled={!isPrimaryEpisode || isAudioLoading}
            >
              +10
            </button>

            <div className={styles.volumeControl}>
              <button
                type="button"
                className={`${styles.volumeButton} ${isVolumeMenuOpen ? styles.volumeButtonActive : ''}`}
                disabled={!isPrimaryEpisode}
                onClick={() => {
                  setOpenSpeedMenu(null);
                  setIsVolumeMenuOpen((open) => !open);
                }}
                aria-label="Abrir controle de volume"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2c0-1.8-1-3.4-2.5-4.2v8.4c1.5-.8 2.5-2.4 2.5-4.2zm2.5-8.5v2.1c2.9 1 5 3.8 5 7.4s-2.1 6.4-5 7.4v2.1c4.1-1 7-4.9 7-9.5S22.1 5.5 19 4.5z"/>
                </svg>
                <span className={styles.volumeButtonLabel}>VOL</span>
              </button>

              {isVolumeMenuOpen && (
                <div className={styles.volumePopover} role="dialog" aria-label="Volume do podcast">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    aria-label="Volume do podcast"
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.progressTimeRow} aria-label="Tempo do podcast">
            <span>{isPrimaryEpisode ? formatTime(currentTime) : '--:--'}</span>
            <span>{isPrimaryEpisode ? formatTime(duration) : 'Em breve'}</span>
          </div>
          <div
            className={`${styles.progressTrack} ${isSeeking ? styles.progressTrackSeeking : ''}`}
            onPointerDown={isPrimaryEpisode ? handleSeekPointerDown : undefined}
            onPointerMove={isPrimaryEpisode ? handleSeekPointerMove : undefined}
            onPointerUp={isPrimaryEpisode ? handleSeekPointerUp : undefined}
            onPointerCancel={isPrimaryEpisode ? handleSeekPointerUp : undefined}
            role={isPrimaryEpisode ? 'slider' : undefined}
            aria-label={isPrimaryEpisode ? `Avançar no podcast: ${formatTime(currentTime)} de ${formatTime(duration)}. Arraste com o dedo para buscar` : 'Episódio em breve'}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}. Arraste com o dedo para buscar`}
            aria-disabled={!isPrimaryEpisode}
            tabIndex={isPrimaryEpisode ? 0 : -1}
            onKeyDown={isPrimaryEpisode ? handleSeekKeyDown : undefined}
          >
            <span className={styles.progressBar} style={{ width: `${progress}%` }} />
            <span className={styles.progressThumb} style={{ left: `${progress}%` }} />
          </div>

          <audio ref={audioRef} src={PODCAST_AUDIO_SOURCE} preload="metadata">
            <track kind="subtitles" src="/captions/episodio-1-pt.vtt" srcLang="pt" label="Português" />
            <track kind="subtitles" src="/captions/episodio-1-es.vtt" srcLang="es" label="Español" />
          </audio>
        </div>
      </div>
    </section>
  );
}
