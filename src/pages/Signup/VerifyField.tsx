import {
  ChangeEvent,
  FocusEvent,
  HTMLInputTypeAttribute,
} from "react";

interface VerifyFieldProps {
  label: string;

  value: string;

  placeholder: string;

  buttonText: string;

  type?: HTMLInputTypeAttribute;

  inputMode?:
    | "none"
    | "text"
    | "decimal"
    | "numeric"
    | "tel"
    | "search"
    | "email"
    | "url";

  maxLength?: number;

  error?: string;

  disabled?: boolean;

  onChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;

  onBlur?: (
    event: FocusEvent<HTMLInputElement>
  ) => void;

  onButtonClick: () => void;
}

const VerifyField = ({
  label,

  value,

  placeholder,

  buttonText,

  type = "text",

  inputMode,

  maxLength,

  error,
  disabled = false,

  onChange,
  onBlur,

  onButtonClick,
}: VerifyFieldProps) => {
  return (
    <div className="signup-field">

      <label className="body06 signup-label">
        {label}
      </label>

      <div className="signup-inline-field">

        <input
          type={type}
          inputMode={inputMode}
          className="body06 signup-input"
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          onChange={onChange}
          onBlur={onBlur}
        />

        <button
          type="button"
          className="body02 signup-inline-button"
          onClick={onButtonClick}
          disabled={disabled}
        >
          {buttonText}
        </button>

      </div>

      {error && (
        <p className="caption04 signup-error">
          {error}
        </p>
      )}

    </div>
  );
};

export default VerifyField;
