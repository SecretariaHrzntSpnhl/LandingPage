import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './GamesSection.module.css';
import Game1 from './Game1';
import Game2 from './Game2';
import Game3 from './Game3';
import Game4 from './Game4';
import Game5 from './Game5';
import RegistrationModal from './RegistrationModal';
import { fireConfetti } from '../../utils/confetti';
import { playSound } from '../../utils/sound';
import { calculateStats, createEmptyProgress, getUnlockedLevel, loadProgress, saveProgress, type GameResult, type ProgressData } from './gameStorage';
import { clearGameSession } from './gameSession';

type GameMeta = {
  level: number;
  title: string;
  subtitle: string;
};

const GAMES: GameMeta[] = [
  { level: 1, title: 'Objetos e Cores', subtitle: 'Você sabe o nome dos objetos e das cores em espanhol?' },
  { level: 2, title: 'Descrevendo o Mundo', subtitle: 'Descrição, rotina e uso de verbos básicos.' },
  { level: 3, title: 'Contando Histórias', subtitle: 'Experiências e conectores para narrar.' },
  { level: 4, title: 'Narrativas e Opiniões', subtitle: 'Estruturas mais avançadas e organização de ideias.' },
  { level: 5, title: 'O Desafio Final', subtitle: 'Subjuntivo, ritmo avançado e fluidez.' },
];

