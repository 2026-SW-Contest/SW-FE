import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = new URL("./", import.meta.url).pathname;
const outputPath = `${outputDir}Connecthing_API_명세서_v1.0.xlsx`;

const BLUE = "#3D7DF5";
const BLUE_DARK = "#0D5EF2";
const BLUE_LIGHT = "#E7EFFE";
const GRAY_50 = "#F7F8F9";
const GRAY_100 = "#E8EBED";
const GRAY_500 = "#72787F";
const GRAY_800 = "#26282B";
const WHITE = "#FFFFFF";
const RED = "#FF4C4C";
const GREEN_LIGHT = "#E9F8EE";
const YELLOW_LIGHT = "#FFF6DF";

const workbook = Workbook.create();

const apiRows = [
  ["AUTH-01","인증","POST","/api/auth/login","학생 로그인","공개","-","body","email, password","200 LoginResponse","-","기존 학생 로그인"],
  ["AUTH-02","인증","POST","/api/admin/auth/login","관리자 로그인","공개","-","body","email, password","200 AdminLoginResponse","-","ADMIN/SUPER_ADMIN만 성공"],
  ["AUTH-03","인증","POST","/api/auth/refresh","액세스 토큰 재발급","Refresh Token","공통","cookie","-","200 TokenResponse","-","Refresh Token Rotation 권장"],
  ["AUTH-04","인증","POST","/api/auth/logout","로그아웃","로그인","공통","cookie/header","-","204","-","리프레시 토큰 폐기"],
  ["AUTH-05","인증","GET","/api/users/me","내 정보 조회","로그인","공통","-","-","200 UserResponse","-","role 포함"],
  ["ADMIN-01","관리자","GET","/api/admin/dashboard/summary","관리자 대시보드 집계","로그인","ADMIN","query","date","200 DashboardSummary","-","대기/진행중/해결완료 건수"],
  ["ADMIN-02","관리자","GET","/api/admin/audit-logs","관리자 작업 이력 조회","로그인","SUPER_ADMIN","query","page,size,adminId,action,from,to","200 Page<AuditLog>","-","모든 상태 변경 기록"],
  ["ADMIN-03","관리자","GET","/api/admin/accounts","관리자 계정 목록","로그인","SUPER_ADMIN","query","page,size,query,active","200 Page<Admin>","-",""],
  ["ADMIN-04","관리자","POST","/api/admin/accounts","관리자 계정 생성","로그인","SUPER_ADMIN","body","name,email,department,role","201 Admin","-","초기 비밀번호 설정 절차 필요"],
  ["COMMON-01","공통","GET","/api/common/locations","학교 장소 목록","공개","공통","-","-","200 LocationList","-","S1~S10, 기타"],
  ["COMMON-02","공통","GET","/api/common/lost-categories","분실물 카테고리 목록","공개","공통","-","-","200 CodeList","-","서버 공통 코드"],
  ["FILE-01","파일","POST","/api/files/presigned-urls","업로드 URL 발급","로그인","공통","body","fileName,contentType,fileSize,domain","200 PresignedUpload","-","이미지 1개당 호출"],
  ["LOST-01","분실물","GET","/api/lost-items","학생 분실물 목록","선택","공통","query","page,size,query,status,category,locationCode,from,to","200 Page<LostItemSummary>","-","최신 등록순"],
  ["LOST-02","분실물","GET","/api/lost-items/{lostItemId}","분실물 상세","선택","공통","path","lostItemId","200 LostItemDetail","-","조회 가능 상태 검증"],
  ["LOST-03","분실물","GET","/api/admin/lost-items","관리자 분실물 목록","로그인","ADMIN","query","page,size,query,status,category,locationCode,from,to","200 Page<AdminLostItem>","-","등록 관리자 포함"],
  ["LOST-04","분실물","POST","/api/admin/lost-items","분실물 게시글 등록","로그인","ADMIN","body","LostItemCreateRequest","201 LostItemDetail","-","대표 사진 필수"],
  ["LOST-05","분실물","PATCH","/api/admin/lost-items/{lostItemId}","분실물 정보 수정","로그인","ADMIN","path/body","lostItemId, LostItemUpdateRequest","200 LostItemDetail","-","변경 이력 기록"],
  ["LOST-06","분실물","PATCH","/api/admin/lost-items/{lostItemId}/status","분실물 상태 변경","로그인","ADMIN","path/body","lostItemId,status,reason","200 LostItemDetail","조건부","상태 3개만 허용"],
  ["LOST-07","분실물","POST","/api/admin/lost-items/{lostItemId}/returns","현장 직접 반환 처리","로그인","ADMIN","path/body","lostItemId,receiverName,studentNumber,evidenceNote","201 ReturnRecord","선택","사전 소유자 요청 없이 가능"],
  ["LOST-08","분실물","DELETE","/api/admin/lost-items/{lostItemId}","분실물 게시글 삭제","로그인","ADMIN","path/body","lostItemId,reason","204","-","소프트 삭제 권장"],
  ["OWNER-01","소유자요청","POST","/api/lost-items/{lostItemId}/owner-requests","소유자 확인 요청","로그인","STUDENT","path/body","lostItemId,inquiry,attachmentFileIds","201 OwnerRequestDetail","관리자","생성 시 분실물 진행중"],
  ["OWNER-02","소유자요청","GET","/api/users/me/owner-requests","내 분실물 회수 내역","로그인","STUDENT","query","page,size,status","200 Page<MyOwnerRequest>","-","최신 신청순"],
  ["OWNER-03","소유자요청","GET","/api/admin/owner-requests","관리자 요청 목록","로그인","ADMIN","query","page,size,query,status,from,to","200 Page<OwnerRequestSummary>","-","진행중 우선"],
  ["OWNER-04","소유자요청","GET","/api/admin/owner-requests/{requestId}","소유자 요청 상세","로그인","ADMIN","path","requestId","200 OwnerRequestDetail","-","증빙 파일 포함"],
  ["OWNER-05","소유자요청","POST","/api/admin/owner-requests/{requestId}/decision","소유자 요청 승인/반려","로그인","ADMIN","path/body","requestId,result,visitLocationCode,rejectionReason,adminMemo","200 OwnerRequestDetail","학생","승인=해결완료, 반려=진행중 유지"],
  ["OWNER-06","소유자요청","POST","/api/owner-requests/{requestId}/supplements","반려 요청 추가 증빙 제출","로그인","STUDENT","path/body","requestId,inquiry,attachmentFileIds","201 OwnerRequestDetail","관리자","동일 요청 건에 재제출 이력 보존"],
  ["FAC-01","시설문의","POST","/api/facility-inquiries","시설·기자재 문의 등록","로그인","STUDENT","body","FacilityInquiryCreateRequest","201 FacilityInquiryDetail","관리자","생성 상태 대기"],
  ["FAC-02","시설문의","GET","/api/facility-inquiries","시설 문의 전체 목록","선택","공통","query","page,size,query,status,category,locationCode,from,to","200 Page<FacilitySummary>","-","최신 등록순"],
  ["FAC-03","시설문의","GET","/api/facility-inquiries/{inquiryId}","시설 문의 상세","선택","공통","path","inquiryId","200 FacilityInquiryDetail","-","관리자 답변 포함"],
  ["FAC-04","시설문의","GET","/api/users/me/facility-inquiries","내 시설 문의 내역","로그인","STUDENT","query","page,size,status","200 Page<FacilitySummary>","-",""],
  ["FAC-05","시설문의","GET","/api/admin/facility-inquiries","관리자 시설 문의 목록","로그인","ADMIN","query","page,size,query,status,category,locationCode,from,to","200 Page<AdminFacilitySummary>","-",""],
  ["FAC-06","시설문의","PATCH","/api/admin/facility-inquiries/{inquiryId}","시설 문의 처리","로그인","ADMIN","path/body","inquiryId,status,answer,adminMemo","200 FacilityInquiryDetail","학생","상태 또는 답변 변경 시 알림"],
  ["NOTI-01","알림","GET","/api/notifications","내 알림 목록","로그인","공통","query","page,size,read","200 Page<Notification>","-","최신순"],
  ["NOTI-02","알림","GET","/api/notifications/unread-count","읽지 않은 알림 수","로그인","공통","-","-","200 UnreadCount","-","벨 활성 상태"],
  ["NOTI-03","알림","PATCH","/api/notifications/{notificationId}/read","알림 읽음 처리","로그인","공통","path","notificationId","204","-","멱등 처리"],
  ["NOTI-04","알림","PATCH","/api/notifications/read-all","알림 전체 읽음","로그인","공통","-","-","204","-",""],
];

