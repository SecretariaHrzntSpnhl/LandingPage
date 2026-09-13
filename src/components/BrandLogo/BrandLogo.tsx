import { useEffect, useState } from 'react';
import styles from './BrandLogo.module.css';

type BrandLogoSize = 'header' | 'hero' | 'footer';
type BrandLogoTone = 'light' | 'brand';

interface BrandLogoProps {
  size?: BrandLogoSize;
  tone?: BrandLogoTone;
  showCircle?: boolean;
  showMonogram?: boolean;
}

export default function BrandLogo({
  size = 'header',
  tone = 'light',
  showCircle = true,
  showMonogram = true,
}: BrandLogoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const circleClass = tone === 'brand' ? styles.brandCircle : styles.lightCircle;
  const textOnlyClass = showMonogram ? '' : styles.textOnly;
  const isHeroTextBrand = size === 'hero' && !showCircle;

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.logoShell} ${styles[size]} ${showCircle ? '' : styles.noCircle} ${textOnlyClass} ${isVisible ? styles.visible : styles.hidden}`}>
      {showCircle ? <div className={`${styles.circle} ${circleClass}`} aria-hidden="true" /> : null}
      <div className={`${styles.logoContent} ${showMonogram ? '' : styles.noMonogram}`}>
        {isHeroTextBrand ? (
          <div className={styles.heroTextBrand} aria-label="Horizonte Espanhol Idioma y Cultura">
            <div className={styles.heroBrandText}>
              <span className={styles.heroBrandTitle}>Horizonte Espanhol</span>
              <span className={styles.heroBrandSubtitle}>Idioma y Cultura</span>
            </div>
          </div>
        ) : (
          <img
            className={styles.brandmarkImage}
            src="/images/horizonte-espanhol-logo.svg"
            alt="Horizonte Espanhol"
          />
        )}
      </div>
    </div>
  );
}