import {
  ChangeEvent,
  FocusEvent,
  HTMLInputTypeAttribute,
} from "react";

import eyeOffIcon from "../../assets/icons/actions/visibility-off.svg";
import eyeOnIcon from "../../assets/icons/actions/visibility-on.svg";

interface PasswordFieldProps {
  label: string;

  value: string;

  placeholder: string;

  error?: string;
  helper?: string;

  showPassword: boolean;

  maxLength?: number;

  onToggle: () => void;

  onChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;

  onBlur?: (
    event: FocusEvent<HTMLInputElement>
  ) => void;
}

const PasswordField = ({
  label,
  value,

  placeholder,

  error,
  helper,

  showPassword,

  maxLength,

  onToggle,

  onChange,
  onBlur,
}: PasswordFieldProps) => {
  return (
    <div className="signup-field">

      <label className="body06 signup-label">
        {label}
      </label>

      <div className="signup-password-wrapper">

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          className="body06 signup-input"
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          onChange={onChange}
          onBlur={onBlur}
        />

        {value.length > 0 && (
          <button
            type="button"
            className="signup-password-toggle"
            onClick={onToggle}
          >
            <img
              src={
                showPassword
                  ? eyeOnIcon
                  : eyeOffIcon
              }
              alt={
                showPassword
                  ? "비밀번호 숨기기"
                  : "비밀번호 보기"
              }
            />
          </button>
        )}

      </div>

      {!error && helper && (
        <p className="caption04 signup-helper">
          {helper}
        </p>
      )}

      {error && (
        <p className="caption04 signup-error">
          {error}
        </p>
      )}

    </div>
  );
};

export default PasswordField;
