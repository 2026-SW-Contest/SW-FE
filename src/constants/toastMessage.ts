export const TOAST_MESSAGE = {

  /* ---------- 로그인 ---------- */

  LOGIN_SUCCESS: "로그인되었습니다.",
  LOGIN_ERROR: "입력 정보를 다시 확인해주세요.",
  LOGIN_ADMIN_REQUIRED: "관리자 권한이 있는 계정으로 로그인해주세요.",
  LOGIN_ADMIN_MODE_REQUIRED: "관리자 계정은 커넥띵 관리자 탭에서 로그인해주세요.",
  LOGOUT_SUCCESS: "로그아웃되었습니다.",

  /* ---------- 회원가입 ---------- */

  SIGNUP_SUCCESS: "회원가입이 완료되었습니다.",
  SIGNUP_ERROR: "회원가입에 실패했습니다.",

  EMAIL_SENT: "인증 메일이 전송되었습니다.",
  EMAIL_VERIFIED: "이메일 인증이 완료되었습니다.",
  EMAIL_VERIFY_FAILED: "이메일 인증에 실패했습니다.",

  /* ---------- 비밀번호 ---------- */

  PASSWORD_CHANGED: "비밀번호가 변경되었습니다.",
  PASSWORD_CHANGE_FAILED: "비밀번호 변경에 실패했습니다.",
  PASSWORD_MISMATCH: "새 비밀번호 입력이 일치하지 않습니다.",

  /* ---------- 분실물 ---------- */

  LOST_CREATED: "분실물이 등록되었습니다.",
  LOST_UPDATED: "분실물이 수정되었습니다.",
  LOST_DELETED: "분실물이 삭제되었습니다.",
  OWNER_REQUESTED: "소유자 확인 요청이 신청되었습니다.",

  /* ---------- 시설 · 기자재 ---------- */

  FACILITY_CREATED: "수리·개선 문의가 등록되었습니다.",
  FACILITY_UPDATED: "수리·개선 문의가 수정되었습니다.",
  FACILITY_DELETED: "수리·개선 문의가 삭제되었습니다.",

  /* ---------- 공통 ---------- */

  COPY_SUCCESS: "복사되었습니다.",
  SAVE_SUCCESS: "저장되었습니다.",
  DELETE_SUCCESS: "삭제되었습니다.",

} as const;
