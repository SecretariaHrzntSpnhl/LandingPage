import { useState, type FormEvent } from 'react';
import styles from './GamesSection.module.css';
import { getLeadTrackingFields } from '../../utils/leadTracking';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistrationModal({ onClose, onSuccess }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      onSuccess();
      return;
    }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: Array.from(formData.entries())
        .reduce((params, [key, value]) => {
          if (typeof value === 'string') {
            params.append(key, value);
          }
          return params;
        }, new URLSearchParams())
        .toString()
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
        <p>Preencha os dados abaixo para liberar seu acesso ao teste prático e iniciar seu jogo.</p>

        <form onSubmit={handleSubmit} data-netlify="true" netlify-honeypot="bot-field" name="registro-juego" method="POST" action="/">
          <input type="hidden" name="form-name" value="registro-juego" />
          <input type="hidden" name="utmSource" value={getLeadTrackingFields().utmSource} />
          <input type="hidden" name="utmMedium" value={getLeadTrackingFields().utmMedium} />
          <input type="hidden" name="utmCampaign" value={getLeadTrackingFields().utmCampaign} />
          <input type="hidden" name="landingPage" value={getLeadTrackingFields().landingPage} />
          <input type="hidden" name="referrer" value={getLeadTrackingFields().referrer} />
          <input type="hidden" name="deviceType" value={getLeadTrackingFields().deviceType} />
          <div hidden>
            <label htmlFor="registro-bot-field">Não preencha este campo</label>
            <input id="registro-bot-field" name="bot-field" tabIndex={-1} autoComplete="off" />
          </div>

          <div className={styles.formGroup}>
            <input type="text" name="nome" placeholder="Seu Nome" autoComplete="name" required />
          </div>
          <div className={styles.formGroup}>
            <input type="email" name="email" placeholder="Seu E-mail" autoComplete="email" inputMode="email" required />
          </div>
          <div className={styles.formGroup}>
            <input type="tel" name="telefone" placeholder="Seu Telefone" autoComplete="tel" inputMode="tel" required />
          </div>
          <div className={styles.formGroup}>
            <textarea
              name="motivo"
              placeholder="Por que você quer estudar espanhol? (Deixe sua ideia aqui)"
              required
              rows={3}
            ></textarea>
          </div>
          <label className={styles.consent}>
            <input type="checkbox" name="consentimentoContato" value="sim" required />
            <span>
              Aceito os{' '}
              <button
                type="button"
                className={styles.termsLink}
                onClick={(event) => {
                  event.preventDefault();
                  setShowTerms(true);
                }}
              >
                termos e condições
              </button>
              .
            </span>
          </label>

          <button type="submit" className={styles.submitModalBtn} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Aguarde...' : 'INICIAR JOGO'}
          </button>
          {status === 'error' && <p role="alert">Não foi possível enviar agora. Tente novamente.</p>}
        </form>
      </div>
      {showTerms && (
        <div className={styles.termsOverlay} role="presentation" onClick={() => setShowTerms(false)}>
          <div
            className={styles.termsDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="terms-title">Termos e condições</h3>
            <p>
              Os dados informados neste cadastro serão utilizados exclusivamente pelo departamento de vendas da
              Horizonte Espanhol para contato sobre cursos, atendimento e oportunidades de matrícula.
            </p>
            <p>
              O tratamento dos dados segue a Lei Geral de Proteção de Dados Pessoais (LGPD), Lei nº 13.709/2018,
              vigente no Brasil.
            </p>
            <button type="button" className={styles.termsCloseBtn} onClick={() => setShowTerms(false)}>
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}