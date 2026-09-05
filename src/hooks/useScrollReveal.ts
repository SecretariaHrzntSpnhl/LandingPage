import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const shouldSkipAnimation = prefersReducedMotion || isTouchDevice || window.innerWidth <= 768;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal], .reveal'));

    if (shouldSkipAnimation) {
      elements.forEach((element) => {
        element.classList.add('is-visible');
        element.querySelectorAll<HTMLElement>('*').forEach((child) => child.classList.add('is-visible'));
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target as HTMLElement;
          const delay = Number(target.dataset.delay ?? 0);
          const effect = target.dataset.effect ?? 'default';

          window.setTimeout(() => {
            target.classList.add('is-visible');
            target.dataset.effect = effect;
            target.querySelectorAll<HTMLElement>('*').forEach((child) => {
              child.classList.add('is-visible');
              if (!child.dataset.effect) {
                child.dataset.effect = effect;
              }
            });
          }, delay);

          observer.unobserve(target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    elements.forEach((element) => {
      element.classList.remove('is-visible');
      const effect = element.dataset.effect ?? 'default';
      element.dataset.effect = effect;
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);
}
