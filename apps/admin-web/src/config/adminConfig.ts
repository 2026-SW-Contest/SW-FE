import { AdminSection, AdminStatus } from "../types";

export const statusLabel: Record<AdminStatus, string> = {
  waiting: "대기",
  inProgress: "진행중",
  resolved: "해결완료",
};

export const navItems: Array<{
  key: AdminSection;
  label: string;
  description: string;
}> = [
  { key: "dashboard", label: "대시보드", description: "운영 현황" },
  { key: "lost", label: "분실물 관리", description: "등록 및 반환 처리" },
  { key: "requests", label: "소유자 확인 요청", description: "승인 및 반려" },
  { key: "facility", label: "시설·기자재 문의", description: "문의 상태 관리" },
  { key: "account", label: "계정 정보", description: "로그인 및 권한 확인" },
];

export const pageTitle: Record<AdminSection, [string, string]> = {
  dashboard: ["대시보드", "오늘 처리해야 할 커넥띵 운영 현황입니다."],
  lost: ["분실물 관리", "접수된 분실물을 등록하고 반환 상태를 관리합니다."],
  requests: ["소유자 확인 요청", "학생이 제출한 증빙자료를 확인하고 결과를 전달합니다."],
  facility: ["시설·기자재 문의", "접수된 문의의 진행 상태와 관리자 답변을 관리합니다."],
  account: ["계정 정보", "현재 로그인한 관리자 계정과 세션 상태를 확인합니다."],
};
