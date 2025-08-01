import React from 'react';
import { forwardRef } from 'react';

const Select = forwardRef(({ 
  label, 
  name, 
  options = [], 
  error, 
  className = "", 
  width = "w-full",
  placeholder = "Select an option",
  required = false,
  classLabel = "form-label",
  classGroup = "",
  horizontal = false,
  validate,
  description,
  ...props 
}, ref) => {
  return (
    <div className={`textfiled-wrapper ${error ? "is-error" : ""} ${horizontal ? "flex" : ""} ${validate ? "is-valid" : ""} ${classGroup}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block capitalize ${classLabel} ${
            horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : ""
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={`relative ${horizontal ? "flex-1" : ""} ${width}`}>
        <select
          ref={ref}
          name={name}
          id={name}
          className={`
            text-control py-[10px] appearance-none cursor-pointer
            ${error ? " is-error" : ""}
            ${validate ? " is-valid" : ""}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="py-1"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className="w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </div>
      
      {/* error and success message*/}
      {error && (
        <div className="mt-2 text-red-600 block text-sm">{error.message || error}</div>
      )}
      {/* validated and success message*/}
      {validate && (
        <div className="mt-2 text-green-600 block text-sm">{validate}</div>
      )}
      {/* only description */}
      {description && <span className="input-help">{description}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
