import { useState, useCallback } from 'react';

const useDigitOnly = () => {
  const [digitErrors, setDigitErrors] = useState({});

  const validateDigitOnly = useCallback((value, fieldName) => {
    if (!value) {
      // Clear error if value is empty
      setDigitErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    }
    
    // Check if value contains only digits, dots, commas, and common number separators
    const digitRegex = /^[\d.,\s-]+$/;
    const isValid = digitRegex.test(value);
    
    if (!isValid) {
      setDigitErrors(prev => ({
        ...prev,
        [fieldName]: "Only numbers are allowed in this field"
      }));
      return false;
    } else {
      setDigitErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    }
  }, []);

  const handleDigitInput = useCallback((e, fieldName) => {
    // Allow: digits, dots, commas, spaces, hyphens, backspace, delete, arrow keys
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Enter', 'Home', 'End'
    ];
    
    // Check if the pressed key is allowed
    if (allowedKeys.includes(e.key)) {
      return true;
    }
    
    // Check if the character is a digit or allowed symbol
    const digitRegex = /[\d.,\s-]/;
    if (!digitRegex.test(e.key)) {
      e.preventDefault();
      setDigitErrors(prev => ({
        ...prev,
        [fieldName]: "Only numbers are allowed in this field"
      }));
      return false;
    }
    
    // Clear error if input is valid
    setDigitErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    
    return true;
  }, []);

  const clearDigitError = useCallback((fieldName) => {
    setDigitErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllDigitErrors = useCallback(() => {
    setDigitErrors({});
  }, []);

  return {
    validateDigitOnly,
    handleDigitInput,
    clearDigitError,
    clearAllDigitErrors,
    digitErrors
  };
};

export default useDigitOnly; 