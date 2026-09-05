import { useEffect, useRef } from 'react';
import styles from './CelestialCarousel.module.css';

const IMAGES = Array.from({ length: 10 }, (_, i) => `/images/imagen-${i + 1}.png`);

export default function CelestialCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const loopWidthRef = useRef(0);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startPosition: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  const normalizePosition = (value: number) => {
    const loopWidth = loopWidthRef.current;

    if (loopWidth <= 0) {
      return value;
    }

    const normalized = value % loopWidth;
    return normalized > 0 ? normalized - loopWidth : normalized;
  };

  const advancePosition = (value: number, distance: number) => {
    const loopWidth = loopWidthRef.current;

    if (loopWidth <= 0) {
      return value - distance;
    }

    const nextPosition = value - distance;
    return nextPosition <= -loopWidth ? nextPosition + loopWidth : nextPosition;
  };

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) {
      return;
    }

    let position = 0;
    const track = trackRef.current;
    const container = containerRef.current;

    const updateLoopWidth = () => {
      const firstSlide = track.children[0] as HTMLElement | undefined;
      const firstDuplicate = track.children[IMAGES.length] as HTMLElement | undefined;

      if (!firstSlide || !firstDuplicate) {
        return;
      }

      const nextLoopWidth = firstDuplicate.getBoundingClientRect().left - firstSlide.getBoundingClientRect().left;
      if (nextLoopWidth > 0 && loopWidthRef.current > 0 && nextLoopWidth !== loopWidthRef.current) {
        position = normalizePosition(position * (nextLoopWidth / loopWidthRef.current));
      }
      loopWidthRef.current = nextLoopWidth;
    };

    const applyPosition = () => {
      container.style.setProperty('--track-offset', `${position}px`);
    };

    const animate = () => {
      if (!dragStateRef.current.active) {
        position = advancePosition(position, 1.35);
        applyPosition();
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    updateLoopWidth();
    window.addEventListener('resize', updateLoopWidth);
    applyPosition();
    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateLoopWidth);
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
        position = advancePosition(position, 1.35);
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

    let nextPosition = dragStateRef.current.startPosition + deltaX;
    nextPosition = normalizePosition(nextPosition);

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
        const nextPosition = normalizePosition(currentPosition + dragStateRef.current.velocity * 90);

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
        {/* Keep a third copy so the loop seam never exposes the empty track area. */}
        {[...IMAGES, ...IMAGES, ...IMAGES].map((src, idx) => (
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