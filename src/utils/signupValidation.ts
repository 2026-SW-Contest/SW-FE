export interface SignupFormValues {
  name: string;
  studentNumber: string;
  email: string;
  password: string;
  passwordConfirm: string;
  emailVerificationToken: string;
}

const EMAIL_PATTERN = /^[^\s@]+@mju\.ac\.kr$/i;
const STUDENT_NUMBER_PATTERN = /^\d{8}$/;
const VERIFICATION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export const validateSignupName = (value: string) => {
  const length = value.trim().length;

  if (length < 2 || length > 100) {
    return "올바른 이름을 입력해주세요";
  }

  return "";
};

export const validateStudentNumber = (value: string) => {
  if (!STUDENT_NUMBER_PATTERN.test(value.trim())) {
    return "올바른 학번을 입력해주세요";
  }

  return "";
};

export const validateSchoolEmail = (value: string) => {
  const email = value.trim();

  if (email.length > 255 || !EMAIL_PATTERN.test(email)) {
    return "올바른 형식의 이메일을 입력해주세요";
  }

  return "";
};

export const validateSignupPassword = (value: string) => {
  if (value.length < 8 || value.length > 64) {
    return "올바른 형식의 비밀번호를 입력해주세요";
  }

  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "올바른 형식의 비밀번호를 입력해주세요";
  }

  return "";
};

export const validatePasswordConfirm = (
  password: string,
  passwordConfirm: string,
) => {
  if (passwordConfirm.length === 0) {
    return "비밀번호가 일치하지 않습니다";
  }

  if (password !== passwordConfirm) {
    return "비밀번호가 일치하지 않습니다";
  }

  return "";
};

export const validateEmailVerificationToken = (value: string) => {
  if (!VERIFICATION_TOKEN_PATTERN.test(value.trim())) {
    return "인증번호가 일치하지 않습니다";
  }

  return "";
};

export const isSignupFormValid = (values: SignupFormValues) => {
  return (
    !validateSignupName(values.name) &&
    !validateStudentNumber(values.studentNumber) &&
    !validateSchoolEmail(values.email) &&
    !validateSignupPassword(values.password) &&
    !validatePasswordConfirm(values.password, values.passwordConfirm) &&
    !validateEmailVerificationToken(values.emailVerificationToken)
  );
};
