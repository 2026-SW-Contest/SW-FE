export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  targetPath: string;
  read: boolean;
}

export const notificationData: NotificationItem[] = [
  {
    id: 1,
    title: "에어팟 프로(2세대)",
    description:
      "검은색 실리콘 케이스가 씌워져 있으며 왼쪽 유닛에 작은 스크래치가 있습니다.",
    targetPath: "/lost/1",
    read: false,
  },
  {
    id: 2,
    title: "갈색 장지갑",
    description: "신분증 있음.(김*민) 카드 2개, 현금 x",
    targetPath: "/lost/3",
    read: false,
  },
  {
    id: 3,
    title: "도서관에 물 떨어져요",
    description:
      "도서관 3층 자율 열람실 에어컨에서 물이 흐릅니다. 가운데 좌석 이용 시 주의해주세요.",
    targetPath: "/facility/1",
    read: false,
  },
];
