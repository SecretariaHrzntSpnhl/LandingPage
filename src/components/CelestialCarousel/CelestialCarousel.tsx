import { useEffect, useRef } from 'react';
import styles from './CelestialCarousel.module.css';

const IMAGES = Array.from({ length: 10 }, (_, i) => `/images/imagen-${i + 1}.png`);

export default function CelestialCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startPosition: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) {
      return;
    }

    let position = 0;
    const track = trackRef.current;
    const container = containerRef.current;

    const applyPosition = () => {
      container.style.setProperty('--track-offset', `${position}px`);
    };

    const animate = () => {
      if (!dragStateRef.current.active) {
        position -= 1.35;
        const halfWidth = track.scrollWidth / 2;

        if (position <= -halfWidth) {
          position += halfWidth;
        }

        applyPosition();
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    applyPosition();
    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const stopAnimation = () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const resumeAnimation = () => {
    if (animationFrameRef.current !== null) {
      return;
    }

    const track = trackRef.current;
    const container = containerRef.current;

    if (!track || !container) {
      return;
    }

    let position = Number.parseFloat(container.style.getPropertyValue('--track-offset') || '0');

    const animate = () => {
      if (!dragStateRef.current.active) {
        position -= 1.35;
        const halfWidth = track.scrollWidth / 2;

        if (position <= -halfWidth) {
          position += halfWidth;
        }

        container.style.setProperty('--track-offset', `${position}px`);
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    event.preventDefault();
    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      startPosition: Number.parseFloat(containerRef.current?.style.getPropertyValue('--track-offset') || '0'),
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
    };

    containerRef.current?.setAttribute('data-dragging', 'true');
    stopAnimation();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active || !containerRef.current || !trackRef.current) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;
    const now = performance.now();
    const timeDelta = Math.max(16, now - dragStateRef.current.lastTime);
    const currentVelocity = (event.clientX - dragStateRef.current.lastX) / timeDelta;

    dragStateRef.current.velocity = currentVelocity * 20;
    dragStateRef.current.lastX = event.clientX;
    dragStateRef.current.lastTime = now;

    const halfWidth = trackRef.current.scrollWidth / 2;
    let nextPosition = dragStateRef.current.startPosition + deltaX;

    if (halfWidth > 0) {
      while (nextPosition <= -halfWidth) {
        nextPosition += halfWidth;
      }
      while (nextPosition > 0) {
        nextPosition -= halfWidth;
      }
    }

    containerRef.current.style.setProperty('--track-offset', `${nextPosition}px`);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) {
      return;
    }

    dragStateRef.current.active = false;
    containerRef.current?.removeAttribute('data-dragging');
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (Math.abs(dragStateRef.current.velocity) > 0.05) {
      const track = trackRef.current;
      const container = containerRef.current;
      if (track && container) {
        const currentPosition = Number.parseFloat(container.style.getPropertyValue('--track-offset') || '0');
        const halfWidth = track.scrollWidth / 2;
        let nextPosition = currentPosition + dragStateRef.current.velocity * 90;

        if (halfWidth > 0) {
          while (nextPosition <= -halfWidth) {
            nextPosition += halfWidth;
          }
          while (nextPosition > 0) {
            nextPosition -= halfWidth;
          }
        }

        container.style.setProperty('--track-offset', `${nextPosition}px`);
      }
    }

    resumeAnimation();
  };

  return (
    <div className={styles.carouselContainer} ref={containerRef}>
      <div className={styles.overlay}></div>
      <div
        className={styles.track}
        ref={trackRef}
        aria-label="Arraste para explorar o carrossel"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Duplicate the array to create an infinite scroll illusion */}
        {[...IMAGES, ...IMAGES].map((src, idx) => (
          <div key={idx} className={styles.slide}>
            <div className={styles.imagePlaceholder} style={{ backgroundImage: `url(${src})` }} />
          </div>
        ))}
      </div>

      <div className={styles.heroText} data-reveal data-effect="hero-rise" data-delay="0">
        <div className={styles.heroCopy}>
          <div className={styles.heroTitleBlock} data-reveal data-effect="hero-rise" data-delay="50">
            <h1>A fluência não é um destino, é o seu novo horizonte.</h1>
          </div>
          <div className={styles.heroSubtitleBlock} data-reveal data-effect="soft-glow" data-delay="120">
            <p>Domine o idioma espanhol com excelência e amplie suas oportunidades acadêmicas e profissionais.</p>
          </div>
        </div>
      </div>
    </div>
  );
}