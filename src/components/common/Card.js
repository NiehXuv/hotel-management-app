import React from 'react';

/**
 * Card Component
 * A container component with optional header and footer sections
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card body content
 * @param {React.ReactNode} props.header - Card header content
 * @param {React.ReactNode} props.footer - Card footer content
 * @param {string} props.className - Additional CSS classes for the card
 * @param {string} props.headerClassName - Additional CSS classes for the header
 * @param {string} props.bodyClassName - Additional CSS classes for the body
 * @param {string} props.footerClassName - Additional CSS classes for the footer
 * @param {Function} props.onClick - Click handler for the card
 */
const Card = ({
  children,
  header,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  onClick,
  ...rest
}) => {
  // Handle click event if provided
  const handleClick = onClick ? { onClick } : {};
  
  // Apply cursor-pointer class if onClick is provided
  const clickableClass = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';
  
  return (
    <div 
      className={`card ${clickableClass} ${className}`}
      {...handleClick}
      {...rest}
    >
      {/* Conditional Header */}
      {header && (
        <div className={`card-header ${headerClassName}`}>
          {header}
        </div>
      )}
      
      {/* Card Body */}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
      
      {/* Conditional Footer */}
      {footer && (
        <div className={`card-footer ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;