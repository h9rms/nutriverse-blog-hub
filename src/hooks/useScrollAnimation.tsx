import { useEffect, useRef, useState } from 'react';

// Hook for page load animations
export const usePageLoadAnimation = (delay: number = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasLoaded(true);
      if (ref.current) {
        ref.current.classList.add('page-load-animate');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return { ref, hasLoaded };
};

// Enhanced scroll animation with multiple animation types
export const useScrollAnimation = (animationType: string = 'fade-in-up', delay: number = 0) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set initial state
    element.style.opacity = '0';
    element.style.transform = getInitialTransform(animationType);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-in', animationType);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -5% 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [animationType, delay]);

  return ref;
};

// Get initial transform based on animation type
const getInitialTransform = (type: string): string => {
  switch (type) {
    case 'fade-in-up': return 'translateY(40px)';
    case 'fade-in-down': return 'translateY(-40px)';
    case 'fade-in-left': return 'translateX(-40px)';
    case 'fade-in-right': return 'translateX(40px)';
    case 'scale-in': return 'scale(0.8)';
    case 'rotate-in': return 'rotate(-10deg) scale(0.8)';
    case 'slide-up': return 'translateY(60px)';
    case 'zoom-in': return 'scale(0.5)';
    default: return 'translateY(40px)';
  }
};

// Enhanced parallax with performance optimization
export const useParallax = (speed: number = 0.5, direction: 'vertical' | 'horizontal' = 'vertical') => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const parallax = scrolled * speed;
          
          if (direction === 'vertical') {
            element.style.transform = `translateY(${parallax}px)`;
          } else {
            element.style.transform = `translateX(${parallax}px)`;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return ref;
};

// Stagger animation for lists
export const useStaggerAnimation = (itemDelay: number = 100) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('animate-in', 'fade-in-up');
              }, index * itemDelay);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Set initial state for children
    children.forEach((child) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(30px)';
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [itemDelay]);

  return containerRef;
};

// Enhanced count-up animation
export const useCountUp = (end: number, duration: number = 2000, prefix: string = '', suffix: string = '') => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(element, end, duration, prefix, suffix);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.7 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [end, duration, prefix, suffix]);

  return ref;
};

// Enhanced count animation with prefix/suffix support
const animateCount = (element: HTMLElement, end: number, duration: number, prefix: string, suffix: string) => {
  const start = 0;
  const startTime = performance.now();

  const updateCount = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const current = Math.floor(start + (end - start) * easeOutCubic(progress));
    element.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    }
  };

  requestAnimationFrame(updateCount);
};

// Typing animation
export const useTypingAnimation = (text: string, speed: number = 50) => {
  const ref = useRef<HTMLElement>(null);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let index = 0;
            const timer = setInterval(() => {
              setDisplayText(text.slice(0, index + 1));
              index++;
              if (index >= text.length) {
                clearInterval(timer);
              }
            }, speed);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [text, speed]);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = displayText;
    }
  }, [displayText]);

  return ref;
};

const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

const easeOutElastic = (t: number): number => {
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
};