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
  register, // This is the register function from useForm
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
  onChange: propOnChange, // Renamed to avoid direct conflict with register's onChange
  options,
  onFocus,
  defaultValue,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
  };

  // Get all props provided by react-hook-form's register function
  // Only call register(name) if 'name' is provided, otherwise it's an uncontrolled input
  const registeredProps = name ? register(name) : {};

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
          htmlFor={id}
          className={`block capitalize ${classLabel} ${
            horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : "" // ⭐ CORRECTED THIS LINE ⭐
          }`}
        >
          {label}
        </label>
      )}
      <div className={`relative ${horizontal ? "flex-1" : ""}`}>
        {/* Branch for inputs managed by react-hook-form and NOT masked */}
        {name && !isMask && (
          <input
            type={type === "password" && open === true ? "text" : type}
            {...registeredProps} // Spread name, ref, onBlur, and react-hook-form's original onChange
            {...rest}
            onChange={handleChange} // Use our combined handler for standard change events
            onInput={handleChange} // Crucial for capturing autofill values immediately
            className={`${
              error ? " is-error" : " "
            } text-control py-[10px] ${className} `}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            // defaultValue is usually handled by react-hook-form via register if defaultValues are set in useForm
            // No need to explicitly pass it here if using RHF's defaultValues
          />
        )}

        {/* Branch for inputs NOT managed by react-hook-form and NOT masked */}
        {!name && !isMask && (
          <input
            type={type === "password" && open === true ? "text" : type}
            className={`text-control py-[10px] ${className}`}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            onChange={propOnChange} // Use only the prop's onChange here
            id={id}
            defaultValue={defaultValue}
            {...rest}
          />
        )}

        {/* Branch for inputs managed by react-hook-form AND masked (using Cleave.js) */}
        {name && isMask && (
          <Cleave
            // Cleave.js requires us to pass react-hook-form's ref and name explicitly
            htmlRef={registeredProps.ref} // Pass the ref from react-hook-form to Cleave
            name={registeredProps.name} // Pass the name from react-hook-form to Cleave
            {...rest} // Spread any other rest props
            placeholder={placeholder}
            options={options}
            className={`${
              error ? " is-error" : " "
            } text-control py-[10px] ${className} `}
            onFocus={onFocus}
            id={id}
            readOnly={readonly}
            disabled={disabled}
            // Cleave's onChange callback: we need to manually create a synthetic event
            // and pass it to our combined handleChange to update react-hook-form's state.
            onChange={(e) => {
              const syntheticEvent = {
                target: {
                  name: registeredProps.name,
                  value: e.target.value, // Cleave's event usually has the value at e.target.value
                },
                type: 'change', // Indicate it's a change event
              };
              handleChange(syntheticEvent); // Call our combined handler
            }}
            onBlur={registeredProps.onBlur} // Ensure onBlur from react-hook-form is also passed
            defaultValue={defaultValue} // Cleave also accepts defaultValue
          />
        )}

        {/* Branch for inputs NOT managed by react-hook-form AND masked */}
        {!name && isMask && (
          <Cleave
            placeholder={placeholder}
            options={options}
            className={`${
              error ? " is-error" : " "
            } text-control py-[10px] ${className} `}
            onFocus={onFocus}
            id={id}
            readOnly={readonly}
            disabled={disabled}
            onChange={propOnChange} // Use only the prop's onChange here
            defaultValue={defaultValue}
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