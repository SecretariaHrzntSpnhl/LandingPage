import { useEffect, useState } from 'react';
import styles from './Game.module.css';
import { playSound } from '../../utils/sound';
import { shuffleArray, type GameAnswer } from './gameStorage';
import { clearGameSession, loadGameSession, saveGameSession } from './gameSession';

interface Props {
  onComplete: (answers: GameAnswer[], correctCount: number) => void;
  isCompleted: boolean;
}

const QUESTIONS = [
  {
    q: 'Si yo ____ más dinero, viajaría a todos los países de América Latina.',
    options: ['tuviera', 'tengo', 'tuve'],
    correct: 0,
  },
  {
    q: 'No creo que ellos ____ a tiempo para la reunión.',
    options: ['lleguen', 'llegarán', 'llegaron'],
    correct: 0,
  },
  {
    q: 'Ojalá que tú ____ más tranquilo durante la entrevista.',
    options: ['te sientas', 'te sentirás', 'te sentiste'],
    correct: 0,
  },
  {
    q: 'Aunque todos ____ que es verdad, yo no lo creo.',
    options: ['dicen', 'dijeron', 'dirán'],
    correct: 0,
  },
  {
    q: 'Cuando ____ al hotel, vamos a descansar un poco.',
    options: ['lleguemos', 'llegamos', 'llegaremos'],
    correct: 0,
  },
];

export default function Game5({ onComplete, isCompleted }: Props) {
  const savedSession = loadGameSession(5, { currentQ: 0, answers: [] as GameAnswer[], showSummary: false });
  const [currentQ, setCurrentQ] = useState(Math.min(savedSession.answers.length, QUESTIONS.length - 1));
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [answers, setAnswers] = useState<GameAnswer[]>(savedSession.answers);
  const [showSummary, setShowSummary] = useState(savedSession.showSummary || savedSession.answers.length >= QUESTIONS.length);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  useEffect(() => {
    saveGameSession(5, { currentQ, answers, showSummary });
  }, [currentQ, answers, showSummary]);

  useEffect(() => {
    setShuffledOptions(shuffleArray(QUESTIONS[currentQ].options));
  }, [currentQ]);

  const resetLevel = () => {
    clearGameSession(5);
    setCurrentQ(0);
    setSelectedAns(null);
    setAnswers([]);
    setShowSummary(false);
  };

  const handleSelect = (opt: string) => {
    if (selectedAns || showSummary) return;
    setSelectedAns(opt);

    const isCorrect = QUESTIONS[currentQ].options.indexOf(opt) === QUESTIONS[currentQ].correct;
    const nextAnswers = [...answers, { question: QUESTIONS[currentQ].q, isCorrect }];
    setAnswers(nextAnswers);

    playSound(isCorrect ? 'success' : 'error');

    setTimeout(() => {
      setSelectedAns(null);
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((c) => c + 1);
      } else {
        setShowSummary(true);
      }
    }, 800);
  };

  if (isCompleted) {
    return (
      <div className={`${styles.gameCard} ${styles.completed}`} style={{ borderColor: 'var(--yellow-horizon)', boxShadow: '0 0 20px rgba(255, 183, 0, 0.4)' }}>
        <h3 className={styles.gameTitle} style={{ color: 'var(--yellow-horizon)' }}>🌟 Desafio Final Completado!</h3>
        <p>Você chegou ao topo da escalada de proficiência.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gameCard} style={{ border: '2px solid var(--yellow-horizon)' }}>
        <h3 className={styles.gameTitle} style={{ color: 'var(--yellow-horizon)' }}>Nível 5 · O Desafio Final</h3>
        <div className={styles.progressMeta}>
          <span>Progresso</span>
          <span>{currentQ + 1}/5</span>
        </div>
        <div className={styles.progressTrack} aria-label={`Pergunta ${currentQ + 1} de 5`}>
          <div className={styles.progressValue} style={{ width: `${((currentQ + 1) / 5) * 100}%` }} />
        </div>

        <div style={{ background: 'rgba(255, 183, 0, 0.1)', padding: 'var(--section-container-padding)', borderRadius: '15px', marginBottom: 'var(--section-gap)' }}>
          <p style={{ marginBottom: 'var(--space-2)', color: 'var(--blue-sky)' }}>Escolha a opção correta para completar cada frase com desenvoltura avançada.</p>
        </div>

        <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: 'var(--section-container-padding)', borderRadius: '15px' }}>
          <p className={styles.questionText} style={{ marginBottom: 'var(--section-gap)', fontWeight: 'bold' }}>
            {currentQ + 1}/5. {QUESTIONS[currentQ].q}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shuffledOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={!!selectedAns}
                className={`${styles.optionBtn} ${selectedAns === opt ? (QUESTIONS[currentQ].options.indexOf(opt) === QUESTIONS[currentQ].correct ? styles.correct : styles.incorrect) : ''}`}
                style={{ textAlign: 'left', padding: 'var(--space-2) var(--section-container-padding)' }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showSummary && (
        <div className={styles.finishModalOverlay}>
          <div className={styles.finishModalContent}>
            <h3 className={styles.finishModalTitle}>¡Excelente!</h3>
            <p className={styles.finishModalText}>
              Você terminou o módulo com {correctCount} acertos e {incorrectCount} erros.
            </p>
            <div className={styles.summaryStats}>
              <div className={styles.summaryStat}><span className={`${styles.resultIcon} ${styles.correctIcon}`} aria-hidden="true">✓</span>Acertos: {correctCount}</div>
              <div className={styles.summaryStat}><span className={`${styles.resultIcon} ${styles.incorrectIcon}`} aria-hidden="true">!</span>Erros: {incorrectCount}</div>
            </div>
            <a
              className={styles.whatsappLink}
              href="https://api.whatsapp.com/send/?phone=5549998212897&text=Ol%C3%A1%2C%20gostaria%20de%20aprender%20mais%20espanhol!"
              target="_blank"
              rel="noopener noreferrer"
            >
              🟢 Aprender mais
            </a>
            <div className={styles.finishModalButtons}>
              <button type="button" className={styles.finishModalBtn} onClick={resetLevel}>
                Repetir nível
              </button>
              <button
                type="button"
                className={`${styles.finishModalBtn} ${styles.primaryBtn}`}
                onClick={() => onComplete(answers, correctCount)}
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}