const authFields = [
  ["관리자 로그인","Request","email","string","Y","학교 관리자 이메일, 최대 255자","admin@mju.ac.kr"],
  ["관리자 로그인","Request","password","string","Y","8~64자","password1"],
  ["관리자 로그인","Response","accessToken","string","Y","Bearer 액세스 토큰","eyJ..."],
  ["관리자 로그인","Response","expiresIn","number","Y","초 단위 만료 시간",1800],
  ["관리자 로그인","Response","admin.adminId","number","Y","관리자 PK",12],
  ["관리자 로그인","Response","admin.name","string","Y","관리자명","김관리"],
  ["관리자 로그인","Response","admin.email","string","Y","관리자 이메일","admin@mju.ac.kr"],
  ["관리자 로그인","Response","admin.department","string","Y","소속 부서","시설관리팀"],
  ["관리자 로그인","Response","admin.role","enum","Y","ADMIN 또는 SUPER_ADMIN","ADMIN"],
  ["공통 인증","Header","Authorization","string","Y","Bearer {accessToken}","Bearer eyJ..."],
  ["공통 인증","Header","X-CSRF-TOKEN","string","조건부","쿠키 인증 또는 상태 변경 요청 시 사용","csrf-token-value"],
  ["공통 응답","Header","X-Request-Id","string","Y","장애 추적용 요청 ID","01H..."],
];

