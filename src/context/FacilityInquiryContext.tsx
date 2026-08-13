import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createFacilityRequest,
  deleteFacilityRequest,
  getAllMyFacilityRequests,
  getFacilityRequest,
  getAllFacilityRequests,
  mapFacilityItem,
  updateFacilityRequest,
} from "../api/facility";
import { FacilityItem } from "../types/facility";
import { useAuth } from "./AuthContext";
import { getUserErrorMessage } from "../utils/userErrorMessage";

interface NewFacilityInquiry {
  title: string;
  description: string;
  categoryIds: number[];
  locationIds: number[];
  images: File[];
  keepFileIds?: number[];
}

interface FacilityInquiryContextValue {
  facilityItems: FacilityItem[];
  submittedItems: FacilityItem[];
  isLoading: boolean;
  error: string;
  addFacilityInquiry: (inquiry: NewFacilityInquiry) => Promise<FacilityItem>;
  editFacilityInquiry: (id: number, inquiry: NewFacilityInquiry) => Promise<FacilityItem>;
  deleteFacilityInquiry: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const FacilityInquiryContext =
  createContext<FacilityInquiryContextValue | null>(null);

export const FacilityInquiryProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [facilityItems, setFacilityItems] = useState<FacilityItem[]>([]);
  const [submittedItems, setSubmittedItems] = useState<FacilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const items = await getAllFacilityRequests();
      setFacilityItems(items);
    } catch (requestError) {
      setFacilityItems([]);
      setError(getUserErrorMessage(requestError, "시설 문의 목록을 불러오지 못했습니다."));
    }

    if (isAuthenticated) {
      try {
        const myItems = await getAllMyFacilityRequests();
        setSubmittedItems(myItems);
      } catch (requestError) {
        setSubmittedItems([]);
        setError(getUserErrorMessage(requestError, "내 시설 문의 내역을 불러오지 못했습니다."));
      }
    } else {
      setSubmittedItems([]);
    }

    setIsLoading(false);
  }, [isAuthenticated, user?.userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addFacilityInquiry = useCallback(
    async (inquiry: NewFacilityInquiry) => {
      const response = await createFacilityRequest({
        title: inquiry.title,
        description: inquiry.description,
        categoryId: inquiry.categoryIds[0],
        locationId: inquiry.locationIds[0],
        images: inquiry.images,
      });
      const responseId = response.facilityRequestId ?? response.id;
      const item = responseId
        ? await getFacilityRequest(responseId)
        : mapFacilityItem({
            ...response,
            title: response.title || inquiry.title,
            description: response.description || inquiry.description,
          });

      setFacilityItems((current) => [item, ...current]);
      setSubmittedItems((current) => [item, ...current]);
      return item;
    },
    [],
  );

  const editFacilityInquiry = useCallback(
    async (id: number, inquiry: NewFacilityInquiry) => {
      await updateFacilityRequest(id, {
        title: inquiry.title,
        description: inquiry.description,
        categoryId: inquiry.categoryIds[0],
        locationId: inquiry.locationIds[0],
        images: inquiry.images,
        keepFileIds: inquiry.keepFileIds,
      });
      const item = await getFacilityRequest(id);

      setFacilityItems((current) =>
        current.map((currentItem) => currentItem.id === id ? item : currentItem),
      );
      setSubmittedItems((current) =>
        current.map((currentItem) => currentItem.id === id ? item : currentItem),
      );
      return item;
    },
    [],
  );

  const deleteFacilityInquiry = useCallback(async (id: number) => {
    await deleteFacilityRequest(id);
    setFacilityItems((current) =>
      current.filter((currentItem) => currentItem.id !== id),
    );
    setSubmittedItems((current) =>
      current.filter((currentItem) => currentItem.id !== id),
    );
  }, []);

  const value = useMemo(
    () => ({
      facilityItems,
      submittedItems,
      isLoading,
      error,
      addFacilityInquiry,
      editFacilityInquiry,
      deleteFacilityInquiry,
      refresh,
    }),
    [
      addFacilityInquiry,
      deleteFacilityInquiry,
      editFacilityInquiry,
      error,
      facilityItems,
      isLoading,
      refresh,
      submittedItems,
    ],
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
