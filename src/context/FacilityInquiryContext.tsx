import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import emptyImage from "../assets/icons/placeholders/image-placeholder.svg";
import waitingStatusIcon from "../assets/icons/status/waiting.svg";
import { facilityListData } from "../mock/facility";
import { FacilityItem } from "../types/facility";

const SUBMITTED_FACILITY_ITEMS_KEY = "submittedFacilityItems";

interface NewFacilityInquiry {
  title: string;
  description: string;
  type: string;
  location: string;
  images?: string[];
}

interface FacilityInquiryContextValue {
  facilityItems: FacilityItem[];
  submittedItems: FacilityItem[];
  addFacilityInquiry: (inquiry: NewFacilityInquiry) => FacilityItem;
}

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};

const getInitialSubmittedItems = (): FacilityItem[] => {
  try {
    const storedItems = JSON.parse(
      localStorage.getItem(SUBMITTED_FACILITY_ITEMS_KEY) ?? "[]",
    ) as FacilityItem[];

    return storedItems.map((item) => ({
      ...item,
      image: item.images?.[0] ?? emptyImage,
      status: "waiting",
      statusIcon: waitingStatusIcon,
    }));
  } catch {
    localStorage.removeItem(SUBMITTED_FACILITY_ITEMS_KEY);
    return [];
  }
};

const FacilityInquiryContext =
  createContext<FacilityInquiryContextValue | null>(null);

export const FacilityInquiryProvider = ({ children }: { children: ReactNode }) => {
  const [submittedItems, setSubmittedItems] = useState(
    getInitialSubmittedItems,
  );

  const addFacilityInquiry = useCallback((inquiry: NewFacilityInquiry) => {
    const newItem: FacilityItem = {
      id: Date.now(),
      image: inquiry.images?.[0] ?? emptyImage,
      images: inquiry.images,
      title: inquiry.title,
      description: inquiry.description,
      detailDescription: inquiry.description,
      date: getToday(),
      type: inquiry.type,
      location: inquiry.location,
      status: "waiting",
      statusIcon: waitingStatusIcon,
    };

    setSubmittedItems((current) => {
      const nextItems = [newItem, ...current];

      try {
        localStorage.setItem(
          SUBMITTED_FACILITY_ITEMS_KEY,
          JSON.stringify(nextItems),
        );
      } catch {
        // 이미지 용량으로 저장소 한도를 넘더라도 현재 세션의 등록은 유지한다.
      }

      return nextItems;
    });

    return newItem;
  }, []);

  const facilityItems = useMemo(
    () => [...submittedItems, ...facilityListData],
    [submittedItems],
  );

  const value = useMemo(
    () => ({ facilityItems, submittedItems, addFacilityInquiry }),
    [addFacilityInquiry, facilityItems, submittedItems],
  );

  return (
    <FacilityInquiryContext.Provider value={value}>
      {children}
    </FacilityInquiryContext.Provider>
  );
};

export const useFacilityInquiries = () => {
  const context = useContext(FacilityInquiryContext);

  if (!context) {
    throw new Error(
      "useFacilityInquiries must be used within FacilityInquiryProvider",
    );
  }

  return context;
};