const lostFields = [
  ["분실물 등록","representativeFileId","string","Y","업로드 완료된 대표 이미지 파일 ID","file_01","이미지, 최대 10MB"],
  ["분실물 등록","additionalFileIds","string[]","N","추가 이미지 ID, 대표 포함 총 5장 이하","[file_02]",""],
  ["분실물 등록","title","string","Y","게시글 제목","검은색 반지갑","1~100자"],
  ["분실물 등록","status","enum","Y","처리 상태","waiting","waiting/inProgress/resolved"],
  ["분실물 등록","foundDate","date","Y","습득 일자","2026-08-12","미래 일자 불가"],
  ["분실물 등록","locationCode","enum","Y","습득 건물 코드","S2","S1~S10/OTHER"],
  ["분실물 등록","detailLocation","string","N","상세 습득 위치","1층 로비","최대 100자"],
  ["분실물 등록","categoryCode","enum","Y","분실물 카테고리","WALLET","공통 코드 참조"],
  ["분실물 등록","description","string","N","물건 상세 정보","검은색 가죽 반지갑","최대 1000자"],
  ["분실물 등록","storageLocationCode","enum","Y","현재 보관 장소","S2_SECURITY","보관 장소 코드 참조"],
  ["분실물 응답","lostItemId","number","Y","분실물 PK",1,""],
  ["분실물 응답","registeredAdmin","object","Y","등록 관리자 ID/이름/부서","{adminId,name,department}",""],
  ["분실물 응답","createdAt","datetime","Y","등록 일시","2026-08-12 10:30:00 KST","실제 JSON은 ISO 8601"],
  ["직접 반환","receiverName","string","Y","수령인 이름","정석우","2~100자"],
  ["직접 반환","studentNumber","string","N","학생이면 8자리 학번","60201705","8자리 숫자"],
  ["직접 반환","evidenceNote","string","Y","관리자가 확인한 증빙 메모","학생증과 물건 특징 확인","최대 1000자"],
  ["직접 반환","returnedAt","datetime","N","미입력 시 서버 현재 시각","2026-08-12 15:00:00 KST","실제 JSON은 ISO 8601, 미래 시각 불가"],
];

const ownerFields = [
  ["학생 요청","lostItemId","number","Y","대상 분실물 ID",1,"존재하고 반환 미완료"],
  ["학생 요청","inquiry","string","Y","소유자임을 설명하는 내용","케이스 특징과 스크래치 위치...","1~500자"],
  ["학생 요청","attachmentFileIds","string[]","N","증빙 이미지 최대 5장","[file_11,file_12]","이미지 파일만"],
  ["요청 응답","requestId","number","Y","요청 PK",101,""],
  ["요청 응답","applicant","object","Y","userId/name/studentNumber/email","{...}","개인정보 관리자만 전체 노출"],
  ["요청 응답","status","enum","Y","게시글/요청 노출 상태","inProgress","요청 즉시 진행중"],
  ["관리자 처리","result","enum","Y","승인 또는 반려","approved","approved/rejected"],
  ["관리자 처리","visitLocationCode","enum","승인 시 Y","방문 장소 코드","S1_SECURITY","승인 알림에 포함"],
  ["관리자 처리","operatingHours","string","N","미입력 시 장소 기본 운영시간","09:00~17:00",""],
  ["관리자 처리","rejectionReason","string","반려 시 Y","학생에게 전달할 반려 사유","증빙자료 확인이 어렵습니다.","1~1000자"],
  ["관리자 처리","adminMemo","string","N","학생에게 보이지 않는 내부 메모","추가 확인 필요","최대 1000자"],
  ["승인 결과","status","enum","Y","승인 처리 후 상태","resolved","해결완료"],
  ["반려 결과","status","enum","Y","반려 처리 후에도 유지","inProgress","진행중"],
  ["반려 재요청","supplementRound","number","Y","추가 증빙 제출 차수",2,"기존 처리 이력 보존"],
];

const facilityFields = [
  ["학생 등록","categoryCodes","string[]","Y","중복 선택 가능한 문의 카테고리","[electric,facility]","최소 1개"],
  ["학생 등록","locationCodes","string[]","Y","중복 선택 가능한 장소 코드","[S1,S2]","최소 1개"],
  ["학생 등록","title","string","Y","문의 제목","복도 조명이 꺼져 있습니다.","1~100자"],
  ["학생 등록","content","string","Y","문의 내용","야간 이동이 어렵습니다.","1~500자"],
  ["학생 등록","attachmentFileIds","string[]","N","첨부 이미지 최대 5장","[file_21]","이미지 파일만"],
  ["문의 응답","inquiryId","number","Y","문의 PK",201,""],
  ["문의 응답","status","enum","Y","처리 상태","waiting","생성 시 대기"],
  ["문의 응답","answer","string","N","학생에게 공개되는 관리자 답변","시설팀에서 확인 중입니다.","최대 2000자"],
  ["문의 응답","answeredAt","datetime","N","최근 답변 일시","2026-08-12 14:20:00 KST","실제 JSON은 ISO 8601"],
  ["관리자 처리","status","enum","Y","변경할 처리 상태","inProgress","3개 상태만"],
  ["관리자 처리","answer","string","N","학생에게 전달할 답변","현장 확인 후 조치하겠습니다.","최대 2000자"],
  ["관리자 처리","adminMemo","string","N","내부 업무 메모","전기팀 전달 완료","학생에게 미노출"],
];

