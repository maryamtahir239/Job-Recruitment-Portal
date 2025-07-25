import React from "react";

const Fileinput = ({
  label,
  onChange,
  multiple,
  className,
  id,
  selectedFile,
  allowedExtensions = [],
  error,
  onRemove,
  hideInput,
  children,
}) => {
  return (
    <div className="space-y-2">
      {!hideInput && (
        <label className={className}>
          <input
            type="file"
            onChange={onChange}
            className="hidden"
            id={id}
            multiple={multiple}
            accept={allowedExtensions.join(",")}
          />
          {label ? label : children}
        </label>
      )}

      {/* Show file name */}
      {selectedFile && (
        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>{selectedFile.name || selectedFile}</span>
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 text-red-500 underline hover:text-red-700"
          >
            Remove File
          </button>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Fileinput;
