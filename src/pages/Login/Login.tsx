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
  const { clearLocalAuth, login, logout } = useAuth();
  const routeState = location.state as {
    from?: string;
    loginNotice?: string;
  } | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<"student" | "admin">("student");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showToast, setShowToast] = useState(Boolean(routeState?.loginNotice));

  const [toastMessage, setToastMessage] = useState(routeState?.loginNotice ?? "");

  const isFormValid =
    email.trim() !== "" &&
    password.trim() !== "";

  const handleLogin = async () => {
    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      const adminUser = isAdminUser(user);

      if (loginMode === "admin" && !adminUser) {
        await logout().catch(() => undefined);
        setToastMessage(TOAST_MESSAGE.LOGIN_ADMIN_REQUIRED);
        setShowToast(true);
        return;
      }

      if (loginMode === "student" && adminUser) {
        await logout().catch(() => undefined);
        setToastMessage(TOAST_MESSAGE.LOGIN_ADMIN_MODE_REQUIRED);
        setShowToast(true);
        return;
      }

      if (adminUser) {
        // 로컬에서는 5173/5174 프록시가 서로 다른 세션 쿠키를 사용한다.
        // 운영에서는 관리자 앱을 같은 출처의 /admin에 제공하므로 이미 생성된
        // SESSION 쿠키를 그대로 공유하고 중복 로그인을 만들지 않는다.
        if (import.meta.env.DEV) {
          await createAdminSession({ email: email.trim(), password });
        }
        // 관리자 세션은 관리자 앱에서 사용하고 학생 앱의 로컬 인증 정보는
        // 제거한다. 이후 학생 앱에서 마이를 눌러도 5174를 경유하지 않는다.
        clearLocalAuth();
        redirectToAdminApp(user);
        return;
      }

      navigate("/", { replace: true });
    } catch {
      setToastMessage(TOAST_MESSAGE.LOGIN_ERROR);
      setShowToast(true);
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

        <div
          className={`login-tabs ${loginMode === "admin" ? "admin-active" : ""}`}
          role="tablist"
          aria-label="로그인 유형"
        >
          <button
            type="button"
            role="tab"
            aria-selected={loginMode === "student"}
            className={`body05 login-tab ${loginMode === "student" ? "active" : ""}`}
            onClick={() => {
              setLoginMode("student");
              setShowToast(false);
            }}
          >
            학생
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={loginMode === "admin"}
            className={`body05 login-tab ${loginMode === "admin" ? "active" : ""}`}
            onClick={() => {
              setLoginMode("admin");
              setShowToast(false);
            }}
          >
            커넥띵 관리자
          </button>
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

        {loginMode === "student" && <div className="login-footer">

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

        </div>}
        
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
