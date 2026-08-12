import { LostItem } from "../types/lost";

import emptyImage from "../assets/icons/placeholders/image-placeholder.svg";
import storedStatusIcon from "../assets/icons/status/stored.svg";
import inProgressStatusIcon from "../assets/icons/status/in-progress.svg";
import resolvedStatusIcon from "../assets/icons/status/resolved.svg";

export const lostListData: LostItem[] = [
  {
    id: 1,

    image: emptyImage,
    images: undefined,

    category: "전자기기 > 이어폰",
    time: "1시간 전",

    title: "에어팟 프로",
    description:
      "검은색 실리콘 케이스가 씌워져 있으며 왼쪽 유닛에 작은 스크래치가 있습니다.",

    location: "방목학술정보관 3층",
    date: "26.07.24 - 26.07.30",

    statusIcon: storedStatusIcon,
    status: "stored",

    storageLocation: "본관 경비실",
    foundLocation: "방목학술정보관 3층",
    foundDate: "26.07.24 - 26.07.30",

    detailDescription:
      "검은색 실리콘 케이스가 씌워져 있으며 왼쪽 유닛에 작은 스크래치가 있습니다. 본체는 정상 작동하며 케이스 내부에 별도의 각인은 없습니다.",
  },

  {
    id: 2,

    image: emptyImage,
    images: [emptyImage],

    category: "신분증 > 학생증",
    time: "3시간 전",

    title: "학생증",
    description:
      "응용소프트웨어학과 학생증입니다.",

    location: "공학관 1층",
    date: "26.07.24 - 26.07.30",

    statusIcon: inProgressStatusIcon,
    status: "inProgress",

    storageLocation: "공학관 교학팀",
    foundLocation: "공학관 1층 로비",
    foundDate: "26.07.24 - 26.07.30",

    detailDescription:
      "응용소프트웨어학과 학생증입니다. 별도의 파손은 없으며 투명한 학생증 케이스가 함께 보관되어 있습니다.",
  },

  {
    id: 3,

    image: emptyImage,
    images: [emptyImage],

    category: "지갑 > 반지갑",
    time: "5시간 전",

    title: "검은색 반지갑",
    description:
      "검은색 가죽 재질의 반지갑입니다.",

    location: "학생회관 2층",
    date: "26.07.24 - 26.07.30",

    statusIcon: resolvedStatusIcon,
    status: "resolved",

    storageLocation: "학생회관 관리실",
    foundLocation: "학생회관 2층 복도",
    foundDate: "26.07.24 - 26.07.30",

    detailDescription:
      "검은색 가죽 재질의 반지갑입니다. 내부에 현금은 없으며 카드 몇 장이 들어 있는 상태로 접수되었습니다.",
  },

  {
    id: 4,

    image: emptyImage,
    images: [emptyImage],

    category: "전자기기 > 태블릿",
    time: "1일 전",

    title: "아이패드",
    description:
      "회색 아이패드이며 검은색 보호 케이스가 장착되어 있습니다.",

    location: "방목학술정보관 2층",
    date: "26.07.23 - 26.07.29",

    statusIcon: storedStatusIcon,
    status: "stored",

    storageLocation: "도서관 안내데스크",
    foundLocation: "방목학술정보관 2층 열람실",
    foundDate: "26.07.23 - 26.07.29",

    detailDescription:
      "회색 아이패드이며 검은색 보호 케이스가 장착되어 있습니다. 전원은 정상적으로 켜지며 외관에 큰 손상은 없습니다.",
  },

  {
    id: 5,

    image: emptyImage,
    images: [emptyImage],

    category: "생활용품 > 텀블러",
    time: "2일 전",

    title: "스타벅스 텀블러",
    description:
      "흰색 스테인리스 재질의 텀블러입니다.",

    location: "본관 1층",
    date: "26.07.22 - 26.07.28",

    statusIcon: inProgressStatusIcon,
    status: "inProgress",

    storageLocation: "본관 경비실",
    foundLocation: "본관 1층 휴게 공간",
    foundDate: "26.07.22 - 26.07.28",

    detailDescription:
      "흰색 스테인리스 재질의 스타벅스 텀블러입니다. 뚜껑이 닫힌 상태로 발견되어 현재 본관 경비실에 보관 중입니다.",
  },

  {
    id: 6,

    image: emptyImage,
    images: [emptyImage],

    category: "전자기기 > 충전기",
    time: "3일 전",

    title: "맥북 충전기",
    description:
      "USB-C 타입 애플 정품 충전기입니다.",

    location: "공학관 3층",
    date: "26.07.21 - 26.07.27",

    statusIcon: resolvedStatusIcon,
    status: "resolved",

    storageLocation: "공학관 교학팀",
    foundLocation: "공학관 3층 강의실",
    foundDate: "26.07.21 - 26.07.27",

    detailDescription:
      "USB-C 타입 애플 정품 충전기입니다. 케이블과 충전 어댑터가 함께 있으며 정상 작동 여부는 확인되지 않았습니다.",
  },

  {
    id: 7,

    image: emptyImage,
    images: [emptyImage],

    category: "의류 > 모자",
    time: "4일 전",

    title: "검은색 야구모자",
    description:
      "앞면에 흰색 로고가 있는 검은색 야구모자입니다.",

    location: "운동장 관람석",
    date: "26.07.20 - 26.07.26",

    statusIcon: storedStatusIcon,
    status: "stored",

    storageLocation: "체육관 관리실",
    foundLocation: "운동장 중앙 관람석",
    foundDate: "26.07.20 - 26.07.26",

    detailDescription:
      "앞면에 흰색 영문 로고가 있는 검은색 야구모자입니다. 모자 안쪽에 별도의 이름 표시는 없습니다.",
  },

  {
    id: 8,

    image: emptyImage,
    images: [emptyImage],

    category: "문구류 > 필통",
    time: "1주 전",

    title: "파란색 필통",
    description:
      "파란색 천 재질의 지퍼형 필통입니다.",

    location: "본관 204호",
    date: "26.07.17 - 26.07.23",

    statusIcon: inProgressStatusIcon,
    status: "inProgress",

    storageLocation: "본관 경비실",
    foundLocation: "본관 204호 강의실",
    foundDate: "26.07.17 - 26.07.23",

    detailDescription:
      "파란색 천 재질의 지퍼형 필통입니다. 내부에 검은색 볼펜과 형광펜이 들어 있습니다.",
  },

  {
    id: 9,

    image: emptyImage,
    images: [emptyImage],

    category: "전자기기 > 휴대전화",
    time: "2주 전",

    title: "갤럭시 스마트폰",
    description:
      "검은색 케이스가 장착된 갤럭시 스마트폰입니다.",

    location: "학생회관 1층",
    date: "26.07.10 - 26.07.16",

    statusIcon: resolvedStatusIcon,
    status: "resolved",

    storageLocation: "학생회관 관리실",
    foundLocation: "학생회관 1층 소파",
    foundDate: "26.07.10 - 26.07.16",

    detailDescription:
      "검은색 케이스가 장착된 갤럭시 스마트폰입니다. 잠금 화면이 설정되어 있어 소유자 정보는 확인하지 못했습니다.",
  },

  {
    id: 10,

    image: emptyImage,
    images: [emptyImage],

    category: "생활용품 > 우산",
    time: "1개월 전",

    title: "투명 장우산",
    description:
      "검은색 손잡이가 달린 투명 비닐 장우산입니다.",

    location: "공학관 출입구",
    date: "26.06.28 - 26.07.04",

    statusIcon: storedStatusIcon,
    status: "stored",

    storageLocation: "공학관 교학팀",
    foundLocation: "공학관 1층 출입구 우산꽂이",
    foundDate: "26.06.28 - 26.07.04",

    detailDescription:
      "검은색 손잡이가 달린 투명 비닐 장우산입니다. 손잡이에 별도의 이름이나 표시는 없습니다.",
  },
];
