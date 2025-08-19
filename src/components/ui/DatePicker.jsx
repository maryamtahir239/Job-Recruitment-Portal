import React, { useState, useEffect } from 'react';
import Flatpickr from "react-flatpickr";
import Icon from "@/components/ui/Icon";

const toLocalYMD = (dateObj) => {
  if (!dateObj) return '';
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = "Choose Date..",
  className = "",
  disabled = false,
  required = false,
  min,
  max,
  error,
  name,
  id,
  register,
  ...rest
}) => {
  const [picker, setPicker] = useState(value || '');

  // Generate unique ID if none provided
  const inputId = id || (name ? `date-${name}` : `date-${Math.random().toString(36).substr(2, 9)}`);

  // Get registered props if register function is provided
  const registeredProps = register ? register(name) : {};

  useEffect(() => {
    setPicker(value || '');
  }, [value]);

  const handleDateChange = (date) => {
    const dateValue = date[0] ? toLocalYMD(date[0]) : '';
    setPicker(dateValue);
    
    console.log('DatePicker onChange called with:', dateValue);
    
    // Create a synthetic event to match the expected format
    const syntheticEvent = {
      target: {
        name: name,
        value: dateValue,
      },
      type: 'change',
    };
    
    // Call react-hook-form's onChange handler first
    if (registeredProps.onChange) {
      console.log('Calling react-hook-form onChange');
      registeredProps.onChange(syntheticEvent);
    }
    
    // Then call the original onChange prop
    if (onChange) {
      console.log('Calling original onChange');
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={`datepicker-wrapper ${error ? "is-error" : ""} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block capitalize form-label"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <Flatpickr
          className={`text-control py-[10px] ${error ? "is-error" : ""}`}
          value={picker}
          placeholder={placeholder}
          onChange={handleDateChange}
          id={inputId}
          name={name}
          disabled={disabled}
          options={{
            dateFormat: "Y-m-d",
            allowInput: false,
            clickOpens: true,
            disableMobile: false,
            minDate: min,
            maxDate: max,
            ...rest
          }}
        />
        
        {/* Custom Calendar Icon */}
        <div className="absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon icon="ph:calendar" className="text-gray-400 text-lg" />
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-2 text-red-500 text-sm flex items-center">
          <Icon icon="ph:warning" className="mr-1 text-sm" />
          {error.message || error}
        </div>
      )}
    </div>
  );
};

export default DatePicker; 