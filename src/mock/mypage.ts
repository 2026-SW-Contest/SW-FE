import resolvedStatusIcon from "../assets/icons/status/resolved.svg";
import { facilityListData } from "./facility";
import { lostListData } from "./lost";

// API 연동 전까지 기존 분실물 목업을 회수 완료 상태로 재사용한다.
// 같은 id를 유지해 목록에서 기존 분실물 상세 화면으로 이동할 수 있다.
export const recoveryHistory = lostListData.map((item) => ({
  ...item,
  statusIcon: resolvedStatusIcon,
}));

// 작성한 문의와 상세 화면이 같은 목업을 바라보도록 시설 데이터를 공유한다.
export const repairHistory = facilityListData;
