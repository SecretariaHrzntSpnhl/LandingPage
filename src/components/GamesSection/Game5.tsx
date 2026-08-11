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
    q: 'Escolha a opção correta: "Después de comer, siempre me siento ____"',
    options: ['lleno', 'llama', 'lento'],
    correct: 0,
    explanation: '"Siempre me siento lleno" é a forma correta para indicar saciedade após comer.',
  },
  {
    q: 'Complete a frase: "Si yo ____ más tiempo, viajaría por el mundo."',
    options: ['tuviera', 'tuve', 'tendrá'],
    correct: 0,
    explanation: 'O condicional hipotético requer o Pretérito Imperfeito de Subjuntivo: "tuviera".',
  },
  {
    q: 'Escolha a forma correta: "Ojalá que él ____ aquí mañana."',
    options: ['esté', 'está', 'estaba'],
    correct: 0,
    explanation: '"Ojalá" exige o Subjuntivo presente para eventos futuros: "esté".',
  },
  {
    q: 'Qual é a melhor tradução de "Eu prefiro estudar espanhol"?',
    options: ['Prefiero estudiar español', 'Prefiero estudiar españolía', 'Prefiero estar estudiando español'],
    correct: 0,
    explanation: 'A tradução direta e natural é "Prefiero estudiar español".',
  },
  {
    q: 'Selecione a opção correta: "No creo que ella ____ el examen."',
    options: ['pase', 'pasará', 'pasó'],
    correct: 0,
    explanation: 'Depois de "No creo que" vem o Subjuntivo presente: "pase".',
  },
];

export default function Game5({ onComplete, isCompleted }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  const resetLevel = () => {
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

        <div style={{ background: 'rgba(255, 183, 0, 0.1)', padding: 'var(--section-container-padding)', borderRadius: '15px', marginBottom: 'var(--section-gap)' }}>
          <p style={{ marginBottom: 'var(--space-2)', color: 'var(--blue-sky)' }}>Escolha la opción correcta para completar cada frase con soltura avanzada.</p>
        </div>

        <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: 'var(--section-container-padding)', borderRadius: '15px' }}>
          <p className={styles.questionText} style={{ marginBottom: 'var(--section-gap)', fontWeight: 'bold' }}>
            {currentQ + 1}/5. {QUESTIONS[currentQ].q}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {QUESTIONS[currentQ].options.map((opt) => (
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
                Repetir nivel
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