import { useLocation, useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";
import pencilIcon from "../../assets/icons/actions/pencil.svg";
import profileIcon from "../../assets/icons/account/profile.svg";
import { useAuth } from "../../context/AuthContext";

import "./AccountSettings.css";

interface EditProfileLocationState {
  passwordChanged?: boolean;
}

const MASKED_PASSWORD = "*".repeat(14);

interface ReadonlyFieldProps {
  label: string;
  value: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ReadonlyField = ({
  label,
  value,
  action,
}: ReadonlyFieldProps) => {
  return (
    <div className="account-settings-field">
      <label className="body06 account-settings-label">
        {label}
      </label>

      <div className="account-settings-input-row">
        <input
          type="text"
          className="body06 account-settings-input account-settings-input-readonly"
          value={value}
          readOnly
          tabIndex={-1}
          aria-readonly="true"
        />

        {action && (
          <button
            type="button"
            className="body05 account-settings-field-action"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

const EditProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as EditProfileLocationState | null;
  const passwordChanged = state?.passwordChanged === true;

  return (
    <Layout
      current="mypage"
      appBarVariant="detail"
      appBarTitle="회원 정보 수정"
      scrollable={false}
      onBack={() => navigate("/mypage")}
    >
      <div className="account-settings-page">
        <div className="account-settings-profile">
          <div className="account-settings-profile-icon">
            <img src={profileIcon} alt="프로필" />
          </div>

          <button
            type="button"
            className="account-settings-profile-edit"
            aria-label="프로필 이미지 수정"
          >
            <img src={pencilIcon} alt="" />
          </button>
        </div>

        <div className="account-settings-form">
          <div className="account-settings-student-field">
            <ReadonlyField
              label="학생 정보"
              value={[user?.name, user?.studentNumber].filter(Boolean).join(" / ")}
            />
          </div>

          <ReadonlyField
            label="학교 이메일"
            value={user?.email ?? ""}
          />

          <ReadonlyField
            label="비밀번호"
            value={MASKED_PASSWORD}
            action={{
              label: "수정",
              onClick: () => navigate("/mypage/edit/password"),
            }}
          />
        </div>

        <div className="account-settings-actions">
          <button
            type="button"
            className="body02 account-settings-cancel"
            onClick={() => navigate("/mypage")}
          >
            취소
          </button>

          <PrimaryButton
            disabled={!passwordChanged}
            onClick={() => navigate("/mypage")}
          >
            회원정보 저장
          </PrimaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfilePage;
