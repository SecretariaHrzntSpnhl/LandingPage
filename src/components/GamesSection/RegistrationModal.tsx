import { useState, type FormEvent } from 'react';
import styles from './GamesSection.module.css';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistrationModal({ onClose, onSuccess }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as any).toString()
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Form submission failed with status ${response.status}`);
        }

        onSuccess();
      })
      .catch((error) => {
        console.error(error);
        setStatus('error');
      });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar cadastro">×</button>
        <h3>Cadastro de Nivelamento</h3>
        <p>Preencha os dados abaixo para liberar seu acesso ao teste prático e iniciar sua avaliação.</p>

        <form onSubmit={handleSubmit} data-netlify="true" name="registro-juego">
          <input type="hidden" name="form-name" value="registro-juego" />

          <div className={styles.formGroup}>
            <input type="text" name="nome" placeholder="Seu Nome" required />
          </div>
          <div className={styles.formGroup}>
            <input type="email" name="email" placeholder="Seu E-mail" required />
          </div>
          <div className={styles.formGroup}>
            <input type="tel" name="telefone" placeholder="Seu Telefone" required />
          </div>
          <div className={styles.formGroup}>
            <textarea
              name="motivo"
              placeholder="Por que você quer estudar espanhol? (Deixe sua ideia aqui)"
              required
              rows={3}
            ></textarea>
          </div>

          <button type="submit" className={styles.submitModalBtn} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Aguarde...' : 'INICIAR AVALIAÇÃO'}
          </button>
          {status === 'error' && <p role="alert">Não foi possível enviar agora. Tente novamente.</p>}
        </form>
      </div>
    </div>
  );
}