export default function GamesSection() {
  const [unlockedLevel, setUnlockedLevel] = useState(() => {
    const initialProgress = loadProgress();
    return !initialProgress.registered
      ? 0
      : getUnlockedLevel(initialProgress.gameHistory);
  });
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState<ProgressData>(() => loadProgress());
  const [showResults, setShowResults] = useState(false);

  const handleStartClick = () => {
    setShowModal(true);
  };

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleRegistrationSuccess = () => {
    setShowModal(false);
    setProgress((current) => ({ ...current, registered: true }));
    setUnlockedLevel((current) => Math.max(current, 1));
    playSound('success');
    fireConfetti();
  };

  const handleLevelComplete = (level: number, answers: GameResult['answers'], correctCount: number) => {
    clearGameSession(level);
    const nextEntry: GameResult = {
      gameId: level,
      completed: true,
      answers,
      correctCount,
      totalQuestions: 5,
    };

    const nextProgress = {
      ...progress,
      gameHistory: {
        ...progress.gameHistory,
        [`game${level}`]: nextEntry,
      },
      totalStats: calculateStats({
        ...progress.gameHistory,
        [`game${level}`]: nextEntry,
      }),
    };

    setProgress(nextProgress);
    playSound('success');
    fireConfetti();
    setTimeout(() => {
      if (level >= 5) {
        setShowResults(true);
        setUnlockedLevel(6);
      } else {
        setUnlockedLevel(level + 1);
      }
    }, 1200);
  };

  const handleReplay = () => {
    for (let level = 1; level <= 5; level += 1) {
      clearGameSession(level);
    }
    setProgress({ ...createEmptyProgress(), registered: true });
    setUnlockedLevel(1);
    setShowResults(false);
  };

  const renderGame = (level: number) => {
    if (level === 1) {
      return <Game1 onComplete={(answers, correctCount) => handleLevelComplete(1, answers, correctCount)} isCompleted={false} />;
    }
    if (level === 2) {
      return <Game2 onComplete={(answers, correctCount) => handleLevelComplete(2, answers, correctCount)} isCompleted={false} />;
    }
    if (level === 3) {
      return <Game3 onComplete={(answers, correctCount) => handleLevelComplete(3, answers, correctCount)} isCompleted={false} />;
    }
    if (level === 4) {
      return <Game4 onComplete={(answers, correctCount) => handleLevelComplete(4, answers, correctCount)} isCompleted={false} />;
    }
    return <Game5 onComplete={(answers, correctCount) => handleLevelComplete(5, answers, correctCount)} isCompleted={false} />;
  };

  const progressLevel = unlockedLevel === 0 ? 1 : Math.min(unlockedLevel, 5);

  return (
    <section className={`${styles.section} ${styles.heroAfterHero} reveal`}>
      <div className={styles.horizonBackdrop} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.header} data-reveal data-effect="soft-glow" data-delay="0">
          <h2>Escalada de Proficiência</h2>
          <p>Cada jogo é um degrau. Cada degrau, uma conquista. Divirta-se enquanto sobe rumo à fluência.</p>
        </div>

        <div className={styles.gamesContainer} data-reveal data-effect="stack-appear" data-delay="80">
          {unlockedLevel < 6 && (
            <div className={styles.deckStack}>
              {GAMES.map((game) => {
                const isCompleted = unlockedLevel > game.level;
                const isCurrent = game.level === progressLevel;
                const isLocked = game.level > progressLevel;
                const isNext = isLocked && game.level === progressLevel + 1;
                const showStartForFirst = unlockedLevel === 0 && game.level === 1;
                const cardClass = [
                  styles.levelCard,
                  isCurrent ? styles.currentCard : '',
                  isCompleted ? styles.completedCard : '',
                  isNext ? styles.nextCard : '',
                  isLocked ? styles.lockedCard : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <article
                    key={game.level}
                    className={cardClass}
                    data-reveal
                    data-effect="card-float"
                    data-delay={game.level * 90}
                    style={{ '--card-index': game.level } as CSSProperties}
                  >
                    <div className={styles.cardTopLine}>
                      <span className={styles.levelPill}>Nível {game.level}</span>
                      <span className={styles.cardStatus}>
                        {isCompleted
                          ? 'Concluído'
                          : showStartForFirst
                            ? 'Pronto para iniciar'
                            : isCurrent
                              ? 'Em jogo'
                              : isNext
                                ? 'Próximo desafio'
                                : 'Aguardando desbloqueio'}
                      </span>
                    </div>

                    <h3>{game.title}</h3>
                    <p>{game.subtitle}</p>

                    {isCurrent && unlockedLevel > 0 && (
                      <div className={styles.activeGameShell}>{renderGame(game.level)}</div>
                    )}

                    {showStartForFirst && (
                      <div className={styles.lockedCardContent}>
                        <p>
                          Registre-se gratuitamente para liberar a primeira seção e iniciar o seu desafio interativo.
                        </p>
                        <button className={styles.startBtn} onClick={handleStartClick}>
                          INICIAR DESAFIO
                        </button>
                      </div>
                    )}

                    {isLocked && !showStartForFirst && (
                      <div className={styles.lockHint}>
                        {isNext
                          ? 'Conclua a carta atual para revelar esta próxima etapa.'
                          : 'Esta etapa permanece em sombra até seu avanço contínuo.'}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {unlockedLevel === 6 && (
            <div className={styles.finalSuccess}>
              <h3>🎉 Parabéns! Você completou a escalada!</h3>
              <p className={styles.resultHighlight}>
                Sua performance atual é de {progress.totalStats.overallPercentage}% de acertos.
              </p>
              <div className={styles.resultBadge}>
                <span>{progress.totalStats.currentMedal.emoji}</span>
                <strong>{progress.totalStats.currentMedal.title}</strong>
              </div>
              <div className={styles.resultStats}>
                <div><span className={`${styles.resultIcon} ${styles.correctIcon}`} aria-hidden="true">✓</span>Acertos: {progress.totalStats.correctAnswers}</div>
                <div><span className={`${styles.resultIcon} ${styles.incorrectIcon}`} aria-hidden="true">!</span>Erros: {progress.totalStats.incorrectAnswers}</div>
                <div>🎮 Jogos concluídos: {progress.totalStats.completedGames}/5</div>
              </div>
              <p className={styles.resultMessage}>
                {showResults
                  ? 'Toda semana, conteúdo novo para praticar. Continue praticando e transforme esse avanço em fluência real com nossos cursos de espanhol.'
                  : 'Seu percurso está salvo. Você pode revisar todos os desafios quando quiser.'}
              </p>
              <button type="button" className={styles.replayBtn} onClick={handleReplay}>
                JOGAR NOVAMENTE
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <RegistrationModal
          onClose={() => setShowModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </section>
  );
}
