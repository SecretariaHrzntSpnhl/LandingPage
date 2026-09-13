import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import styles from './PodcastShowcase.module.css';

type SpeedOption = 1 | 1.5 | 2;
type SpeedMenu = 'compact' | 'full' | null;
type CaptionMenu = 'cover' | 'compact' | 'full' | null;
type CaptionLanguage = 'pt' | 'es' | null;

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
    description: 'Conheça o método Horizonte e avance do vocabulário à fluência em cinco jogos.',
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
  const coverTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const readingPanelPointerStartRef = useRef<{ x: number; y: number; pointerType: string } | null>(null);
  const readingPanelPointerMovedRef = useRef(false);
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
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [transcriptCues, setTranscriptCues] = useState<TranscriptCue[]>([]);
  const [readingPanelWidth, setReadingPanelWidth] = useState(39);
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
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFeatureMode(false);
        setIsLockedOnFirstEpisode(false);
        setCaptionMenu(null);
        audioRef.current?.pause();
        setIsPlaying(false);
        setOpenSpeedMenu(null);
        setIsVolumeMenuOpen(false);
        setIsStudyOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFeatureMode]);

  useEffect(() => {
    if (isLockedOnFirstEpisode) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSelectedEpisodeId((currentId) => {
        const currentIndex = EPISODES.findIndex((episode) => episode.id === currentId);
        const nextEpisode = EPISODES[(currentIndex + 1) % EPISODES.length];
        return nextEpisode.id;
      });
    }, 4800);

    return () => window.clearInterval(timer);
  }, [isLockedOnFirstEpisode]);

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

    setSelectedEpisodeId(episodeId);
    setIsFeatureMode(true);
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

  const handleTogglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setIsFeatureMode(true);
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

  useEffect(() => {
    const handleSpacebar = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]');
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

  const activeEpisode = EPISODES.find((episode) => episode.id === selectedEpisodeId) ?? EPISODES[0];
  const isPrimaryEpisode = activeEpisode.id === 1;

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  };

  const closeVolumeMenu = () => {
    window.setTimeout(() => {
      setIsVolumeMenuOpen(false);
    }, 150);
  };

  const SpeedSelector = ({ compact = false }: { compact?: boolean }) => {
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
      >
        <span className={styles.speedTriggerIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.5 14.5c0-4.6 3.7-8.3 8.3-8.3.6 0 1.2.1 1.7.2l.7-1.6c-.8-.2-1.7-.4-2.6-.4-6.2 0-11.2 5-11.2 11.2 0 .8.1 1.5.3 2.2l1.6-.7c-.2-.6-.3-1.2-.3-1.8zm7.4 5.9c-1.4 0-2.6-.6-3.5-1.5l-1.1 1.1c1.3 1.4 3.2 2.3 5.2 2.3 3.9 0 7.1-3.2 7.1-7.1 0-1.4-.4-2.8-1.2-3.9l-1.3 1.1c.5.8.7 1.7.7 2.7 0 2.8-2.3 5.1-5.1 5.1zm8.6-11.5h-1.7v3.5l2.8 2.8.9-1.1-2-2V9.9zM12 5.8a7.2 7.2 0 0 1 7.2 7.2h-1.6A5.6 5.6 0 0 0 12 7.4V5.8z"/>
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

  const CaptionSelector = ({ compact = false, onCover = false }: { compact?: boolean; onCover?: boolean }) => {
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
  const activeStudyCue = activePortugueseCue ?? activeSpanishCue;

  useEffect(() => {
    if (!activePortugueseCue || !isStudyOpen || !transcriptListRef.current) {
      return;
    }

    const activeElement = transcriptListRef.current.querySelector<HTMLElement>(
      `[data-cue-id="${CSS.escape(activePortugueseCue.id)}"]`,
    );
    activeElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activePortugueseCue, isStudyOpen]);

  const seekToCue = (cue: TranscriptCue) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.currentTime = cue.startTime;
    setCurrentTime(cue.startTime);
    setProgress(audio.duration > 0 ? (cue.startTime / audio.duration) * 100 : 0);
  };

  const repeatActiveCue = () => {
    if (activeStudyCue) {
      seekToCue(activeStudyCue);
    }
    void audioRef.current?.play();
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
  };

  const handleCoverPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const touchStart = coverTouchStartRef.current;
    coverTouchStartRef.current = null;

    if (!touchStart || event.pointerType !== 'touch' || !isPrimaryEpisode) {
      return;
    }

    const deltaX = event.clientX - touchStart.x;
    const deltaY = event.clientY - touchStart.y;
    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    event.preventDefault();
    seekBySeconds(deltaX > 0 ? -10 : 10);
  };

  const resizeReadingPanel = (event: PointerEvent<HTMLButtonElement>) => {
    const panel = event.currentTarget.parentElement;
    if (!panel) {
      return;
    }

    const bounds = panel.getBoundingClientRect();
    const nextWidth = ((bounds.right - event.clientX) / bounds.width) * 100;
    setReadingPanelWidth(Math.min(70, Math.max(30, nextWidth)));
  };

  const handleReadingPanelKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      setReadingPanelWidth((width) => Math.min(70, Math.max(30, width + direction * 3)));
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setReadingPanelWidth(30);
    }

    if (event.key === 'End') {
      event.preventDefault();
      setReadingPanelWidth(70);
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

    if (event.pointerType !== 'touch') {
      resizeReadingPanel(event);
    }
  };

  const handleReadingPanelPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = readingPanelPointerStartRef.current;
    if (!start || !isResizingReadingPanel) {
      return;
    }

    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6;
    if (moved) {
      readingPanelPointerMovedRef.current = true;
      resizeReadingPanel(event);
    }
  };

  const handleReadingPanelPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const start = readingPanelPointerStartRef.current;
    const shouldToggleTouch = start?.pointerType === 'touch' && !readingPanelPointerMovedRef.current;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    readingPanelPointerStartRef.current = null;
    readingPanelPointerMovedRef.current = false;
    setIsResizingReadingPanel(false);

    if (shouldToggleTouch) {
      setReadingPanelWidth((width) => (width >= 69 ? 39 : 70));
    }
  };

  const PlayIcon = ({ paused }: { paused: boolean }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paused ? <path d="M8 5.2v13.6L19 12 8 5.2z" /> : <path d="M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z" />}
    </svg>
  );

  return (
    <section className={styles.section} aria-label="Episódios do podcast">
      <div className={styles.sectionGlow} aria-hidden="true" />

      {isFeatureMode && (
        <div className={`${styles.featuredOverlay} ${isEpisodeTransitioning ? styles.featuredOverlayTransitioning : ''}`}>
          <div className={styles.transitionCurtain} aria-hidden="true" />
          <button
            type="button"
            className={styles.closeFeatureButton}
            onClick={() => {
              setIsFeatureMode(false);
              setIsLockedOnFirstEpisode(false);
              setCaptionMenu(null);
              setOpenSpeedMenu(null);
              setIsVolumeMenuOpen(false);
              setIsStudyOpen(false);

              if (audioRef.current) {
                audioRef.current.pause();
              }

              setIsPlaying(false);
            }}
          >
            Fechar
          </button>

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
            className={`${styles.featuredPanel} ${isResizingReadingPanel ? styles.featuredPanelResizing : ''}`}
            style={{ '--reading-panel-width': `${readingPanelWidth}%` } as CSSProperties}
          >
            <div
              className={styles.featuredCover}
              style={{ backgroundImage: `url(${activeEpisode.featuredImage ?? activeEpisode.image})` }}
              aria-label={activeEpisode.title}
              onPointerDown={handleCoverPointerDown}
              onPointerUp={handleCoverPointerUp}
              onPointerCancel={() => {
                coverTouchStartRef.current = null;
              }}
            >
              <CaptionSelector onCover />
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
              aria-label="Ajustar o expandir el panel de lectura"
              aria-valuemin={30}
              aria-valuemax={70}
              aria-valuenow={Math.round(readingPanelWidth)}
              aria-valuetext={`${Math.round(readingPanelWidth)}% de ancho`}
            >
              <span aria-hidden="true" />
            </button>

            <div className={styles.featuredMeta}>
              <div className={styles.featuredStatusRow}>
                <span className={styles.featuredLivePill}>
                  {isPrimaryEpisode ? (isPlaying ? 'Em reprodução' : 'Episódio disponível') : 'Em breve'}
                </span>
                <span className={styles.featuredRuntime}>{isPrimaryEpisode ? '18 min' : 'Ainda não lançado'}</span>
              </div>

              <span className={styles.lineTag}>{activeEpisode.label}</span>

              <h3>{activeEpisode.title}</h3>
              <p>{activeEpisode.description}</p>

              {isPrimaryEpisode && (
                <div className={styles.studyArea}>
                  <div className={styles.readingPanelControls} aria-label="Tamaño del panel de lectura">
                    <span className={styles.readingPanelControlsLabel}>Lectura</span>
                    <button
                      type="button"
                      onClick={() => setReadingPanelWidth((width) => Math.max(30, width - 4))}
                      aria-label="Reducir panel de lectura"
                      title="Reducir panel de lectura"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => setReadingPanelWidth(39)}
                      aria-label="Restablecer tamaño del panel de lectura"
                      title="Restablecer tamaño inicial"
                    >
                      {Math.round(readingPanelWidth)}%
                    </button>
                    <button
                      type="button"
                      onClick={() => setReadingPanelWidth((width) => Math.min(70, width + 4))}
                      aria-label="Ampliar panel de lectura"
                      title="Ampliar panel de lectura"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.studyToggle}
                    onClick={() => setIsStudyOpen((open) => !open)}
                    aria-expanded={isStudyOpen}
                    aria-controls="episode-study-panel"
                  >
                    <span>
                      <strong>Texto do episódio</strong>
                      <small>Escute, leia e pratique no seu ritmo</small>
                    </span>
                    <span className={styles.studyToggleIcon} aria-hidden="true">{isStudyOpen ? '−' : '+'}</span>
                  </button>

                  {isStudyOpen && (
                    <div id="episode-study-panel" className={styles.studyPanel}>
                      <div className={styles.studyPanelHeader}>
                        <div>
                          <span className={styles.studyEyebrow}>Modo estudo</span>
                          <strong>Compreenda cada frase</strong>
                        </div>
                        <button
                          type="button"
                          className={styles.translationToggle}
                          onClick={() => setShowTranslation((visible) => !visible)}
                          aria-pressed={showTranslation}
                        >
                          {showTranslation ? 'Ocultar tradução' : 'Mostrar tradução'}
                        </button>
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
                            {showTranslation && activeSpanishCue && <small>{activeSpanishCue.text}</small>}
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
                                    {showTranslation && translation && <small>{translation.text}</small>}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <button type="button" className={styles.repeatCueButton} onClick={repeatActiveCue}>
                            Repetir frase
                          </button>
                        </>
                      )}
                    </div>
                  )}
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
                    Conhecer episódio 2
                  </button>
                </div>
              ) : (
                <>
                  {activeEpisode.id !== 1 && (
                    <span className={styles.featuredComingSoon}>Em breve</span>
                  )}
                  <button
                    type="button"
                    className={styles.featuredPlayButton}
                    disabled={!isPrimaryEpisode || isAudioLoading}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (isPrimaryEpisode) {
                        void handleTogglePlayback();
                      }
                    }}
                  >
                    <PlayIcon paused={!isPlaying} />
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
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

                      <SpeedSelector compact />
                      <CaptionSelector compact />

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

      <div className={`${styles.container} ${isFeatureMode ? styles.containerFeatureMode : ''}`}>
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

                <div className={styles.mainFrameActions}>
                  <button
                    type="button"
                    className={styles.mainFrameButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (activeEpisode.id === 1) {
                        void handleTogglePlayback();
                        return;
                      }

                      handleSelectEpisode(activeEpisode.id);
                    }}
                    disabled={!isPrimaryEpisode}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>

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

            <div className={styles.filmStrip} aria-label="Próximos episódios">
              {EPISODES.map((episode) => (
                <button
                  key={episode.id}
                  type="button"
                  className={`${styles.filmFrame} ${selectedEpisodeId === episode.id ? styles.filmFrameActive : ''}`}
                  onClick={() => handleSelectEpisode(episode.id)}
                  disabled={isLockedOnFirstEpisode && episode.id !== 1}
                  aria-label={`Selecionar episódio ${episode.title}`}
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
              className={styles.playButton}
              disabled={!isPrimaryEpisode || isAudioLoading}
              onClick={() => void handleTogglePlayback()}
              aria-label={isPrimaryEpisode ? (isPlaying ? 'Pausar episódio' : 'Reproduzir episódio') : 'Episódio em breve'}
            >
              <PlayIcon paused={!isPlaying} />
            </button>

            <SpeedSelector />
            <CaptionSelector />

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
