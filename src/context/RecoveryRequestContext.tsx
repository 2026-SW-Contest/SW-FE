import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { recoveryHistory } from "../mock/mypage";
import { lostListData } from "../mock/lost";
import inProgressStatusIcon from "../assets/icons/status/in-progress.svg";

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
  recoveryItems: typeof recoveryHistory;
  requestedIds: number[];
  requestRecovery: (lostItemId: number) => void;
}

const RecoveryRequestContext =
  createContext<RecoveryRequestContextValue | null>(null);

export const RecoveryRequestProvider = ({ children }: { children: ReactNode }) => {
  const [requestedIds, setRequestedIds] = useState(getInitialRequestedIds);

  const requestRecovery = useCallback((lostItemId: number) => {
    setRequestedIds((current) => {
      const nextIds = [lostItemId, ...current.filter((id) => id !== lostItemId)];

      localStorage.setItem(
        REQUESTED_LOST_ITEM_IDS_KEY,
        JSON.stringify(nextIds),
      );

      return nextIds;
    });
  }, []);

  const recoveryItems = useMemo(() => {
    const requestedItems = requestedIds
      .map((requestedId) =>
        lostListData.find((item) => item.id === requestedId),
      )
      .filter((item): item is (typeof lostListData)[number] => Boolean(item))
      .map((item) => ({
        ...item,
        status: "inProgress" as const,
        statusIcon: inProgressStatusIcon,
      }));
    const requestedIdSet = new Set(requestedIds);

    return [
      ...requestedItems,
      ...recoveryHistory.filter((item) => !requestedIdSet.has(item.id)),
    ];
  }, [requestedIds]);

  const value = useMemo(
    () => ({ recoveryItems, requestedIds, requestRecovery }),
    [recoveryItems, requestRecovery, requestedIds],
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
