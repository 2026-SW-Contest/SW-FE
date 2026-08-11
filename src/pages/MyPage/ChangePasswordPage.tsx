import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";
import AlertModal from "../../components/common/AlertModal/AlertModal";
import Toast from "../../components/common/Toast/Toast";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";
import profileIcon from "../../assets/icons/account/profile.svg";
import eyeOffIcon from "../../assets/icons/actions/visibility-off.svg";
import eyeOnIcon from "../../assets/icons/actions/visibility-on.svg";
import { ALERT_MESSAGE } from "../../constants/alertMessage";
import { TOAST_MESSAGE } from "../../constants/toastMessage";

import "./AccountSettings.css";

interface EditablePasswordFieldProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  visible: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
  onBlur?: () => void;
}

const EditablePasswordField = ({
  label,
  value,
  placeholder,
  error,
  visible,
  onChange,
  onToggle,
  onBlur,
}: EditablePasswordFieldProps) => {
  return (
    <div className="account-settings-field">
      <label className="body06 account-settings-label">
        {label}
      </label>

      <div className="account-settings-password-wrapper">
        <input
          type={visible ? "text" : "password"}
          className={`body06 account-settings-input ${
            error ? "account-settings-input-error" : ""
          }`}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
        />

        {value.length > 0 && (
          <button
            type="button"
            className="account-settings-password-toggle"
            onClick={onToggle}
          >
            <img
              src={visible ? eyeOnIcon : eyeOffIcon}
              alt={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
            />
          </button>
        )}
      </div>

      {error && (
        <p className="caption04 account-settings-error">{error}</p>
      )}
    </div>
  );
};

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMismatchToast, setShowMismatchToast] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const notifyIfPasswordMismatch = () => {
    if (
      confirmPassword.length > 0 &&
      newPassword !== confirmPassword
    ) {
      setShowMismatchToast(true);
    }
  };

  const returnToEditProfile = (passwordChanged: boolean) => {
    navigate("/mypage/edit", {
      replace: true,
      state: { passwordChanged },
    });
  };

  return (
    <Layout
      current="mypage"
      appBarVariant="detail"
      appBarTitle="비밀번호 변경"
      scrollable={false}
      onBack={() => returnToEditProfile(false)}
    >
      <div className="account-settings-page">
        <div className="account-settings-profile">
          <div className="account-settings-profile-icon">
            <img src={profileIcon} alt="프로필" />
          </div>
        </div>

        <div className="account-settings-form account-settings-password-form">
          <EditablePasswordField
            label="현재 비밀번호"
            value={currentPassword}
            placeholder="현재 비밀번호를 입력해주세요"
            visible={showCurrentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            onToggle={() => setShowCurrentPassword((previous) => !previous)}
          />

          <EditablePasswordField
            label="새 비밀번호"
            value={newPassword}
            placeholder="8자 이상 입력해주세요"
            visible={showNewPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            onToggle={() => setShowNewPassword((previous) => !previous)}
            onBlur={notifyIfPasswordMismatch}
          />

          <EditablePasswordField
            label="새 비밀번호 확인"
            value={confirmPassword}
            placeholder="새 비밀번호를 다시 입력해주세요"
            visible={showConfirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onToggle={() => setShowConfirmPassword((previous) => !previous)}
            onBlur={notifyIfPasswordMismatch}
          />
        </div>

        <div className="account-settings-actions">
          <button
            type="button"
            className="body02 account-settings-cancel"
            onClick={() => returnToEditProfile(false)}
          >
            취소
          </button>

          <PrimaryButton
            disabled={!isFormValid}
            onClick={() => setShowSuccessModal(true)}
          >
            비밀번호 변경
          </PrimaryButton>
        </div>

        <Toast
          visible={showMismatchToast}
          message={TOAST_MESSAGE.PASSWORD_MISMATCH}
          placement="above-navigation"
          onClose={() => setShowMismatchToast(false)}
        />

        <AlertModal
          open={showSuccessModal}
          message={ALERT_MESSAGE.PASSWORD_CHANGE_SUCCESS.message}
          confirmLabel={
            ALERT_MESSAGE.PASSWORD_CHANGE_SUCCESS.confirmLabel
          }
          onConfirm={() => returnToEditProfile(true)}
        />
      </div>
    </Layout>
  );
};

export default ChangePasswordPage;