const notificationRows = [
  ["OWNER_REQUEST_CREATED","관리자","소유자 확인 요청이 접수되었습니다.","[물건명] 소유자 확인 요청을 검토해 주세요.","/admin/owner-requests/{requestId}","OWNER-01"],
  ["OWNER_REQUEST_APPROVED","학생","본인 확인이 완료되었습니다.","증빙자료를 지참하여 [방문 장소]로 방문해주세요. 운영시간 [시간]","/mypage/recovery-history","OWNER-05"],
  ["OWNER_REQUEST_REJECTED","학생","소유자 확인 요청이 반려되었습니다.","반려 사유: [관리자 입력 내용]. 추가 증빙자료를 첨부해 다시 요청해 주세요.","/mypage/recovery-history","OWNER-05"],
  ["OWNER_REQUEST_SUPPLEMENTED","관리자","추가 증빙자료가 제출되었습니다.","[신청자]가 [물건명] 요청에 추가 자료를 제출했습니다.","/admin/owner-requests/{requestId}","OWNER-06"],
  ["LOST_ITEM_RETURNED","학생","분실물 반환 처리가 완료되었습니다.","[물건명]의 반환 처리가 완료되었습니다.","/mypage/recovery-history","LOST-07"],
  ["FACILITY_INQUIRY_CREATED","관리자","새 시설·기자재 문의가 등록되었습니다.","[장소] [문의 제목]","/admin/facility-inquiries/{inquiryId}","FAC-01"],
  ["FACILITY_STATUS_CHANGED","학생","시설·기자재 문의 상태가 변경되었습니다.","[문의 제목] 상태가 [상태]로 변경되었습니다.","/facility/{inquiryId}","FAC-06"],
  ["FACILITY_ANSWER_ADDED","학생","시설·기자재 문의에 답변이 등록되었습니다.","[관리자 답변 요약]","/facility/{inquiryId}","FAC-06"],
];

const codeRows = [
  ["업무 상태","waiting","대기","처리 전 또는 신규 등록 상태","전체 도메인"],
  ["업무 상태","inProgress","진행중","소유자 요청 접수, 관리자 처리 중, 반려 후 유지","전체 도메인"],
  ["업무 상태","resolved","해결완료","승인·반환·조치 완료","전체 도메인"],
  ["권한","STUDENT","학생","학생 모바일 서비스 사용자","인증"],
  ["권한","ADMIN","관리자","운영 데이터 처리","인증"],
  ["권한","SUPER_ADMIN","최고 관리자","관리자 계정·감사 로그 관리","인증"],
  ["요청 결과","approved","승인","소유 확인 승인, 상태 해결완료","소유자 요청"],
  ["요청 결과","rejected","반려","반려 사유 전달, 상태 진행중 유지","소유자 요청"],
  ...["S1|본관(종합관)|S1_SECURITY|본관(종합관) 1층 경비실","S2|학생회관|S2_SECURITY|학생회관 1층 경비실","S3|미래관|S3_SECURITY|미래관 1층 경비실","S4|경상관(국제관)|S4_SECURITY|경상관(국제관) 1층 경비실","S5|행정동|S5_SECURITY|행정동 1층 경비실","S6|운동장|S6_OFFICE|운동장 관리실","S7|주차장|S7_OFFICE|주차장 관리실","S8|기숙사|S8_OFFICE|기숙사 관리실","S9|방목학술정보관(도서관)|S9_DESK|방목학술정보관 안내데스크","S10|MCC관|S10_SECURITY|MCC관 1층 경비실","OTHER|기타|OTHER|기타"].map((row) => {
    const [code,name,storageCode,storageName] = row.split("|");
    return ["장소",code,name,`${storageCode} / ${storageName}`,"공통"];
  }),
  ...["ELECTRONICS|전자기기","WALLET|지갑 / 카드 / 현금","BAG|가방 / 파우치","FASHION|의류 / 패션잡화","ACCESSORY|액세서리","BOOKS|도서 / 문구","STUDENT_ID|학생증","KEY|열쇠","UMBRELLA|우산","OTHER|기타"].map((row) => {
    const [code,name] = row.split("|"); return ["분실물 카테고리",code,name,"관리자 등록 및 필터","분실물"];
  }),
];

