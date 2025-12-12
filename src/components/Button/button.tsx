import React, { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils'; // optional utility for merging classNames

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, className, ...rest }, ref) => {
    const baseClasses =
      'px-4 py-2 rounded-md font-medium transition-colors duration-200';

    const variantClasses =
      variant === 'primary'
        ? 'bg-[#26344e] text-white hover:bg-[#1d293d]'
        : 'bg-transparent border border-gray-500 hover:bg-gray-600 hover:text-white';

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses, className)}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
