import { useState } from 'react';
import styles from './Game.module.css';
import { playSound } from '../../utils/sound';
import type { GameAnswer } from './gameStorage';

interface Props {
  onComplete: (answers: GameAnswer[], correctCount: number) => void;
  isCompleted: boolean;
}

const QUESTIONS = [
  {
    q: 'A forma correta de "Yo soy profesora" para um homem é "Yo soy profesor".',
    a: true,
  },
  {
    q: 'Em espanhol, "Eu como" se traduz como "Yo come".',
    a: false,
  },
  {
    q: '"Mi hermana es alta y delgada" descreve um aspecto físico.',
    a: true,
  },
  {
    q: 'A tradução de "Eu tenho um gato" em espanhol é "Yo tengo una casa".',
    a: false,
  },
  {
    q: 'Para dizer "estar cansado" em espanhol, usa-se o verbo "estar".',
    a: true,
  },
];

export default function Game2({ onComplete, isCompleted }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAns, setSelectedAns] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  const resetLevel = () => {
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAns(null);
    setShowSummary(false);
  };

  const handleSelect = (opt: boolean) => {
    if (selectedAns !== null || showSummary) return;
    setSelectedAns(opt);

    const isCorrect = opt === QUESTIONS[currentQ].a;
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
        <p>✅ Nível concluído!</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gameCard}>
        <h3 className={styles.gameTitle}>Nível 2 · Descrevendo o Mundo</h3>
        <p className={styles.questionText}>{QUESTIONS[currentQ].q}</p>

        <div className={styles.optionsGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
          <button
            onClick={() => handleSelect(true)}
            disabled={selectedAns !== null}
            className={`${styles.optionBtn} ${selectedAns === true ? (QUESTIONS[currentQ].a === true ? styles.correct : styles.incorrect) : ''}`}
          >
            Verdadeiro
          </button>
          <button
            onClick={() => handleSelect(false)}
            disabled={selectedAns !== null}
            className={`${styles.optionBtn} ${selectedAns === false ? (QUESTIONS[currentQ].a === false ? styles.correct : styles.incorrect) : ''}`}
          >
            Falso
          </button>
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
              <div className={styles.summaryStat}>✅ Acertos: {correctCount}</div>
              <div className={styles.summaryStat}>❌ Erros: {incorrectCount}</div>
            </div>
            <a
              className={styles.whatsappLink}
              href="https://api.whatsapp.com/send/?phone=5549998212897&text=Ol%C3%A1%2C%20gostaria%20de%20aprender%20mais%20espanhol!"
              target="_blank"
              rel="noopener noreferrer"
            >
              📲 Aprender mais no WhatsApp
            </a>
            <div className={styles.finishModalButtons}>
              <button type="button" className={styles.finishModalBtn} onClick={resetLevel}>
                Tentar novamente
              </button>
              <button
                type="button"
                className={styles.finishModalBtn}
                onClick={() => onComplete(answers, correctCount)}
              >
                Finalizar desafio
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}