'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  threshold?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  threshold = 0.1,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold,
        rootMargin: '50px 0px -50px 0px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: `all 0.6s ease-out`,
            transitionDelay: isVisible ? `${index * staggerDelay}s` : '0s',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};