import { ReactNode } from 'react';
import { useMagneticButton } from '@/hooks/useMagneticButton';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MagneticButtonProps extends ButtonProps {
  children: ReactNode;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  ...props
}: MagneticButtonProps) {
  const { ref, position, handlers } = useMagneticButton(strength);

  return (
    <Button
      ref={ref}
      className={cn(
        'transition-shadow duration-200',
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 && position.y === 0 
          ? 'transform 0.3s ease-out, box-shadow 0.2s ease-out' 
          : 'box-shadow 0.2s ease-out',
      }}
      {...handlers}
      {...props}
    >
      {children}
    </Button>
  );
}
