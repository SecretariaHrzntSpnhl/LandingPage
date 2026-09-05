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
    q: 'Você está em uma loja de roupas e quer provar uma camisa. O que você diz ao vendedor?',
    options: ['¿Puedo probarme esta camisa?', '¿Puedo probar esta camisa?', '¿Puedo vestirme esta camisa?', '¿Puedo ponerme esta camisa?'],
    correct: 0,
    explanation: '"Probarse" é o verbo reflexivo correto para experimentar roupa em si mesmo.',
  },
  {
    q: 'Você está em um restaurante e quer pedir a conta. O que você diz?',
    options: ['¿Me trae la cuenta, por favor?', '¿Me trae el recibo, por favor?', '¿Me trae el ticket, por favor?', '¿Me trae la factura, por favor?'],
    correct: 0,
    explanation: '"La cuenta" é a forma correta para pedir a conta no restaurante.',
  },
  {
    q: 'Como você pergunta a idade de alguém em espanhol?',
    options: ['¿Cuántos años tienes?', '¿Cuántas años tienes?', '¿Cuántos años tenés?', '¿Cuánta edad tienes?'],
    correct: 0,
    explanation: '"¿Cuántos años tienes?" é a forma correta. "Años" é masculino plural, então usamos "cuántos".',
  },
  {
    q: 'Você quer saber o que uma pessoa faz da vida. Como você pergunta?',
    options: ['¿A qué te dedicas?', '¿Qué haces en la vida?', '¿Qué trabajas?', '¿Cuál es tu trabajo?'],
    correct: 0,
    explanation: '"¿A qué te dedicas?" é a forma mais natural e comum para perguntar a profissão de alguém.',
  },
  {
    q: 'Você quer convidar um amigo para sair no sábado. Como você diz?',
    options: ['¿Quieres salir el sábado?', '¿Quieres salir en sábado?', '¿Quieres salir a sábado?', '¿Quieres salir por sábado?'],
    correct: 0,
    explanation: '"El sábado" é a forma correta para dias da semana em espanhol.',
  },
];

export default function Game2({ onComplete, isCompleted }: Props) {
  const savedSession = loadGameSession(2, { currentQ: 0, answers: [] as GameAnswer[], showSummary: false });
  const [currentQ, setCurrentQ] = useState(Math.min(savedSession.answers.length, QUESTIONS.length - 1));
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [answers, setAnswers] = useState<GameAnswer[]>(savedSession.answers);
  const [showSummary, setShowSummary] = useState(savedSession.showSummary || savedSession.answers.length >= QUESTIONS.length);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  useEffect(() => {
    saveGameSession(2, { currentQ, answers, showSummary });
  }, [currentQ, answers, showSummary]);

  useEffect(() => {
    setShuffledOptions(shuffleArray(QUESTIONS[currentQ].options));
  }, [currentQ]);

  const resetLevel = () => {
    clearGameSession(2);
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAns(null);
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
      <div className={`${styles.gameCard} ${styles.completed}`}>
        <h3 className={styles.gameTitle}>Descrevendo o Mundo</h3>
        <p><span className={`${styles.resultIcon} ${styles.correctIcon}`} aria-hidden="true">✓</span>Nível concluído!</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gameCard}>
        <h3 className={styles.gameTitle}>Nível 2 · Descrevendo o Mundo</h3>
        <div className={styles.progressMeta}>
          <span>Progresso</span>
          <span>{currentQ + 1}/5</span>
        </div>
        <div className={styles.progressTrack} aria-label={`Pergunta ${currentQ + 1} de 5`}>
          <div className={styles.progressValue} style={{ width: `${((currentQ + 1) / 5) * 100}%` }} />
        </div>
        <p className={styles.questionText}>{QUESTIONS[currentQ].q}</p>

        <div className={styles.optionsGrid}>
          {shuffledOptions.map((opt) => (
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
              Você concluiu o módulo com {correctCount} acertos e {incorrectCount} erros.
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
                Seguir para o próximo nível 3
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}