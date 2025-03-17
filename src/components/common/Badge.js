import React from 'react';

/**
 * Badge Component
 * Displays a small badge, typically used for status indicators or counts
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Badge style variant: 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'
 * @param {string} props.size - Badge size: 'sm', 'md', 'lg'
 * @param {React.ReactNode} props.children - Badge content
 * @param {boolean} props.rounded - Whether badge has rounded corners
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({
  variant = 'primary',
  size = 'md',
  children,
  rounded = false,
  className = '',
  ...rest
}) => {
  // Base badge classes
  const baseClasses = 'inline-flex items-center justify-center font-medium';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-color/15 text-primary-dark',
    secondary: 'bg-secondary-color/15 text-secondary-dark',
    success: 'bg-success-color/15 text-success-color',
    warning: 'bg-warning-color/15 text-neutral-800',
    danger: 'bg-error-color/15 text-error-color',
    info: 'bg-info-color/15 text-info-color',
    neutral: 'bg-neutral-200 text-neutral-800',
  };
  
  // Border radius classes
  const radiusClasses = rounded ? 'rounded-full' : 'rounded';
  
  // Combine all classes
  const badgeClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    ${radiusClasses}
    ${className}
  `;
  
  return (
    <span className={badgeClasses} {...rest}>
      {children}
    </span>
  );
};

/**
 * Status Badge Component
 * Specialized badge for displaying status with color-coding
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Status value: 'active', 'pending', 'completed', 'cancelled', 'inactive'
 * @param {string} props.size - Badge size: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 */
export const StatusBadge = ({
  status,
  size = 'md',
  className = '',
  ...rest
}) => {
  // Map status to variant and label
  const statusConfig = {
    active: { variant: 'success', label: 'Active' },
    pending: { variant: 'warning', label: 'Pending' },
    completed: { variant: 'primary', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    inactive: { variant: 'neutral', label: 'Inactive' },
    assigned: { variant: 'info', label: 'Assigned' },
    critical: { variant: 'danger', label: 'Critical' },
    normal: { variant: 'success', label: 'Normal' },
    low: { variant: 'info', label: 'Low' },
    high: { variant: 'warning', label: 'High' },
  };
  
  // Get config for the provided status
  const config = statusConfig[status] || { variant: 'neutral', label: status };
  
  return (
    <Badge 
      variant={config.variant} 
      size={size} 
      rounded 
      className={className}
      {...rest}
    >
      <span className={`mr-1 inline-block w-2 h-2 rounded-full bg-${config.variant === 'neutral' ? 'neutral-500' : config.variant}-color`}></span>
      {config.label}
    </Badge>
  );
};

export default Badge;