import {
  ChangeEvent,
  FocusEvent,
  HTMLInputTypeAttribute,
} from "react";

interface FormFieldProps {
  label: string;
  value: string;

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

  placeholder: string;

  maxLength?: number;

  error?: string;

  onChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;

  onBlur?: (
    event: FocusEvent<HTMLInputElement>
  ) => void;
}

const FormField = ({
  label,
  value,

  type = "text",
  inputMode,

  placeholder,

  maxLength,

  error,

  onChange,
  onBlur,
}: FormFieldProps) => {
  return (
    <div className="signup-field">

      <label className="body06 signup-label">
        {label}
      </label>

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

      {error && (
        <p className="caption04 signup-error">
          {error}
        </p>
      )}

    </div>
  );
};

export default FormField;
