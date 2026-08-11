import { useEffect, useState } from 'react';
import styles from './Game.module.css';
import { playSound } from '../../utils/sound';
import type { GameAnswer } from './gameStorage';

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
    words: ['Cuando', 'era', 'niño', 'vivía', 'en', 'un', 'pueblo', 'pequeño.'],
    expected: 'Cuando era niño vivía en un pueblo pequeño.',
    explanation: 'A estrutura correta em espanhol é: "Cuando era niño vivía en un pueblo pequeño.".',
  },
  {
    words: ['Mientras', 'yo', 'estudiaba', 'ella', 'leía', 'un', 'libro.'],
    expected: 'Mientras yo estudiaba ella leía un libro.',
    explanation: '"Mientras" exige o Pretérito Imperfeito para ações simultâneas: "estudiaba / leía".',
  },
  {
    words: ['Aunque', 'era', 'tarde', 'yo', 'seguí', 'trabajando.'],
    expected: 'Aunque era tarde yo seguí trabajando.',
    explanation: '"Aunque era tarde" dá contexto no imperfecto, a ação pontual se expressa em Indefinido: "seguí".',
  },
  {
    words: ['Cuando', 'llegué', 'a', 'casa', 'ya', 'habían', 'preparado', 'la', 'cena.'],
    expected: 'Cuando llegué a casa ya habían preparado la cena.',
    explanation: '"Cuando llegué" (ação pontual) + ação anterior em Pluscuamperfecto: "habían preparado".',
  },
  {
    words: ['No', 'sabía', 'que', 'tú', 'estabas', 'aquí.'],
    expected: 'No sabía que tú estabas aquí.',
    explanation: '"No sabía que" dá contexto no imperfecto; a ação simultânea também se expressa no Imperfeito: "estabas".',
  },
];

export default function Game4({ onComplete, isCompleted }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);

  const correctCount = answers.filter((item) => item.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  useEffect(() => {
    setShuffledWords(shuffleArray(QUESTIONS[currentQ].words));
    setSelectedWords([]);
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
        <p>✅ Nível concluído!</p>
      </div>
    );
  }

  const availableWords = shuffledWords.filter((w) => !selectedWords.includes(w));

  return (
    <div className={styles.gameCard}>
      <h3 className={styles.gameTitle}>Nível 4 · Narrativas e Opiniões</h3>
      <p className={styles.questionText}>Forma la frase correcta ordenando las palabras:</p>

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
              <button onClick={resetLevel} className={styles.finishModalBtn} type="button">
                Repetir nivel
              </button>
              <button onClick={() => onComplete(answers, correctCount)} className={`${styles.finishModalBtn} ${styles.primaryBtn}`} type="button">
                Seguir al próximo nivel 5
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}