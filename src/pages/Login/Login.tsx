import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";
import Toast from "../../components/common/Toast/Toast";
import { TOAST_MESSAGE } from "../../constants/toastMessage";
import { useAuth } from "../../context/AuthContext";
import { createAdminSession } from "../../api/auth";
import { isAdminUser, redirectToAdminApp } from "../../utils/authRole";

import logo from "../../assets/icons/brand/logo-stacked.svg";
import eyeOffIcon from "../../assets/icons/actions/visibility-off.svg";
import eyeOnIcon from "../../assets/icons/actions/visibility-on.svg";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

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

    try {
      const user = await login(email.trim(), password);

      if (isAdminUser(user)) {
        // 로컬에서는 5173/5174 프록시가 서로 다른 세션 쿠키를 사용한다.
        // 운영에서는 관리자 앱을 같은 출처의 /admin에 제공하므로 이미 생성된
        // SESSION 쿠키를 그대로 공유하고 중복 로그인을 만들지 않는다.
        if (import.meta.env.DEV) {
          await createAdminSession({ email: email.trim(), password });
        }
        redirectToAdminApp(user);
        return;
      }

      const returnPath = (location.state as { from?: string } | null)?.from;
      navigate(returnPath || "/mypage", { replace: true });
    } catch (error) {
      setToastMessage(TOAST_MESSAGE.LOGIN_ERROR);
      setShowToast(true);
      setErrorMessage(error instanceof Error ? error.message : "");
    } finally {
      setIsSubmitting(false);
    }
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
