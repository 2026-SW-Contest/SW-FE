import { FacilityItem } from "../types/facility";

import emptyImage from "../assets/icons/common/empty-picture.svg";

export const facilityListData: FacilityItem[] = [
  {
    id: 1,
    image: emptyImage,
    images: [emptyImage],

    title: "도서관 자율 열람실 의자가 흔들립니다.",
    description:
      "의자 다리가 흔들려 장시간 이용이 어렵습니다. 확인 및 수리가 필요합니다.",
    date: "2026.07.27",

    location: "방목학술정보관 자율열람실",
    status: "접수",

    detailDescription:
      "도서관 자율열람실 의자 다리가 흔들려 사용이 어렵습니다. 빠른 점검 부탁드립니다.",
  },

  {
    id: 2,
    image: emptyImage,
    images: [emptyImage],

    title: "본관 1층 천장에서 물이 떨어집니다.",
    description:
      "비가 오는 날마다 천장에서 누수가 발생하고 있습니다.",
    date: "2026.07.27",

    location: "본관 1층",
    status: "처리중",

    detailDescription:
      "천장에서 지속적으로 누수가 발생하여 바닥이 미끄럽습니다.",
  },

  {
    id: 3,
    image: emptyImage,
    images: [emptyImage],

    title: "학생회관 에어컨에서 물이 샙니다.",
    description:
      "에어컨 하단으로 물이 떨어지고 있습니다.",
    date: "2026.07.26",

    location: "학생회관 2층",
    status: "접수",

    detailDescription:
      "에어컨 배수 문제로 추정됩니다. 점검 부탁드립니다.",
  },

  {
    id: 4,
    image: emptyImage,
    images: [emptyImage],

    title: "주차장 조명이 깜빡입니다.",
    description:
      "야간에 조명이 반복적으로 깜빡여 위험합니다.",
    date: "2026.07.25",

    location: "지하주차장 1층",
    status: "처리완료",

    detailDescription:
      "조명 안정기 교체가 필요한 것으로 보입니다.",
  },

  {
    id: 5,
    image: emptyImage,
    images: [emptyImage],

    title: "강의실 프로젝터 화면이 나오지 않습니다.",
    description:
      "HDMI 연결은 정상인데 화면이 출력되지 않습니다.",
    date: "2026.07.24",

    location: "공학관 302호",
    status: "접수",

    detailDescription:
      "프로젝터 전원은 켜지지만 화면이 출력되지 않습니다.",
  },

  {
    id: 6,
    image: emptyImage,
    images: [emptyImage],

    title: "복도 형광등이 꺼져 있습니다.",
    description:
      "저녁 시간 복도가 매우 어둡습니다.",
    date: "2026.07.24",

    location: "본관 3층",
    status: "처리중",

    detailDescription:
      "형광등 또는 안정기 교체가 필요해 보입니다.",
  },

  {
    id: 7,
    image: emptyImage,
    images: [emptyImage],

    title: "엘리베이터 버튼이 눌리지 않습니다.",
    description:
      "3층 버튼 입력이 되지 않습니다.",
    date: "2026.07.23",

    location: "공학관",
    status: "접수",

    detailDescription:
      "엘리베이터 내부 3층 버튼이 동작하지 않습니다.",
  },

  {
    id: 8,
    image: emptyImage,
    images: [emptyImage],

    title: "화장실 수도꼭지에서 물이 계속 샙니다.",
    description:
      "잠가도 물이 조금씩 흐르고 있습니다.",
    date: "2026.07.22",

    location: "학생회관 1층",
    status: "처리완료",

    detailDescription:
      "수도꼭지 패킹 교체가 필요한 것으로 보입니다.",
  },

  {
    id: 9,
    image: emptyImage,
    images: [emptyImage],

    title: "계단 손잡이가 흔들립니다.",
    description:
      "손잡이가 고정되지 않아 위험합니다.",
    date: "2026.07.21",

    location: "본관 계단",
    status: "접수",

    detailDescription:
      "계단 손잡이 볼트가 풀린 것으로 보입니다.",
  },

  {
    id: 10,
    image: emptyImage,
    images: [emptyImage],

    title: "도서관 콘센트가 작동하지 않습니다.",
    description:
      "노트북 충전이 되지 않습니다.",
    date: "2026.07.20",

    location: "방목학술정보관 2층",
    status: "처리중",

    detailDescription:
      "콘센트 전원이 공급되지 않아 사용이 어렵습니다.",
  },
];