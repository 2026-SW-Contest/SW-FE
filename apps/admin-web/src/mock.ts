import { facilityListData } from "../../../src/mock/facility";
import { lostListData } from "../../../src/mock/lost";
import {
  AdminFacilityItem,
  AdminLostItem,
  AdminStatus,
  OwnerRequest,
} from "./types";

const normalizeLostStatus = (status: string): AdminStatus => {
  if (status === "resolved") return "resolved";
  if (status === "inProgress") return "inProgress";
  return "waiting";
};

export const initialLostItems: AdminLostItem[] = lostListData.map((item) => ({
  id: item.id,
  title: item.title,
  category: item.category,
  location: item.foundLocation,
  storageLocation: item.storageLocation,
  foundDate: item.foundDate,
  status: normalizeLostStatus(item.status),
}));

export const initialFacilityItems: AdminFacilityItem[] = facilityListData.map(
  (item) => ({
    id: item.id,
    title: item.title,
    category: item.type,
    location: item.location,
    submittedAt: item.date,
    description: item.detailDescription ?? item.description,
    status: item.status,
  }),
);

export const initialOwnerRequests: OwnerRequest[] = [
  {
    id: 101,
    lostItemId: 1,
    itemTitle: "에어팟 프로",
    applicant: "정석우",
    studentNumber: "60201705",
    submittedAt: "2026.08.12 10:24",
    evidence: "왼쪽 유닛에 작은 스크래치가 있고 검은색 실리콘 케이스를 사용했습니다.",
    status: "inProgress",
  },
  {
    id: 102,
    lostItemId: 3,
    itemTitle: "검은색 반지갑",
    applicant: "김민지",
    studentNumber: "60241234",
    submittedAt: "2026.08.12 09:10",
    evidence: "신분증과 카드 두 장이 들어 있으며 지갑 안쪽에 이니셜이 있습니다.",
    status: "inProgress",
  },
];

export const statusLabel: Record<AdminStatus, string> = {
  waiting: "대기",
  inProgress: "진행중",
  resolved: "해결완료",
};
