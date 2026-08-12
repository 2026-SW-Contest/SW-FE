import { FacilityItem } from "../types/facility";

import emptyImage from "../assets/icons/placeholders/image-placeholder.svg";
import waitingStatusIcon from "../assets/icons/status/waiting.svg";
import inProgressStatusIcon from "../assets/icons/status/in-progress.svg";
import resolvedStatusIcon from "../assets/icons/status/resolved.svg";

export const facilityListData: FacilityItem[] = [
  {
    id: 1,
    image: emptyImage,
    images: undefined,

    title: "도서관 자율 열람실 의자가 흔들립니다.",
    description:
      "의자 다리가 흔들려 장시간 이용이 어렵습니다. 확인 및 수리가 필요합니다.",

    date: "2026.07.27",

    type: "시설",
    location: "방목학술정보관 자율열람실",

    statusIcon: waitingStatusIcon,
    status: "waiting",

    detailDescription:
      "도서관 자율열람실 의자 다리가 흔들려 사용이 어렵습니다. 빠른 점검 부탁드립니다.",
  },

  {
    id: 2,
    image: emptyImage,
    images: undefined,

    title: "본관 1층 천장에서 물이 떨어집니다.",
    description:
      "비가 오는 날마다 천장에서 누수가 발생하고 있습니다.",

    date: "2026.07.27",

    type: "시설",
    location: "본관 1층",

    statusIcon: inProgressStatusIcon,
    status: "inProgress",

    detailDescription:
      "천장에서 지속적으로 누수가 발생하여 바닥이 미끄럽습니다.",
  },

  {
    id: 3,
    image: emptyImage,
    images: undefined,

    title: "학생회관 에어컨에서 물이 샙니다.",
    description:
      "에어컨 하단으로 물이 떨어지고 있습니다. 줄ㄹㅇㄴㄹㅁㄴㅇㄴㅇㅇㅇㅇㅇㄹ!!!!!ㅁㅁㅁㅁㄹㄹrrr",

    date: "2026.07.26",

    type: "시설",
    location: "학생회관 2층",

    statusIcon: resolvedStatusIcon,
    status: "resolved",

    detailDescription:
      "에어컨 배수 문제로 추정됩니다. 점검 부탁드립니다. 줄바꿈용ㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ",
  },

  {
    id: 4,
    image: emptyImage,
    images: undefined,

    title: "주차장 조명이 깜빡입니다.",
    description:
      "야간에 조명이 반복적으로 깜빡여 위험합니다.",

    date: "2026.07.25",

    type: "시설",
    location: "지하주차장 1층",

    statusIcon: waitingStatusIcon,
    status: "waiting",

    detailDescription:
      "조명 안정기 교체가 필요한 것으로 보입니다.",
  },

  {
    id: 5,
    image: emptyImage,
    images: undefined,

    title: "강의실 프로젝터 화면이 나오지 않습니다.",
    description:
      "HDMI 연결은 정상인데 화면이 출력되지 않습니다.",

    date: "2026.07.24",

    type: "기자재",
    location: "공학관 302호",

    statusIcon: inProgressStatusIcon,
    status: "inProgress",

    detailDescription:
      "프로젝터 전원은 켜지지만 화면이 출력되지 않습니다.",
  },

  {
    id: 6,
    image: emptyImage,
    images: undefined,

    title: "복도 형광등이 꺼져 있습니다.",
    description:
      "저녁 시간 복도가 매우 어둡습니다.",

    date: "2026.07.24",

    type: "시설",
    location: "본관 3층",

    statusIcon: resolvedStatusIcon,
    status: "resolved",

    detailDescription:
      "형광등 또는 안정기 교체가 필요해 보입니다.",
  },

  {
    id: 7,
    image: emptyImage,
    images: undefined,

    title: "엘리베이터 버튼이 눌리지 않습니다.",
    description:
      "3층 버튼 입력이 되지 않습니다.",

    date: "2026.07.23",

    type: "시설",
    location: "공학관",

    statusIcon: waitingStatusIcon,
    status: "waiting",

    detailDescription:
      "엘리베이터 내부 3층 버튼이 동작하지 않습니다.",
  },

  {
    id: 8,
    image: emptyImage,
    images: undefined,

    title: "화장실 수도꼭지에서 물이 계속 샙니다.",
    description:
      "잠가도 물이 조금씩 흐르고 있습니다.",

    date: "2026.07.22",

    type: "시설",
    location: "학생회관 1층",

    statusIcon: inProgressStatusIcon,
    status: "inProgress",

    detailDescription:
      "수도꼭지 패킹 교체가 필요한 것으로 보입니다.",
  },

  {
    id: 9,
    image: emptyImage,
    images: undefined,

    title: "계단 손잡이가 흔들립니다.",
    description:
      "손잡이가 고정되지 않아 위험합니다.",

    date: "2026.07.21",

    type: "시설",
    location: "본관 계단",

    statusIcon: resolvedStatusIcon,
    status: "resolved",

    detailDescription:
      "계단 손잡이 볼트가 풀린 것으로 보입니다.",
  },

  {
    id: 10,
    image: emptyImage,
    images: undefined,

    title: "도서관 콘센트가 작동하지 않습니다.",
    description:
      "노트북 충전이 되지 않습니다.",

    date: "2026.07.20",

    type: "기자재",
    location: "방목학술정보관 2층",

    statusIcon: waitingStatusIcon,
    status: "waiting",

    detailDescription:
      "콘센트 전원이 공급되지 않아 사용이 어렵습니다.",
  },
];