const errorRows = [
  [400,"COMMON_001","INVALID_REQUEST","요청 형식 또는 필드 검증 실패","fieldErrors 배열 제공"],
  [400,"COMMON_002","INVALID_STATUS_TRANSITION","허용되지 않은 상태 변경","현재/요청 상태 제공"],
  [401,"AUTH_001","UNAUTHORIZED","인증 토큰 없음 또는 만료","재로그인 또는 refresh"],
  [403,"AUTH_002","FORBIDDEN","역할 권한 부족","관리자 API는 ADMIN 이상"],
  [404,"LOST_001","LOST_ITEM_NOT_FOUND","분실물 없음",""],
  [409,"LOST_002","ALREADY_RETURNED","이미 반환 완료된 물건","중복 반환 방지"],
  [409,"OWNER_001","OWNER_REQUEST_ALREADY_EXISTS","동일 사용자의 활성 요청 존재","추가 증빙 API 사용"],
  [409,"OWNER_002","OWNER_REQUEST_ALREADY_PROCESSED","이미 처리된 요청","중복 승인/반려 방지"],
  [400,"OWNER_003","REJECTION_REASON_REQUIRED","반려 사유 누락","result=rejected 조건"],
  [400,"OWNER_004","VISIT_LOCATION_REQUIRED","승인 방문 장소 누락","result=approved 조건"],
  [404,"FAC_001","FACILITY_INQUIRY_NOT_FOUND","시설 문의 없음",""],
  [413,"FILE_001","FILE_TOO_LARGE","파일 크기 제한 초과","이미지 10MB 이하"],
  [415,"FILE_002","UNSUPPORTED_FILE_TYPE","지원하지 않는 파일 형식","jpg/png/webp 권장"],
  [429,"COMMON_003","TOO_MANY_REQUESTS","요청 횟수 제한 초과","Retry-After 헤더"],
  [500,"COMMON_999","INTERNAL_SERVER_ERROR","서버 내부 오류","requestId로 추적"],
];

const transitionRows = [
  ["분실물","신규 등록","-","waiting","관리자 게시글 등록","대표 사진 및 필수값 검증","-"],
  ["분실물","소유자 요청 접수","waiting","inProgress","학생 요청 생성","반환 완료가 아닐 것","관리자에게 요청 알림"],
  ["분실물","소유자 요청 반려","inProgress","inProgress","관리자 반려","반려 사유 필수","학생에게 반려 알림"],
  ["분실물","소유자 요청 승인","inProgress","resolved","관리자 승인","방문 장소 필수","학생에게 승인·방문 안내"],
  ["분실물","현장 직접 반환","waiting/inProgress","resolved","관리자 반환 처리","증빙 확인 메모 필수","해당 학생 식별 시 완료 알림"],
  ["시설문의","신규 등록","-","waiting","학생 문의 등록","카테고리·장소·제목·내용 필수","관리자에게 신규 알림"],
  ["시설문의","처리 시작","waiting","inProgress","관리자 상태 변경","-","학생에게 상태 변경 알림"],
  ["시설문의","반려/추가 확인","inProgress","inProgress","관리자 답변 등록","답변 선택","학생에게 답변 알림"],
  ["시설문의","조치 완료","waiting/inProgress","resolved","관리자 상태 변경","-","학생에게 해결완료 알림"],
  ["공통","해결 건 재오픈","resolved","inProgress","관리자 재처리","재오픈 사유 필수","대상 사용자에게 알림"],
];

const modelRows = [
  ["users","user_id","BIGINT","PK","Y","사용자 ID"],
  ["users","email","VARCHAR(255)","UK","Y","학교 이메일"],
  ["users","role","VARCHAR(20)","IDX","Y","STUDENT/ADMIN/SUPER_ADMIN"],
  ["admin_profiles","admin_id","BIGINT","PK/FK","Y","users.user_id"],
  ["admin_profiles","department","VARCHAR(100)","","Y","소속 부서"],
  ["lost_items","lost_item_id","BIGINT","PK","Y","분실물 ID"],
  ["lost_items","status","VARCHAR(20)","IDX","Y","waiting/inProgress/resolved"],
  ["lost_items","location_code","VARCHAR(10)","IDX","Y","S1~S10/OTHER"],
  ["lost_items","registered_admin_id","BIGINT","FK","Y","등록 관리자"],
  ["owner_requests","request_id","BIGINT","PK","Y","소유자 요청 ID"],
  ["owner_requests","lost_item_id","BIGINT","FK/IDX","Y","대상 분실물"],
  ["owner_requests","applicant_user_id","BIGINT","FK/IDX","Y","신청 학생"],
  ["owner_requests","result","VARCHAR(20)","IDX","N","approved/rejected"],
  ["owner_request_decisions","decision_id","BIGINT","PK","Y","처리 이력 ID"],
  ["owner_request_decisions","rejection_reason","TEXT","","N","반려 사유"],
  ["facility_inquiries","inquiry_id","BIGINT","PK","Y","시설 문의 ID"],
  ["facility_inquiries","status","VARCHAR(20)","IDX","Y","3단계 상태"],
  ["facility_inquiry_histories","history_id","BIGINT","PK","Y","상태·답변 변경 이력"],
  ["notifications","notification_id","BIGINT","PK","Y","알림 ID"],
  ["notifications","read_at","TIMESTAMP","IDX","N","읽음 시각"],
  ["files","file_id","VARCHAR(50)","PK","Y","업로드 파일 식별자"],
  ["audit_logs","audit_log_id","BIGINT","PK","Y","관리자 감사 로그"],
  ["audit_logs","request_id","VARCHAR(50)","IDX","Y","API 요청 추적 ID"],
];

