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
    q: '"Este fin de semana, yo ____ (ir) al cine con mis amigos."',
    verb: 'ir',
    tense: 'Pretérito perfecto',
    a: 'he ido',
    explanation: '"Este fin de semana" é um período não terminado, usa-se o Pretérito Perfeito "he ido".',
  },
  {
    q: '"¿Qué ____ (hacer) tú ayer por la tarde?"',
    verb: 'hacer',
    tense: 'Pretérito indefinido',
    a: 'hiciste',
    explanation: '"Ayer" é um tempo terminado, usa-se o Pretérito Indefinido "hiciste".',
  },
  {
    q: '"Cuando era niño, yo ____ (vivir) en un pueblo pequeño."',
    verb: 'vivir',    tense: 'Pretérito imperfecto',    a: 'vivía',
    explanation: '"Cuando era niño" descreve hábito ou contexto no passado, usa-se o Pretérito Imperfeito "vivía".',
  },
  {
    q: '"Yo ____ (estudiar) español desde hace dos años."',
    verb: 'estudiar',
    tense: 'Pretérito perfecto',
    a: 'he estudiado',
    explanation: '"Desde hace dos años" indica ação que começou no passado e continua, usa-se o Pretérito Perfeito "he estudiado".',
  },
  {
    q: '"¿Alguna vez ____ (visitar) México?"',
    verb: 'visitar',
    tense: 'Pretérito perfecto',
    a: 'has visitado',
    explanation: '"Alguna vez" refere-se a uma experiência de vida, usa-se o Pretérito Perfeito "has visitado".',
  },
];

export default function Game3({ onComplete, isCompleted }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  const resetLevel = () => {
    setCurrentQ(0);
    setInputVal('');
    setStatus('idle');
    setAnswers([]);
    setShowSummary(false);
  };

  const checkAnswer = () => {
    if (status !== 'idle') return;
    const normalized = inputVal.toLowerCase().trim();
    const isCorrect = normalized === QUESTIONS[currentQ].a;
    const nextAnswers = [...answers, { question: QUESTIONS[currentQ].q, isCorrect }];
    setAnswers(nextAnswers);
    setStatus(isCorrect ? 'correct' : 'incorrect');
    playSound(isCorrect ? 'success' : 'error');

    setTimeout(() => {
      setStatus('idle');
      setInputVal('');
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((c) => c + 1);
      } else {
        setShowSummary(true);
      }
    }, 1000);
  };

  if (isCompleted) {
    return (
      <div className={`${styles.gameCard} ${styles.completed}`}>
        <h3 className={styles.gameTitle}>Contando Histórias</h3>
        <p>✅ Nível concluído!</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gameCard}>
        <h3 className={styles.gameTitle}>Nível 3 · Contando Histórias</h3>
        <p className={styles.questionText}>
          {QUESTIONS[currentQ].q.replace('____', '_____')} <br />
          <small style={{ color: 'var(--blue-sky)', fontSize: '0.9rem' }}>
            (Verbo: {QUESTIONS[currentQ].verb} · {QUESTIONS[currentQ].tense})
          </small>
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--section-gap)' }}>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
            disabled={status !== 'idle'}
            style={{
              padding: '10px 15px',
              borderRadius: '10px',
              border: `2px solid ${status === 'correct' ? '#4caf50' : status === 'incorrect' ? 'var(--red-energy)' : 'var(--blue-sky)'}`,
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1.2rem',
              textAlign: 'center',
              minWidth: '180px',
              flex: '1 1 220px',
            }}
            placeholder="Sua resposta..."
          />
          <button onClick={checkAnswer} disabled={status !== 'idle'} className={styles.nextBtn}>
            Enviar
          </button>
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
              🟢 Aprender mais
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
                Seguir al próximo nivel 4
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}