import { type FormEvent, useState } from 'react';
import styles from './LeadForm.module.css';
import { playSound } from '../../utils/sound';

const PHONE_OPTIONS = [
  { code: 'BR', label: 'Brasil', dialCode: '+55', emoji: '🇧🇷', example: '(11) 99999-9999' },
  { code: 'PT', label: 'Portugal', dialCode: '+351', emoji: '🇵🇹', example: '912 345 678' },
  { code: 'ES', label: 'Espanha', dialCode: '+34', emoji: '🇪🇸', example: '612 34 56 78' },
  { code: 'FR', label: 'França', dialCode: '+33', emoji: '🇫🇷', example: '612 34 56 78' },
  { code: 'DE', label: 'Alemanha', dialCode: '+49', emoji: '🇩🇪', example: '1512 345678' },
  { code: 'IT', label: 'Itália', dialCode: '+39', emoji: '🇮🇹', example: '333 1234567' },
  { code: 'NL', label: 'Países Baixos', dialCode: '+31', emoji: '🇳🇱', example: '6 1234 5678' },
  { code: 'BE', label: 'Bélgica', dialCode: '+32', emoji: '🇧🇪', example: '470 123 456' },
  { code: 'CH', label: 'Suíça', dialCode: '+41', emoji: '🇨🇭', example: '79 123 45 67' },
  { code: 'AT', label: 'Áustria', dialCode: '+43', emoji: '🇦🇹', example: '660 123456' },
  { code: 'IE', label: 'Irlanda', dialCode: '+353', emoji: '🇮🇪', example: '85 123 4567' },
  { code: 'GB', label: 'Reino Unido', dialCode: '+44', emoji: '🇬🇧', example: '7700 900123' },
  { code: 'SE', label: 'Suécia', dialCode: '+46', emoji: '🇸🇪', example: '70 123 45 67' },
  { code: 'NO', label: 'Noruega', dialCode: '+47', emoji: '🇳🇴', example: '412 34 567' },
  { code: 'DK', label: 'Dinamarca', dialCode: '+45', emoji: '🇩🇰', example: '21 23 45 67' },
  { code: 'FI', label: 'Finlândia', dialCode: '+358', emoji: '🇫🇮', example: '40 123 4567' },
  { code: 'PL', label: 'Polônia', dialCode: '+48', emoji: '🇵🇱', example: '500 123 456' },
  { code: 'CZ', label: 'República Tcheca', dialCode: '+420', emoji: '🇨🇿', example: '601 123 456' },
  { code: 'HU', label: 'Hungria', dialCode: '+36', emoji: '🇭🇺', example: '20 123 4567' },
  { code: 'RO', label: 'Romênia', dialCode: '+40', emoji: '🇷🇴', example: '721 234 567' },
  { code: 'GR', label: 'Grécia', dialCode: '+30', emoji: '🇬🇷', example: '690 123 4567' },
  { code: 'TR', label: 'Turquia', dialCode: '+90', emoji: '🇹🇷', example: '505 123 45 67' },
  { code: 'UA', label: 'Ucrânia', dialCode: '+380', emoji: '🇺🇦', example: '50 123 4567' },
  { code: 'RU', label: 'Rússia', dialCode: '+7', emoji: '🇷🇺', example: '900 123-45-67' },
  { code: 'US', label: 'Estados Unidos', dialCode: '+1', emoji: '🇺🇸', example: '(415) 555-2671' },
  { code: 'CA', label: 'Canadá', dialCode: '+1', emoji: '🇨🇦', example: '(416) 555-0123' },
  { code: 'MX', label: 'México', dialCode: '+52', emoji: '🇲🇽', example: '55 1234 5678' },
  { code: 'AR', label: 'Argentina', dialCode: '+54', emoji: '🇦🇷', example: '11 2345-6789' },
  { code: 'CL', label: 'Chile', dialCode: '+56', emoji: '🇨🇱', example: '9 1234 5678' },
  { code: 'CO', label: 'Colômbia', dialCode: '+57', emoji: '🇨🇴', example: '300 123 4567' },
  { code: 'PE', label: 'Peru', dialCode: '+51', emoji: '🇵🇪', example: '912 345 678' },
  { code: 'UY', label: 'Uruguai', dialCode: '+598', emoji: '🇺🇾', example: '99 123 456' },
  { code: 'VE', label: 'Venezuela', dialCode: '+58', emoji: '🇻🇪', example: '412 1234567' },
  { code: 'EC', label: 'Equador', dialCode: '+593', emoji: '🇪🇨', example: '99 123 4567' },
  { code: 'BO', label: 'Bolívia', dialCode: '+591', emoji: '🇧🇴', example: '712 34567' },
  { code: 'PY', label: 'Paraguai', dialCode: '+595', emoji: '🇵🇾', example: '971 234 567' },
  { code: 'CR', label: 'Costa Rica', dialCode: '+506', emoji: '🇨🇷', example: '8888 1234' },
  { code: 'DO', label: 'República Dominicana', dialCode: '+1', emoji: '🇩🇴', example: '809 123 4567' },
  { code: 'PR', label: 'Porto Rico', dialCode: '+1', emoji: '🇵🇷', example: '787 123 4567' },
  { code: 'PA', label: 'Panamá', dialCode: '+507', emoji: '🇵🇦', example: '6123 4567' },
  { code: 'GT', label: 'Guatemala', dialCode: '+502', emoji: '🇬🇹', example: '5123 4567' },
  { code: 'SV', label: 'El Salvador', dialCode: '+503', emoji: '🇸🇻', example: '7012 3456' },
  { code: 'HN', label: 'Honduras', dialCode: '+504', emoji: '🇭🇳', example: '9123 4567' },
  { code: 'NI', label: 'Nicarágua', dialCode: '+505', emoji: '🇳🇮', example: '8123 4567' },
  { code: 'CU', label: 'Cuba', dialCode: '+53', emoji: '🇨🇺', example: '5 1234567' },
  { code: 'JP', label: 'Japão', dialCode: '+81', emoji: '🇯🇵', example: '90 1234 5678' },
  { code: 'KR', label: 'Coreia do Sul', dialCode: '+82', emoji: '🇰🇷', example: '10 1234 5678' },
  { code: 'CN', label: 'China', dialCode: '+86', emoji: '🇨🇳', example: '139 1234 5678' },
  { code: 'HK', label: 'Hong Kong', dialCode: '+852', emoji: '🇭🇰', example: '5123 4567' },
  { code: 'SG', label: 'Singapura', dialCode: '+65', emoji: '🇸🇬', example: '8123 4567' },
  { code: 'MY', label: 'Malásia', dialCode: '+60', emoji: '🇲🇾', example: '12 3456 7890' },
  { code: 'TH', label: 'Tailândia', dialCode: '+66', emoji: '🇹🇭', example: '81 234 5678' },
  { code: 'VN', label: 'Vietnã', dialCode: '+84', emoji: '🇻🇳', example: '912 345 678' },
  { code: 'ID', label: 'Indonésia', dialCode: '+62', emoji: '🇮🇩', example: '812 3456 789' },
  { code: 'IN', label: 'Índia', dialCode: '+91', emoji: '🇮🇳', example: '98765 43210' },
  { code: 'PK', label: 'Paquistão', dialCode: '+92', emoji: '🇵🇰', example: '300 1234567' },
  { code: 'BD', label: 'Bangladesh', dialCode: '+880', emoji: '🇧🇩', example: '1712 345678' },
  { code: 'AE', label: 'Emirados Árabes', dialCode: '+971', emoji: '🇦🇪', example: '50 123 4567' },
  { code: 'SA', label: 'Arábia Saudita', dialCode: '+966', emoji: '🇸🇦', example: '50 123 4567' },
  { code: 'QA', label: 'Qatar', dialCode: '+974', emoji: '🇶🇦', example: '3312 3456' },
  { code: 'KW', label: 'Kuwait', dialCode: '+965', emoji: '🇰🇼', example: '500 12345' },
  { code: 'EG', label: 'Egito', dialCode: '+20', emoji: '🇪🇬', example: '100 123 4567' },
  { code: 'ZA', label: 'África do Sul', dialCode: '+27', emoji: '🇿🇦', example: '71 123 4567' },
  { code: 'NG', label: 'Nigéria', dialCode: '+234', emoji: '🇳🇬', example: '803 123 4567' },
  { code: 'KE', label: 'Quênia', dialCode: '+254', emoji: '🇰🇪', example: '712 345678' },
  { code: 'MA', label: 'Marrocos', dialCode: '+212', emoji: '🇲🇦', example: '612 345 678' },
  { code: 'TN', label: 'Tunísia', dialCode: '+216', emoji: '🇹🇳', example: '20 123 456' },
  { code: 'IL', label: 'Israel', dialCode: '+972', emoji: '🇮🇱', example: '50 123 4567' },
  { code: 'AU', label: 'Austrália', dialCode: '+61', emoji: '🇦🇺', example: '412 345 678' },
  { code: 'NZ', label: 'Nova Zelândia', dialCode: '+64', emoji: '🇳🇿', example: '21 123 4567' },
];

