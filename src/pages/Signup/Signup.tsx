import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import Toast from "../../components/common/Toast/Toast";
import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";
import { signup } from "../../api/auth";
import { TOAST_MESSAGE } from "../../constants/toastMessage";
import {
  isSignupFormValid,
  validateEmailVerificationToken,
  validatePasswordConfirm,
  validateSchoolEmail,
  validateSignupName,
  validateSignupPassword,
  validateStudentNumber,
} from "../../utils/signupValidation";

import "./Signup.css";

import FormField from "./FormField";
import PasswordField from "./PasswordField";
import VerifyField from "./VerifyField";
import AgreementSection from "./AgreementSection";

import logo from "../../assets/icons/brand/logo-stacked.svg";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] =
    useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [nameError, setNameError] = useState("");
  const [studentNumberError, setStudentNumberError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailVerificationTokenError, setEmailVerificationTokenError] =
    useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] =
    useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [signupSucceeded, setSignupSucceeded] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);
  const [showPasswordCheck, setShowPasswordCheck] =
    useState(false);

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const isAllAgreed =
    agreements.terms &&
    agreements.privacy &&
    agreements.marketing;

  const isRequiredAgreed =
    agreements.terms && agreements.privacy;

  const toggleAgreement = (
    key: keyof typeof agreements
  ) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAllAgreement = () => {
    const next = !isAllAgreed;

    setAgreements({
      terms: next,
      privacy: next,
      marketing: next,
    });
  };

  const validateName = () => {
    setNameError(validateSignupName(name));
  };

  const validateStudentNumberField = () => {
    setStudentNumberError(validateStudentNumber(studentNumber));
  };

  const validateEmail = () => {
    setEmailError(validateSchoolEmail(email));
  };

  const validateVerificationToken = () => {
    setEmailVerificationTokenError(
      validateEmailVerificationToken(emailVerificationToken),
    );
  };

  const validatePassword = () => {
    setPasswordError(validateSignupPassword(password));
  };

  const validatePasswordConfirmField = () => {
    setPasswordConfirmError(
      validatePasswordConfirm(password, passwordConfirm),
    );
  };

  const isFormValid =
    isSignupFormValid({
      name,
      studentNumber,
      email,
      password,
      passwordConfirm,
      emailVerificationToken,
    }) && isRequiredAgreed;

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    validateName();
    validateStudentNumberField();
    validateEmail();
    validateVerificationToken();
    validatePassword();
    validatePasswordConfirmField();

    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      await signup({
        name: name.trim(),
        studentNumber: studentNumber.trim(),
        email: email.trim(),
        password,
        passwordConfirm,
        emailVerificationToken: emailVerificationToken.trim(),
      });

      setSignupSucceeded(true);
      setToastMessage(TOAST_MESSAGE.SIGNUP_SUCCESS);
      setShowToast(true);
    } catch (error) {
      setSignupSucceeded(false);
      setToastMessage(
        error instanceof Error
          ? error.message
          : TOAST_MESSAGE.SIGNUP_ERROR,
      );
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      appBarVariant="detail"
      appBarTitle="회원가입"
      rightIcon="close"
      showBottomNavigation={false}
      scrollable={true}
    >
      <div className="signup">
        <div className="signup-logo">
          <img
            src={logo}
            alt="ConnecThing"
            className="signup-logo-image"
          />
        </div>

        <form
          className="signup-form"
          onSubmit={handleSignup}
        >
          <div className="signup-form-content">
            <FormField
              label="이름"
              value={name}
              error={nameError}
              placeholder="이름을 입력해주세요."
              maxLength={100}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              onBlur={validateName}
            />

            <FormField
              label="학번"
              value={studentNumber}
              error={studentNumberError}
              placeholder="학번을 입력해주세요."
              inputMode="numeric"
              maxLength={8}
              onChange={(e) => {
                setStudentNumber(e.target.value.replace(/\D/g, ""));
                setStudentNumberError("");
              }}
              onBlur={validateStudentNumberField}
            />

            <VerifyField
              label="학교 이메일"
              value={email}
              error={emailError}
              placeholder="학교 이메일 입력"
              type="email"
              maxLength={255}
              buttonText="인증하기"
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              onBlur={validateEmail}
              onButtonClick={() => {
                validateEmail();
              }}
            />

            <VerifyField
              label="인증번호"
              value={emailVerificationToken}
              error={emailVerificationTokenError}
              placeholder="인증번호 입력"
              buttonText="확인"
              maxLength={43}
              onChange={(e) => {
                setEmailVerificationToken(e.target.value);
                setEmailVerificationTokenError("");
              }}
              onBlur={validateVerificationToken}
              onButtonClick={validateVerificationToken}
            />

            <PasswordField
              label="비밀번호"
              value={password}
              error={passwordError}
              placeholder="비밀번호 입력"
              showPassword={showPassword}
              maxLength={64}
              onToggle={() =>
                setShowPassword((prev) => !prev)
              }
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              onBlur={validatePassword}
            />

            <PasswordField
              label="비밀번호 확인"
              value={passwordConfirm}
              error={passwordConfirmError}
              placeholder="비밀번호 다시 입력"
              showPassword={showPasswordCheck}
              maxLength={64}
              onToggle={() =>
                setShowPasswordCheck(
                  (prev) => !prev
                )
              }
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                setPasswordConfirmError("");
              }}
              onBlur={validatePasswordConfirmField}
            />
          </div>

          <AgreementSection
            agreements={agreements}
            isAllAgreed={isAllAgreed}
            onToggle={toggleAgreement}
            onToggleAll={toggleAllAgreement}
          />

          <div className="signup-submit">
            <PrimaryButton
              type="submit"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? "가입 중..." : "회원가입"}
            </PrimaryButton>
          </div>
        </form>

        <Toast
          visible={showToast}
          message={toastMessage}
          onClose={() => {
            setShowToast(false);

            if (signupSucceeded) {
              navigate("/login");
            }
          }}
        />
      </div>
    </Layout>
  );
};

export default Signup;
