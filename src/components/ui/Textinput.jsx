import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.us";

const Textinput = ({
  type,
  label,
  placeholder,
  classLabel = "form-label",
  className = "",
  classGroup = "",
  register, // This is the register function from useForm (optional)
  name,
  readonly,
  error,
  icon,
  disabled,
  id,
  horizontal,
  validate,
  isMask,
  description,
  hasicon,
  onChange: propOnChange,
  options,
  onFocus,
  defaultValue,
  value,
  required = false,
  ...rest
}) => {
  // Generate a unique ID if none provided
  const inputId = id || (name ? `input-${name.replace(/\./g, '-')}` : `input-${Math.random().toString(36).substr(2, 9)}`);
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
  };

  // Get all props provided by react-hook-form's register function
  // Only call register(name) if 'name' is provided AND register function exists, otherwise it's an uncontrolled input
  const registeredProps = name && register ? register(name) : {};

  // Create a combined change handler for all inputs
  const handleChange = (e) => {
    // 1. Call react-hook-form's onChange handler first (crucial for internal state updates)
    if (registeredProps.onChange) {
      registeredProps.onChange(e);
    }
    // 2. Then call the original onChange prop passed from the parent component, if it exists
    if (propOnChange) {
      propOnChange(e);
    }
  };

  return (
    <div
      className={`textfiled-wrapper ${error ? "is-error" : ""} ${
        horizontal ? "flex" : ""
      } ${validate ? "is-valid" : ""} `}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={`block capitalize ${classLabel} ${
            horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : ""
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={`relative ${horizontal ? "flex-1" : ""}`}>
        {/* Branch for inputs managed by react-hook-form and NOT masked */}
        {name && register && !isMask && (
          <input
            type={type === "password" && open === true ? "text" : type}
            {...registeredProps}
            {...rest}
            onChange={handleChange}
            onInput={handleChange}
            className={`${
              error ? " is-error" : " "
            } text-control py-[10px] ${className} ${type === "date" ? "[&::-webkit-calendar-picker-indicator]:hidden" : ""}`}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={inputId}
          />
        )}

        {/* Branch for inputs NOT managed by react-hook-form and NOT masked */}
        {(!name || !register) && !isMask && (
          <input
            type={type === "password" && open === true ? "text" : type}
            className={`text-control py-[10px] ${className} ${type === "date" ? "[&::-webkit-calendar-picker-indicator]:hidden" : ""}`}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            onChange={propOnChange}
            onInput={propOnChange}
            id={inputId}
            name={name}
            value={value}
            defaultValue={defaultValue}
            {...rest}
          />
        )}

        {/* Branch for inputs managed by react-hook-form AND masked (using Cleave.js) */}
        {name && register && isMask && (
          <Cleave
            htmlRef={registeredProps.ref}
            name={registeredProps.name}
            {...rest}
            placeholder={placeholder}
            options={options}
            className={`${
              error ? " is-error" : " "
            } text-control py-[10px] ${className} ${type === "date" ? "[&::-webkit-calendar-picker-indicator]:hidden" : ""}`}
            onFocus={onFocus}
            id={inputId}
            readOnly={readonly}
            disabled={disabled}
            onChange={(e) => {
              const syntheticEvent = {
                target: {
                  name: registeredProps.name,
                  value: e.target.value,
                },
                type: 'change',
              };
              handleChange(syntheticEvent);
            }}
            onBlur={registeredProps.onBlur}
            defaultValue={defaultValue}
          />
        )}

        {/* Branch for inputs NOT managed by react-hook-form AND masked */}
        {(!name || !register) && isMask && (
          <Cleave
            placeholder={placeholder}
            options={options}
            className={`${
              error ? " is-error" : " "
            } text-control py-[10px] ${className} ${type === "date" ? "[&::-webkit-calendar-picker-indicator]:hidden" : ""}`}
            onFocus={onFocus}
            id={inputId}
            readOnly={readonly}
            disabled={disabled}
            onChange={propOnChange}
            defaultValue={defaultValue}
            name={name}
            value={value}
          />
        )}

        {/* Icon and validation feedback */}
        <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
          {hasicon && (
            <span className="cursor-pointer text-gray-400" onClick={handleOpen}>
              {open && type === "password" && <Icon icon="heroicons-outline:eye" />}
              {!open && type === "password" && <Icon icon="heroicons-outline:eye-off" />}
            </span>
          )}
          {type === "date" && (
            <span className="cursor-pointer text-gray-400" onClick={() => {
              // Trigger click on the input to open the date picker
              const input = document.getElementById(inputId);
              if (input) {
                input.showPicker ? input.showPicker() : input.click();
              }
            }}>
              <Icon icon="ph:calendar" />
            </span>
          )}
          {error && (
            <span className="text-red-500">
              <Icon icon="ph:info-fill" />
            </span>
          )}
          {validate && (
            <span className="text-green-500">
              <Icon icon="ph:check-circle-fill" />
            </span>
          )}
        </div>
      </div>
      {/* Error, validation, and description messages */}
      {error && (
        <div className="mt-2 text-red-500 block text-sm">{error.message}</div>
      )}
      {validate && (
        <div className="mt-2 text-green-500 block text-sm">{validate}</div>
      )}
      {description && <span className="input-help">{description}</span>}
    </div>
  );
};

export default Textinput;