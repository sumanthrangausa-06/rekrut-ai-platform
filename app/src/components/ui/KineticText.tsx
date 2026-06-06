import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface KineticTextProps {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  animate?: boolean;
}

export function KineticText({
  children,
  className,
  delay = 0,
  stagger = 30,
  animate = true,
}: KineticTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [animate, delay]);

  const words = children.split(' ');

  return (
    <span className={cn('inline', className)} aria-label={children}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]">
          {word.split('').map((char, charIndex) => {
            const totalIndex = words
              .slice(0, wordIndex)
              .reduce((acc, w) => acc + w.length, 0) + charIndex;

            return (
              <span
                key={charIndex}
                className="inline-block"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: `opacity 0.4s ease-out ${totalIndex * stagger}ms, transform 0.4s ease-out ${totalIndex * stagger}ms`,
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
