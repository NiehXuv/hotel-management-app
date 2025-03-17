import React from 'react';

/**
 * Reusable Button Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Button style variant: 'primary', 'secondary', 'success', 'warning', 'danger', 'outline', 'text'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Function} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.type - Button type attribute ('button', 'submit', 'reset')
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  className = '',
  ...rest
}) => {
  // Base button classes
  const baseClasses = 'font-medium rounded-md transition-all duration-200 flex items-center justify-center';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-color text-white hover:bg-primary-dark active:bg-primary-dark',
    secondary: 'bg-secondary-color text-white hover:bg-secondary-dark active:bg-secondary-dark',
    success: 'bg-success-color text-white hover:bg-success-color/90 active:bg-success-color/90',
    warning: 'bg-warning-color text-neutral-900 hover:bg-warning-color/90 active:bg-warning-color/90',
    danger: 'bg-error-color text-white hover:bg-error-color/90 active:bg-error-color/90',
    outline: 'bg-transparent border border-primary-color text-primary-color hover:bg-primary-color/10 active:bg-primary-color/20',
    text: 'bg-transparent text-primary-color hover:bg-primary-color/10 active:bg-primary-color/20 px-2',
  };
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    ${disabledClasses}
    ${widthClasses}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;