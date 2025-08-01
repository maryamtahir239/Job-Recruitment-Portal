import React, { useState, useEffect } from 'react';
import Flatpickr from "react-flatpickr";
import Icon from "@/components/ui/Icon";

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
  ...rest
}) => {
  const [picker, setPicker] = useState(value || null);

  // Generate unique ID if none provided
  const inputId = id || (name ? `date-${name}` : `date-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    setPicker(value || null);
  }, [value]);

  const handleDateChange = (date) => {
    setPicker(date);
    if (onChange) {
      // Create a synthetic event to match the expected format
      const syntheticEvent = {
        target: {
          name: name,
          value: date[0] ? date[0].toISOString().split('T')[0] : '',
        },
        type: 'change',
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={`datepicker-wrapper ${error ? "is-error" : ""} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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