const jsonExampleRows = [
  ["AUTH-02","Request",`{
  "email": "admin@mju.ac.kr",
  "password": "password1"
}`],
  ["AUTH-02","Response 200",`{
  "accessToken": "eyJ...",
  "expiresIn": 1800,
  "admin": { "adminId": 12, "name": "김관리", "department": "시설관리팀", "role": "ADMIN" }
}`],
  ["LOST-04","Request",`{
  "representativeFileId": "file_01",
  "additionalFileIds": ["file_02"],
  "title": "검은색 반지갑",
  "status": "waiting",
  "foundDate": "2026-08-12",
  "locationCode": "S2",
  "detailLocation": "1층 로비",
  "categoryCode": "WALLET",
  "description": "검은색 가죽 반지갑",
  "storageLocationCode": "S2_SECURITY"
}`],
  ["LOST-07","Request",`{
  "receiverName": "정석우",
  "studentNumber": "60201705",
  "evidenceNote": "학생증과 물건 특징을 확인함"
}`],
  ["OWNER-01","Request",`{
  "inquiry": "왼쪽 유닛 스크래치와 케이스 특징이 일치합니다.",
  "attachmentFileIds": ["file_11", "file_12"]
}`],
  ["OWNER-05","승인 Request",`{
  "result": "approved",
  "visitLocationCode": "S1_SECURITY",
  "adminMemo": "제출한 증빙과 물건 특징 일치"
}`],
  ["OWNER-05","반려 Request",`{
  "result": "rejected",
  "rejectionReason": "제출된 자료만으로 소유 여부를 확인하기 어렵습니다.",
  "adminMemo": "추가 특징 확인 필요"
}`],
  ["FAC-01","Request",`{
  "categoryCodes": ["electric", "facility"],
  "locationCodes": ["S10"],
  "title": "복도 조명이 꺼져 있습니다.",
  "content": "MCC관 2층 복도 조명이 켜지지 않습니다.",
  "attachmentFileIds": ["file_21"]
}`],
  ["FAC-06","Request",`{
  "status": "inProgress",
  "answer": "시설팀에서 현장을 확인하고 있습니다.",
  "adminMemo": "전기팀 전달 완료"
}`],
  ["공통","Page Response",`{
  "data": [{ "id": 1 }],
  "page": { "number": 0, "size": 20, "totalElements": 1, "totalPages": 1, "hasNext": false }
}`],
  ["공통","Error Response",`{
  "code": "OWNER_003",
  "message": "반려 사유가 필요합니다.",
  "fieldErrors": [{ "field": "rejectionReason", "reason": "required" }],
  "requestId": "01H..."
}`],
];

function styleTitle(sheet, title, subtitle, lastCol) {
  sheet.showGridLines = false;
  const titleRange = sheet.getRange(`A1:${lastCol}1`);
  titleRange.merge();
  titleRange.values = [[title]];
  titleRange.format.fill = BLUE;
  titleRange.format.font = { bold: true, color: WHITE, size: 18 };
  titleRange.format.rowHeight = 34;
  titleRange.format.verticalAlignment = "center";
  const subtitleRange = sheet.getRange(`A2:${lastCol}2`);
  subtitleRange.merge();
  subtitleRange.values = [[subtitle]];
  subtitleRange.format.fill = BLUE_LIGHT;
  subtitleRange.format.font = { color: GRAY_500, size: 10 };
  subtitleRange.format.rowHeight = 26;
  subtitleRange.format.verticalAlignment = "center";
}

function writeTable(sheet, startRow, headers, rows, widths, tableName) {
  const startCol = 1;
  const endRow = startRow + rows.length;
  const lastCol = String.fromCharCode(64 + headers.length);
  const range = sheet.getRange(`A${startRow}:${lastCol}${endRow}`);
  range.values = [headers, ...rows];
  range.format.font = { color: GRAY_800, size: 10 };
  range.format.verticalAlignment = "center";
  range.format.wrapText = true;
  range.format.borders = {
    insideHorizontal: { style: "thin", color: GRAY_100 },
    insideVertical: { style: "thin", color: "#F0F2F4" },
  };
  const header = sheet.getRange(`A${startRow}:${lastCol}${startRow}`);
  header.format.fill = GRAY_50;
  header.format.font = { bold: true, color: GRAY_500, size: 10 };
  header.format.rowHeight = 28;
  for (let index = 0; index < widths.length; index += 1) {
    sheet.getRangeByIndexes(startRow - 1, startCol - 1 + index, rows.length + 1, 1).format.columnWidth = widths[index];
  }
  sheet.getRange(`A${startRow + 1}:${lastCol}${endRow}`).format.rowHeight = 34;
  sheet.tables.add(`A${startRow}:${lastCol}${endRow}`, true, tableName);
  sheet.freezePanes.freezeRows(startRow);
  return { endRow, lastCol };
}

