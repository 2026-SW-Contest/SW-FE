import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";
import Toast from "../../components/common/Toast/Toast";
import { TOAST_MESSAGE } from "../../constants/toastMessage";
import { mockUser } from "../../mock/user";

import logo from "../../assets/icons/brand/logo-stacked.svg";
import eyeOffIcon from "../../assets/icons/actions/visibility-off.svg";
import eyeOnIcon from "../../assets/icons/actions/visibility-on.svg";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [showToast, setShowToast] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const isFormValid =
    email.trim() !== "" &&
    password.trim() !== "";

  const handleLogin = async () => {
    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const isMockUser =
      email.trim() === mockUser.email && password === mockUser.password;

    if (!isMockUser) {
      setToastMessage(TOAST_MESSAGE.LOGIN_ERROR);
      setShowToast(true);
      setIsSubmitting(false);
      return;
    }

    localStorage.setItem("isLogin", "true");

    const returnPath = (location.state as { from?: string } | null)?.from;

    navigate(returnPath || "/mypage", { replace: true });
  };

  return (
    <Layout
      appBarVariant="detail"
      appBarTitle="로그인"
      rightIcon="close"
      showBottomNavigation={false}
      scrollable={false}
    >
      <form
        className="login"
        onSubmit={(event) => {
          event.preventDefault();
          void handleLogin();
        }}
      >

        {/* ---------- 로고 ---------- */}

        <div className="login-logo">
          <img
            src={logo}
            alt="ConnecThing"
            className="login-logo-image"
          />
        </div>

        {/* ---------- 입력 ---------- */}

        <div className="login-form">

          {/* 이메일 */}

          <div className="login-field">

            <label className="body06 login-label">
              이메일
            </label>

            <input
              type="email"
              className="body06 login-input"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

          </div>

          {/* 비밀번호 */}

          <div className="login-field">

            <label className="body06 login-label">
              비밀번호
            </label>

            <div className="login-password-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="body06 login-input"
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;

                  event.preventDefault();
                  void handleLogin();
                }}
              />

              {password.length > 0 && (
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
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

          </div>

          {errorMessage && (
            <p className="caption02 login-error">
              {errorMessage}
            </p>
          )}

        </div>

        {/* ---------- 버튼 ---------- */}

        <div className="login-button">

          <PrimaryButton
            type="submit"
            disabled={
              !isFormValid ||
              isSubmitting
            }
          >
            {isSubmitting
              ? "로그인 중..."
              : "로그인"}
          </PrimaryButton>

        </div>

        {/* ---------- 하단 ---------- */}

        <div className="login-footer">

          <button
            type="button"
            className="caption02 login-link"
            onClick={() =>
              navigate("/signup")
            }
          >
            회원가입
          </button>

          <span className="login-divider">
            |
          </span>

          <button
            type="button"
            className="caption02 login-link"
          >
            아이디 찾기
          </button>

          <span className="login-divider">
            |
          </span>

          <button
            type="button"
            className="caption02 login-link"
          >
            비밀번호 찾기
          </button>

        </div>
        
        <Toast
          visible={showToast}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />

      </form>
    </Layout>
  );
};

export default Login;
