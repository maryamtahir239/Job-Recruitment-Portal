import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  headerslot,
  className = "bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded",
  bodyClass = "px-5 py-4",
  noborder,
  titleClass = "custom-class",
  headerClass = "custom-header-class",
}) => {
  return (
    <div
      className={`card ${className} dark:bg-gray-800 dark:border-gray-700`}
    >
      {(title || subtitle) && (
        <header
          className={`card-header ${
            noborder ? "no-border" : ""
          } ${headerClass}`}
        >
          <div>
            {title && <div className={`card-title ${titleClass}`}>{title}</div>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {headerslot && <div className="card-header-slot">{headerslot}</div>}
        </header>
      )}
      <main className={`card-body ${bodyClass}`}>{children}</main>
    </div>
  );
};

export default Card;