const overview = workbook.worksheets.add("00_개요");
styleTitle(overview, "Connecthing API 명세서", "학생 모바일 서비스와 데스크톱 관리자 서비스의 통합 API 계약 · v1.0 · 2026-08-12", "H");
overview.getRange("A4:B12").values = [
  ["항목","내용"],
  ["API Base URL","/api"],
  ["관리자 Base URL","/api/admin"],
  ["인증","Access Token(Bearer) + Refresh Token(HttpOnly Cookie)"],
  ["관리 권한","ADMIN / SUPER_ADMIN"],
  ["시간 기준","ISO 8601, Asia/Seoul(+09:00)"],
  ["페이지 기준","page=0, size=20, sort=createdAt,desc"],
  ["업무 상태","waiting(대기), inProgress(진행중), resolved(해결완료)"],
  ["전체 API 수",""],
];
overview.getRange("A4:B12").format.borders = { insideHorizontal: { style: "thin", color: GRAY_100 } };
overview.getRange("A4:B4").format.fill = GRAY_50;
overview.getRange("A4:B4").format.font = { bold: true, color: GRAY_500 };
overview.getRange("A4:A12").format.font = { bold: true, color: GRAY_800 };
overview.getRange("A4:A12").format.columnWidth = 22;
overview.getRange("B4:B12").format.columnWidth = 62;
overview.getRange("A14:H14").merge();
overview.getRange("A14").values = [["핵심 정책"]];
overview.getRange("A14:H14").format.fill = BLUE_LIGHT;
overview.getRange("A14:H14").format.font = { bold: true, color: BLUE_DARK };
overview.getRange("A15:H20").values = [
  ["1","상태는 모든 업무에서 대기·진행중·해결완료 세 단계만 사용합니다.",null,null,null,null,null,null],
  ["2","학생이 소유자 확인 요청을 생성하면 대상 분실물과 요청은 진행중이 됩니다.",null,null,null,null,null,null],
  ["3","관리자가 반려하면 진행중을 유지하고, 반려 사유를 학생 알림으로 전달합니다.",null,null,null,null,null,null],
  ["4","관리자가 승인하거나 현장에서 직접 반환하면 해결완료가 됩니다.",null,null,null,null,null,null],
  ["5","소유자 요청 없이 방문해도 관리자는 직접 반환 API로 동일하게 처리할 수 있습니다.",null,null,null,null,null,null],
  ["6","관리자 상태 변경·승인·반려·반환 작업은 모두 감사 로그를 남깁니다.",null,null,null,null,null,null],
];
for (let row = 15; row <= 20; row += 1) overview.getRange(`B${row}:H${row}`).merge();
overview.getRange("A15:A20").format.font = { bold: true, color: BLUE };
overview.getRange("B15:H20").format.wrapText = true;
overview.getRange("A15:H20").format.rowHeight = 27;
overview.freezePanes.freezeRows(2);

const apiSheet = workbook.worksheets.add("01_API목록");
styleTitle(apiSheet, "API 엔드포인트 목록", "권한·입력·응답·알림 연동을 포함한 전체 엔드포인트", "L");
writeTable(apiSheet, 4, ["API ID","도메인","Method","Endpoint","기능","인증","권한","입력 위치","주요 입력","성공 응답","알림","비고"], apiRows, [12,14,10,42,25,12,15,13,32,25,13,34], "ApiCatalogTable");
overview.getRange("B12").formulas = [["=COUNTA('01_API목록'!$A$5:$A$200)"]];
apiSheet.getRange(`C5:C${4 + apiRows.length}`).conditionalFormats.add("containsText", { text: "POST", format: { fill: GREEN_LIGHT, font: { color: "#258442", bold: true } } });
apiSheet.getRange(`C5:C${4 + apiRows.length}`).conditionalFormats.add("containsText", { text: "DELETE", format: { fill: "#FFF0F0", font: { color: RED, bold: true } } });

const authSheet = workbook.worksheets.add("02_인증·권한");
styleTitle(authSheet, "인증·권한 필드", "학생과 관리자는 로그인 엔드포인트를 분리하되 동일한 사용자·역할 체계를 사용", "G");
writeTable(authSheet, 4, ["API/구분","위치","필드","타입","필수","설명/검증","예시"], authFields, [20,12,26,14,10,52,36], "AuthFieldsTable");

const lostSheet = workbook.worksheets.add("03_분실물");
styleTitle(lostSheet, "분실물 API 필드", "관리자 게시글 등록·수정·상태 변경·현장 직접 반환", "G");
writeTable(lostSheet, 4, ["기능","필드","타입","필수","설명","예시","검증/비고"], lostFields, [20,26,16,10,46,36,38], "LostFieldsTable");

