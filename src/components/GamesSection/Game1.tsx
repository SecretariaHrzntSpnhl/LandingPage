import { useEffect, useState } from 'react';
import styles from './Game.module.css';
import { playSound } from '../../utils/sound';
import type { GameAnswer } from './gameStorage';
import { clearGameSession, loadGameSession, saveGameSession } from './gameSession';

interface Props {
  onComplete: (answers: GameAnswer[], correctCount: number) => void;
  isCompleted: boolean;
}

const QUESTIONS = [
  {
    id: 1,
    question: 'Qual é a tradução direta para a cor "vermelho" em espanhol?',
    options: ['Azul', 'Rojo', 'Verde', 'Amarillo'],
    correct: 1,
    explanation: '"Rojo" é a tradução direta de "vermelho". "Azul" é azul, "verde" é verde e "amarillo" é amarelo.',
  },
  {
    id: 2,
    question: 'O que você usa para tomar café?',
    options: ['Vaso', 'Cuchara', 'Taza', 'Tenedor'],
    correct: 2,
    explanation: '"Taza" é a xícara. "Vaso" é o copo, "cuchara" é a colher e "tenedor" é o garfo.',
  },
  {
    id: 3,
    question: 'O que você usa para tomar sopa?',
    options: ['Vaso', 'Cuchara', 'Taza', 'Tenedor'],
    correct: 1,
    explanation: '"Cuchara" é a colher. "Vaso" é o copo, "taza" é a xícara e "tenedor" é o garfo.',
  },
  {
    id: 4,
    question: 'O que você usa para assar um bolo?',
    options: ['Sartén', 'Olla', 'Cacerola', 'Horno'],
    correct: 3,
    explanation: '"Horno" é o forno. "Sartén" é a frigideira, "olla" é a panela de pressão e "cacerola" é a panela funda.',
  },
  {
    id: 5,
    question: 'O que você diz quando alguém espirra?',
    options: ['Salud', 'Gracias', 'Por favor', 'Perdón'],
    correct: 0,
    explanation: '"Salud" é o que se diz ao espirro. "Gracias" é obrigado, "por favor" é por favor e "perdón" é desculpa.',
  },
];

export default function Game1({ onComplete, isCompleted }: Props) {
  const savedSession = loadGameSession(1, { currentQ: 0, answers: [] as GameAnswer[], showSummary: false });
  const [currentQ, setCurrentQ] = useState(Math.min(savedSession.answers.length, QUESTIONS.length - 1));
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [answers, setAnswers] = useState<GameAnswer[]>(savedSession.answers);
  const [showSummary, setShowSummary] = useState(savedSession.showSummary || savedSession.answers.length >= QUESTIONS.length);

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  useEffect(() => {
    saveGameSession(1, { currentQ, answers, showSummary });
  }, [currentQ, answers, showSummary]);

  const resetLevel = () => {
    clearGameSession(1);
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAns(null);
    setShowSummary(false);
  };

  const handleSelect = (opt: string) => {
    if (selectedAns || showSummary) return;
    setSelectedAns(opt);

    const isCorrect = QUESTIONS[currentQ].options.indexOf(opt) === QUESTIONS[currentQ].correct;
    const nextAnswers = [...answers, { question: QUESTIONS[currentQ].question, isCorrect }];
    setAnswers(nextAnswers);

    playSound(isCorrect ? 'success' : 'error');
    if ('vibrate' in navigator) navigator.vibrate(isCorrect ? 100 : [100, 50, 100]);

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
      <div className={`${styles.gameCard} ${styles.completed}`}>
        <h3 className={styles.gameTitle}>Primeiros Passos</h3>
        <p><span className={`${styles.resultIcon} ${styles.correctIcon}`} aria-hidden="true">✓</span>Nível concluído!</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gameCard}>
      <h3 className={styles.gameTitle}>Nível 1 · Objetos e Cores</h3>
      <div className={styles.progressMeta}>
        <span>Progresso</span>
        <span>{currentQ + 1}/5</span>
      </div>
      <div className={styles.progressTrack} aria-label={`Pergunta ${currentQ + 1} de 5`}>
        <div className={styles.progressValue} style={{ width: `${((currentQ + 1) / 5) * 100}%` }} />
      </div>
      <p className={styles.questionText}>{QUESTIONS[currentQ].question}</p>

      <div className={styles.optionsGrid}>
        {QUESTIONS[currentQ].options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={!!selectedAns}
            className={`${styles.optionBtn} ${selectedAns === opt ? (QUESTIONS[currentQ].options.indexOf(opt) === QUESTIONS[currentQ].correct ? styles.correct : styles.incorrect) : ''}`}
          >
            {opt}
          </button>
        ))}
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
                  Seguir para o próximo nível 2
              </button>
            </div>
          </div>
        </div>
      )}
    </>
 );
}