export default function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [selectedCountry, setSelectedCountry] = useState(PHONE_OPTIONS[0].code);

  const selectedCountryData = PHONE_OPTIONS.find((option) => option.code === selectedCountry) ?? PHONE_OPTIONS[0];

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

        setStatus('success');
        playSound('success');
        form.reset();
        setSelectedCountry(PHONE_OPTIONS[0].code);
      })
      .catch((error) => {
        console.error(error);
        playSound('error');
        setStatus('error');
      });
  };

  return (
    <section className={`${styles.section} reveal`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2>Dê o próximo passo na sua carreira</h2>
          <p>Preencha o formulário abaixo e receba um atendimento personalizado da nossa equipe acadêmica.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} data-netlify="true" name="consulta-directa" method="POST" action="/">
          <input type="hidden" name="form-name" value="consulta-directa" />

          <div className={styles.formGroup}>
            <input type="text" name="nome" placeholder="Nombre" required />
          </div>
          <div className={styles.formGroup}>
            <input type="email" name="email" placeholder="Email" required />
          </div>
          <div className={styles.formGroup}>
            <div className={styles.phoneFieldGroup}>
              <label className={styles.countryFieldLabel} htmlFor="countryCode">
                <select
                  id="countryCode"
                  className={styles.countrySelect}
                  name="countryCode"
                  value={selectedCountry}
                  onChange={(event) => setSelectedCountry(event.target.value)}
                  aria-label="Código de país"
                >
                  {PHONE_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.emoji} {option.dialCode}
                    </option>
                  ))}
                </select>
              </label>
              <input type="hidden" name="countryDialCode" value={selectedCountryData.dialCode} />
              <input
                type="tel"
                name="telefone"
                placeholder={`${selectedCountryData.dialCode} · ${selectedCountryData.example}`}
                required
                className={styles.phoneInput}
                inputMode="tel"
                aria-label="Telefone"
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <textarea name="consulta" placeholder="Consulta" required rows={4}></textarea>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Enviando...' : status === 'success' ? 'Enviado!' : status === 'error' ? 'Tentar novamente' : 'Enviar consulta'}
          </button>
          {status === 'error' && <p role="alert">Não foi possível enviar agora. Tente novamente.</p>}
        </form>
      </div>
    </section>
  );
}