const ownerSheet = workbook.worksheets.add("04_소유자요청");
styleTitle(ownerSheet, "소유자 확인 요청 API 필드", "요청 접수 시 진행중 · 승인 시 해결완료 · 반려 시 진행중 유지", "G");
writeTable(ownerSheet, 4, ["기능","필드","타입","필수","설명","예시","검증/비고"], ownerFields, [20,27,16,12,48,40,40], "OwnerFieldsTable");

const facilitySheet = workbook.worksheets.add("05_시설문의");
styleTitle(facilitySheet, "시설·기자재 문의 API 필드", "학생 문의 등록과 관리자 상태·답변 관리", "G");
writeTable(facilitySheet, 4, ["기능","필드","타입","필수","설명","예시","검증/비고"], facilityFields, [20,27,16,10,48,42,38], "FacilityFieldsTable");

const notificationSheet = workbook.worksheets.add("06_알림");
styleTitle(notificationSheet, "알림 이벤트 명세", "업무 트랜잭션 완료 후 Outbox/Event 기반으로 자동 생성 권장", "F");
writeTable(notificationSheet, 4, ["이벤트 코드","수신자","제목","본문 템플릿","이동 경로","발생 API"], notificationRows, [32,14,38,76,46,14], "NotificationEventsTable");

const codeSheet = workbook.worksheets.add("07_공통코드");
styleTitle(codeSheet, "공통 코드", "프론트와 백엔드가 동일하게 사용하는 상태·권한·장소·카테고리", "E");
writeTable(codeSheet, 4, ["코드 그룹","코드","표시명","설명/연결값","사용 도메인"], codeRows, [24,24,34,62,20], "CommonCodesTable");

const errorSheet = workbook.worksheets.add("08_오류코드");
styleTitle(errorSheet, "오류 응답 명세", "모든 오류는 code, message, fieldErrors, requestId를 공통 형식으로 반환", "E");
writeTable(errorSheet, 4, ["HTTP","오류 코드","오류 키","기본 메시지","처리/비고"], errorRows, [10,20,38,54,44], "ErrorCodesTable");
errorSheet.getRange("A5:A30").format.numberFormat = "0";

const transitionSheet = workbook.worksheets.add("09_상태전이");
styleTitle(transitionSheet, "상태 전이 규칙", "허용된 업무 이벤트와 서버 검증·알림 효과", "G");
writeTable(transitionSheet, 4, ["도메인","이벤트","이전 상태","다음 상태","행위자/API","필수 조건","부가 효과"], transitionRows, [16,28,18,18,26,42,48], "StatusTransitionTable");
const nextStatusRange = transitionSheet.getRange(`D5:D${4 + transitionRows.length}`);
nextStatusRange.conditionalFormats.add("containsText", { text: "waiting", format: { fill: YELLOW_LIGHT, font: { color: "#9A7017", bold: true } } });
nextStatusRange.conditionalFormats.add("containsText", { text: "inProgress", format: { fill: BLUE_LIGHT, font: { color: BLUE_DARK, bold: true } } });
nextStatusRange.conditionalFormats.add("containsText", { text: "resolved", format: { fill: GREEN_LIGHT, font: { color: "#258442", bold: true } } });

const modelSheet = workbook.worksheets.add("10_데이터모델");
styleTitle(modelSheet, "권장 데이터 모델", "상태 이력·관리자 감사 로그·알림을 포함한 최소 핵심 테이블", "F");
writeTable(modelSheet, 4, ["테이블","컬럼","DB 타입","키/인덱스","필수","설명"], modelRows, [30,34,22,18,10,60], "DataModelTable");

const jsonSheet = workbook.worksheets.add("11_JSON예시");
styleTitle(jsonSheet, "요청·응답 JSON 예시", "주요 상태 변경 API와 공통 응답 형식의 구현 참고 예시", "C");
const jsonTable = writeTable(jsonSheet, 4, ["API ID","구분","예시 JSON"], jsonExampleRows, [18,22,110], "JsonExamplesTable");
jsonSheet.getRange(`C5:C${jsonTable.endRow}`).format.font = { name: "Consolas", size: 9, color: GRAY_800 };
jsonSheet.getRange(`A5:C${jsonTable.endRow}`).format.rowHeight = 105;
jsonSheet.getRange(`A5:B${jsonTable.endRow}`).format.verticalAlignment = "top";
jsonSheet.getRange(`C5:C${jsonTable.endRow}`).format.verticalAlignment = "top";

for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange();
  used.format.font.name = "Aptos";
  used.format.verticalAlignment = "center";
}

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const inspectOverview = await workbook.inspect({
  kind: "table",
  range: "00_개요!A1:H20",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 8,
});
console.log(inspectOverview.ndjson);

const inspectApis = await workbook.inspect({
  kind: "table",
  range: "01_API목록!A1:L16",
  include: "values,formulas",
  tableMaxRows: 16,
  tableMaxCols: 12,
});
console.log(inspectApis.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const sheetName of workbook.worksheets.items.map((sheet) => sheet.name)) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 0.8, format: "png" });
  const previewBytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(`${outputDir}preview_${sheetName}.png`, previewBytes);
}

console.log(`SAVED:${outputPath}`);
