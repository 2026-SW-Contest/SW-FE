import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getMyItemClaims, mapMyItemClaim } from "../api/lost";
import inProgressStatusIcon from "../assets/icons/status/in-progress.svg";
import { LostItem } from "../types/lost";
import { useAuth } from "./AuthContext";

const REQUESTED_LOST_ITEM_IDS_KEY = "requestedLostItemIds";

const getInitialRequestedIds = () => {
  try {
    return JSON.parse(
      localStorage.getItem(REQUESTED_LOST_ITEM_IDS_KEY) ?? "[]",
    ) as number[];
  } catch {
    localStorage.removeItem(REQUESTED_LOST_ITEM_IDS_KEY);
    return [];
  }
};

interface RecoveryRequestContextValue {
  recoveryItems: LostItem[];
  requestedIds: number[];
  isLoading: boolean;
  error: string;
  requestRecovery: (item: LostItem) => void;
  refreshRecoveryItems: () => Promise<void>;
}

const RecoveryRequestContext =
  createContext<RecoveryRequestContextValue | null>(null);

export const RecoveryRequestProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [requestedIds, setRequestedIds] = useState(getInitialRequestedIds);
  const [recoveryItems, setRecoveryItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshRecoveryItems = useCallback(async () => {
    if (!isAuthenticated) {
      setRecoveryItems([]);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const claims = [];
      let cursor: string | undefined;

      do {
        const response = await getMyItemClaims({ cursor, size: 50 });
        claims.push(...response.content);

        const nextCursor = response.nextCursor ?? undefined;
        if (!response.hasNext || !nextCursor || nextCursor === cursor) break;
        cursor = nextCursor;
      } while (true);

      const items = claims.map(mapMyItemClaim);
      const ids = Array.from(new Set(items.map((item) => item.id)));

      setRecoveryItems(items);
      setRequestedIds(ids);
      localStorage.setItem(REQUESTED_LOST_ITEM_IDS_KEY, JSON.stringify(ids));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "분실물 회수 내역을 불러오지 못했습니다.",
      );
      setRecoveryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecoveryItems([]);
      setRequestedIds([]);
      localStorage.removeItem(REQUESTED_LOST_ITEM_IDS_KEY);
      return;
    }

    void refreshRecoveryItems();
  }, [isAuthenticated, refreshRecoveryItems, user?.userId]);

  const requestRecovery = useCallback((item: LostItem) => {
    setRequestedIds((current) => {
      const nextIds = [item.id, ...current.filter((id) => id !== item.id)];
      localStorage.setItem(REQUESTED_LOST_ITEM_IDS_KEY, JSON.stringify(nextIds));
      return nextIds;
    });
    setRecoveryItems((current) => [
      {
        ...item,
        status: "inProgress",
        statusIcon: inProgressStatusIcon,
        description: "소유자 확인 요청을 처리 중입니다.",
      },
      ...current.filter((currentItem) => currentItem.id !== item.id),
    ]);
  }, []);

  const value = useMemo(
    () => ({
      recoveryItems,
      requestedIds,
      isLoading,
      error,
      requestRecovery,
      refreshRecoveryItems,
    }),
    [error, isLoading, recoveryItems, refreshRecoveryItems, requestRecovery, requestedIds],
  );

  return (
    <RecoveryRequestContext.Provider value={value}>
      {children}
    </RecoveryRequestContext.Provider>
  );
};

export const useRecoveryRequests = () => {
  const context = useContext(RecoveryRequestContext);

  if (!context) {
    throw new Error(
      "useRecoveryRequests must be used within RecoveryRequestProvider",
    );
  }

  return context;
};
