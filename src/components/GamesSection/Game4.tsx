import { useEffect, useState } from 'react';
import styles from './Game.module.css';
import { playSound } from '../../utils/sound';
import type { GameAnswer } from './gameStorage';
import { clearGameSession, loadGameSession, saveGameSession } from './gameSession';

interface Props {
  onComplete: (answers: GameAnswer[], correctCount: number) => void;
  isCompleted: boolean;
}

function shuffleArray<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const QUESTIONS = [
  {
    words: ['Cuando', 'llegué', 'al', 'aeropuerto', 'ya', 'había', 'perdido', 'mi', 'vuelo.'],
    expected: 'Cuando llegué al aeropuerto ya había perdido mi vuelo.',
  },
  {
    words: ['Mientras', 'el', 'jefe', 'hablaba', 'yo', 'tomaba', 'notas', 'importantes.'],
    expected: 'Mientras el jefe hablaba yo tomaba notas importantes.',
  },
  {
    words: ['Aunque', 'hacía', 'frío', 'nosotros', 'salimos', 'a', 'pasear.'],
    expected: 'Aunque hacía frío nosotros salimos a pasear.',
  },
  {
    words: ['Cuando', 'vi', 'la', 'oferta', 'ya', 'había', 'comprado', 'el', 'regalo.'],
    expected: 'Cuando vi la oferta ya había comprado el regalo.',
  },
  {
    words: ['No', 'sabía', 'que', 'tus', 'amigos', 'vivían', 'en', 'esta', 'ciudad.'],
    expected: 'No sabía que tus amigos vivían en esta ciudad.',
  },
];

export default function Game4({ onComplete, isCompleted }: Props) {
  const savedSession = loadGameSession(4, { currentQ: 0, selectedWords: [] as string[], answers: [] as GameAnswer[], completionModalVisible: false });
  const [currentQ, setCurrentQ] = useState(Math.min(savedSession.answers.length, QUESTIONS.length - 1));
  const [selectedWords, setSelectedWords] = useState<string[]>(savedSession.selectedWords);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [answers, setAnswers] = useState<GameAnswer[]>(savedSession.answers);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [completionModalVisible, setCompletionModalVisible] = useState(savedSession.completionModalVisible || savedSession.answers.length >= QUESTIONS.length);

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  useEffect(() => {
    saveGameSession(4, { currentQ, selectedWords, answers, completionModalVisible });
  }, [currentQ, selectedWords, answers, completionModalVisible]);

  useEffect(() => {
    setShuffledWords(shuffleArray(QUESTIONS[currentQ].words));
    setStatus('idle');
  }, [currentQ]);


  const handleWordClick = (word: string) => {
    if (status !== 'idle') return;
    setSelectedWords([...selectedWords, word]);
  };

  const handleRemoveWord = (index: number) => {
    if (status !== 'idle') return;
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const resetLevel = () => {
    clearGameSession(4);
    setCurrentQ(0);
    setSelectedWords([]);
    setAnswers([]);
    setStatus('idle');
    setShuffledWords(shuffleArray(QUESTIONS[0].words));
    setCompletionModalVisible(false);
  };

  const checkAnswer = () => {
    if (status !== 'idle') return;

    const currentAns = selectedWords.join(' ').toLowerCase();
    const isCorrect = currentAns === QUESTIONS[currentQ].expected.toLowerCase();
    const nextAnswers = [...answers, { question: QUESTIONS[currentQ].expected, isCorrect }];
    setAnswers(nextAnswers);
    setStatus(isCorrect ? 'correct' : 'incorrect');
    playSound(isCorrect ? 'success' : 'error');

    setTimeout(() => {
      setStatus('idle');
      setSelectedWords([]);
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((c) => c + 1);
      } else {
        setCompletionModalVisible(true);
      }
    }, 1200);
  };

  if (isCompleted) {
    return (
      <div className={`${styles.gameCard} ${styles.completed}`}>
        <h3 className={styles.gameTitle}>Narrativas e Opiniões</h3>
        <p><span className={`${styles.resultIcon} ${styles.correctIcon}`} aria-hidden="true">✓</span>Nível concluído!</p>
      </div>
    );
  }

  const availableWords = shuffledWords.filter((w) => !selectedWords.includes(w));

  return (
    <div className={styles.gameCard}>
      <h3 className={styles.gameTitle}>Nível 4 · Narrativas e Opiniões</h3>
      <div className={styles.progressMeta}>
        <span>Progresso</span>
        <span>{currentQ + 1}/5</span>
      </div>
      <div className={styles.progressTrack} aria-label={`Pergunta ${currentQ + 1} de 5`}>
        <div className={styles.progressValue} style={{ width: `${((currentQ + 1) / 5) * 100}%` }} />
      </div>
      <p className={styles.questionText}>Monte a frase correta ordenando as palavras:</p>

      <div className={styles.sentenceBuilder} style={{ minHeight: '60px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: 'var(--section-container-padding)', marginBottom: 'var(--section-gap)', display: 'flex', flexWrap: 'wrap', gap: '10px', border: `2px solid ${status === 'correct' ? '#4caf50' : status === 'incorrect' ? 'var(--red-energy)' : 'var(--blue-sky)'}` }}>
        {selectedWords.map((word, i) => (
          <button key={`${word}-${i}`} onClick={() => handleRemoveWord(i)} className={styles.wordChip} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: '20px', background: 'var(--yellow-horizon)', color: 'var(--blue-deep)', fontWeight: 'bold' }}>
            {word}
          </button>
        ))}
        {selectedWords.length === 0 && <span style={{ color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>Tu frase aparecerá aquí...</span>}
      </div>

      <div className={styles.availableWords} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: 'var(--section-gap)' }}>
        {availableWords.map((word, i) => (
          <button key={`${word}-${i}`} onClick={() => handleWordClick(word)} className={styles.wordChip} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: '20px', background: 'transparent', border: '1px solid var(--blue-sky)', color: 'var(--white)' }}>
            {word}
          </button>
        ))}
      </div>

      <button onClick={checkAnswer} disabled={status !== 'idle'} className={styles.nextBtn} style={{ width: '100%' }}>
        Verificar Frase
      </button>

      {completionModalVisible && (
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
              <button onClick={resetLevel} className={styles.finishModalBtn} type="button">
                Repetir nível
              </button>
              <button onClick={() => onComplete(answers, correctCount)} className={`${styles.finishModalBtn} ${styles.primaryBtn}`} type="button">
                Seguir para o próximo nível 5
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}