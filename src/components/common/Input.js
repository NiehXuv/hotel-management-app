import React, { forwardRef } from 'react';

/**
 * Input Component
 * Reusable input field with label and error handling
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID (required for accessibility)
 * @param {string} props.label - Input label text
 * @param {string} props.type - Input type (text, password, email, etc.)
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.error - Error message to display
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes for input
 * @param {string} props.labelClassName - Additional CSS classes for label
 * @param {string} props.errorClassName - Additional CSS classes for error message
 * @param {string} props.helperText - Helper text to display below input
 * @param {React.ReactNode} props.startIcon - Icon to display at start of input
 * @param {React.ReactNode} props.endIcon - Icon to display at end of input
 * @param {React.Ref} ref - Forwarded ref
 */
const Input = forwardRef(({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  errorClassName = '',
  helperText = '',
  startIcon,
  endIcon,
  ...rest
}, ref) => {
  // Generate a random ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Base input classes
  const baseInputClasses = 'w-full px-3 py-2 rounded-md border outline-none transition-colors focus:ring-2 focus:ring-primary-color/30';
  
  // Input state classes
  const stateClasses = error
    ? 'border-error-color text-error-color focus:border-error-color'
    : 'border-neutral-300 focus:border-primary-color';
  
  // Disabled classes
  const disabledClasses = disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : '';
  
  // With icon classes
  const withIconClasses = {
    start: startIcon ? 'pl-9' : '',
    end: endIcon ? 'pr-9' : ''
  };
  
  // Combine input classes
  const inputClasses = `
    ${baseInputClasses}
    ${stateClasses}
    ${disabledClasses}
    ${withIconClasses.start}
    ${withIconClasses.end}
    ${className}
  `;
  
  return (
    <div className="mb-md">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block mb-1 font-medium text-neutral-800 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-error-color ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container with Icons */}
      <div className="relative">
        {/* Start Icon */}
        {startIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
            {startIcon}
          </div>
        )}
        
        {/* Input Element */}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={inputClasses}
          ref={ref}
          {...rest}
        />
        
        {/* End Icon */}
        {endIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
            {endIcon}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className={`mt-1 text-sm text-error-color ${errorClassName}`}>
          {error}
        </p>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

// Display name for debugging
Input.displayName = 'Input';

export default Input;