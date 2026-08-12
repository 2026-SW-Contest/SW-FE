export type FilterTabKey = "category" | "status" | "place" | "period";

export interface FilterOption {
  value: string;
  label: string;
}

export interface CampusLocation {
  locationId: number;
  locationCode: string | null;
  locationName: string;
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  { locationId: 1, locationCode: "S1", locationName: "본관(종합관)" },
  { locationId: 2, locationCode: "S2", locationName: "학생회관" },
  { locationId: 3, locationCode: "S3", locationName: "미래관" },
  { locationId: 4, locationCode: "S4", locationName: "경상관(국제관)" },
  { locationId: 5, locationCode: "S5", locationName: "행정동" },
  { locationId: 6, locationCode: "S6", locationName: "운동장" },
  { locationId: 7, locationCode: "S7", locationName: "주차장" },
  { locationId: 8, locationCode: "S8", locationName: "기숙사" },
  {
    locationId: 9,
    locationCode: "S9",
    locationName: "방목학술정보관(도서관)",
  },
  { locationId: 10, locationCode: "S10", locationName: "MCC관" },
  { locationId: 11, locationCode: null, locationName: "기타" },
];

export const CAMPUS_LOCATION_OPTIONS: FilterOption[] = CAMPUS_LOCATIONS.map(
  ({ locationCode, locationName }) => ({
    value: locationCode ?? "other",
    label: locationCode ? `${locationCode} ${locationName}` : locationName,
  }),
);

export interface FilterDefinition {
  category: FilterOption[];
  status: FilterOption[];
  place: FilterOption[];
  period: FilterOption[];
}

export interface FilterSelection {
  category: string[];
  status: string[];
  place: string[];
  period: string;
  startDate: string;
  endDate: string;
}

export const createEmptyFilterSelection = (): FilterSelection => ({
  category: [],
  status: [],
  place: [],
  period: "",
  startDate: "",
  endDate: "",
});

export const countActiveFilters = (selection: FilterSelection) =>
  selection.category.length +
  selection.status.length +
  selection.place.length +
  (selection.period ? 1 : 0);

export const LOST_FILTER_DEFINITION: FilterDefinition = {
  category: [
    { value: "electronics", label: "전자기기" },
    { value: "wallet", label: "지갑/카드/현금" },
    { value: "fashion", label: "의류/패션잡화" },
    { value: "bag", label: "가방/파우치" },
    { value: "books", label: "도서/문구" },
    { value: "accessory", label: "악세서리" },
    { value: "other", label: "기타" },
  ],
  status: [
    { value: "stored", label: "보관중" },
    { value: "inProgress", label: "진행중" },
    { value: "resolved", label: "해결완료" },
  ],
  place: CAMPUS_LOCATION_OPTIONS,
  period: [
    { value: "1d", label: "1일" },
    { value: "2d", label: "2일" },
    { value: "7d", label: "7일" },
    { value: "1m", label: "1개월" },
    { value: "custom", label: "직접선택" },
  ],
};

export const FACILITY_FILTER_DEFINITION: FilterDefinition = {
  category: [
    { value: "electric", label: "전기/조명" },
    { value: "temperature", label: "냉난방/온도" },
    { value: "facility", label: "시설/설비" },
    { value: "clean", label: "청소/위생" },
    { value: "safety", label: "안전/보안" },
    { value: "information", label: "정보통신" },
    { value: "convenience", label: "편의/서비스" },
    { value: "other", label: "기타" },
  ],
  status: [
    { value: "waiting", label: "대기" },
    { value: "inProgress", label: "진행중" },
    { value: "resolved", label: "해결완료" },
  ],
  place: CAMPUS_LOCATION_OPTIONS,
  period: [
    { value: "7d", label: "7일" },
    { value: "1m", label: "1개월" },
    { value: "3m", label: "3개월" },
    { value: "6m", label: "6개월" },
    { value: "custom", label: "직접선택" },
  ],
};
