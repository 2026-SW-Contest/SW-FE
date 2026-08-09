import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";

import logo from "../../assets/icons/common/Logo_Stacked Lockup.svg";
import eyeOffIcon from "../../assets/icons/common/function=eye-off.svg";
import eyeOnIcon from "../../assets/icons/common/function=eye-on.svg";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

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
      const response = await fetch(
        `${apiBaseUrl}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "로그인에 실패했습니다."
        );
      }

      const accessToken =
        data?.accessToken ??
        data?.data?.accessToken ??
        data?.tokens?.accessToken;

      const refreshToken =
        data?.refreshToken ??
        data?.data?.refreshToken ??
        data?.tokens?.refreshToken;

      const user =
        data?.user ??
        data?.data?.user;

      if (accessToken) {
        localStorage.setItem(
          "accessToken",
          accessToken
        );
      }

      if (refreshToken) {
        localStorage.setItem(
          "refreshToken",
          refreshToken
        );
      }

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      navigate("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "로그인 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      appBarVariant="detail"
      appBarTitle="로그인"
      showBottomNavigation={false}
      scrollable={false}
    >
      <div className="login">

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
            disabled={
              !isFormValid ||
              isSubmitting
            }
            onClick={handleLogin}
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

      </div>
    </Layout>
  );
};

export default Login;