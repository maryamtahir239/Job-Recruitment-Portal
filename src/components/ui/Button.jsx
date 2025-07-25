import React from "react";
import Icon from "@/components/ui/Icon";
import { Link } from "react-router-dom";

function Button({
  text,
  type = "button",
  isLoading,
  disabled, // This prop needs to be passed to the <button> element
  className = "bg-indigo-700 text-white",
  children,
  icon,
  loadingClass = "unset-classname",
  iconPosition = "left",
  iconClass = "text-[20px]",
  link,
  onClick,
  div,
  width,
  rotate,
  hFlip,
  vFlip,
}) {
  return (
    <>
      {!link && !div && (
        <button
          type={type}
          onClick={onClick}
          className={`btn btn inline-flex justify-center   ${
            isLoading ? " pointer-events-none" : ""
          }
          ${disabled || isLoading ? " opacity-60 cursor-not-allowed" : ""} {/* Combine disabled and isLoading for visual feedback */}
          ${className}`}
          disabled={disabled || isLoading} // <--- ADD THIS LINE! This is the fix.
        >
          {/* if has children and not loading*/}
          {children && !isLoading && children}

          {/* if no children and  loading*/}
          {!children && !isLoading && (
            <span className="flex items-center">
              {/* if has icon */}
              {icon && (
                <span
                  className={`
          ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : " "}
          ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}

          ${iconClass}

          `}
                >
                  <Icon
                    icon={icon}
                    width={width}
                    rotate={rotate}
                    hFlip={hFlip}
                    vFlip={vFlip}
                  />
                </span>
              )}
              <span>{text}</span>
            </span>
          )}

          {/* if loading*/}
          {isLoading && (
            <>
              <svg
                className={`animate-spin ltr:-ml-1 ltr:mr-3 rtl:-mr-1 rtl:ml-3 h-5 w-5 ${loadingClass}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading ...
            </>
          )}
        </button>
      )}

      {/* The `div` and `Link` elements will not inherently respect `disabled`
          as it's an HTML <button> attribute.
          For these, `pointer-events-none` is the correct way to disable clicks.
          However, `onClick` will still be called if a parent event listener captures it,
          or if it's programmatically triggered.
          For consistency, you might want to add a check inside `onClick` for these cases too.
          I'll update the `div` and `Link` versions for `pointer-events-none` for `disabled` too.
      */}
      {!link && div && (
        <div
          onClick={disabled || isLoading ? null : onClick} // Explicitly nullify onClick if disabled or loading
          className={`btn btn inline-flex justify-center   ${
            isLoading ? " pointer-events-none" : ""
          }
          ${disabled ? " opacity-60 cursor-not-allowed pointer-events-none" : ""} {/* Add pointer-events-none */}
          ${className}`}
        >
          {children && !isLoading && children}

          {!children && !isLoading && (
            <span className="flex items-center">
              {icon && (
                <span
                  className={`
          ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : " "}
          ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}

          ${iconClass}

          `}
                >
                  <Icon icon={icon} />
                </span>
              )}
              <span>{text}</span>
            </span>
          )}

          {isLoading && (
            <>
              <svg
                className={`animate-spin ltr:-ml-1 ltr:mr-3 rtl:-mr-1 rtl:ml-3 h-5 w-5 ${loadingClass}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading ...
            </>
          )}
        </div>
      )}
      {link && !div && (
        <Link
          to={link}
          // For Link components, `disabled` attribute doesn't work.
          // You need to prevent navigation and clicks via classes or conditional rendering.
          // `pointer-events-none` is the best approach for visual disabled state.
          onClick={disabled || isLoading ? (e) => e.preventDefault() : onClick} // Prevent default navigation
          className={`btn btn inline-flex justify-center   ${
            isLoading ? " pointer-events-none" : ""
          }
          ${disabled ? " opacity-60 cursor-not-allowed pointer-events-none" : ""} {/* Add pointer-events-none */}
          ${className}`}
        >
          {/* if has children and not loading*/}
          {children && !isLoading && children}

          {/* if no children and  loading*/}
          {!children && !isLoading && (
            <span className="flex items-center">
              {/* if has icon */}
              {icon && (
                <span
                  className={`
          ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : " "}
          ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}

          ${iconClass}

          `}
                >
                  <Icon icon={icon} />
                </span>
              )}
              <span>{text}</span>
            </span>
          )}

          {/* if loading*/}
          {isLoading && (
            <>
              <svg
                className={`animate-spin ltr:-ml-1 ltr:mr-3 rtl:-mr-1 rtl:ml-3 h-5 w-5 ${loadingClass}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading ...
            </>
          )}
        </Link>
      )}
    </>
  );
}

export default Button;