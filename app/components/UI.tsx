import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { Checkbox as HeroCheckbox } from '@heroui/react';

// ==========================================
// 1. CUSTOM INPUT COMPONENT
// ==========================================
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'size'> {
  label?: string;
  placeholder?: string;
  labelPlacement?: 'inside' | 'outside' | 'outside-left';
  type?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined' | 'primary' | 'secondary';
  classNames?: {
    inputWrapper?: string;
    label?: string;
    input?: string;
    mainWrapper?: string;
  };
  startContent?: ReactNode;
  endContent?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  placeholder,
  labelPlacement = 'outside',
  type = 'text',
  value,
  onValueChange,
  onChange,
  variant = 'bordered',
  classNames = {},
  className = '',
  startContent,
  endContent,
  id,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };

  const mainWrapperClass = `flex flex-col gap-1.5 w-full ${classNames.mainWrapper || ''} ${className}`;
  
  let variantWrapperClass = '';
  if (variant === 'bordered') {
    variantWrapperClass = 'border border-border focus-within:border-primary hover:border-primary';
  } else if (variant === 'primary' || variant === 'secondary') {
    variantWrapperClass = 'border border-border focus-within:border-primary hover:border-primary';
  } else {
    variantWrapperClass = 'bg-input-bg';
  }

  const wrapperClass = `flex items-center px-3 gap-2 transition-all duration-200 w-full ${variantWrapperClass} ${classNames.inputWrapper || 'h-11 rounded-xl bg-input-bg'}`;
  const labelClass = `text-text-secondary font-bold text-xs uppercase tracking-wider ${classNames.label || ''}`;
  const inputClass = `w-full h-full bg-transparent border-none outline-none text-text-primary text-xs ${classNames.input || ''}`;
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={mainWrapperClass}>
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
      <div className={wrapperClass}>
        {startContent}
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClass}
          {...props}
        />
        {endContent}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

// ==========================================
// 2. CUSTOM BUTTON COMPONENT
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'bordered' | 'outline' | 'ghost' | 'light' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  isLoading?: boolean;
  isPending?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  color = 'default',
  isLoading = false,
  isPending = false,
  isDisabled,
  disabled,
  onPress,
  onClick,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const isButtonLoading = isLoading || isPending;
  const isButtonDisabled = disabled || isDisabled || isButtonLoading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isButtonDisabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
    if (onPress) {
      onPress();
    }
  };

  let variantClass = '';
  if (variant === 'primary') {
    variantClass = 'bg-primary text-white hover:bg-primary/90';
  } else if (variant === 'secondary') {
    variantClass = 'bg-secondary text-white hover:bg-secondary/90';
  } else if (variant === 'bordered' || variant === 'outline') {
    variantClass = 'border border-border text-text-primary hover:bg-input-bg';
  } else if (variant === 'ghost') {
    variantClass = 'bg-transparent border border-primary text-primary hover:bg-primary/10';
  } else if (variant === 'light') {
    if (color === 'danger') {
      variantClass = 'bg-transparent text-danger hover:bg-danger/10';
    } else {
      variantClass = 'bg-transparent text-text-primary hover:bg-input-bg';
    }
  } else if (variant === 'danger' || color === 'danger') {
    variantClass = 'bg-danger text-white hover:bg-danger/90';
  }

  let sizeClass = 'px-4 h-11 text-xs';
  if (size === 'sm') {
    sizeClass = 'px-3 h-8 text-[10px] rounded-lg';
  } else if (size === 'lg') {
    sizeClass = 'px-6 h-12 text-sm';
  }

  const baseClass = `flex items-center justify-center gap-2 rounded-xl transition-all duration-200 font-bold active:scale-[0.98] ${sizeClass} ${variantClass} ${
    isButtonDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
  } ${className}`;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isButtonDisabled}
      onClick={handleClick}
      className={baseClass}
      {...props}
    >
      {isButtonLoading && (
        <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

// ==========================================
// 3. CUSTOM CHECKBOX COMPONENT
// ==========================================
export interface CheckboxProps extends Omit<React.ComponentPropsWithoutRef<typeof HeroCheckbox>, 'onChange' | 'classNames' | 'children'> {
  children?: React.ReactNode;
  onValueChange?: (isSelected: boolean) => void;
  onChange?: (isSelected: boolean) => void;
  classNames?: {
    wrapper?: string;
    label?: string;
  };
}

export const Checkbox = forwardRef<React.ElementRef<typeof HeroCheckbox>, CheckboxProps>(({
  children,
  onValueChange,
  onChange,
  classNames,
  ...props
}, ref) => {
  const handleChange = (isSelected: boolean) => {
    if (onChange) {
      onChange(isSelected);
    }
    if (onValueChange) {
      onValueChange(isSelected);
    }
  };

  return (
    <HeroCheckbox
      ref={ref}
      onChange={handleChange}
      {...props}
    >
      <HeroCheckbox.Content className={classNames?.wrapper}>
        <HeroCheckbox.Control />
        <span className={classNames?.label}>{children}</span>
      </HeroCheckbox.Content>
    </HeroCheckbox>
  );
});

Checkbox.displayName = 'Checkbox';
