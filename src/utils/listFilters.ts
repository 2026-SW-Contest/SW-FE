import { FilterSelection } from "../constants/filterOptions";
import { FacilityItem } from "../types/facility";
import { LostItem } from "../types/lost";

type MatcherMap = Record<string, (value: string) => boolean>;

const LOST_CATEGORY_MATCHERS: MatcherMap = {
  electronics: (value) => /전자기기/.test(value),
  wallet: (value) => /지갑|카드|현금|신분증/.test(value),
  fashion: (value) => /의류|패션|신발/.test(value),
  bag: (value) => /가방|파우치/.test(value),
  books: (value) => /도서|문구|필통/.test(value),
  accessory: (value) => /악세서리|액세서리/.test(value),
};

const FACILITY_CATEGORY_MATCHERS: MatcherMap = {
  electric: (value) => /전기|조명|형광등/.test(value),
  temperature: (value) => /냉방|난방|온도|에어컨/.test(value),
  facility: (value) => /시설|설비|의자|천장|누수|수도꼭지|엘리베이터/.test(value),
  clean: (value) => /청소|위생|화장실/.test(value),
  safety: (value) => /안전|보안|손잡이/.test(value),
  information: (value) => /정보|통신|프로젝터|콘센트/.test(value),
  convenience: (value) => /편의|서비스/.test(value),
};

const CAMPUS_PLACE_MATCHERS: MatcherMap = {
  S1: (value) => /본관|종합관/.test(value),
  S2: (value) => value.includes("학생회관"),
  S3: (value) => value.includes("미래관"),
  S4: (value) => /경상관|국제관/.test(value),
  S5: (value) => value.includes("행정동"),
  S6: (value) => value.includes("운동장"),
  S7: (value) => value.includes("주차장"),
  S8: (value) => value.includes("기숙사"),
  S9: (value) => /방목학술정보관|도서관/.test(value),
  S10: (value) => value.includes("MCC관"),
};

const PERIOD_DAYS: Record<string, number> = {
  "1d": 1,
  "2d": 2,
  "7d": 7,
  "1m": 31,
  "3m": 92,
  "6m": 184,
};

const matchesSelectedOptions = (
  value: string,
  selectedValues: string[],
  matchers: MatcherMap,
) => {
  if (selectedValues.length === 0) return true;

  const matchesKnownOption = (option: string) => matchers[option]?.(value);
  const isOther = !Object.values(matchers).some((matcher) => matcher(value));

  return selectedValues.some((option) =>
    option === "other" ? isOther : matchesKnownOption(option),
  );
};

const parseItemDate = (value: string) => {
  const match = value.match(/^(\d{2,4})\.(\d{2})\.(\d{2})/);

  if (!match) return null;

  const rawYear = Number(match[1]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;

  return new Date(year, Number(match[2]) - 1, Number(match[3]));
};

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const parseRelativeDays = (value: string) => {
  const amount = Number(value.match(/\d+/)?.[0] ?? 0);

  if (value.includes("시간")) return 0;
  if (value.includes("일")) return amount;
  if (value.includes("주")) return amount * 7;
  if (value.includes("개월")) return amount * 30;

  return null;
};

const matchesPeriod = (
  itemDate: Date | null,
  selection: FilterSelection,
  relativeDays?: number | null,
) => {
  if (!selection.period) return true;

  if (selection.period === "custom") {
    if (!itemDate) return false;

    const startDate = selection.startDate
      ? startOfDay(new Date(`${selection.startDate}T00:00:00`))
      : null;
    const endDate = selection.endDate
      ? startOfDay(new Date(`${selection.endDate}T00:00:00`))
      : null;

    return (
      (!startDate || itemDate >= startDate) &&
      (!endDate || itemDate <= endDate)
    );
  }

  const limit = PERIOD_DAYS[selection.period];

  if (limit === undefined) return true;
  if (relativeDays !== null && relativeDays !== undefined) {
    return relativeDays <= limit;
  }
  if (!itemDate) return false;

  const today = startOfDay(new Date());
  const elapsedDays = Math.floor(
    (today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return elapsedDays >= 0 && elapsedDays <= limit;
};

export const matchesLostFilters = (
  item: LostItem,
  selection: FilterSelection,
) =>
  matchesSelectedOptions(
    item.category,
    selection.category,
    LOST_CATEGORY_MATCHERS,
  ) &&
  (selection.status.length === 0 || selection.status.includes(item.status)) &&
  matchesSelectedOptions(
    item.location,
    selection.place,
    CAMPUS_PLACE_MATCHERS,
  ) &&
  matchesPeriod(
    parseItemDate(item.date),
    selection,
    parseRelativeDays(item.time),
  );

export const matchesFacilityFilters = (
  item: FacilityItem,
  selection: FilterSelection,
) =>
  matchesSelectedOptions(
    `${item.title} ${item.description}`,
    selection.category,
    FACILITY_CATEGORY_MATCHERS,
  ) &&
  (selection.status.length === 0 || selection.status.includes(item.status)) &&
  matchesSelectedOptions(
    item.location,
    selection.place,
    CAMPUS_PLACE_MATCHERS,
  ) &&
  matchesPeriod(parseItemDate(item.date), selection);
